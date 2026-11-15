// src/pages/workPermit/WorkPermitPrint.tsx
//
// Halaman cetak izin kerja. Urutan bagian:
//   1. HIRA lengkap (landscape)
//   2. Formulir izin kerja: informasi dan checklist
//   3. Bukti pekerjaan: foto dan stempel lokasi
//   4. HIRA yang dipakai izin ini (landscape)
//   5. Daftar dokumen pendukung
//   6. Seluruh halaman PDF medical/certificate (dirender menggunakan PDF.js)
//   7. Pengesahan dan riwayat persetujuan
// PDF lampiran dirender menjadi gambar halaman agar ikut tercetak bersama dokumen izin kerja.
import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getWorkPermitById, getWorkPermitFormSchema } from "../../services/workPermitServices";
import { getHiraDocumentById } from "../../services/hiraServices";
import { calculateRisk } from "../../utils/hiraRisk";
import type { WorkPermitDetail } from "../../types/workPermit";
import type { HiraDetailResponse, HiraGroup } from "../../types/hira";

// Worker harus berasal dari versi pdfjs-dist yang sama dengan library utama.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/* ============================ KONSTANTA & LABEL ============================ */

const STEP_LABELS: Record<string, string> = {
  creator: "Pemohon",
  supervisor: "Supervisor",
  hse_officer: "HSE Officer",
  project_manager: "Project Manager",
  mk: "Manajemen Konstruksi",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_supervisor: "Menunggu Supervisor",
  pending_officer: "Menunggu HSE Officer",
  pending_pm: "Menunggu Project Manager",
  pending_mk: "Menunggu Manajemen Konstruksi",
  approved: "Disetujui",
  rejected: "Ditolak",
  pending_close: "Menunggu Konfirmasi Penutupan",
  closed: "Ditutup",
  cancelled: "Dibatalkan",
};

const RISK_LABELS: Record<string, string> = { R: "Rendah", M: "Menengah", T: "Tinggi", E: "Ekstrem" };
const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  R: { bg: "#198754", color: "#fff" },
  M: { bg: "#ffc107", color: "#212529" },
  T: { bg: "#fd7e14", color: "#fff" },
  E: { bg: "#dc3545", color: "#fff" },
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = { R: "Rutin", NR: "Non-Rutin", E: "Darurat" };

const ATTACHMENT_LABELS: Record<string, string> = {
  medical: "Surat Keterangan Sehat (Fit-to-Work)",
  certificate: "Sertifikat",
};

// Sama dengan daftar di form izin kerja (idealnya dipindah ke satu file konstanta bersama)
const CHECKLIST_ITEMS: Record<string, string> = {
  "1": "SPK/kontrak ditandatangani",
  "2": "Penanggung jawab ditentukan",
  "3": "Cuaca cerah & tidak mendung",
  "4": "Pekerja memakai & menyiapkan APD sesuai",
  "5": "Sudah mendapat pengarahan K3 (Safety Induction)",
  "6": "Punya pengalaman & kompeten",
  "7": "Tidak punya penyakit ayan, rabun senja, gangguan keseimbangan",
  "8": "Prosedur keadaan darurat dimengerti",
  "9": "Rambu-rambu dipasang",
  "10": "Safety line / safety net / safety deck terpasang",
  "11": "Climbing terpasang (pekerjaan corewall)",
  "12": "Area kerja & bawahnya bersih & bebas lalu lintas orang",
  "13": "Peralatan diinspeksi & layak pakai",
  "14": "Bahan kimia B3 aman, ada MSDS & label jelas",
};

// Cadangan bila form-schema gagal dimuat
const FALLBACK_AREAS: Record<string, string> = {
  A: "Area Perifer (Pinggiran)",
  B: "Area Pit Lift/ Tangga",
  C: "Pekerjaan perbaikan/ perawatan di ketinggian",
};
const FALLBACK_PPE: Record<string, string> = {
  sarung_tangan: "Sarung tangan",
  safety_belt: "Safety Belt",
  body_harness: "Body Harness",
  sepatu: "Sepatu",
};

interface RenderedAttachmentPage {
  key: string;
  attachmentId: number;
  attachmentName: string;
  attachmentKind: string;
  pageNumber: number;
  totalPages: number;
  orientation: "portrait" | "landscape";
  imageDataUrl: string;
}

/* ================================ HELPER ================================== */

const formatDateTime = (iso?: string | null): string => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDate = (iso?: string | null): string => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

// Escape text safely for CSS content strings used by @page margin boxes.
const cssContentString = (value: string): string =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n\f]/g, " ")}"`;

// Isi header/footer diletakkan pada page-margin boxes.
// Gunakan nama halaman khusus (workPermitPage/hiraPage), jangan "portrait"
// karena nama itu juga merupakan kata kunci orientasi pada descriptor ukuran kertas
// dan dapat ditangani berbeda oleh browser saat dokumen mencampur orientasi.
const buildPrintPageHeaderCss = (
  dateText: string,
  documentNumber: string,
  footerText: string
): string => {
  const dateContent = cssContentString(dateText);
  const numberContent = cssContentString(`No. Dokumen: ${documentNumber}`);
  const footerContent = cssContentString(footerText);

  const makePageRule = (pageRule: string) => `
    ${pageRule} {
      @top-left {
        content: ${dateContent};
        color: #111;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 8px;
        line-height: 1.2;
        text-align: left;
        vertical-align: bottom;
        white-space: nowrap;
        padding-bottom: 2mm;
        border-bottom: 0.2mm solid #bbb;
      }
      @top-right {
        content: ${numberContent};
        color: #111;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 8px;
        font-weight: 700;
        line-height: 1.2;
        text-align: right;
        vertical-align: bottom;
        white-space: nowrap;
        padding-bottom: 2mm;
        border-bottom: 0.2mm solid #bbb;
      }
      @bottom-center {
        content: ${footerContent};
        color: #555;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 7px;
        line-height: 1.2;
        text-align: right;
        vertical-align: top;
        padding-top: 2mm;
        border-top: 0.2mm solid #bbb;
      }
    }
  `;

  return [
    makePageRule("@page"),
    makePageRule("@page workPermitPage"),
    makePageRule("@page hiraPage"),
  ].join("\n");
};

const formatSize = (bytes: number): string =>
  bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Ubah objek {kode: nama} dari form-schema menjadi map string
const toOptionMap = (raw: unknown): Record<string, string> =>
  raw && typeof raw === "object"
    ? Object.fromEntries(Object.entries(raw as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
    : {};

// Tunggu semua gambar (foto bertanda tangan) selesai dimuat sebelum dialog cetak dibuka
const waitForImages = async (): Promise<void> => {
  await Promise.all(
    Array.from(document.images).map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
    )
  );
};

// Teks watermark: dokumen yang belum sah tidak boleh tampak seperti dokumen resmi
const getWatermark = (status: string): string | null => {
  if (status === "approved" || status === "closed") return null;
  if (status === "cancelled") return "DIBATALKAN";
  if (status === "rejected") return "DITOLAK";
  if (status === "draft") return "DRAFT";
  return "BELUM DISETUJUI PENUH";
};

/* ========================= KOMPONEN KECIL (TAMPILAN) ====================== */

function RiskTag({ category, text }: { category: string; text?: string }) {
  const c = RISK_COLORS[category] ?? { bg: "#6c757d", color: "#fff" };
  return (
    <span className="pp-tag" style={{ backgroundColor: c.bg, color: c.color }}>
      {text ?? category}
    </span>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr>
      <th className="pp-info-label">{label}</th>
      <td>{children}</td>
    </tr>
  );
}

/**
 * Tabel HIRA per grup lokasi. Dipakai di bagian HIRA lengkap dan HIRA terpilih.
 * Skor risiko dihitung ulang dengan calculateRisk, jadi tidak bergantung pada field turunan dari server.
 * highlightIds: tandai aktivitas yang dipakai izin ini (hanya halaman 1).
 */
function HiraGroupsTable({ groups, highlightIds }: { groups: HiraGroup[]; highlightIds?: number[] }) {
  if (!groups.length) return <p className="pp-muted">Belum ada aktivitas.</p>;

  return (
    <>
      {groups.map((grp, gi) => (
        <div key={grp.id ?? `g-${gi}`} className="pp-group">
          <div className="pp-group-head">
            <strong>Lokasi / Fungsi Pekerjaan: {grp.location_function || "-"}</strong>
            {grp.applicable_regulation && (
              <div className="pp-muted pp-pre">Regulasi yang berlaku: {grp.applicable_regulation}</div>
            )}
          </div>

          <table className="pp-table">
            <thead>
              <tr>
                {highlightIds && <th style={{ width: 28 }}>Izin</th>}
                <th style={{ width: 24 }}>No</th>
                <th>Aktivitas</th>
                <th>Sifat</th>
                <th>Potensi Bahaya</th>
                <th>Risiko / Dampak</th>
                <th>Risiko Awal</th>
                <th>Pengendalian</th>
                <th>Kategori</th>
                <th>Risiko Sisa</th>
                <th>Peluang</th>
              </tr>
            </thead>
            <tbody>
              {grp.activities.map((act, ai) => {
                const initial = calculateRisk(act.initial_severity, act.initial_likelihood);
                const residual = calculateRisk(act.residual_severity, act.residual_likelihood);
                const used = act.id !== undefined && highlightIds?.includes(act.id);

                return (
                  <tr key={act.id ?? `a-${gi}-${ai}`}>
                    {highlightIds && <td className="pp-center">{used ? "✓" : ""}</td>}
                    <td className="pp-center">{ai + 1}</td>
                    <td className="pp-pre">{act.activity_name}</td>
                    <td>{ACTIVITY_TYPE_LABELS[act.activity_type ?? ""] ?? act.activity_type ?? "-"}</td>
                    <td className="pp-pre">{act.potential_hazard}</td>
                    <td className="pp-pre">{act.risk_impact}</td>
                    <td className="pp-center">
                      {act.initial_severity}×{act.initial_likelihood} = {initial.score}
                      <br />
                      <RiskTag category={initial.category} />
                    </td>
                    <td className="pp-pre">{act.existing_controls || "-"}</td>
                    <td>{act.control_category || "-"}</td>
                    <td className="pp-center">
                      {act.residual_severity}×{act.residual_likelihood} = {residual.score}
                      <br />
                      <RiskTag category={residual.category} text={residual.isAcceptable ? "Dapat diterima" : "Tidak diterima"} />
                    </td>
                    <td className="pp-pre">{act.opportunity || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

/* ================================ HALAMAN ================================= */

export default function WorkPermitPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permit, setPermit] = useState<WorkPermitDetail | null>(null);
  const [hiraDoc, setHiraDoc] = useState<HiraDetailResponse | null>(null);
  const [hiraUnavailable, setHiraUnavailable] = useState<boolean>(false);
  const [areaMap, setAreaMap] = useState<Record<string, string>>(FALLBACK_AREAS);
  const [ppeMap, setPpeMap] = useState<Record<string, string>>(FALLBACK_PPE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [preparing, setPreparing] = useState<boolean>(false);
  const [attachmentPages, setAttachmentPages] = useState<RenderedAttachmentPage[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState<boolean>(false);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);
  // Waktu cetak dihitung sekali saat halaman dibuka (dipakai di header dan footer)
  const [printedAt] = useState<string>(() => formatDateTime(new Date().toISOString()));

  // Ambil data. Detail izin diambil segar karena tautan foto dan lampiran kedaluwarsa sekitar 1 jam.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const [detail, schema] = await Promise.all([
          getWorkPermitById(id),
          getWorkPermitFormSchema("working_at_height"),
        ]);
        if (cancelled) return;
        setPermit(detail);

        // Label area keselamatan dan APD dari schema (cadangan: daftar bawaan)
        const schemaData = schema?.data || schema;
        const areas = toOptionMap(schemaData?.safety_areas);
        const ppe = toOptionMap(schemaData?.ppe ?? schemaData?.ppe_options);
        if (Object.keys(areas).length) setAreaMap(areas);
        if (Object.keys(ppe).length) setPpeMap(ppe);

        // Dokumen HIRA lengkap untuk halaman 1. Bila tidak bisa dibaca, halaman 3 tetap memuat HIRA terpilih.
        const hiraId = detail.hira_document ?? detail.hira?.document?.id;
        if (hiraId) {
          try {
            const doc = await getHiraDocumentById(String(hiraId));
            if (!cancelled) setHiraDoc(doc);
          } catch {
            if (!cancelled) setHiraUnavailable(true);
          }
        }
      } catch {
        if (!cancelled) setError("Gagal memuat data izin kerja untuk dicetak.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Ambil setiap halaman PDF medical/certificate dan render ke gambar untuk dicetak.
  // URL lampiran adalah signed URL dari response detail terbaru dan berlaku terbatas.
  useEffect(() => {
    if (!permit) return;

    let cancelled = false;

    const renderAttachments = async () => {
      const sourceAttachments = permit.attachments ?? [];

      setAttachmentPages([]);
      setAttachmentErrors([]);

      if (sourceAttachments.length === 0) {
        setAttachmentsLoading(false);
        return;
      }

      setAttachmentsLoading(true);
      const renderedPages: RenderedAttachmentPage[] = [];
      const errors: string[] = [];

      // Render satu file pada satu waktu untuk membatasi penggunaan memori browser.
      for (const attachment of sourceAttachments) {
        if (cancelled) break;

        if (!attachment.url) {
          errors.push(`${attachment.original_name}: tautan file tidak tersedia atau sudah kedaluwarsa.`);
          continue;
        }

        // PDFDocumentLoadingTask yang mengelola worker dan request jaringan.
        // Pada pdfjs-dist v6, destroy() tersedia pada loadingTask, bukan proxy dokumen.
        let loadingTask: ReturnType<typeof pdfjsLib.getDocument> | null = null;

        try {
          loadingTask = pdfjsLib.getDocument({
            url: attachment.url,
            withCredentials: false,
          });
          const pdfDocument = await loadingTask.promise;
          const totalPages = pdfDocument.numPages;

          for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
            if (cancelled) break;

            const page = await pdfDocument.getPage(pageNumber);
            // Skala 1.8 menjaga teks tetap terbaca saat dicetak di kertas A4.
            const viewport = page.getViewport({ scale: 1.8 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d", { alpha: false });

            if (!context) {
              throw new Error("Browser tidak dapat membuat canvas untuk PDF.");
            }

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
              canvas,
              canvasContext: context,
              viewport,
              background: "rgb(255, 255, 255)",
            }).promise;

            const imageDataUrl = canvas.toDataURL("image/png");
            renderedPages.push({
              key: `${attachment.id}-${pageNumber}`,
              attachmentId: attachment.id,
              attachmentName: attachment.original_name,
              attachmentKind: attachment.kind,
              pageNumber,
              totalPages,
              orientation: viewport.width >= viewport.height ? "landscape" : "portrait",
              imageDataUrl,
            });

            // Lepaskan bitmap canvas setelah data gambar tersimpan.
            canvas.width = 0;
            canvas.height = 0;
            page.cleanup();
          }
        } catch {
          // Jangan tampilkan atau mencatat signed URL karena URL tersebut bersifat rahasia.
          errors.push(
            `${attachment.original_name}: gagal dimuat. Periksa masa berlaku tautan dan izin CORS penyimpanan file.`
          );
        } finally {
          if (loadingTask) {
            try {
              await loadingTask.destroy();
            } catch {
              // Abaikan kegagalan cleanup; hasil render yang sudah dibuat tetap dapat digunakan.
            }
          }
        }
      }

      if (!cancelled) {
        setAttachmentPages(renderedPages);
        setAttachmentErrors(errors);
        setAttachmentsLoading(false);
      }
    };

    void renderAttachments();

    return () => {
      cancelled = true;
    };
  }, [permit]);

  // Judul tab menjadi nama file bawaan saat "Simpan sebagai PDF"
  useEffect(() => {
    if (!permit) return;
    const previous = document.title;
    document.title = `Izin Kerja ${permit.document_number ?? `#${permit.id}`}`;
    return () => {
      document.title = previous;
    };
  }, [permit]);

  const handlePrint = async () => {
    if (attachmentsLoading || preparing) return;

    setPreparing(true);
    try {
      await waitForImages();
      window.print();
    } finally {
      setPreparing(false);
    }
  };

  // Kembali ke detail izin secara langsung. navigate(-1) tidak selalu bekerja
  // jika halaman cetak dibuka langsung atau melalui tab baru.
  const handleBack = () => {
    if (id) {
      navigate(`/work-permit/${id}`);
    } else {
      navigate("/work-permit/list");
    }
  };

  if (loading) {
    return <div className="container py-5 text-center text-muted">Menyiapkan halaman cetak...</div>;
  }

  if (error || !permit) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || "Data izin kerja tidak ditemukan."}</div>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleBack}>
          &larr; Kembali
        </button>
      </div>
    );
  }

  /* ---- Turunan data yang dipakai di beberapa halaman ---- */
  const currentRound = permit.submission_round;
  const watermark = getWatermark(permit.status);
  const statusLabel = STATUS_LABELS[permit.status] ?? permit.status;
  const photos = permit.photos ?? [];
  const beforePhotos = photos.filter((p) => p.stage === "before");
  const afterPhotos = photos.filter((p) => p.stage === "after");
  const geoStamps = permit.geo_stamps ?? [];
  const attachments = permit.attachments ?? [];
  const selectedGroups = permit.hira?.groups ?? [];
  const highest = permit.highest_initial_category ?? permit.risk_category;

  // Keputusan putaran berjalan vs putaran sebelumnya (riwayat penolakan)
  const approvals = permit.approvals ?? [];
  const roundApprovals = approvals.filter((a) => a.submission_round === currentRound);
  const pastApprovals = approvals.filter((a) => a.submission_round < currentRound);
  const geoFor = (step: string) => geoStamps.find((g) => g.step === step && g.submission_round === currentRound);
  const formatGeo = (g?: (typeof geoStamps)[number]) =>
    g ? `${Number(g.latitude).toFixed(5)}, ${Number(g.longitude).toFixed(5)} (±${Number(g.accuracy).toFixed(0)} m)` : "-";

  return (
    <div className="pp-root">
      <style>
        {PRINT_CSS}
        {buildPrintPageHeaderCss(
          printedAt,
          permit.document_number?.trim() || "Belum ditetapkan",
          `${permit.document_number?.trim() || "Nomor belum ditetapkan"} · ${statusLabel} · Dicetak oleh ${user?.full_name ?? "-"} · ${printedAt}`
        )}
      </style>

      {/* Bilah alat: hanya tampil di layar, tidak ikut tercetak */}
      <div className="no-print pp-toolbar">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleBack}>
          &larr; Kembali
        </button>
        <div className="pp-toolbar-hint">
          Di dialog cetak pilih ukuran <strong>A4</strong>, aktifkan <strong>Grafik latar belakang</strong>, dan nonaktifkan
          <strong> Header dan footer</strong> bawaan browser agar header dokumen tidak rangkap.
        </div>
        <button
          className="btn btn-success btn-sm"
          onClick={handlePrint}
          disabled={preparing || attachmentsLoading}
        >
          {attachmentsLoading
            ? "Memuat PDF lampiran..."
            : preparing
            ? "Menyiapkan cetakan..."
            : "🖨 Cetak"}
        </button>
      </div>

      {/* Watermark; header dan footer dicetak melalui @page margin boxes. */}
      {watermark && <div className="pp-watermark">{watermark}</div>}
      <div className="pp-footer">
        {permit.document_number ?? "Belum ada nomor dokumen"} · {statusLabel} · Dicetak oleh {user?.full_name ?? "-"} ·{" "}
        {printedAt}
      </div>

      {/* Elemen ini hanya cadangan struktur; header cetak sebenarnya berasal dari @page margin boxes. */}
      <div className="pp-print-header" aria-hidden="true">
        <span className="pp-print-header-date">{printedAt}</span>
        <span className="pp-print-header-number">
          No. Dokumen: {permit.document_number?.trim() || "Belum ditetapkan"}
        </span>
      </div>

      <div className="pp-sheet">
        {/* Versi header untuk preview layar; versi cetak berada di luar pp-sheet. */}
        <div className="pp-print-header-preview">
          <span>{printedAt}</span>
          <strong>
            No. Dokumen: {permit.document_number?.trim() || "Belum ditetapkan"}
          </strong>
        </div>

        {/* ============ HALAMAN 1: HIRA LENGKAP ============ */}
        <section className="pp-section pp-hira">
          <h1 className="pp-title">HAZARD IDENTIFICATION AND RISK ASSESSMENT (HIRA)</h1>
          {hiraDoc ? (
            <>
              <table className="pp-info">
                <tbody>
                  <Info label="Proyek">{hiraDoc.project_name}</Info>
                  <Info label="No. Dokumen">
                    {hiraDoc.document_number || "Belum diatur"}
                  </Info>
                  <Info label="Paket Pekerjaan">{hiraDoc.work_package || "-"}</Info>
                  <Info label="Area Pekerjaan">{hiraDoc.work_area || "-"}</Info>
                  <Info label="Tanggal Dokumen">{formatDate(hiraDoc.document_date)}</Info>
                  <Info label="Dibuat Oleh">
                    {hiraDoc.created_by?.full_name || "-"}
                  </Info>
                </tbody>
              </table>
              <p className="pp-muted">Tanda ✓ pada kolom &quot;Izin&quot; menandai aktivitas yang dipakai izin kerja ini.</p>
              <HiraGroupsTable groups={hiraDoc.groups ?? []} highlightIds={permit.hira_activity_ids ?? []} />
            </>
          ) : (
            <p className="pp-muted">
              {hiraUnavailable
                ? "Dokumen HIRA lengkap tidak dapat diakses oleh akun ini. Aktivitas HIRA yang dipakai izin ini ditampilkan pada bagian HIRA terpilih."
                : "Izin kerja ini belum terhubung ke dokumen HIRA."}
            </p>
          )}
        </section>

        {/* ============ HALAMAN 2: FORMULIR IZIN KERJA ============ */}
        <section className="pp-section pp-portrait">
          <h1 className="pp-title">FORMULIR IZIN KERJA DI KETINGGIAN</h1>
          <p className="pp-center pp-muted">
            {permit.form?.code ?? "-"} {permit.form?.revision != null && `(Rev. ${permit.form.revision})`}
          </p>

          <table className="pp-info">
            <tbody>
              <Info label="No. Dokumen">
                {permit.document_number || "Belum diatur"}
              </Info>
              <Info label="Status">{statusLabel}</Info>
              <Info label="Proyek">{permit.project_name}</Info>
              <Info label="Pemohon">{permit.created_by?.full_name || "-"}</Info>
              <Info label="Putaran Pengajuan">{currentRound}</Info>
              <Info label="Kategori Risiko Izin">
                {permit.risk_category ? (
                  <>
                    <RiskTag category={permit.risk_category} text={`${permit.risk_category} · ${RISK_LABELS[permit.risk_category] ?? ""}`} />{" "}
                    <span className="pp-muted">(tertinggi dari aktivitas terpilih: {highest ?? "-"})</span>
                  </>
                ) : (
                  "Belum ditentukan (belum diajukan)"
                )}
              </Info>
              <Info label="Tanggal Kerja">{formatDate(permit.work_date)}</Info>
              <Info label="Jam Kerja">
                {permit.work_start} - {permit.work_end}
              </Info>
              <Info label="Lokasi Kerja">{permit.work_location}</Info>
              <Info label="Jumlah Pekerja">{permit.worker_count} orang</Info>
              <Info label="Penanggung Jawab (PIC)">{permit.person_in_charge}</Info>
              <Info label="Peralatan">{permit.equipment_used || "-"}</Info>
              <Info label="Deskripsi Pekerjaan">
                <span className="pp-pre">{permit.work_description}</span>
              </Info>
              <Info label="Area Keselamatan">
                {(permit.safety_areas ?? []).length
                  ? (permit.safety_areas ?? []).map((code) => `[${code}] ${areaMap[code] ?? ""}`).join("; ")
                  : "-"}
              </Info>
              <Info label="APD">
                {[...(permit.ppe ?? []).map((k) => ppeMap[k] ?? k), ...(permit.ppe_other ?? [])].join(", ") || "-"}
              </Info>
              {permit.post_work_evaluation && (
                <Info label="Evaluasi Pasca-Pekerjaan">
                  <span className="pp-pre">{permit.post_work_evaluation}</span>
                </Info>
              )}
              {permit.cancel_reason && (
                <Info label="Alasan Pembatalan">
                  <span className="pp-pre">{permit.cancel_reason}</span>
                </Info>
              )}
            </tbody>
          </table>

          <h2 className="pp-subtitle">Checklist Keselamatan</h2>
          <table className="pp-table">
            <thead>
              <tr>
                <th style={{ width: 30 }}>No</th>
                <th>Poin Pemeriksaan</th>
                <th style={{ width: 50 }}>Ya</th>
                <th style={{ width: 50 }}>Tidak</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CHECKLIST_ITEMS).map(([key, text]) => {
                const checked = Boolean(permit.checklist?.[key]);
                return (
                  <tr key={key}>
                    <td className="pp-center">{key}</td>
                    <td>{text}</td>
                    <td className="pp-center">{checked ? "✓" : ""}</td>
                    <td className="pp-center">{checked ? "" : "✓"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ============ HALAMAN 3: FOTO DAN BUKTI LOKASI ============ */}
        <section className="pp-section pp-portrait pp-evidence">
          <h1 className="pp-title">BUKTI PELAKSANAAN DAN LOKASI PEKERJAAN</h1>
          <p className="pp-center pp-muted">
            {permit.document_number || `Izin Kerja #${permit.id}`} · Putaran {currentRound}
          </p>

          <h2 className="pp-subtitle">Foto Bukti Lapangan</h2>
          {(["before", "after"] as const).map((stage) => {
            const list = stage === "before" ? beforePhotos : afterPhotos;
            return (
              <div key={stage} className="pp-photo-block">
                <strong>{stage === "before" ? "Sebelum Kerja" : "Sesudah Kerja"}</strong>
                {list.length === 0 ? (
                  <span className="pp-muted"> — belum ada foto</span>
                ) : (
                  <div className="pp-photos">
                    {list.map((p) =>
                      p.url ? (
                        <img key={p.id} src={p.url} alt={p.original_name} className="pp-photo" />
                      ) : (
                        <div key={p.id} className="pp-photo pp-photo-missing">
                          Foto tidak tersedia
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <h2 className="pp-subtitle">Stempel Lokasi (GPS)</h2>
          {geoStamps.length === 0 ? (
            <p className="pp-muted">Belum ada stempel lokasi.</p>
          ) : (
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Tahap</th>
                  <th>Putaran</th>
                  <th>Koordinat</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {geoStamps.map((g) => (
                  <tr key={g.id}>
                    <td>{STEP_LABELS[g.step] ?? g.step}</td>
                    <td className="pp-center">{g.submission_round}</td>
                    <td>{formatGeo(g)}</td>
                    <td>{formatDateTime(g.captured_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="pp-muted">Lokasi disimpan sebagaimana dikirim perangkat dan tidak diverifikasi otomatis oleh sistem.</p>
        </section>

        {/* ============ HALAMAN 4: HIRA YANG DIPAKAI IZIN INI ============ */}
        <section className="pp-section pp-hira pp-selected-hira">
          <h1 className="pp-title">AKTIVITAS HIRA YANG MENJADI ACUAN IZIN KERJA</h1>
          <p className="pp-muted">
            Hanya aktivitas yang dipilih pada izin ini. Kategori risiko izin mengikuti yang tertinggi:{" "}
            {highest ? <RiskTag category={highest} text={`${highest} · ${RISK_LABELS[highest] ?? ""}`} /> : "-"}
          </p>
          <HiraGroupsTable groups={selectedGroups} />
        </section>

        {/* ============ HALAMAN 5: LAMPIRAN DOKUMEN ============ */}
        <section className="pp-section pp-portrait pp-attachments">
          <h1 className="pp-title">DAFTAR DOKUMEN PENDUKUNG</h1>
          {attachments.length === 0 ? (
            <p className="pp-muted">Belum ada lampiran.</p>
          ) : (
            <table className="pp-table">
              <thead>
                <tr>
                  <th style={{ width: 30 }}>No</th>
                  <th>Jenis Dokumen</th>
                  <th>Nama Berkas</th>
                  <th>Ukuran</th>
                  <th>Diunggah</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((a, i) => (
                  <tr key={a.id}>
                    <td className="pp-center">{i + 1}</td>
                    <td>{ATTACHMENT_LABELS[a.kind] ?? a.kind}</td>
                    <td className="pp-break">{a.original_name}</td>
                    <td>{formatSize(a.size)}</td>
                    <td>{formatDateTime(a.uploaded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="pp-muted">
            Isi setiap berkas PDF ditampilkan pada halaman lampiran berikutnya. Setiap halaman asli PDF akan dicetak
            sebagai satu halaman tersendiri dengan orientasi mengikuti dokumen sumber.
          </p>

          {attachmentsLoading && (
            <div className="no-print alert alert-info py-2 small mb-0">
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Memuat dan menyiapkan seluruh halaman PDF dokumen pendukung...
            </div>
          )}

          {attachmentErrors.length > 0 && (
            <div className="pp-attachment-errors alert alert-warning small mt-3 mb-0">
              <strong>Beberapa lampiran tidak dapat dimuat:</strong>
              <ul className="mb-0 mt-1">
                {attachmentErrors.map((message, index) => (
                  <li key={`${index}-${message}`}>{message}</li>
                ))}
              </ul>
              <span>
                Lampiran yang gagal dimuat tidak akan muncul sebagai isi PDF. Periksa URL bertanda tangan dan konfigurasi CORS storage.
              </span>
            </div>
          )}

          {!attachmentsLoading && attachmentPages.length > 0 && (
            <p className="no-print text-success small mt-2 mb-0">
              {attachmentPages.length} halaman PDF berhasil disiapkan untuk dicetak.
            </p>
          )}
        </section>

        {/* ============ HALAMAN 6+: ISI PDF DOKUMEN PENDUKUNG ============ */}
        {attachmentPages.map((page) => (
          <section
            key={page.key}
            className={`pp-section pp-pdf-attachment ${
              page.orientation === "landscape" ? "pp-page-landscape" : "pp-page-portrait"
            }`}
          >
            <div className="pp-pdf-page-caption">
              <strong>
                {ATTACHMENT_LABELS[page.attachmentKind] ?? page.attachmentKind}: {page.attachmentName}
              </strong>
              <span>
                Halaman {page.pageNumber} dari {page.totalPages}
              </span>
            </div>
            <img
              className="pp-pdf-page-image"
              src={page.imageDataUrl}
              alt={`${page.attachmentName}, halaman ${page.pageNumber}`}
            />
          </section>
        ))}

        {/* ============ BAGIAN AKHIR: PENGESAHAN ============ */}
        <section className="pp-section pp-portrait">
          <h1 className="pp-title">PENGESAHAN</h1>
          <p className="pp-muted">Putaran pengajuan ke-{currentRound}</p>

          {(permit.approval_chain ?? []).length === 0 ? (
            <p className="pp-muted">Izin kerja ini belum diajukan, sehingga belum ada rantai persetujuan.</p>
          ) : (
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Tahap</th>
                  <th>Nama</th>
                  <th>Keputusan</th>
                  <th>Waktu</th>
                  <th>Catatan</th>
                  <th>Lokasi</th>
                  <th style={{ width: 110 }}>Tanda Tangan</th>
                </tr>
              </thead>
              <tbody>
                {/* Pemohon: diajukan pada stempel lokasi tahap "creator" */}
                <tr>
                  <td>Pemohon</td>
                  <td>
                    {permit.created_by?.full_name || "-"}
                    <div className="pp-muted">Subkontraktor</div>
                  </td>
                  <td>Mengajukan</td>
                  <td>{formatDateTime(geoFor("creator")?.captured_at)}</td>
                  <td>-</td>
                  <td>{formatGeo(geoFor("creator"))}</td>
                  <td className="pp-sign" />
                </tr>

                {(permit.approval_chain ?? []).map((step) => {
                  // Keputusan terakhir pada tahap ini di putaran berjalan
                  const decision = [...roundApprovals].reverse().find((a) => a.step === step.step);
                  // Penyetuju MK tidak punya akun: namanya dari decided_by_external
                  const external = decision?.decided_by_external;
                  const name = decision?.decided_by?.full_name ?? external?.name ?? decision?.decided_by_name ?? "-";
                  const stateText =
                    decision
                      ? decision.decision === "approved"
                        ? "Disetujui"
                        : "Ditolak"
                      : step.state === "pending"
                      ? "Menunggu keputusan"
                      : "Belum giliran";

                  return (
                    <tr key={step.step}>
                      <td>{STEP_LABELS[step.step] ?? step.step}</td>
                      <td>
                        {name}
                        {external && <div className="pp-muted">melalui tautan dan OTP email</div>}
                      </td>
                      <td>{stateText}</td>
                      <td>{formatDateTime(decision?.decided_at)}</td>
                      <td className="pp-pre">{decision?.remarks || "-"}</td>
                      <td>{formatGeo(geoFor(step.step))}</td>
                      <td className="pp-sign" />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {pastApprovals.length > 0 && (
            <>
              <h2 className="pp-subtitle">Riwayat Putaran Sebelumnya</h2>
              <table className="pp-table">
                <thead>
                  <tr>
                    <th>Putaran</th>
                    <th>Tahap</th>
                    <th>Nama</th>
                    <th>Keputusan</th>
                    <th>Waktu</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {pastApprovals.map((a, i) => (
                    <tr key={a.id ?? i}>
                      <td className="pp-center">{a.submission_round}</td>
                      <td>{STEP_LABELS[a.step] ?? a.step}</td>
                      <td>{a.decided_by?.full_name ?? a.decided_by_external?.name ?? a.decided_by_name ?? "-"}</td>
                      <td>{a.decision === "approved" ? "Disetujui" : "Ditolak"}</td>
                      <td>{formatDateTime(a.decided_at)}</td>
                      <td className="pp-pre">{a.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <p className="pp-muted pp-note">
            Persetujuan dilakukan secara digital di sistem. Kolom tanda tangan disediakan bila instansi memerlukan
            pengesahan basah.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ================================== CSS =================================== */
const PRINT_CSS = `
  /* Ukuran kertas. Footer diberi ruang melalui margin bawah agar tidak menimpa isi. */
  @page {
    size: A4 portrait;
    margin: 20mm 12mm 18mm;
  }

  @page workPermitPage {
    size: A4 portrait;
    margin: 20mm 12mm 18mm;
  }

  @page hiraPage {
    size: A4 landscape;
    margin: 18mm 10mm 16mm;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .pp-root {
    min-width: 0;
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5px;
    line-height: 1.35;

    /* PENGATURAN CETAK: jarak isi setelah area header pada halaman tertentu. */
    --pp-selected-hira-top-space: 18mm; /* Jarak atas halaman Aktivitas HIRA acuan */
    --pp-attachments-top-space: 18mm; /* Jarak atas halaman dokumen pendukung */
  }

  /* Nama halaman khusus agar rule header/footer cocok pada setiap orientasi. */
  .pp-hira { page: hiraPage; }
  .pp-portrait { page: workPermitPage; }

  /* Section boleh berlanjut ke halaman berikutnya jika kontennya panjang. */
  .pp-section {
    min-width: 0;
    break-inside: auto;
    page-break-inside: auto;
    break-after: page;
    page-break-after: always;
    padding-bottom: 3mm;
    orphans: 3;
    widows: 3;
  }

  .pp-section:last-of-type {
    break-after: auto;
    page-break-after: auto;
  }

  .pp-title {
    max-width: 100%;
    overflow: visible;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.35;
    text-align: center;
    margin: 0 0 7px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .pp-subtitle {
    font-size: 11px;
    font-weight: 700;
    margin: 10px 0 5px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .pp-muted { color: #555; font-size: 9.5px; }
  .pp-note { margin-top: 10px; }
  .pp-center { text-align: center; }
  .pp-pre { white-space: pre-wrap; overflow-wrap: anywhere; }
  .pp-break { overflow-wrap: anywhere; word-break: break-word; }

  .pp-info {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    margin: 0 0 8px;
  }

  .pp-info th,
  .pp-info td {
    border: 1px solid #444;
    padding: 4px 6px;
    vertical-align: top;
    text-align: left;
    overflow-wrap: anywhere;
  }

  .pp-info-label {
    width: 28%;
    background: #eee;
    font-weight: 600;
  }

  .pp-table {
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 9.5px;
    margin: 0 0 8px;
  }

  .pp-table th,
  .pp-table td {
    border: 1px solid #444;
    padding: 4px 5px;
    vertical-align: top;
    text-align: left;
    overflow-wrap: anywhere;
    word-break: normal;
  }

  .pp-table th {
    background: #eee;
    text-align: center;
  }

  .pp-table thead { display: table-header-group; }
  .pp-table tfoot { display: table-footer-group; }

  /* Baris tabel dijaga tetap utuh; tabel panjang tetap boleh lanjut ke halaman berikutnya. */
  .pp-table tr {
    break-inside: avoid-page;
    page-break-inside: avoid;
  }

  .pp-sign { height: 45px; }

  .pp-group {
    margin-bottom: 10px;
    break-inside: auto;
    page-break-inside: auto;
  }

  .pp-group-head {
    margin-bottom: 4px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .pp-tag {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 8.5px;
  }

  .pp-photo-block {
    margin-bottom: 12px;
    break-inside: auto;
    page-break-inside: auto;
  }

  .pp-photos {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 6px;
  }

  .pp-photo {
    display: block;
    width: 100%;
    max-width: 190px;
    height: 125px;
    object-fit: contain;
    border: 1px solid #999;
    background: #f8f9fa;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .pp-photo-missing {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #777;
    font-size: 9px;
  }

  /* Halaman isi lampiran yang dirender PDF.js. Satu halaman PDF menjadi satu halaman cetak. */
  .pp-pdf-attachment {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5mm;
  }

  .pp-pdf-page-caption {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    padding-bottom: 2mm;
    border-bottom: 1px solid #bbb;
    color: #444;
    font-size: 8px;
    overflow-wrap: anywhere;
  }

  .pp-pdf-page-caption strong {
    max-width: 80%;
  }

  .pp-pdf-page-image {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 245mm;
    object-fit: contain;
    margin: 0 auto;
    background: #fff;
  }

  .pp-attachment-errors {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .pp-watermark {
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 64px;
    font-weight: 800;
    color: rgba(220, 53, 69, 0.13);
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
  }

  .pp-footer { display: none; }

  /* Header layar tetap berada di lembar preview. Header cetak disembunyikan di layar. */
  .pp-print-header-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #333;
    border-bottom: 1px solid #bbb;
    padding: 0 0 8px;
    margin: 0 0 18px;
    font-size: 10px;
  }

  .pp-print-header-preview strong {
    text-align: right;
    overflow-wrap: anywhere;
  }

  /* Header cetak disembunyikan pada preview layar. */
  .pp-print-header {
    display: none;
  }

  /* Tampilan layar / preview sebelum dicetak. */
  @media screen {
    .pp-root {
      background: #e9ecef;
      min-height: 100vh;
      padding-bottom: 24px;
    }

    .pp-toolbar {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      padding: 10px 16px;
      background: #fff;
      border-bottom: 1px solid #ccc;
      position: sticky;
      top: 0;
      z-index: 1055;
      isolation: isolate;
      pointer-events: auto;
    }

    .pp-toolbar button {
      position: relative;
      z-index: 1;
      pointer-events: auto;
    }

    .pp-toolbar-hint {
      font-size: 12px;
      color: #555;
      flex: 1;
      min-width: 220px;
    }

    .pp-sheet {
      width: calc(100% - 32px);
      max-width: 1100px;
      margin: 16px auto;
      padding: 28px;
      background: #fff;
      box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
      overflow-x: auto;
      overflow-y: visible;
    }

    .pp-section {
      border-bottom: 2px dashed #bbb;
      margin-bottom: 24px;
      padding-bottom: 24px;
    }

    .pp-section:last-of-type {
      border-bottom: 0;
      margin-bottom: 0;
    }

    .pp-pdf-attachment {
      min-height: 420px;
      padding: 18px;
      border: 1px solid #ddd;
      margin-bottom: 24px;
      background: #fff;
    }

    .pp-pdf-page-image {
      max-height: 1100px;
      max-width: 100%;
    }

    /* HIRA memiliki 11 kolom; preview boleh digeser horizontal agar teks tidak terjepit. */
    .pp-hira .pp-table {
      min-width: 900px;
    }
  }

  /* Tampilan cetak. */
  @media print {
    html,
    body {
      width: 100%;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    .no-print { display: none !important; }

    /* Header untuk preview layar tidak ikut dicetak. */
    .pp-print-header-preview {
      display: none !important;
    }

    /* Header cetak sekarang menggunakan @page margin boxes agar setiap orientasi
       memiliki area kiri/kanan sendiri dan nomor tidak terpotong pada halaman portrait. */
    .pp-print-header {
      display: none !important;
    }

    .pp-root {
      width: 100%;
      min-height: 0;
      margin: 0;
      padding: 0;
      font-size: 9.5px;
      line-height: 1.25;
      background: #fff !important;
    }

    .pp-sheet {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 0;
      overflow: visible !important;
      box-shadow: none;
    }

    .pp-section {
      margin: 0;
      padding: 0 0 2mm;
      border: 0 !important;
    }

    /* Turunkan isi halaman 4 dan 5 agar tidak terlalu dekat dengan tepi atas kertas. */
    .pp-selected-hira {
      padding-top: var(--pp-selected-hira-top-space) !important;
    }

    .pp-attachments {
      padding-top: var(--pp-attachments-top-space) !important;
    }

    .pp-section:last-of-type {
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .pp-hira .pp-table {
      min-width: 0;
      font-size: 8px;
    }

    .pp-table,
    .pp-info {
      width: 100%;
      max-width: 100%;
    }

    .pp-table th,
    .pp-table td,
    .pp-info th,
    .pp-info td {
      padding: 3px 4px;
    }

    .pp-pdf-attachment.pp-page-portrait {
      page: workPermitPage;
      break-after: page;
      page-break-after: always;
    }

    .pp-pdf-attachment.pp-page-landscape {
      page: hiraPage;
      break-after: page;
      page-break-after: always;
    }

    .pp-pdf-page-image {
      max-width: 100%;
      max-height: 245mm;
      width: auto;
      height: auto;
    }

    .pp-pdf-attachment.pp-page-landscape .pp-pdf-page-image {
      max-height: 165mm;
    }

    .pp-attachment-errors {
      border: 1px solid #d39e00;
    }

    /* Footer dicetak oleh @bottom-center pada setiap page type, bukan fixed DOM. */
    .pp-footer {
      display: none !important;
    }

    .pp-watermark { z-index: 0; }
  }

  @media screen and (max-width: 576px) {
    .pp-sheet {
      width: calc(100% - 16px);
      margin: 8px auto;
      padding: 16px;
    }

    .pp-photos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .pp-photo {
      max-width: none;
      height: 110px;
    }

    .pp-toolbar { padding: 10px; }
    .pp-toolbar-hint { min-width: 100%; order: 3; }
  }
`;
