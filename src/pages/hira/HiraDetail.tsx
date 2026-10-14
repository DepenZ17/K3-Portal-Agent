// src/pages/hira/HiraDetail.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  getHiraDocumentById,
  submitHiraDocument,
  approveHiraDocument,
  rejectHiraDocument,
  cancelHiraDocument,
  setHiraDocumentNumber,
  deleteHiraDocument,
} from "../../services/hiraServices";
import type { 
  HiraDetailResponse, 
  HiraStatus, 
  HiraGroup, 
  HiraActivity, 
  HiraApproval,
  AllowedAction 
} from "../../types/hira";

export default function HiraDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hira, setHira] = useState<HiraDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // State Input Form Action
  const [decisionNotes, setDecisionNotes] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [documentNumberInput, setDocumentNumberInput] = useState<string>("");

  // Helper untuk memformat error response dari backend
  const extractErrorMessage = (err: unknown, fallbackMessage: string): string => {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data;
      if (typeof data.detail === "string") return data.detail;
      if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        if (firstKey && Array.isArray(data[firstKey])) {
          return `${firstKey}: ${data[firstKey].join(", ")}`;
        }
      }
    }
    return fallbackMessage;
  };

  // Fetch Data Detail HIRA
  const fetchHiraDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getHiraDocumentById(id);
      setHira(data);
      if (data.document_number) {
        setDocumentNumberInput(data.document_number);
      }
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal memuat detail HIRA."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHiraDetail();
  }, [fetchHiraDetail]);

  // Handler Submit
  const handleSubmit = async () => {
    if (!id || !window.confirm("Apakah Anda yakin ingin mengajukan dokumen HIRA ini?")) return;
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await submitHiraDocument(id);
      setSuccessMessage("Dokumen HIRA berhasil diajukan!");
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal mengajukan HIRA."));
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Approve
  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await approveHiraDocument(id, decisionNotes);
      setSuccessMessage("Dokumen HIRA telah disetujui!");
      setDecisionNotes("");
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menyetujui HIRA."));
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Reject
  const handleReject = async () => {
    if (!id) return;
    if (!decisionNotes.trim()) {
      alert("Harap berikan catatan/alasan penolakan.");
      return;
    }
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await rejectHiraDocument(id, decisionNotes);
      setSuccessMessage("Dokumen HIRA telah ditolak.");
      setDecisionNotes("");
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menolak HIRA."));
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Cancel
  const handleCancel = async () => {
    if (!id) return;
    if (!cancelReason.trim()) {
      alert("Harap isi alasan pembatalan dokumen.");
      return;
    }
    if (!window.confirm("Apakah Anda yakin ingin membatalkan dokumen HIRA ini?")) return;
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await cancelHiraDocument(id, cancelReason);
      setSuccessMessage("Dokumen HIRA telah dibatalkan.");
      setCancelReason("");
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal membatalkan HIRA."));
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Set Nomor Dokumen
  const handleSetNumber = async () => {
    if (!id) return;
    if (!documentNumberInput.trim()) {
      alert("Harap isi nomor dokumen.");
      return;
    }
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await setHiraDocumentNumber(id, documentNumberInput);
      setSuccessMessage("Nomor dokumen berhasil diperbarui!");
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal mengatur nomor dokumen."));
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Delete Draft Dokumen
  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus draft dokumen HIRA ini secara permanen?")) return;

    setActionLoading(true);
    setErrorMessage("");
    try {
      await deleteHiraDocument(id);
      alert("Draft dokumen HIRA berhasil dihapus!");
      navigate("/hira");
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menghapus draft dokumen HIRA."));
    } finally {
      setActionLoading(false);
    }
  };

  // Badge Status
  const renderStatusBadge = (status: HiraStatus) => {
    const badgeMap: Record<HiraStatus, { label: string; bg: string }> = {
      draft: { label: "Draft", bg: "bg-secondary" },
      pending_officer: { label: "Menunggu HSE Officer", bg: "bg-warning text-dark" },
      pending_pm: { label: "Menunggu Project Manager", bg: "bg-info text-dark" },
      approved: { label: "Disetujui", bg: "bg-success" },
      rejected: { label: "Ditolak", bg: "bg-danger" },
      cancelled: { label: "Dibatalkan", bg: "bg-dark" },
    };
    const config = badgeMap[status] || { label: status, bg: "bg-secondary" };
    return <span className={`badge ${config.bg} fs-6`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Memuat detail HIRA...</p>
      </div>
    );
  }

  if (!hira) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {errorMessage || "Dokumen HIRA tidak ditemukan."}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/hira")}>
          &larr; Kembali ke List HIRA
        </button>
      </div>
    );
  }

  // Pengecekan Aksi Berdasarkan allowed_actions (Mendukung Format Objek & Array)
  const allowedActions = hira.allowed_actions;

  const isActionAllowed = (actionKey: AllowedAction): boolean => {
    if (Array.isArray(allowedActions)) {
      return (allowedActions as string[]).includes(actionKey);
    }
    if (allowedActions && typeof allowedActions === "object") {
      return Boolean((allowedActions as Record<string, boolean>)[actionKey]);
    }
    return false;
  };

  const canSubmit = isActionAllowed("can_submit");
  const canEdit = isActionAllowed("can_edit");
  const canDecide = isActionAllowed("can_decide");
  const canCancel = isActionAllowed("can_cancel");
  const canSetNumber = isActionAllowed("can_set_number");

  // Hanya pembuat yang bisa menghapus draft yang belum pernah di-submit
  const canDeleteDraft = hira.status === "draft" && hira.submission_round === 0;

  return (
    <div className="container py-4">
      {/* Navigation & Title */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/hira" className="btn btn-outline-secondary btn-sm">
          &larr; Kembali ke Daftar HIRA
        </Link>
        {renderStatusBadge(hira.status)}
      </div>

      {/* Alert Notification */}
      {errorMessage && <div className="alert alert-danger mb-3">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success mb-3">{successMessage}</div>}

      {/* Peringatan Risiko Sisa Unacceptable */}
      {hira.has_unacceptable_residual && (
        <div className="alert alert-warning border-warning d-flex align-items-center mb-4">
          <div className="me-3 fs-3">⚠️</div>
          <div>
            <strong>Peringatan Risiko Sisa!</strong> Dokumen ini memiliki aktivitas dengan Skor Risiko Sisa (R_t &gt; 4). Dokumen tidak dapat disetujui (Approve) sampai pengendalian disesuaikan.
          </div>
        </div>
      )}

      {/* Main Header Info Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h3 className="fw-bold text-dark mb-1">{hira.work_package}</h3>
          <p className="text-muted mb-3">
            Area Pekerjaan: <strong>{hira.work_area || "-"}</strong> | Proyek: <strong>{hira.project_name}</strong>
          </p>

          <div className="row g-3 bg-light p-3 rounded">
            <div className="col-md-3">
              <small className="text-muted d-block">No. Dokumen</small>
              <span className="fw-semibold">{hira.document_number || "Belum Diatur"}</span>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Tanggal Dokumen</small>
              <span className="fw-semibold">{hira.document_date || "-"}</span>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Dibuat Oleh</small>
              <span className="fw-semibold">
                {hira.created_by?.full_name || "-"} ({hira.created_by?.role || "-"})
              </span>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">Putaran Pengajuan</small>
              <span className="fw-semibold">Revisi #{hira.submission_round}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {(canSubmit || canEdit || canSetNumber || canCancel || canDeleteDraft) && (
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-body d-flex flex-wrap align-items-center gap-2">
            <span className="fw-bold me-2">Aksi Dokumen:</span>

            {/* Submit Button */}
            {canSubmit && (
              <button
                className="btn btn-success fw-semibold"
                onClick={handleSubmit}
                disabled={actionLoading}
              >
                Submit / Ajukan Dokumen
              </button>
            )}

            {/* Edit Button */}
            {canEdit && (
              <Link to={`/hira/edit/${hira.id}`} className="btn btn-outline-primary">
                Edit HIRA
              </Link>
            )}

            {/* Delete Draft Button */}
            {canDeleteDraft && (
              <button
                className="btn btn-outline-danger fw-semibold"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                Hapus Draft
              </button>
            )}

            {/* Set Number Form */}
            {canSetNumber && (
              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Set No. Dokumen..."
                  value={documentNumberInput}
                  onChange={(e) => setDocumentNumberInput(e.target.value)}
                />
                <button
                  className="btn btn-sm btn-dark text-nowrap"
                  onClick={handleSetNumber}
                  disabled={actionLoading}
                >
                  Simpan No.
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Box (Approve / Reject) */}
      {canDecide && (
        <div className="card border-primary mb-4 shadow-sm">
          <div className="card-header bg-primary text-white fw-bold">
            Persetujuan Dokumen (HSE Officer / Project Manager)
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Catatan / Alasan Persetujuan / Penolakan:
              </label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Masukkan catatan pendukung atau alasan penolakan..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
              ></textarea>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-success fw-semibold"
                onClick={handleApprove}
                disabled={actionLoading || hira.has_unacceptable_residual}
              >
                Approve (Setujui)
              </button>
              <button
                className="btn btn-danger fw-semibold"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Reject (Tolak)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Box (HSE Coordinator) */}
      {canCancel && (
        <div className="card border-danger mb-4 shadow-sm">
          <div className="card-header bg-danger text-white fw-bold">
            Pembatalan Dokumen (HSE Coordinator)
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Alasan Pembatalan Dokumen:
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan alasan pembatalan dokumen ini..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline-danger fw-semibold"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Batalkan Dokumen HIRA
            </button>
          </div>
        </div>
      )}

      {/* Table Risk Assessment (Groups & Activities) */}
      <h4 className="fw-bold mb-3">Tabel Identifikasi Bahaya &amp; Penilaian Risiko</h4>
      {hira.groups.length === 0 ? (
        <p className="text-muted">Belum ada grup lokasi/aktivitas yang ditambahkan.</p>
      ) : (
        hira.groups.map((grp: HiraGroup) => (
          <div key={grp.id || grp.location_function} className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-dark text-white fw-bold">
              Lokasi / Fungsi: {grp.location_function}
            </div>
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light text-center small">
                  <tr>
                    <th style={{ width: "12%" }}>Aktivitas</th>
                    <th style={{ width: "6%" }}>Sifat</th>
                    <th style={{ width: "15%" }}>Potensi Bahaya</th>
                    <th style={{ width: "15%" }}>Dampak Risiko</th>
                    <th style={{ width: "10%" }}>Awal (S x L)</th>
                    <th style={{ width: "18%" }}>Tindakan Pengendalian</th>
                    <th style={{ width: "10%" }}>Sisa (S x L)</th>
                    <th style={{ width: "8%" }}>Skor (R_t)</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {grp.activities.map((act: HiraActivity) => {
                    const initScore = act.initial_risk_score ?? (act.initial_severity * act.initial_likelihood);
                    const resScore = act.residual_risk_score ?? (act.residual_severity * act.residual_likelihood);
                    const isAcceptable = act.is_acceptable ?? act.residual_acceptable ?? (resScore <= 4);

                    return (
                      <tr key={act.id || act.activity_name}>
                        <td className="fw-semibold">{act.activity_name}</td>
                        <td className="text-center fw-bold">{act.activity_type || "NR"}</td>
                        <td>{act.potential_hazard}</td>
                        <td>{act.risk_impact}</td>
                        <td className="text-center">
                          {act.initial_severity} x {act.initial_likelihood} ={" "}
                          <strong>{initScore}</strong>
                        </td>
                        <td>
                          <div>{act.existing_controls || "-"}</div>
                          {act.control_category && (
                            <span className="badge bg-light text-dark border mt-1">
                              {act.control_category}
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          {act.residual_severity} x {act.residual_likelihood}
                        </td>
                        <td
                          className={`text-center fw-bold ${
                            isAcceptable
                              ? "table-success text-success"
                              : "table-danger text-danger"
                          }`}
                        >
                          {resScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Histori Approval */}
      <h4 className="fw-bold mb-3">Histori Persetujuan</h4>
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body">
          {hira.approvals.length === 0 ? (
            <p className="text-muted mb-0">Belum ada riwayat persetujuan.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {hira.approvals.map((app: HiraApproval) => {
                const stageName = app.step || app.stage || "-";
                const decBy = app.decided_by?.full_name || app.decided_by_name || "-";
                const notes = app.remarks || app.notes;
                const statusVal = app.decision || app.status || "-";

                return (
                  <li
                    key={app.id}
                    className="list-group-item d-flex justify-content-between align-items-start py-3"
                  >
                    <div>
                      <div className="fw-bold text-capitalize">
                        Tahap: {stageName.replace("_", " ")}
                      </div>
                      <div className="small text-muted">
                        Oleh: {decBy} | Waktu: {app.decided_at || "-"}
                      </div>
                      {notes && (
                        <div className="mt-1 small bg-light p-2 rounded">
                          Catatan: {notes}
                        </div>
                      )}
                    </div>
                    <span
                      className={`badge ${
                        statusVal === "approved"
                          ? "bg-success"
                          : statusVal === "rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {statusVal}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}