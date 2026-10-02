import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username || !password) {
      setErrorMessage("Harap isi username dan password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Panggil API Django untuk login
      const response = await api.post("/auth/login/", {
        username,
        password,
        // Kirim role jika backend memang butuh validasi role dari frontend
        ...(role ? { role } : {}),
      });

      // 2. Ambil token dan data user dari response backend
      // Sesuaikan nama field sesuai response Django Anda (misal: access, token, user)
      const { access, user: backendUser } = response.data;

      // 3. Susun data user (Gunakan data dari backend jika ada, fallback ke state lokal)
      const userData: User = {
        username: backendUser?.username || username,
        role: (backendUser?.role as Role) || (role as Role) || "subcontractor",
        full_name: backendUser?.full_name || username,
      };

      // 4. Simpan ke AuthContext (JSON Tunggal + Token)
      auth.login(userData, access);

      // 5. Redirect ke dashboard
      navigate("/home");
    } catch (err: any) {
      // Handle error response dari Django
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else if (err.response?.status === 401) {
        setErrorMessage("Username atau password salah.");
      } else {
        setErrorMessage("Gagal terhubung ke server. Periksa koneksi Anda.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            {/* Header di luar card */}
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

            {/* Card form */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">Sign in</h2>

                {/* Pesan Error Alert */}
                {errorMessage && (
                  <div className="alert alert-danger py-2" role="alert" style={{ fontSize: 13 }}>
                    {errorMessage}
                  </div>
                )}

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

                  <div className="mb-3">
                    <label className="form-label d-block">Role (Opsional/Pilihan)</label>

                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="role"
                          id="roleSubcontractor"
                          checked={role === "subcontractor"}
                          onChange={() => setRole("subcontractor")}
                          disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="roleSubcontractor">
                          Subcontractor
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="role"
                          id="roleSheOfficer"
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
                          checked={role === "project_manager"}
                          onChange={() => setRole("project_manager")}
                          disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="roleSiteManager">
                          Project Manager
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}