// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth, type Role } from "../context/AuthContext";
import type { LoginRequest, LoginResponse } from "../types/auth";
import { roleMap } from "../utils/roleMap";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">(""); // opsional
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi minimal
    if (!username || !password) {
      alert("Harap isi username dan password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Body request login (role opsional)
      const payload: LoginRequest = { username, password };
      if (role) payload.role = role;

      // Panggil endpoint login backend
      const res = await api.post<LoginResponse>("/auth/login/", payload);

      const token = res.data.access_token;

      // Normalisasi role: angka -> kode role backend
      const normalizedRole: Role =
        typeof res.data.role === "number" ? roleMap[res.data.role] : res.data.role;

      if (!normalizedRole) {
        alert("Role dari backend tidak dikenali.");
        return;
      }

      // Simpan sesi (username, role, token)
      auth.login(res.data.username, normalizedRole, token);

      // Masuk ke halaman utama
      navigate("/home");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login gagal. Periksa username/password.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white mb-2"
                style={{ width: 60, height: 60 }}
              >
                <span className="fw-bold">K3</span>
              </div>
              <h1 className="h4 mb-1">K3 Agent Portal</h1>
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                Masuk sebagai Foreman, SHE Officer, atau Site Manager.
              </p>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">Sign in</h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Opsional: hapus bagian ini kalau role sepenuhnya dari backend */}
                  <div className="mb-3">
                    <label className="form-label d-block">Role (opsional)</label>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="role"
                          id="roleForeman"
                          value="foreman"
                          checked={role === "foreman"}
                          onChange={() => setRole("foreman")}
                          disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="roleForeman">
                          Foreman
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="role"
                          id="roleSheOfficer"
                          value="she_officer"
                          checked={role === "she_officer"}
                          onChange={() => setRole("she_officer")}
                          disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="roleSheOfficer">
                          SHE Officer
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="role"
                          id="roleSiteManager"
                          value="project_manager"
                          checked={role === "project_manager"}
                          onChange={() => setRole("project_manager")}
                          disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="roleSiteManager">
                          Site Manager
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              </div>
            </div>

            <p className="text-center text-muted mt-3" style={{ fontSize: 12 }}>
              *Login akan memanggil backend dan menyimpan access token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
