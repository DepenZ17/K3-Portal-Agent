// src/pages/workPermit/WorkPermitPrint.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { WorkPermitListItem } from "../../types/WorkPermitList";

type WorkPermitPrintResponse = WorkPermitListItem & {
  // nanti bisa ditambah data form lengkap di sini jika diperlukan
};

function typeLabel(type: WorkPermitListItem["type"]) {
  switch (type) {
    case "HEIGHT":
      return "Kerja di Ketinggian";
    case "CONFINED_SPACE":
      return "Ruang Terbatas (Confined Space)";
    case "HOT_WORK":
      return "Pekerjaan Panas (Hot Work)";
    case "LIFTING":
      return "Pekerjaan Pengangkatan (Lifting)";
    case "TOWER_CRANE":
      return "Instalasi / Segmen Tower Crane";
    default:
      return type;
  }
}

export default function WorkPermitPrint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<WorkPermitPrintResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get<WorkPermitPrintResponse>(`/work-permit/${id}/`);
      setData(res.data);
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

  // Auto print setelah data dimuat
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
        <p className="text-muted mt-2" style={{ fontSize: 13 }}>Sedang menyiapkan lembar cetak...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container my-4 print-container" style={{ maxWidth: "850px" }}>
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
        
        {/* Header Dokumen */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <div>
            <h5 className="fw-bold mb-1 text-uppercase">K3 AGENT PORTAL PROJECT</h5>
            <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
              Sistem Manajemen Keselamatan &amp; Kesehatan Kerja Konstruksi
            </p>
          </div>
          <div className="text-end">
            <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: "11px" }}>
              No. Dokumen: WP-{data.id}/K3/{new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Judul Form */}
        <div className="text-center mb-4">
          <h2 className="h4 fw-bold text-uppercase mb-1">SURAT IZIN KERJA BERISIKO TINGGI</h2>
          <span className="badge bg-success bg-opacity-15 text-success border border-success px-3 py-1 fw-semibold" style={{ fontSize: "13px" }}>
            {typeLabel(data.type)}
          </span>
        </div>

        {/* Tabel Informasi Utama */}
        <table className="table table-bordered table-sm mb-4" style={{ fontSize: "13px" }}>
          <tbody>
            <tr>
              <th className="bg-light" style={{ width: "25%" }}>ID Izin Kerja</th>
              <td>#{data.id}</td>
            </tr>
            <tr>
              <th className="bg-light">Proyek</th>
              <td>{data.project}</td>
            </tr>
            <tr>
              <th className="bg-light">Lokasi Pekerjaan</th>
              <td>{data.location}</td>
            </tr>
            <tr>
              <th className="bg-light">Tanggal Pengajuan</th>
              <td>{data.date}</td>
            </tr>
            <tr>
              <th className="bg-light">Status Persetujuan</th>
              <td>
                <span className="fw-bold text-uppercase">
                  {data.status}
                </span>
              </td>
            </tr>
            <tr>
              <th className="bg-light">Pemohon (Subcontractor)</th>
              <td>{data.createdBy}</td>
            </tr>
            <tr>
              <th className="bg-light">Lampiran Dokumentasi</th>
              <td>
                <div className="d-flex gap-4">
                  <span>Sebelum Kerja: <strong>{data.hasBeforePhotos ? "Ada (Terlampir)" : "Tidak Ada"}</strong></span>
                  <span>Sesudah Kerja: <strong>{data.hasAfterPhotos ? "Ada (Terlampir)" : "Tidak Ada"}</strong></span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Catatan / Keterangan Tambahan */}
        <div className="p-3 bg-light rounded border mb-4" style={{ fontSize: "12px" }}>
          <strong>Catatan K3:</strong> Dokumen izin kerja ini wajib dibawa oleh pengawas lapangan selama pekerjaan berlangsung dan diletakkan di area kerja yang mudah diakses untuk keperluan audit keselamatan K3.
        </div>

        {/* Kolom Tanda Tangan / Persetujuan Resmi */}
        <div className="row mt-5 text-center" style={{ fontSize: "12px" }}>
          <div className="col-4">
            <p className="mb-1">Diajukan oleh:</p>
            <strong className="text-muted">Subcontractor</strong>
            <div style={{ height: "55px" }}></div>
            <div className="border-top pt-1 mx-3">Nama &amp; Tanda Tangan</div>
          </div>
          <div className="col-4">
            <p className="mb-1">Diperiksa &amp; Diverifikasi:</p>
            <strong className="text-muted">HSE Officer</strong>
            <div style={{ height: "55px" }}></div>
            <div className="border-top pt-1 mx-3">Nama &amp; Tanda Tangan</div>
          </div>
          <div className="col-4">
            <p className="mb-1">Persetujuan Akhir:</p>
            <strong className="text-muted">Project Manager / MK</strong>
            <div style={{ height: "55px" }}></div>
            <div className="border-top pt-1 mx-3">Nama &amp; Tanda Tangan</div>
          </div>
        </div>

      </div>

      {/* Pengaturan Khusus Media Cetak Browser */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
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