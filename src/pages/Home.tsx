// src/pages/Home.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CardMenu from "../components/CardMenu";
import { getDashboardStats, getDashboardTasks } from "../services/dashboardServices";
import type { DashboardStats, DashboardTask } from "../services/dashboardServices";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mendapatkan peran (role) pengguna aktif
  const currentRole = user?.role || "";
  const isSubcontractor = currentRole === "subcontractor";
  
  // Daftar peran yang memiliki akses modul K3
  const isK3Role = [
    "subcontractor",
    "hse_officer",
    "project_manager",
    "hse_coordinator",
    "supervisor",
  ].includes(currentRole);

  // Daftar peran yang bertindak sebagai pemberi persetujuan (approver)
  const isApproverRole = [
    "hse_officer",
    "hse_coordinator",
    "supervisor",
    "project_manager",
  ].includes(currentRole);

  // State komponen
  const [stats, setStats] = useState<DashboardStats>({});
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * Fungsi helper terpusat di frontend untuk menentukan rute navigasi detail dokumen
   * berdasarkan kategori dan ID tugas.
   */
  const getTaskRoute = (category: string, id: number): string => {
    const normalizedCategory = category.toLowerCase();
    
    if (normalizedCategory.includes("hira")) {
      return `/hira/${id}`;
    } 
    
    if (normalizedCategory.includes("permit") || normalizedCategory.includes("izin") || normalizedCategory.includes("work")) {
      return `/work-permit/${id}`;
    }

    // Fallback default ke daftar izin kerja jika kategori tidak dikenali
    return "/work-permit/list";
  };

  // Mengambil data dashboard secara paralel dari backend
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [statsData, tasksData] = await Promise.all([
        getDashboardStats(),
        getDashboardTasks(),
      ]);

      setStats(statsData);
      setTasks(tasksData);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMsg = err.response?.data?.detail || err.message;
        setErrorMessage(`Gagal memuat data dashboard: ${backendMsg}`);
      } else {
        setErrorMessage("Terjadi kesalahan saat menghubungkan ke server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header Dashboard */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold text-dark">
            Dashboard {user?.role ? user.role.replace("_", " ").toUpperCase() : "K3"}
          </h1>
          <p className="text-muted mb-0">
            Selamat datang kembali, <strong>{user?.full_name}</strong>. Berikut ringkasan operasional K3 Anda.
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
          <CardMenu title="HIRA / HIRADC" onClick={() => navigate("/hira")} />
        </div>

        {isSubcontractor && (
          <div className="col-12 col-sm-6 col-lg-3">
            <CardMenu title="Izin Kerja Berisiko Tinggi" onClick={() => navigate("/work-permit")} />
          </div>
        )}

        {isK3Role && (
          <div className="col-12 col-sm-6 col-lg-3">
            <CardMenu title="Daftar Izin Kerja" onClick={() => navigate("/work-permit/list")} />
          </div>
        )}

        <div className="col-12 col-sm-6 col-lg-3">
          <CardMenu title="Audit Log" onClick={() => navigate("/audit")} />
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <CardMenu title="Rule & Law" onClick={() => navigate("/rules")} />
        </div>
      </div>

      {/* Alert Error jika gagal memuat data */}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {/* Panel Utama 2 Kolom Berdampingan Simetris */}
      <div className="row g-4">
        {/* Kolom 1: Ringkasan Statistik */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h2 className="h6 mb-0 fw-bold text-dark">
                {isSubcontractor ? "Status Pengajuan Saya" : "Ringkasan Aktivitas K3"}
              </h2>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <p className="text-muted small">
                {isSubcontractor 
                  ? "Rekapitulasi dokumen izin kerja dan HIRA yang Anda ajukan." 
                  : "Statistik dokumen keselamatan kerja lapangan."}
              </p>
              <div className="row text-center my-auto py-3">
                {loading ? (
                  <div className="py-3 text-muted small">Memuat statistik...</div>
                ) : isSubcontractor ? (
                  <>
                    <div className="col-4 border-end">
                      <div className="fw-bold fs-2 text-success">{stats.approved_count ?? 0}</div>
                      <div className="text-muted small">Disetujui</div>
                    </div>
                    <div className="col-4 border-end">
                      <div className="fw-bold fs-2 text-warning">{stats.pending_count ?? 0}</div>
                      <div className="text-muted small">Pending Reviu</div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold fs-2 text-danger">{stats.rejected_count ?? 0}</div>
                      <div className="text-muted small">Ditolak</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-4 border-end">
                      <div className="fw-bold fs-2 text-success">{stats.total_hira ?? 0}</div>
                      <div className="text-muted small">Total HIRA</div>
                    </div>
                    <div className="col-4 border-end">
                      <div className="fw-bold fs-2 text-warning">{stats.total_permits ?? 0}</div>
                      <div className="text-muted small">Total Permit</div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold fs-2 text-primary">{stats.pending_count ?? 0}</div>
                      <div className="text-muted small">Pending Aksi</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 2: Antrean Tugas & Approval */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-bold text-dark">
                {isApproverRole ? "Antrean Tugas & Approval" : "Pusat Informasi & Status"}
              </h2>
              {isApproverRole && tasks.length > 0 && (
                <span className="badge bg-danger rounded-pill">
                  {tasks.length} Perlu Tindakan
                </span>
              )}
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {loading ? (
                  <div className="text-center py-4 text-muted small">Memuat daftar tugas...</div>
                ) : isApproverRole ? (
                  tasks.length > 0 ? (
                    tasks.map((task) => {
                      // Menggunakan fungsi perangkai rute mandiri di frontend
                      const targetUrl = getTaskRoute(task.category, task.id);

                      return (
                        <div
                          key={task.id}
                          className="list-group-item list-group-item-action px-0 py-2 border-0 cursor-pointer"
                          onClick={() => navigate(targetUrl)}
                        >
                          <div className="d-flex w-100 justify-content-between align-items-center">
                            <span className="badge bg-warning text-dark mb-1">{task.category}</span>
                            <small className="text-muted text-uppercase" style={{ fontSize: "10px" }}>
                              {task.status.replace("_", " ")}
                            </small>
                          </div>
                          <p className="mb-1 text-dark fw-semibold small">{task.title}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted small">
                      Tidak ada antrean tugas tertunda saat ini.
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 text-muted small">
                    Tidak ada antrean tugas tertunda untuk peran Anda saat ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}