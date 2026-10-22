// src/components/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State untuk Menu Navigasi Mobile
  const [isOpen, setIsOpen] = useState(false);
  
  // State untuk Dropdown Notifikasi
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Event listener untuk menutup dropdown notifikasi saat klik di luar area
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

  // Penyesuaian Role: Hanya Subcontractor
  const isSubcontractor = currentRole === "subcontractor";

  // Penyesuaian Role K3
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
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-expanded={isNotifOpen}
                style={{ width: "36px", height: "36px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <span>🔔</span>
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                  style={{ fontSize: "9px" }}
                >
                  2
                </span>
              </button>
              
              <ul
                className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isNotifOpen ? "show" : ""}`}
                style={{ width: "260px", position: "absolute", right: 0, top: "100%" }}
              >
                <li className="dropdown-header fw-bold text-success border-bottom pb-2">
                  Notifikasi K3 (2 Baru)
                </li>
                <li>
                  <Link
                    className="dropdown-item py-2 border-bottom"
                    to="/work-permit/list"
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    <div className="fw-bold small text-dark">Permohonan Izin Kerja</div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>Subkon mengajukan Work Permit</div>
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item py-2 border-bottom"
                    to="/hira"
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsOpen(false);
                    }}
                  >
                    <div className="fw-bold small text-dark">HIRA Perlu Reviu</div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>Area Tower Crane belum disetujui</div>
                  </Link>
                </li>
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