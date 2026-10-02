// src/pages/workPermit/WorkPermitPrint.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import type { WorkPermitListItem } from "../../types/WorkPermitList";

type WorkPermitPrintResponse = WorkPermitListItem & {
  // nanti bisa ditambah data form lengkap di sini
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

  // Auto print setelah data ada (biar user tinggal Ctrl+P / dialog print muncul)
  useEffect(() => {
    if (!loading && data) {
      // kecilkan delay supaya browser sempat render sebelum print
      setTimeout(() => window.print(), 200);
    }
  }, [loading, data]);

  if (loading) return <p>Sedang menyiapkan halaman print...</p>;
  if (!data) return null;

  return (
    <div className="print-page">
      {/* Toolbar (akan hilang saat print) */}
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <h1 className="h5 mb-0">Print Izin Kerja #{data.id}</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            Kembali
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      {/* Konten print */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="text-center mb-3">
            <h2 className="h5 mb-1">FORM IZIN KERJA</h2>
            <div className="text-muted" style={{ fontSize: 13 }}>
              {typeLabel(data.type)}
            </div>
          </div>

          <table className="table table-sm">
            <tbody>
              <tr>
                <td style={{ width: 160 }}><strong>ID</strong></td>
                <td>#{data.id}</td>
              </tr>
              <tr>
                <td><strong>Proyek</strong></td>
                <td>{data.project}</td>
              </tr>
              <tr>
                <td><strong>Lokasi</strong></td>
                <td>{data.location}</td>
              </tr>
              <tr>
                <td><strong>Tanggal</strong></td>
                <td>{data.date}</td>
              </tr>
              <tr>
                <td><strong>Status</strong></td>
                <td>{data.status}</td>
              </tr>
              <tr>
                <td><strong>Dibuat oleh</strong></td>
                <td>{data.createdBy}</td>
              </tr>
              <tr>
                <td><strong>Foto</strong></td>
                <td>
                  Sebelum: {data.hasBeforePhotos ? "Ada" : "Tidak"} • Sesudah:{" "}
                  {data.hasAfterPhotos ? "Ada" : "Tidak"}
                </td>
              </tr>
            </tbody>
          </table>

          <hr />

          {/* Placeholder: nanti isi form lengkap + approval block Anda bisa ditaruh di sini */}
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            *Layout print lengkap (checklist, APD, approval/tanda tangan) bisa ditambahkan
            setelah backend mengirim field detail form. Saat ini halaman print menampilkan ringkasan.
          </p>
        </div>
      </div>

      {/* CSS khusus print */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { border: none !important; box-shadow: none !important; }
          .print-page { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
