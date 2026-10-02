// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const auth = useAuth();

  const bgImageUrl =
    "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?q=80&w=779&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Harap isi email dan password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🟢 Panggil endpoint /users/login/ sesuai skema cURL backend Django
      const response = await api.post("/users/login/", {
        email,
        password,
      });

      const data = response.data;

      // Extract Token JWT (access / accessToken) dan data user
      const token = data.access || data.access_token || data.token;
      const userData = data.user || {
        email: data.email || email,
        role: data.role,
        full_name: data.full_name || email,
      };

      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan pada respon server.");
      }

      // Simpan ke AuthContext & localStorage
      auth.login(token, userData);

      navigate("/home");
    } catch (err: any) {
      if (err.response) {
        // Jika server merespons dengan status error (400, 401, 404, 500)
        const serverError =
          err.response.data?.detail ||
          err.response.data?.message ||
          err.response.data?.error ||
          "Gagal masuk. Periksa email & password Anda.";
        setErrorMessage(serverError);
      } else if (err.request) {
        // Jika request terkirim tapi tidak ada respons sama sekali
        setErrorMessage("Gagal terhubung ke server backend Render. Coba beberapa saat lagi.");
      } else {
        setErrorMessage(err.message || "Terjadi kesalahan sistem.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative py-5"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 1,
        }}
      ></div>

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              
              <div
                className="card-header border-0 text-center py-4 px-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #198754 0%, #0f5132 100%)",
                }}
              >
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white text-success fw-bold shadow-sm mb-2"
                  style={{ width: 56, height: 56, fontSize: "1.2rem" }}
                >
                  K3
                </div>
                <h1 className="h4 mb-1 fw-bold">HSE AGENT PORTAL</h1>
                <p className="mb-0 text-white-50" style={{ fontSize: "13px" }}>
                  Sistem Informasi &amp; Management Keselamatan Kerja
                </p>
              </div>

              <div className="card-body p-4 p-md-5 bg-white">
                {errorMessage && (
                  <div className="alert alert-danger py-2 fs-6 mb-3" role="alert">
                    <small>{errorMessage}</small>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  
                  <div className="mb-3">
                    <label htmlFor="login-email" className="form-label fw-semibold text-secondary small">
                      EMAIL
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      className="form-control form-control-lg fs-6 bg-light border-1"
                      placeholder="coordinator@hse.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="login-password" className="form-label fw-semibold text-secondary small">
                      PASSWORD
                    </label>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      className="form-control form-control-lg fs-6 bg-light border-1"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100 fw-bold shadow-sm rounded-3 py-3 fs-6 mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        MEMPROSES...
                      </>
                    ) : (
                      "MASUK KE SYSTEM"
                    )}
                  </button>

                </form>
              </div>

              <div className="card-footer bg-light border-0 text-center py-3">
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  Connected to Backend API &bull; HSE Agent Portal v1.0
                </small>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}