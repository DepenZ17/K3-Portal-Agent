// src/pages/Home.tsx
//
// Dashboard. Data dari dua endpoint: /dashboard/stats/ (angka ringkasan) dan /dashboard/tasks/ (antrean tugas).
// Perubahan tampilan: sapaan sesuai waktu, ringkasan dalam kalimat, kartu angka berikon, grafik komposisi dokumen,
// antrean tugas dengan filter, panduan alur per peran, dan akses cepat dengan keterangan.
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getDashboardStats, getDashboardTasks } from "../services/dashboardServices";
import type { DashboardStats, DashboardTask, DocumentCounts } from "../services/dashboardServices";

/* ============================ KONSTANTA & HELPER ============================ */

const ROLE_LABELS: Record<string, string> = {
  subcontractor: "Subkontraktor",
  supervisor: "Supervisor",
  hse_officer: "HSE Officer",
  hse_coordinator: "HSE Coordinator",
  project_manager: "Project Manager",
};

// Panduan singkat per peran (ditampilkan di kartu "Alur kerja Anda")
const ROLE_GUIDE: Record<string, string[]> = {
  subcontractor: [
    "Buat dokumen HIRA lalu ajukan untuk direviu HSE Officer dan Project Manager.",
    "Setelah HIRA disetujui, buat izin kerja dan pilih aktivitas HIRA yang dipakai.",
    "Unggah foto sebelum kerja, surat keterangan sehat, dan sertifikat (PDF), lalu ajukan.",
    "Setelah pekerjaan selesai, unggah foto sesudah kerja dan ajukan penutupan izin.",
  ],
  supervisor: [
    "Buka tugas yang berlabel “Menunggu Anda”.",
    "Periksa data pekerjaan, foto, dan lampiran izin kerja.",
    "Setujui (lokasi GPS Anda direkam sebagai bukti kehadiran) atau tolak dengan alasan yang jelas.",
  ],
  hse_officer: [
    "Reviu HIRA dan izin kerja yang menunggu Anda.",
    "Saat menyetujui izin, lokasi GPS Anda direkam sebagai bukti kehadiran.",
    "Tetapkan nomor dokumen dan konfirmasi penutupan izin setelah pekerjaan selesai.",
  ],
  project_manager: [
    "Reviu HIRA dan izin kerja pada proyek Anda.",
    "Izin berisiko Tinggi dan Ekstrem yang Anda setujui diteruskan ke Manajemen Konstruksi lewat email.",
    "Tolak dengan alasan yang jelas bila ada yang belum memenuhi standar.",
  ],
  hse_coordinator: [
    "Pantau seluruh dokumen yang sedang direviu di semua proyek.",
    "Lihat kolom “Menunggu ...” untuk tahu siapa yang sedang memegang tiap dokumen.",
    "Batalkan dokumen yang tidak sesuai standar, atau kirim ulang tautan MK bila email gagal.",
  ],
};

// Sapaan sesuai jam di perangkat pengguna
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
};

const formatToday = (): string =>
  new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const formatClock = (date: Date): string =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");

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

// Berapa jam dokumen sudah menunggu sejak pembaruan terakhir
const ageInHours = (iso?: string): number => (iso ? (Date.now() - new Date(iso).getTime()) / 3600000 : 0);

// Rute dokumen dari type + id (id saja tidak cukup: urutan id HIRA dan izin kerja bisa sama)
const getTaskRoute = (task: DashboardTask): string => {
  if (task.type === "hira") return `/hira/${task.id}`;
  if (task.type === "permit") return `/work-permit/${task.id}`;
  return "/home";
};

type Tone = "success" | "warning" | "danger" | "secondary" | "primary" | "info";
type TaskFilter = "all" | "mine" | "permit" | "hira";

/* ============================ KOMPONEN KECIL ============================== */

interface StatTileProps {
  icon: string; // nama ikon bootstrap-icons, mis. "bi-check-circle-fill"
  label: string;
  value: number;
  hint?: string;
  tone: Tone;
  loading: boolean;
}

// Kartu angka: ikon berwarna, angka besar, keterangan
function StatTile({ icon, label, value, hint, tone, loading }: StatTileProps) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderLeft: `4px solid var(--bs-${tone})` }}>
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`hm-icon bg-${tone} bg-opacity-10 text-${tone}`}>
            <i className={`bi ${icon}`}></i>
          </div>
          <div style={{ minWidth: 0 }}>
            {loading ? (
              <span className="hm-skeleton" style={{ width: 44, height: 26 }} />
            ) : (
              <div className="fw-bold fs-3 lh-1">{value}</div>
            )}
            <div className="text-muted small mt-1">{label}</div>
            {hint && !loading && (
              <div className="text-muted text-truncate" style={{ fontSize: "11px" }}>
                {hint}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Batang komposisi dokumen (disetujui / dalam reviu / ditolak / draft)
function DocBar({ title, counts, loading }: { title: string; counts?: DocumentCounts; loading: boolean }) {
  const parts: { label: string; value: number; tone: Tone }[] = [
    { label: "Disetujui", value: counts?.approved ?? 0, tone: "success" },
    { label: "Dalam reviu", value: counts?.pending ?? 0, tone: "warning" },
    { label: "Ditolak", value: counts?.rejected ?? 0, tone: "danger" },
    { label: "Draft", value: counts?.draft ?? 0, tone: "secondary" },
  ];
  const total = parts.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small mb-1">
        <span className="fw-semibold text-dark">{title}</span>
        <span className="text-muted">{loading ? "..." : `${total} dokumen`}</span>
      </div>

      {loading ? (
        <span className="hm-skeleton d-block" style={{ height: 10 }} />
      ) : total === 0 ? (
        <div className="text-muted small">Belum ada dokumen.</div>
      ) : (
        <>
          <div className="progress" style={{ height: 10 }}>
            {parts
              .filter((p) => p.value > 0)
              .map((p) => (
                <div
                  key={p.label}
                  className={`progress-bar bg-${p.tone}`}
                  style={{ width: `${(p.value / total) * 100}%` }}
                  title={`${p.label}: ${p.value}`}
                />
              ))}
          </div>
          <div className="d-flex flex-wrap gap-3 mt-2" style={{ fontSize: "11px" }}>
            {parts.map((p) => (
              <span key={p.label} className="text-muted">
                <span className={`text-${p.tone}`}>●</span> {p.label} {p.value}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface QuickCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

// Kartu akses cepat ke modul
function QuickCard({ icon, title, description, onClick }: QuickCardProps) {
  return (
    <div className="col-12 col-sm-6 col-xl">
      <button type="button" className="card border-0 shadow-sm h-100 w-100 text-start hm-hover" onClick={onClick}>
        <div className="card-body d-flex align-items-center gap-3">
          <div className="hm-icon bg-success bg-opacity-10 text-success">
            <i className={`bi ${icon}`}></i>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="fw-bold text-dark small">{title}</div>
            <div className="text-muted" style={{ fontSize: "12px" }}>
              {description}
            </div>
          </div>
          <i className="bi bi-chevron-right text-muted ms-auto"></i>
        </div>
      </button>
    </div>
  );
}

/* ================================ HALAMAN ================================= */

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queueRef = useRef<HTMLDivElement>(null);

  // Peran pengguna aktif
  const currentRole = user?.role || "";
  const isSubcontractor = currentRole === "subcontractor";
  const isCoordinator = currentRole === "hse_coordinator";
  const isK3Role = [
    "subcontractor",
    "hse_officer",
    "project_manager",
    "hse_coordinator",
    "supervisor",
  ].includes(currentRole);

  // State data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // State tampilan antrean
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  // Ambil data secara paralel. Dijalankan saat halaman dibuka dan setiap tombol "Segarkan" ditekan.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [statsData, tasksData] = await Promise.all([getDashboardStats(), getDashboardTasks(50)]);
        if (cancelled) return;
        setStats(statsData);
        setTasks(tasksData);
        setErrorMessage("");
        setUpdatedAt(new Date());
      } catch (err: unknown) {
        if (cancelled) return;
        if (axios.isAxiosError(err)) {
          const backendMsg = err.response?.data?.detail || err.message;
          setErrorMessage(`Gagal memuat data dashboard: ${backendMsg}`);
        } else {
          setErrorMessage("Terjadi kesalahan saat menghubungkan ke server.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
  };

  const scrollToQueue = () => queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ---- Angka turunan ---- */
  const hira = stats?.hira;
  const permits = stats?.permits;
  const sum = (key: keyof DocumentCounts) => (hira?.[key] ?? 0) + (permits?.[key] ?? 0);
  const splitHint = (key: keyof DocumentCounts) => `HIRA ${hira?.[key] ?? 0} · Izin ${permits?.[key] ?? 0}`;
  const pendingAction = stats?.pending_action ?? 0;

  /* ---- Antrean tugas dan filternya ---- */
  const mineTasks = tasks.filter((t) => t.waiting_on === currentRole);
  const permitTasks = tasks.filter((t) => t.type === "permit");
  const hiraTasks = tasks.filter((t) => t.type === "hira");

  const filters: { key: TaskFilter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: tasks.length },
    // HSE Coordinator tidak pernah menjadi pemegang langkah, jadi filter "Menunggu Anda" tidak relevan
    ...(isCoordinator ? [] : [{ key: "mine" as TaskFilter, label: "Menunggu Anda", count: mineTasks.length }]),
    { key: "permit", label: "Izin Kerja", count: permitTasks.length },
    { key: "hira", label: "HIRA", count: hiraTasks.length },
  ];

  const visibleTasks =
    taskFilter === "mine" ? mineTasks : taskFilter === "permit" ? permitTasks : taskFilter === "hira" ? hiraTasks : tasks;

  /* ---- Teks komunikatif di banner ---- */
  const firstName = user?.full_name?.split(" ")[0] || "";
  const roleLabel = ROLE_LABELS[currentRole] ?? "Pengguna";

  let summaryText = "";
  if (errorMessage && !stats) {
    summaryText = "Ringkasan belum bisa dimuat. Coba segarkan halaman.";
  } else if (pendingAction === 0) {
    summaryText = isSubcontractor
      ? "Tidak ada yang perlu Anda kerjakan saat ini. Mulai dengan membuat izin kerja baru bila ada pekerjaan berisiko tinggi."
      : "Semua beres. Tidak ada antrean tugas tertunda saat ini.";
  } else if (isCoordinator) {
    summaryText = `${pendingAction} dokumen sedang direviu di semua proyek.`;
  } else if (isSubcontractor) {
    summaryText = `Ada ${pendingAction} dokumen yang perlu Anda kerjakan: lengkapi draft, perbaiki yang ditolak, atau ajukan penutupan izin yang sudah selesai.`;
  } else {
    summaryText = `Ada ${pendingAction} dokumen menunggu tindakan Anda.`;
  }

  const queueTitle = isCoordinator ? "Pusat Pengawasan" : isSubcontractor ? "Tugas Saya" : "Antrean Tugas & Approval";

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      <style>{HOME_CSS}</style>

      {/* ============================ BANNER SAMBUTAN ============================ */}
      <div className="hm-hero rounded-4 p-4 p-md-5 mb-4 text-white position-relative overflow-hidden">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 position-relative">
          <div>
            <div className="small text-white-50 mb-1">{formatToday()}</div>
            <h1 className="h3 fw-bold mb-2">
              {getGreeting()}
              {firstName && `, ${firstName}`}!
            </h1>
            <span className="badge bg-white text-success fw-semibold mb-3">{roleLabel}</span>

            {/* Ringkasan dalam kalimat */}
            <p className="mb-0" style={{ maxWidth: "640px" }}>
              {loading ? <span className="hm-skeleton d-inline-block" style={{ width: 320, height: 16 }} /> : summaryText}
            </p>
          </div>

          <div className="d-flex flex-column align-items-lg-end gap-2">
            {/* Tombol aksi utama menyesuaikan peran */}
            <div className="d-flex flex-wrap gap-2">
              {isSubcontractor ? (
                <>
                  <button type="button" className="btn btn-light fw-semibold text-success" onClick={() => navigate("/work-permit")}>
                    <i className="bi bi-plus-circle me-1"></i> Buat izin kerja
                  </button>
                  <button type="button" className="btn btn-outline-light" onClick={() => navigate("/hira/create")}>
                    <i className="bi bi-shield-plus me-1"></i> Buat HIRA
                  </button>
                </>
              ) : (
                pendingAction > 0 && (
                  <button type="button" className="btn btn-light fw-semibold text-success" onClick={scrollToQueue}>
                    <i className="bi bi-list-check me-1"></i> Lihat antrean tugas
                  </button>
                )
              )}
            </div>

            {/* Waktu pembaruan terakhir + tombol segarkan */}
            <div className="d-flex align-items-center gap-2 small text-white-50">
              {updatedAt && <span>Diperbarui pukul {formatClock(updatedAt)}</span>}
              <button
                type="button"
                className="btn btn-sm btn-outline-light py-0 px-2"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Segarkan data dashboard"
              >
                <i className={`bi bi-arrow-clockwise ${refreshing ? "hm-spin" : ""}`}></i> Segarkan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pesan galat dengan tombol coba lagi */}
      {errorMessage && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{errorMessage}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRefresh}>
            Coba lagi
          </button>
        </div>
      )}

      {/* =============================== KARTU ANGKA ============================== */}
      <div className="row g-3 mb-4">
        {isSubcontractor ? (
          <>
            <StatTile icon="bi-check-circle-fill" label="Disetujui" value={sum("approved")} hint={splitHint("approved")} tone="success" loading={loading} />
            <StatTile icon="bi-hourglass-split" label="Dalam Reviu" value={sum("pending")} hint={splitHint("pending")} tone="warning" loading={loading} />
            <StatTile
              icon="bi-x-circle-fill"
              label="Ditolak"
              value={sum("rejected")}
              hint={sum("rejected") > 0 ? "Perbaiki lalu ajukan ulang" : splitHint("rejected")}
              tone="danger"
              loading={loading}
            />
            <StatTile icon="bi-pencil-square" label="Draft" value={sum("draft")} hint={splitHint("draft")} tone="secondary" loading={loading} />
          </>
        ) : (
          <>
            <StatTile icon="bi-shield-check" label="Total HIRA" value={hira?.total ?? 0} hint={`${hira?.pending ?? 0} dalam reviu`} tone="success" loading={loading} />
            <StatTile icon="bi-file-earmark-text" label="Total Izin Kerja" value={permits?.total ?? 0} hint={`${permits?.pending ?? 0} dalam reviu`} tone="info" loading={loading} />
            <StatTile icon="bi-check-circle-fill" label="Disetujui" value={sum("approved")} hint={splitHint("approved")} tone="primary" loading={loading} />
            <StatTile
              icon="bi-bell-fill"
              label="Pending Aksi"
              value={pendingAction}
              hint={isCoordinator ? "Seluruh dokumen dalam reviu" : "Menunggu tindakan Anda"}
              tone="warning"
              loading={loading}
            />
          </>
        )}
      </div>

      {/* ======================= ANTREAN TUGAS + PANEL SAMPING ======================= */}
      <div className="row g-4 mb-4">
        {/* ---- Antrean tugas ---- */}
        <div className="col-12 col-xl-7" ref={queueRef} style={{ scrollMarginTop: "16px" }}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="h6 mb-0 fw-bold text-dark">
                  <i className="bi bi-list-check text-success me-2"></i>
                  {queueTitle}
                </h2>
                {!loading && pendingAction > 0 && (
                  <span className={`badge rounded-pill ${isCoordinator ? "bg-secondary" : "bg-danger"}`}>
                    {pendingAction} {isCoordinator ? "dalam reviu" : "perlu tindakan"}
                  </span>
                )}
              </div>

              {isCoordinator && (
                <p className="text-muted small mt-2 mb-0">
                  Menampilkan seluruh dokumen yang sedang direviu di semua proyek. Pembatalan dilakukan dari halaman detail dokumen.
                </p>
              )}

              {/* Filter antrean */}
              {!loading && tasks.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      className={`btn btn-sm rounded-pill ${taskFilter === f.key ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() => setTaskFilter(f.key)}
                    >
                      {f.label} <span className="ms-1 opacity-75">{f.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card-body">
              <div style={{ maxHeight: "440px", overflowY: "auto" }}>
                {loading ? (
                  // Kerangka pemuatan
                  [0, 1, 2].map((i) => (
                    <div key={i} className="border rounded-3 p-3 mb-2">
                      <span className="hm-skeleton d-block mb-2" style={{ width: "30%", height: 12 }} />
                      <span className="hm-skeleton d-block mb-2" style={{ width: "80%", height: 16 }} />
                      <span className="hm-skeleton d-block" style={{ width: "50%", height: 12 }} />
                    </div>
                  ))
                ) : tasks.length === 0 ? (
                  // Keadaan kosong yang ramah
                  <div className="text-center py-5">
                    <i className="bi bi-check2-circle text-success" style={{ fontSize: "2.5rem" }}></i>
                    <div className="fw-semibold mt-2">Tidak ada antrean tugas tertunda</div>
                    <div className="text-muted small mb-3">
                      {isSubcontractor
                        ? "Semua dokumen Anda sudah ditangani. Siap membuat izin kerja baru?"
                        : "Semua dokumen sudah ditangani. Terima kasih!"}
                    </div>
                    {isSubcontractor && (
                      <button type="button" className="btn btn-success btn-sm" onClick={() => navigate("/work-permit")}>
                        Buat izin kerja
                      </button>
                    )}
                  </div>
                ) : visibleTasks.length === 0 ? (
                  <div className="text-center text-muted small py-4">Tidak ada tugas pada filter ini.</div>
                ) : (
                  visibleTasks.map((task) => {
                    const waitingOnMe = task.waiting_on === currentRole;
                    const hours = ageInHours(task.updated_at);
                    // Sudah menunggu 2 hari atau lebih dan menunggu Anda: beri penekanan
                    const overdue = waitingOnMe && hours >= 48;

                    return (
                      <button
                        key={`${task.type}-${task.id}`}
                        type="button"
                        className="hm-task w-100 text-start bg-white border rounded-3 p-3 mb-2"
                        style={{ borderLeft: `4px solid ${waitingOnMe ? "#dc3545" : "#dee2e6"}` }}
                        onClick={() => navigate(getTaskRoute(task))}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="d-flex align-items-center gap-2">
                            <i className={`bi ${task.type === "hira" ? "bi-shield-exclamation text-info" : "bi-file-earmark-text text-warning"}`}></i>
                            <span className="small fw-semibold text-muted">{task.category}</span>
                            <span className="text-muted" style={{ fontSize: "11px" }}>
                              · {task.status_label}
                            </span>
                          </span>
                          <small className={overdue ? "text-danger fw-semibold" : "text-muted"} style={{ fontSize: "11px" }}>
                            {overdue && <i className="bi bi-exclamation-triangle-fill me-1"></i>}
                            {formatRelative(task.updated_at)}
                          </small>
                        </div>

                        <div className="fw-semibold text-dark small mb-2">{task.title}</div>

                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <span className="text-muted" style={{ fontSize: "12px" }}>
                            <i className="bi bi-building me-1"></i>
                            {task.project_name}
                          </span>
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

        {/* ---- Panel samping: komposisi, alur peran, rantai persetujuan ---- */}
        <div className="col-12 col-xl-5">
          <div className="d-flex flex-column gap-4">
            {/* Komposisi dokumen */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-3 pb-0">
                <h2 className="h6 mb-0 fw-bold text-dark">
                  <i className="bi bi-pie-chart text-success me-2"></i>
                  {isSubcontractor ? "Status Dokumen Saya" : "Komposisi Dokumen"}
                </h2>
              </div>
              <div className="card-body">
                <DocBar title="HIRA" counts={hira} loading={loading} />
                <DocBar title="Izin Kerja" counts={permits} loading={loading} />
                <div className="text-muted" style={{ fontSize: "11px" }}>
                  Tidak termasuk dokumen yang dibatalkan. Izin yang sudah ditutup dihitung sebagai disetujui.
                </div>
              </div>
            </div>

            {/* Alur kerja sesuai peran */}
            {ROLE_GUIDE[currentRole] && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 pt-3 pb-0">
                  <h2 className="h6 mb-0 fw-bold text-dark">
                    <i className="bi bi-signpost-split text-success me-2"></i>
                    Alur Kerja Anda
                  </h2>
                </div>
                <div className="card-body">
                  <ol className="list-unstyled mb-0">
                    {ROLE_GUIDE[currentRole].map((step, index) => (
                      <li key={step} className="d-flex gap-3 mb-2">
                        <span className="hm-step">{index + 1}</span>
                        <span className="small text-dark">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Rantai persetujuan izin kerja menurut kategori risiko */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 pt-3 pb-0">
                <h2 className="h6 mb-0 fw-bold text-dark">
                  <i className="bi bi-diagram-3 text-success me-2"></i>
                  Rantai Persetujuan Izin Kerja
                </h2>
              </div>
              <div className="card-body small">
                <div className="d-flex flex-wrap align-items-center gap-1 mb-2">
                  <span className="badge bg-success me-1">R</span>
                  <span className="badge bg-light text-dark border">Supervisor</span>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-1 mb-2">
                  <span className="badge me-1" style={{ backgroundColor: "#ffc107", color: "#212529" }}>M</span>
                  <span className="badge bg-light text-dark border">Supervisor</span>
                  <i className="bi bi-arrow-right text-muted"></i>
                  <span className="badge bg-light text-dark border">HSE Officer</span>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-1">
                  <span className="badge me-1" style={{ backgroundColor: "#fd7e14" }}>T</span>
                  <span className="badge me-1" style={{ backgroundColor: "#dc3545" }}>E</span>
                  <span className="badge bg-light text-dark border">Supervisor</span>
                  <i className="bi bi-arrow-right text-muted"></i>
                  <span className="badge bg-light text-dark border">HSE Officer</span>
                  <i className="bi bi-arrow-right text-muted"></i>
                  <span className="badge bg-light text-dark border">Project Manager</span>
                  <i className="bi bi-arrow-right text-muted"></i>
                  <span className="badge bg-light text-dark border">MK (email + OTP)</span>
                </div>
                <div className="text-muted mt-2" style={{ fontSize: "11px" }}>
                  Kategori risiko izin mengikuti yang tertinggi dari aktivitas HIRA yang dipilih.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================ AKSES CEPAT =============================== */}
      <h2 className="h6 fw-bold text-dark mb-3">Akses Cepat</h2>
      <div className="row g-3">
        <QuickCard icon="bi-shield-exclamation" title="HIRA / HIRADC" description="Identifikasi bahaya dan penilaian risiko" onClick={() => navigate("/hira")} />

        {isSubcontractor && (
          <QuickCard icon="bi-file-earmark-plus" title="Izin Kerja Baru" description="Ajukan izin kerja berisiko tinggi" onClick={() => navigate("/work-permit")} />
        )}

        {isK3Role && (
          <QuickCard icon="bi-card-checklist" title="Daftar Izin Kerja" description="Pantau status semua izin kerja" onClick={() => navigate("/work-permit/list")} />
        )}

        {/* Audit Log: tampil untuk semua peran K3 (ubah ke !isSubcontractor bila Subkontraktor tidak boleh membukanya) */}
        {isK3Role && (
          <QuickCard icon="bi-clock-history" title="Audit Log" description="Riwayat aktivitas dan perubahan" onClick={() => navigate("/audit")} />
        )}

        <QuickCard icon="bi-journal-text" title="Rule & Law" description="Regulasi dan prosedur K3" onClick={() => navigate("/rules")} />
      </div>
    </div>
  );
}

/* ================================== CSS =================================== */
// Gaya khusus dashboard (awalan hm- supaya tidak bentrok dengan Bootstrap)
const HOME_CSS = `
  .hm-hero { background: linear-gradient(135deg, #198754 0%, #0f5132 100%); }
  .hm-hero::after {
    content: ""; position: absolute; right: -60px; top: -60px; width: 220px; height: 220px;
    border-radius: 50%; background: rgba(255, 255, 255, 0.08); pointer-events: none;
  }

  .hm-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
  }

  .hm-hover, .hm-task { transition: transform .15s ease, box-shadow .15s ease; cursor: pointer; }
  .hm-hover:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.12) !important; }
  .hm-task:hover { box-shadow: 0 .25rem .75rem rgba(0,0,0,.1); background: #f8fff9 !important; }

  .hm-step {
    width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
    background: #198754; color: #fff; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  .hm-skeleton {
    display: inline-block; border-radius: 6px;
    background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 37%, #e9ecef 63%);
    background-size: 400% 100%; animation: hm-shimmer 1.4s ease infinite;
  }
  .hm-hero .hm-skeleton { background: rgba(255, 255, 255, 0.25); animation: none; }
  @keyframes hm-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

  .hm-spin { display: inline-block; animation: hm-rotate 1s linear infinite; }
  @keyframes hm-rotate { to { transform: rotate(360deg); } }

  @media (prefers-reduced-motion: reduce) {
    .hm-hover, .hm-task { transition: none; }
    .hm-skeleton, .hm-spin { animation: none; }
  }
`;