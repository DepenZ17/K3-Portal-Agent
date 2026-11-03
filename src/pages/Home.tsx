// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CardMenu from "../components/CardMenu";
import { getDashboardStats, getDashboardTasks } from "../services/dashboardServices";
import type { DashboardStats, DashboardTask, DocumentCounts } from "../services/dashboardServices";

// Keterangan waktu singkat
const formatRelative = (iso?: string): string => {
  if (!iso) return "";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

// Rute dokumen dari type + id (id saja tidak cukup: urutan id HIRA dan izin kerja bisa sama)
const getTaskRoute = (task: DashboardTask): string => {
  if (task.type === "hira") return `/hira/${task.id}`;
  if (task.type === "permit") return `/work-permit/${task.id}`;
  return "/home";
};

interface StatTileProps {
  value: number;
  label: string;
  colorClass: string;
  hint?: string;
  withBorder?: boolean;
}

function StatTile({ value, label, colorClass, hint, withBorder }: StatTileProps) {
  return (
    <div className={`col-4 ${withBorder ? "border-end" : ""}`}>
      <div className={`fw-bold fs-2 ${colorClass}`}>{value}</div>
      <div className="text-muted small">{label}</div>
      {hint && <div className="text-muted" style={{ fontSize: "11px" }}>{hint}</div>}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mendapatkan peran (role) pengguna aktif
  const currentRole = user?.role || "";
  const isSubcontractor = currentRole === "subcontractor";
  const isCoordinator = currentRole === "hse_coordinator";

  // Daftar peran yang memiliki akses modul K3
  const isK3Role = [
    "subcontractor",
    "hse_officer",
    "project_manager",
    "hse_coordinator",
    "supervisor",
  ].includes(currentRole);

  // State komponen
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Mengambil data dashboard secara paralel dari backend
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          getDashboardStats(),
          getDashboardTasks(50),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setTasks(tasksData);
      } catch (err: unknown) {
        if (cancelled) return;
        if (axios.isAxiosError(err)) {
          const backendMsg = err.response?.data?.detail || err.message;
          setErrorMessage(`Gagal memuat data dashboard: ${backendMsg}`);
        } else {
          setErrorMessage("Terjadi kesalahan saat menghubungkan ke server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hira = stats?.hira;
  const permits = stats?.permits;
  const sum = (key: keyof DocumentCounts) => (hira?.[key] ?? 0) + (permits?.[key] ?? 0);
  const pendingAction = stats?.pending_action ?? 0;

  const queueTitle = isCoordinator
    ? "Pusat Pengawasan & Kontrol K3"
    : isSubcontractor
    ? "Tugas Saya"
    : "Antrean Tugas & Approval";

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

        {/* Subkontraktor tidak punya halaman audit global (hanya riwayat dokumennya sendiri) */}
        {isK3Role && (
          <div className="col-12 col-sm-6 col-lg-3">
            <CardMenu title="Audit Log" onClick={() => navigate("/audit")} />
          </div>
        )}

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
                    <StatTile
                      value={sum("approved")}
                      label="Disetujui"
                      colorClass="text-success"
                      hint={`HIRA ${hira?.approved ?? 0} · Izin ${permits?.approved ?? 0}`}
                      withBorder
                    />
                    <StatTile
                      value={sum("pending")}
                      label="Dalam Reviu"
                      colorClass="text-warning"
                      hint={`HIRA ${hira?.pending ?? 0} · Izin ${permits?.pending ?? 0}`}
                      withBorder
                    />
                    <StatTile
                      value={sum("rejected")}
                      label="Ditolak"
                      colorClass="text-danger"
                      hint={`HIRA ${hira?.rejected ?? 0} · Izin ${permits?.rejected ?? 0}`}
                    />
                  </>
                ) : (
                  <>
                    <StatTile
                      value={hira?.total ?? 0}
                      label="Total HIRA"
                      colorClass="text-success"
                      hint={`${hira?.pending ?? 0} dalam reviu`}
                      withBorder
                    />
                    <StatTile
                      value={permits?.total ?? 0}
                      label="Total Izin Kerja"
                      colorClass="text-warning"
                      hint={`${permits?.pending ?? 0} dalam reviu`}
                      withBorder
                    />
                    <StatTile value={pendingAction} label="Pending Aksi" colorClass="text-primary" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 2: Antrean tugas (semua role punya antrean sesuai kewenangannya) */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0 fw-bold text-dark">{queueTitle}</h2>
              {!loading && pendingAction > 0 && (
                <span className={`badge rounded-pill ${isCoordinator ? "bg-secondary" : "bg-danger"}`}>
                  {pendingAction} {isCoordinator ? "Dalam Reviu" : "Perlu Tindakan"}
                </span>
              )}
            </div>
            <div className="card-body">
              {isCoordinator && (
                <p className="text-muted small">
                  Menampilkan seluruh dokumen yang sedang direviu di semua proyek. Pembatalan dilakukan dari halaman
                  detail dokumen.
                </p>
              )}

              <div className="list-group list-group-flush" style={{ maxHeight: "360px", overflowY: "auto" }}>
                {loading ? (
                  <div className="text-center py-4 text-muted small">Memuat daftar tugas...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-4 text-muted small">Tidak ada antrean tugas tertunda saat ini.</div>
                ) : (
                  tasks.map((task) => {
                    const waitingOnMe = task.waiting_on === currentRole;

                    return (
                      <button
                        key={`${task.type}-${task.id}`}
                        type="button"
                        className="list-group-item list-group-item-action px-0 py-2 border-0 text-start"
                        onClick={() => navigate(getTaskRoute(task))}
                      >
                        <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                          <span className={`badge ${task.type === "hira" ? "bg-info text-dark" : "bg-warning text-dark"}`}>
                            {task.category}
                          </span>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            {formatRelative(task.updated_at)}
                          </small>
                        </div>
                        <p className="mb-1 text-dark fw-semibold small">{task.title}</p>
                        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ fontSize: "12px" }}>
                          <span className="text-muted">{task.project_name}</span>
                          <span className="text-muted">·</span>
                          <span className="text-muted">{task.status_label}</span>
                          <span className={`badge ${waitingOnMe ? "bg-danger" : "bg-light text-dark border"}`}>
                            {waitingOnMe ? "Menunggu Anda" : `Menunggu ${task.waiting_on_label}`}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {!loading && pendingAction > tasks.length && (
                <small className="text-muted d-block mt-2">
                  Menampilkan {tasks.length} dari {pendingAction} tugas.
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}