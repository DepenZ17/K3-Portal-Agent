// src/components/Navbar.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getNotifications, markNotificationAsRead } from "../services/notificationServices";
import type { NotificationItem } from "../services/notificationServices";

const POLL_INTERVAL_MS = 60000;

const ROLE_LABELS: Record<string, string> = {
  subcontractor: "Subkontraktor",
  supervisor: "Supervisor",
  hse_officer: "HSE Officer",
  hse_coordinator: "HSE Coordinator",
  project_manager: "Project Manager",
};

// Keterangan waktu singkat; lebih dari 7 hari tampil sebagai tanggal
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

// Rangkai URL tujuan dari type dan resource_id
const getNotificationRoute = (targetType: string, resourceId: number): string => {
  const type = targetType ? targetType.toLowerCase() : "";
  if (type.includes("permit") || type === "izin_kerja") return `/work-permit/${resourceId}`;
  if (type.includes("hira")) return `/hira/${resourceId}`;
  return "/work-permit/list";
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialMount = useRef(true);
  const prevUnreadCountRef = useRef<number>(0);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log("Audio diblokir browser sebelum ada interaksi klik:", error);
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.results || []);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    }
  }, []);

  // Polling aman dengan setTimeout rekursif
  useEffect(() => {
    let cancelled = false;
    let timerId: number;

    const load = async () => {
      if (cancelled) return;
      try {
        const data = await getNotifications();
        if (!cancelled) {
          setNotifications(data.results || []);
        }
      } catch (error) {
        console.error("Gagal memuat notifikasi:", error);
      } finally {
        if (!cancelled) {
          timerId = window.setTimeout(() => {
            if (document.visibilityState === "visible") {
              load();
            } else {
              timerId = window.setTimeout(load, POLL_INTERVAL_MS);
            }
          }, POLL_INTERVAL_MS);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, []);

  const toggleNotif = () => {
    const next = !isNotifOpen;
    setIsNotifOpen(next);
    if (next) fetchNotifications();
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    setIsNotifOpen(false);
    setIsOpen(false);
    navigate(getNotificationRoute(item.type, item.resource_id));

    if (!item.read_at) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
      try {
        await markNotificationAsRead(item.id);
      } catch (error) {
        console.error("Gagal menandai notifikasi dibaca:", error);
        fetchNotifications();
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at && (n.needs_action !== false || !n.resolution_note)).length;
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUnreadCountRef.current = unreadCount;
      return;
    }
    if (unreadCount > prevUnreadCountRef.current) {
      playNotificationSound();
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentRole = user?.role || "";
  const isSubcontractor = currentRole === "subcontractor";
  const isK3Role = [
    "subcontractor",
    "hse_officer",
    "hse_coordinator",
    "supervisor",
    "project_manager",
  ].includes(currentRole);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm py-2">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2 me-3" to="/home">
          <span className="bg-white text-success rounded-circle px-2 py-1 fs-6">K3</span>
          <span className="fs-6 tracking-wide">AGENT PORTAL</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-semibold align-lg-items-center gap-1">
            <li className="nav-item">
              <Link className="nav-link px-2" to="/home" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link px-2 text-nowrap" to="/hira" onClick={() => setIsOpen(false)}>
                HIRA / HIRADC
              </Link>
            </li>

            {isSubcontractor && (
              <li className="nav-item">
                <Link className="nav-link px-2 text-nowrap" to="/work-permit" onClick={() => setIsOpen(false)}>
                  Izin Kerja
                </Link>
              </li>
            )}

            {isK3Role && (
              <li className="nav-item">
                <Link className="nav-link px-2 text-nowrap" to="/work-permit/list" onClick={() => setIsOpen(false)}>
                  Daftar Izin
                </Link>
              </li>
            )}

            {/* Disamakan dengan Home.tsx: hanya tampil untuk K3 Role */}
            {isK3Role && (
              <li className="nav-item">
                <Link className="nav-link px-2" to="/audit" onClick={() => setIsOpen(false)}>
                  Audit Log
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link px-2 text-nowrap" to="/rules" onClick={() => setIsOpen(false)}>
                Rule &amp; Law
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 pt-2 pt-lg-0 mt-2 mt-lg-0">
            {/* Bell Notifikasi */}
            <div className="dropdown position-relative" ref={notifRef}>
              <button
                className="btn btn-success border-0 p-2 position-relative rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                type="button"
                onClick={toggleNotif}
                aria-expanded={isNotifOpen}
                aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
                style={{ width: "36px", height: "36px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <i className="bi bi-bell-fill text-white"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                    style={{ fontSize: "9px" }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <ul
                className={`dropdown-menu dropdown-menu-start dropdown-menu-lg-end shadow border-0 mt-2 ${isNotifOpen ? "show" : ""}`}
                style={{ width: "300px", maxWidth: "90vw", maxHeight: "400px", overflowY: "auto" }}
              >
                <li className="dropdown-header fw-bold text-success border-bottom pb-2">
                  Notifikasi K3 ({unreadCount} Baru)
                </li>

                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map((item) => {
                    const isUnread = !item.read_at;
                    const isResolvedByOthers = !item.needs_action && item.resolution_note;

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`dropdown-item py-2 border-bottom ${isUnread ? "bg-light" : ""}`}
                          style={{ whiteSpace: "normal", opacity: isResolvedByOthers ? 0.7 : 1 }}
                          onClick={() => handleNotificationClick(item)}
                        >
                          <div className={`small text-dark ${isUnread ? "fw-bold" : ""}`}>
                            {isUnread && <span className="text-primary me-1">●</span>}
                            {item.title}
                          </div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{item.body}</div>
                          
                          {isResolvedByOthers && (
                            <div className="text-danger fst-italic mt-1" style={{ fontSize: "11px" }}>
                              <i className="bi bi-info-circle me-1"></i> {item.resolution_note}
                            </div>
                          )}

                          {item.created_at && (
                            <div className="text-muted mt-1" style={{ fontSize: "10px" }}>
                              {formatRelative(item.created_at)}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li>
                    <span className="dropdown-item text-center text-muted small py-3">
                      Tidak ada notifikasi
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Profil Pengguna */}
            {user && (
              <div className="d-none d-xl-flex align-items-center bg-white bg-opacity-10 rounded-pill ps-3 pe-2 py-1 border border-white border-opacity-25 gap-2">
                <span className="text-white small fw-semibold text-truncate" style={{ maxWidth: "120px" }}>
                  {user.full_name}
                </span>
                <span
                  className="badge bg-white text-success fw-bold px-2 py-1"
                  style={{ fontSize: "10px" }}
                >
                  {ROLE_LABELS[currentRole] || currentRole}
                </span>
              </div>
            )}

            {/* Tombol Logout */}
            <button
              className="btn btn-danger btn-sm fw-semibold px-2.5 py-1 shadow-sm d-flex align-items-center gap-1 rounded-2 text-nowrap"
              onClick={handleLogout}
              style={{ backgroundColor: "#dc3545", borderColor: "#dc3545", fontSize: "13px" }}
            >
              <span>Logout</span> <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}