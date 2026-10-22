// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

// Impor fungsi login dari services/authService
import { login } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const data = await login({
        email,
        password,
      });

      // Respons login yang valid selalu membawa access dan user
      if (!data.access || !data.user) {
        throw new Error("Respon login dari server tidak lengkap.");
      }

      // refreshToken sudah disimpan oleh authService.login
      auth.login(data.access, data.user);

      navigate("/home");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const serverError =
            err.response.data?.detail ||
            err.response.data?.message ||
            err.response.data?.error ||
            "Gagal masuk. Periksa email & password Anda.";
          setErrorMessage(serverError);
        } else if (err.code === "ECONNABORTED" || err.request) {
          setErrorMessage(
            "Server sedang aktif kembali atau tidak terjangkau. Tunggu sekitar satu menit lalu coba lagi."
          );
        } else {
          setErrorMessage("Terjadi kesalahan jaringan.");
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan sistem.");
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
                      placeholder="Subcontractor@mail.com"
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
                    <div className="input-group">
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg fs-6 bg-light border-1 border-end-0"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-light bg-light border border-start-0 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
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