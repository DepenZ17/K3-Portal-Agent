// src/pages/public/MkApprovalPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  getMkPortalData, 
  sendMkOtp, 
  approveMkPermit, 
  rejectMkPermit,
  type MkPortalResponse,
  type OtpDetails 
} from "../services/mkServices";

export default function MkApprovalPage() {
  const { token } = useParams<{ token: string }>();

  const [portalData, setPortalData] = useState<MkPortalResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Form states
  const [fullName, setFullName] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [otpInfo, setOtpInfo] = useState<OtpDetails | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const fetchPortal = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMkPortalData(token);
      setPortalData(data);
      if (data && typeof data.contact_name === "string") {
        setFullName(data.contact_name);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as { detail?: string })?.detail || err.message;
        if (status === 404) setErrorMessage("Tautan tidak valid.");
        else if (status === 410) setErrorMessage("Tautan tidak dapat digunakan: sudah diputuskan, diganti, kedaluwarsa, atau izin kerja telah berpindah tahap.");
        else if (status === 409) setErrorMessage("Proyek tidak aktif atau HIRA tidak lagi disetujui.");
        else setErrorMessage(msg);
      } else {
        setErrorMessage("Gagal memuat data persetujuan MK.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPortal();
  }, [fetchPortal]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!token) return;
    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);
    try {
      const res = await sendMkOtp(token);
      setOtpInfo(res.otp || null);
      setSuccessMessage("Kode OTP berhasil dikirim ke email Anda.");
      const sec = res.otp?.can_request_in_seconds ?? 60;
      setCountdown(sec);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as { detail?: string })?.detail || err.message;
        if (status === 429) setErrorMessage("Terlalu cepat untuk meminta kode baru atau terlalu banyak permintaan.");
        else setErrorMessage(msg);
      } else {
        setErrorMessage("Gagal mengirim OTP.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (decision: "approve" | "reject") => {
    if (!token) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }
    if (!otpCode.trim() || otpCode.length !== 6) {
      setErrorMessage("Masukkan kode OTP 6 digit yang valid.");
      return;
    }
    if (decision === "reject" && !remarks.trim()) {
      setErrorMessage("Catatan / Alasan wajib diisi saat menolak.");
      return;
    }

    setActionLoading(true);
    try {
      if (decision === "approve") {
        await approveMkPermit(token, { otp: otpCode, full_name: fullName, remarks: remarks.trim() || undefined });
        setSuccessMessage("Izin kerja berhasil disetujui oleh Manajemen Konstruksi.");
      } else {
        await rejectMkPermit(token, { otp: otpCode, full_name: fullName, remarks: remarks.trim() });
        setSuccessMessage("Izin kerja ditolak.");
      }
      await fetchPortal();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as { detail?: string };
        const msg = data?.detail || err.message;
        if (status === 400) {
          setErrorMessage(msg || "Kode OTP tidak benar.");
        } else if (status === 410) {
          setErrorMessage("Tautan sudah tidak berlaku.");
        } else {
          setErrorMessage(msg);
        }
      } else {
        setErrorMessage("Terjadi kesalahan saat memproses keputusan.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Memuat portal persetujuan MK...</p>
      </div>
    );
  }

  if (errorMessage && !portalData) {
    return (
      <div className="container py-5" style={{ maxWidth: "600px" }}>
        <div className="alert alert-danger text-center shadow-sm p-4">
          <h4 className="fw-bold mb-2">Akses Ditolak / Tautan Tidak Valid</h4>
          <p className="mb-0">{errorMessage}</p>
        </div>
      </div>
    );
  }

  const permit = portalData?.permit;
  const state = portalData?.state;

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      {errorMessage && <div className="alert alert-danger shadow-sm">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success shadow-sm">{successMessage}</div>}

      <div className="card shadow border-0 overflow-hidden mb-4">
        <div className="bg-primary text-white p-4">
          <span className="badge bg-light text-primary fw-bold mb-2">PORTAL PERSETUJUAN MANAJEMEN KONSTRUKSI (MK)</span>
          <h3 className="fw-bold mb-1 text-white">
            Izin Kerja: {String(permit?.document_number || permit?.permit_type_label || "Working at Height")}
          </h3>
          <p className="mb-0 text-white-50 small">Kontak MK: {String(portalData?.contact_name || "")}</p>
        </div>

        <div className="card-body p-4">
          {state !== "active" ? (
            <div className="alert alert-warning text-center p-4">
              <h5 className="fw-bold">Tautan Ini Tidak Lagi Aktif</h5>
              <p className="mb-0">
                Status tautan saat ini: <strong>{String(state)}</strong>. Keputusan atau perubahan status telah dicatat pada sistem.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-light rounded border">
                <h5 className="fw-bold text-dark mb-3">Detail Ringkas Pekerjaan</h5>
                <p className="mb-1"><strong>Proyek:</strong> {String(permit?.project_name || "-")}</p>
                <p className="mb-1">
                  <strong>Tanggal &amp; Waktu:</strong> {String(permit?.work_date || "")} ({String(permit?.work_start || "")} - {String(permit?.work_end || "")})
                </p>
                <p className="mb-1"><strong>Lokasi:</strong> {String(permit?.work_location || "")}</p>
                <p className="mb-1"><strong>Deskripsi:</strong> {String(permit?.work_description || "")}</p>
                <p className="mb-0"><strong>Kategori Risiko:</strong> {String(permit?.risk_category || "")}</p>
              </div>

              <div className="mb-4 p-3 border rounded bg-white">
                <h5 className="fw-bold text-dark mb-3">Verifikasi &amp; Keputusan MK</h5>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Nama Lengkap Anda*:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Kode OTP Verifikasi Email*:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Masukkan 6 digit OTP"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleSendOtp}
                      disabled={actionLoading || countdown > 0}
                    >
                      {countdown > 0 ? `Kirim Ulang (${countdown}s)` : "Kirim Kode OTP"}
                    </button>
                  </div>
                  <small className="text-muted">Kode OTP akan dikirim ke email terdaftar Anda dan berlaku selama 10 menit.</small>
                  {otpInfo && <div className="text-success small mt-1">OTP telah dikirim. Sisa percobaan: {otpInfo.attempts_left ?? '-'}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Catatan / Alasan (Wajib jika Menolak):</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Tulis catatan persetujuan atau alasan penolakan..."
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-danger px-4"
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                  >
                    Tolak (Reject)
                  </button>
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Memproses..." : "Setujui (Approve)"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}