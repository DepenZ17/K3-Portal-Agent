// src/components/Navbar.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getNotifications, markNotificationAsRead } from "../services/notificationServices";
import type { NotificationItem } from "../services/notificationServices";

const POLL_INTERVAL_MS = 60000;

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

// Rangkai URL tujuan dari target_type dan target_id
const getNotificationRoute = (targetType: string, targetId: number): string => {
  const type = targetType.toLowerCase();
  if (type.includes("permit") || type === "izin_kerja") return `/work-permit/${targetId}`;
  if (type.includes("hira")) return `/hira/${targetId}`;
  return "/work-permit/list"; // Fallback default
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State untuk Menu Navigasi Mobile
  const [isOpen, setIsOpen] = useState(false);

  // State untuk Dropdown Notifikasi & Data dari Backend
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Dipakai dari event handler (saat lonceng dibuka)
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    }
  }, []);

  // Ambil saat dimuat, lalu segarkan berkala selama tab terlihat
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getNotifications();
        if (!cancelled) setNotifications(data);
      } catch (error) {
        console.error("Gagal memuat notifikasi:", error);
      }
    };

    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const toggleNotif = () => {
    const next = !isNotifOpen;
    setIsNotifOpen(next);
    if (next) fetchNotifications(); // data terbaru saat lonceng dibuka
  };

  // Handler saat item notifikasi diklik: pindah halaman dulu, penandaan dibaca tidak boleh menghalangi
  const handleNotificationClick = async (item: NotificationItem) => {
    setIsNotifOpen(false);
    setIsOpen(false);
    navigate(getNotificationRoute(item.target_type, item.target_id));

    if (!item.is_read) {
      // Perbarui tampilan langsung, lalu kabari backend
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      try {
        await markNotificationAsRead(item.id);
      } catch (error) {
        console.error("Gagal menandai notifikasi dibaca:", error);
        fetchNotifications(); // kembalikan ke kondisi server jika gagal
      }
    }
  };

  // Hitung jumlah notifikasi yang belum dibaca
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Tutup dropdown notifikasi saat klik di luar area
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

        {/* Tombol Hamburger untuk Mobile */}
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

            <li className="nav-item">
              <Link className="nav-link px-2" to="/audit" onClick={() => setIsOpen(false)}>
                Audit Log
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link px-2 text-nowrap" to="/rules" onClick={() => setIsOpen(false)}>
                Rule &amp; Law
              </Link>
            </li>
          </ul>

          {/* Area Kanan: Notifikasi, User Info & Logout */}
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
                <span>🔔</span>
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
                className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isNotifOpen ? "show" : ""}`}
                style={{ width: "300px", maxHeight: "400px", overflowY: "auto", position: "absolute", right: 0, top: "100%" }}
              >
                <li className="dropdown-header fw-bold text-success border-bottom pb-2">
                  Notifikasi K3 ({unreadCount} Baru)
                </li>

                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`dropdown-item py-2 border-bottom ${!item.is_read ? "bg-light" : ""}`}
                        style={{ whiteSpace: "normal" }}
                        onClick={() => handleNotificationClick(item)}
                      >
                        <div className={`small text-dark ${!item.is_read ? "fw-bold" : ""}`}>
                          {!item.is_read && <span className="text-primary me-1">●</span>}
                          {item.title}
                        </div>
                        <div className="text-muted" style={{ fontSize: "11px" }}>{item.body}</div>
                        {item.created_at && (
                          <div className="text-muted" style={{ fontSize: "10px" }}>
                            {formatRelative(item.created_at)}
                          </div>
                        )}
                      </button>
                    </li>
                  ))
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
                  className="badge bg-white text-success fw-bold text-uppercase px-2 py-1"
                  style={{ fontSize: "9px", letterSpacing: "0.5px" }}
                >
                  {user.role ? user.role.replace("_", " ") : ""}
                </span>
              </div>
            )}

            {/* Tombol Logout */}
            <button
              className="btn btn-danger btn-sm fw-semibold px-2.5 py-1 shadow-sm d-flex align-items-center gap-1 rounded-2 text-nowrap"
              onClick={handleLogout}
              style={{ backgroundColor: "#dc3545", borderColor: "#dc3545", fontSize: "13px" }}
            >
              <span>Logout</span> 🚪
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}