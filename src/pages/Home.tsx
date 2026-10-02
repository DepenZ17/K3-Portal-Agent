// src/pages/Home.tsx
import { useAuth } from "../hooks/useAuth";
//import type { Role } from "../types/auth";
import { useNavigate } from "react-router-dom";
import CardMenu from "../components/CardMenu";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentRole = user?.role || "";

  const isSubcontractor = currentRole === "subcontractor";
  
  // Penyesuaian Role K3 (mengganti awalan she_ menjadi hse_)
  const isK3Role = [
    "subcontractor",
    "hse_officer",
    "project_manager",
    "hse_coordinator",
    "supervisor",
  ].includes(currentRole);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold text-dark">Dashboard K3</h1>
          <p className="text-muted mb-0">
            Ringkasan modul untuk pengelolaan Keselamatan &amp; Kesehatan Kerja.
          </p>
        </div>

        <div className="text-end">
          <small className="text-muted d-block" style={{ fontSize: "11px" }}>
            Status Sistem
          </small>
          <span className="badge bg-success">Online</span>
        </div>
      </div>

      {/* Grid Modul Cepat */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <CardMenu
            title="HIRA / HIRADC"
            onClick={() => navigate("/jsa")}
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <CardMenu
            title="Equipment & APD"
            onClick={() => navigate("/equipment")}
          />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <CardMenu
            title="Rule & Law"
            onClick={() => navigate("/rules")}
          />
        </div>

        {/* MUNCUL UNTUK SUBCONTRACTOR */}
        {isSubcontractor && (
          <div className="col-12 col-sm-6 col-lg-3">
            <CardMenu
              title="Izin Kerja Berisiko Tinggi"
              onClick={() => navigate("/work-permit")}
            />
          </div>
        )}

        {/* MUNCUL UNTUK SEMUA ROLE K3 */}
        {isK3Role && (
          <div className="col-12 col-sm-6 col-lg-3">
            <CardMenu
              title="Daftar Izin Kerja"
              onClick={() => navigate("/work-permit/list")}
            />
          </div>
        )}
      </div>

      {/* Panel Utama 2 Kolom Berdampingan Simetris */}
      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h2 className="h6 mb-0 fw-bold text-dark">
                Ringkasan Aktivitas K3
              </h2>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <p className="text-muted small">
                Statistik terkini aktivitas keselamatan kerja lapangan.
              </p>
              <div className="row text-center my-auto py-3">
                <div className="col-4 border-end">
                  <div className="fw-bold fs-2 text-success">12</div>
                  <div className="text-muted small">JSA Bulan Ini</div>
                </div>
                <div className="col-4 border-end">
                  <div className="fw-bold fs-2 text-warning">3</div>
                  <div className="text-muted small">Pending Permit</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold fs-2 text-primary">98%</div>
                  <div className="text-muted small">Kepatuhan APD</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-bold text-dark">
                Pusat Notifikasi &amp; Tugas
              </h2>
              <span className="badge bg-danger rounded-pill">
                2 Perlu Tindakan
              </span>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div
                  className="list-group-item list-group-item-action px-0 py-2 border-0 cursor-pointer"
                  onClick={() => navigate("/work-permit/list")}
                >
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <span className="badge bg-warning text-dark mb-1">
                      Permohonan Baru
                    </span>
                    <small className="text-muted">10 mnt lalu</small>
                  </div>
                  <p className="mb-1 text-dark fw-semibold small">
                    Work Permit Ketinggian diajukan untuk Area Tower Crane A
                  </p>
                  <small className="text-muted" style={{ fontSize: "12px" }}>
                    Status: Menunggu Persetujuan HSE Officer
                  </small>
                </div>

                <div
                  className="list-group-item list-group-item-action px-0 py-2 border-0 cursor-pointer"
                  onClick={() => navigate("/jsa")}
                >
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <span className="badge bg-info text-dark mb-1">
                      Review JSA
                    </span>
                    <small className="text-muted">1 jam lalu</small>
                  </div>
                  <p className="mb-1 text-dark fw-semibold small">
                    Dokumen JSA Pekerjaan Pengelasan Pipa Gas belum ditandatangani
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}