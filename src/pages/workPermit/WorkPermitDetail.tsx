// src/pages/workPermit/WorkPermitDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { WorkPermitListItem } from "../../types/WorkPermitList";

/**
 * Detail response untuk saat ini minimal sama dengan WorkPermitListItem.
 * Nanti backend bisa menambah field lain (description, checklist detail, approval trail, dsb).
 */
type WorkPermitDetailResponse = WorkPermitListItem & {
  // contoh jika nanti backend menambahkan:
  // description?: string;
  // verifiedBy?: string;
  // approvedBy?: string;
};

function typeLabel(type: WorkPermitListItem["type"]) {
  switch (type) {
    case "HEIGHT":
      return "Kerja di Ketinggian";
    case "CONFINED_SPACE":
      return "Ruang Terbatas";
    case "HOT_WORK":
      return "Pekerjaan Panas (Hot Work)";
    case "LIFTING":
      return "Pekerjaan Mengangkat";
    case "TOWER_CRANE":
      return "Instalasi / Segmen Tower Crane";
    default:
      return type;
  }
}

function statusBadge(status: WorkPermitListItem["status"]) {
  let className = "badge bg-secondary";
  if (status === "DRAFT") className = "badge bg-secondary";
  if (status === "SUBMITTED") className = "badge bg-info";
  if (status === "VERIFIED") className = "badge bg-warning text-dark";
  if (status === "APPROVED") className = "badge bg-success";
  if (status === "CLOSED") className = "badge bg-dark";
  return <span className={className}>{status}</span>;
}

export default function WorkPermitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<WorkPermitDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = async () => {
    try {
      setLoading(true);

      // Ambil detail permit
      const res = await api.get<WorkPermitDetailResponse>(`/work-permit/${id}/`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil detail izin kerja.");
      navigate("/work-permit/list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p>Sedang memuat detail...</p>;
  if (!data) return null;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="h4 mb-1">Detail Izin Kerja #{data.id}</h1>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            <strong>{typeLabel(data.type)}</strong> • Proyek:{" "}
            <strong>{data.project}</strong> • Lokasi:{" "}
            <strong>{data.location}</strong> • Tanggal:{" "}
            <strong>{data.date}</strong>
          </p>
        </div>

        {/* Tombol aksi di detail */}
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            Kembali
          </button>

          {/* Print diarahkan ke halaman print khusus */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/work-permit/${data.id}/print`)}
          >
            Print
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="mb-2">
                <strong>Status:</strong> {statusBadge(data.status)}
              </div>
              <div className="mb-2">
                <strong>Dibuat oleh:</strong> {data.createdBy}
              </div>

              {/* Flag foto dari backend */}
              <div className="mb-0">
                <strong>Foto:</strong>{" "}
                <span className="badge bg-light text-dark me-1">
                  Sebelum: {data.hasBeforePhotos ? "Ada" : "Tidak"}
                </span>
                <span className="badge bg-light text-dark">
                  Sesudah: {data.hasAfterPhotos ? "Ada" : "Tidak"}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              {/* Info tambahan untuk pengembangan berikutnya */}
              <div className="alert alert-info mb-0" style={{ fontSize: 13 }}>
                <strong>Catatan:</strong> Halaman ini menampilkan ringkasan data.
                Jika backend sudah mengirim field form lengkap (checklist, notes, dll),
                kita bisa render detail sesuai tipe izin (HEIGHT/HOT_WORK/dst).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder untuk detail isi form (nanti) */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0">
          <h2 className="h6 mb-0">Isi Form (akan ditampilkan lengkap saat endpoint detail siap)</h2>
        </div>
        <div className="card-body">
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Untuk saat ini, backend baru mengembalikan data ringkas (project, lokasi, tanggal, status, dll).
            Setelah endpoint detail mengirim semua field form, bagian ini bisa menampilkan checklist, APD,
            catatan, dan lampiran foto.
          </p>
        </div>
      </div>
    </div>
  );
}
