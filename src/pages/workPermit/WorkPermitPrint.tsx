// src/pages/workPermit/WorkPermitPrint.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkPermitById } from "../../services/workPermitServices";
import type { WorkPermitDetail } from "../../types/workPermit";

function typeLabel(type: string) {
  switch (type) {
    case "working_at_height":
      return "Kerja di Ketinggian (Working at Height)";
    case "confined_space":
      return "Ruang Terbatas (Confined Space)";
    case "fire_explosive":
      return "Pekerjaan Panas & Bahaya Ledakan (Fire & Explosive)";
    case "lifting":
      return "Pekerjaan Pengangkatan (Lifting)";
    case "tower_crane":
      return "Instalasi / Segmen Tower Crane";
    default:
      return type;
  }
}

export default function WorkPermitPrint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<WorkPermitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getWorkPermitById(id);
      setData(res);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data untuk print.");
      navigate("/work-permit/list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-print setelah data selesai dimuat
  useEffect(() => {
    if (!loading && data) {
      setTimeout(() => window.print(), 300);
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Memuat data cetak...</span>
        </div>
        <p className="text-muted mt-2" style={{ fontSize: 13 }}>Sedang menyiapkan lembar cetak dokumen...</p>
      </div>
    );
  }

  if (!data) return null;

  // Cek apakah ada foto before/after
  const hasBefore = data.photos?.some((p) => p.stage === "before");
  const hasAfter = data.photos?.some((p) => p.stage === "after");

  return (
    <div className="container my-4 print-container" style={{ maxWidth: "900px" }}>
      {/* Toolbar Navigasi (Otomatis hilang saat dicetak berkat kelas .no-print) */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h1 className="h5 mb-0 fw-bold text-success">Pratinjau Cetak Izin Kerja #{data.id}</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            ← Kembali
          </button>
          <button className="btn btn-success btn-sm fw-bold" onClick={() => window.print()}>
            🖨️ Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Lembar Dokumen Resmi K3 */}
      <div className="card shadow-sm border p-4 bg-white mx-auto">
        
        {/* Header Dokumen Resmi */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div>
            <h5 className="fw-bold mb-1 text-uppercase text-dark">K3 AGENT PORTAL PROJECT</h5>
            <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
              Sistem Manajemen Keselamatan &amp; Kesehatan Kerja Konstruksi
            </p>
          </div>
          <div className="text-end">
            <div className="fw-bold text-dark" style={{ fontSize: "12px" }}>
              {data.form?.code || "F.01/P.10/SHE/KPT"} (Rev: {data.form?.revision || "01"})
            </div>
            <span className="text-muted" style={{ fontSize: "11px" }}>
              No. Dok: <strong>{data.document_number || `WP-${data.id}/K3`}</strong>
            </span>
          </div>
        </div>

        {/* Judul Form */}
        <div className="text-center mb-3">
          <h2 className="h4 fw-bold text-uppercase mb-1">SURAT IZIN KERJA BERISIKO TINGGI</h2>
          <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 fw-semibold" style={{ fontSize: "13px" }}>
            {typeLabel(data.permit_type)}
          </span>
        </div>

        {/* Tabel Informasi Utama */}
        <table className="table table-bordered table-sm mb-3" style={{ fontSize: "12px" }}>
          <tbody>
            <tr>
              <th className="bg-light" style={{ width: "25%" }}>ID &amp; Status Dokumen</th>
              <td>
                <span className="fw-bold me-3">#{data.id}</span>
                <span>Status: <strong className="text-uppercase">{data.status}</strong></span>
              </td>
            </tr>
            <tr>
              <th className="bg-light">Proyek / Area Kerja</th>
              <td>{data.project_name || `Proyek ID: ${data.project}`}</td>
            </tr>
            <tr>
              <th className="bg-light">Lokasi Spesifik</th>
              <td>{data.work_location}</td>
            </tr>
            <tr>
              <th className="bg-light">Waktu Pelaksanaan</th>
              <td>
                Tanggal: <strong>{data.work_date}</strong> | Pukul: <strong>{data.work_start} s/d {data.work_end} WIB</strong>
              </td>
            </tr>
            <tr>
              <th className="bg-light">Deskripsi Pekerjaan</th>
              <td>{data.work_description}</td>
            </tr>
            <tr>
              <th className="bg-light">Peralatan yang Digunakan</th>
              <td>{data.equipment_used || "Tidak ada catatan peralatan khusus"}</td>
            </tr>
            <tr>
              <th className="bg-light">Penanggung Jawab / Pekerja</th>
              <td>
                PJ Lapangan: <strong>{data.person_in_charge}</strong> | Jumlah Pekerja: <strong>{data.worker_count} Orang</strong>
              </td>
            </tr>
            <tr>
              <th className="bg-light">Pemohon (Subcontractor)</th>
              <td>{data.created_by?.full_name || "Subkontraktor"} (Role: {data.created_by?.role || "subcontractor"})</td>
            </tr>
          </tbody>
        </table>

        {/* Informasi Keselamatan & APD */}
        <div className="row mb-3" style={{ fontSize: "12px" }}>
          <div className="col-6">
            <div className="border p-2 rounded bg-light h-100">
              <strong className="d-block mb-1 text-dark">Area Keselamatan / Zona:</strong>
              {data.safety_areas && data.safety_areas.length > 0 ? (
                <ul className="mb-0 ps-3">
                  {data.safety_areas.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted">-</span>
              )}
            </div>
          </div>
          <div className="col-6">
            <div className="border p-2 rounded bg-light h-100">
              <strong className="d-block mb-1 text-dark">Alat Pelindung Diri (APD) Wajib:</strong>
              {data.ppe && data.ppe.length > 0 ? (
                <div>{data.ppe.join(", ")}</div>
              ) : (
                <span className="text-muted">-</span>
              )}
              {data.ppe_other && data.ppe_other.length > 0 && (
                <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
                  Catatan APD Lain: {data.ppe_other.join("; ")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dokumentasi Foto */}
        <div className="border p-2 rounded mb-3 bg-light" style={{ fontSize: "12px" }}>
          <div className="d-flex justify-content-between">
            <span>Lampiran Foto Sebelum Kerja (Before): <strong>{hasBefore ? "Ada (Terlampir di Sistem)" : "Tidak Ada"}</strong></span>
            <span>Lampiran Foto Sesudah Kerja (After): <strong>{hasAfter ? "Ada (Terlampir di Sistem)" : "Belum Ada"}</strong></span>
          </div>
        </div>

        {/* Catatan / Keterangan Tambahan K3 */}
        <div className="p-2 bg-light rounded border mb-4" style={{ fontSize: "11px" }}>
          <strong>Ketentuan K3:</strong> Formulir izin kerja ini wajib diletakkan di area kerja yang mudah terlihat. Pengawas lapangan dan petugas HSE berhak menghentikan pekerjaan jika ditemukan pelanggaran prosedur K3.
        </div>

        {/* Kolom Tanda Tangan / Persetujuan Resmi */}
        <div className="row mt-4 text-center" style={{ fontSize: "12px" }}>
          <div className="col-4">
            <p className="mb-1">Diajukan oleh:</p>
            <strong className="text-muted">Subcontractor</strong>
            <div style={{ height: "45px" }}></div>
            <div className="border-top pt-1 mx-2">{data.created_by?.full_name || "Nama & Tanda Tangan"}</div>
          </div>
          <div className="col-4">
            <p className="mb-1">Diperiksa &amp; Diverifikasi:</p>
            <strong className="text-muted">HSE Officer</strong>
            <div style={{ height: "45px" }}></div>
            <div className="border-top pt-1 mx-2">Nama &amp; Tanda Tangan</div>
          </div>
          <div className="col-4">
            <p className="mb-1">Persetujuan Akhir:</p>
            <strong className="text-muted">Project Manager / MK</strong>
            <div style={{ height: "45px" }}></div>
            <div className="border-top pt-1 mx-2">Nama &amp; Tanda Tangan</div>
          </div>
        </div>

      </div>

      {/* Pengaturan Khusus Media Cetak Browser */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}