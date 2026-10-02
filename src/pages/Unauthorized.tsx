// src/pages/Unauthorized.tsx
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card border-0 shadow-sm rounded-4 p-4 text-center" style={{ maxWidth: 420 }}>
        <div className="text-warning display-1 fw-bold mb-2">403</div>
        <h3 className="fw-bold mb-2">Akses Dibatasi</h3>
        <p className="text-muted small mb-4">
          Maaf, akun Anda tidak memiliki hak akses (*permission*) untuk membuka halaman ini.
        </p>
        <Link to="/home" className="btn btn-success fw-bold rounded-3 py-2">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}