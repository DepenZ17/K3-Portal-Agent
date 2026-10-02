// src/pages/WorkPermitMenu.tsx
import { useNavigate } from "react-router-dom";
import CardMenu from "../components/CardMenu";

export default function WorkPermitMenu() {
  const navigate = useNavigate();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 mb-1">Izin Kerja Pekerjaan Berisiko Tinggi</h1>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Pilih jenis pekerjaan untuk membuat form izin kerja, atau lihat
            daftar seluruh izin yang sudah diajukan.
          </p>
        </div>

        <button
          className="btn btn-outline-success btn-sm"
          onClick={() => navigate("/work-permit/list")}
        >
          Lihat semua izin
        </button>
      </div>

      <div className="row g-3">
        <div className="col-6 col-md-4 col-lg-3">
          <CardMenu
            title="Izin Kerja di Ketinggian"
            onClick={() => navigate("/work-permit/height")}
          />
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <CardMenu
            title="Izin Kerja Ruang Terbatas (Confined Space)"
            onClick={() => navigate("/work-permit/confined-space")}
          />
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <CardMenu
            title="Izin Kerja Berpotensi Kebakaran & Ledakan (Hot Work)"
            onClick={() => navigate("/work-permit/hot-work")}
          />
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <CardMenu
            title="Izin Kerja Pekerjaan Mengangkat (Lifting)"
            onClick={() => navigate("/work-permit/lifting")}
          />
        </div>

        <div className="col-6 col-md-4 col-lg-3">
          <CardMenu
            title="Izin Kerja Instalasi & Segmen Tower Crane (TC)"
            onClick={() => navigate("/work-permit/tower-crane")}
          />
        </div>
      </div>

      <p className="text-muted mt-3" style={{ fontSize: 12 }}>
        *Saat ini form rinci tersedia untuk 5 jenis izin kerja. Pastikan seluruh checklist
        terisi sebelum diajukan untuk verifikasi/persetujuan.
      </p>
    </>
  );
}
