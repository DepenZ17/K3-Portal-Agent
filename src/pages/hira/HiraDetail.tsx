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
  updateHiraDocument,
  createHiraGroup,
  updateHiraGroup,
  deleteHiraGroup,
  createHiraActivity,
  updateHiraActivity,
  deleteHiraActivity,
} from "../../services/hiraServices";
import { calculateRisk } from "../../utils/hiraRisk";
import type { 
  HiraDetailResponse, 
  HiraStatus, 
  HiraGroup, 
  HiraActivity, 
  HiraApproval,
  AllowedAction,
  ActivityType
} from "../../types/hira";

export default function HiraDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hira, setHira] = useState<HiraDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Local Editable State untuk Header Dokumen
  const [editWorkPackage, setEditWorkPackage] = useState("");
  const [editWorkArea, setEditWorkArea] = useState("");
  const [editDocumentDate, setEditDocumentDate] = useState("");

  // Local Editable State untuk Groups & Activities
  const [editableGroups, setEditableGroups] = useState<HiraGroup[]>([]);

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
      // Inisialisasi local state untuk edit per section
      setEditWorkPackage(data.work_package || "");
      setEditWorkArea(data.work_area || "");
      setEditDocumentDate(data.document_date || "");
      setEditableGroups(data.groups || []);

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

  // ==========================================
  // HANDLERS GRANULAR SAVE (SAVE PER SECTION)
  // ==========================================

  // 1. Simpan Header Dokumen (PATCH /hira/documents/{id}/)
  const handleSaveHeader = async () => {
    if (!id) return;
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await updateHiraDocument(id, {
        work_package: editWorkPackage,
        work_area: editWorkArea,
        document_date: editDocumentDate || undefined,
      });
      setSuccessMessage("Header dokumen berhasil diperbarui!");
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal memperbarui header dokumen."));
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Simpan Group (POST /hira/groups/ atau PATCH /hira/groups/{id}/)
  const handleSaveGroup = async (group: HiraGroup, index: number) => {
    if (!id) return;
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!group.id) {
        // Buat Grup Baru jika belum memiliki ID
        await createHiraGroup({
          hira_document: Number(id),
          location_function: group.location_function,
          order: index + 1,
        });
        setSuccessMessage("Grup lokasi baru berhasil ditambahkan!");
      } else {
        // Update Grup yang Sudah Ada
        await updateHiraGroup(group.id, {
          location_function: group.location_function,
          order: group.order ?? index + 1,
        });
        setSuccessMessage(`Grup "${group.location_function}" berhasil diperbarui!`);
      }
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menyimpan grup."));
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Simpan Activity (POST /hira/activities/ atau PATCH /hira/activities/{id}/)
  const handleSaveActivity = async (activity: HiraActivity, groupId?: number) => {
    if (!activity.activity_name.trim()) {
      alert("Nama aktivitas tidak boleh kosong.");
      return;
    }
    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!activity.id) {
        // Buat Aktivitas Baru jika belum ada ID
        if (!groupId) {
          alert("Harap simpan grup lokasi terlebih dahulu sebelum menambah aktivitas!");
          setActionLoading(false);
          return;
        }
        await createHiraActivity({
          ...activity,
          group: groupId,
        });
        setSuccessMessage("Aktivitas baru berhasil ditambahkan!");
      } else {
        // Update Aktivitas Granular
        await updateHiraActivity(activity.id, activity);
        setSuccessMessage(`Aktivitas "${activity.activity_name}" berhasil diperbarui!`);
      }
      fetchHiraDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menyimpan aktivitas."));
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Hapus Group Granular
  const handleDeleteGroup = async (gIndex: number, groupId?: number) => {
    if (!groupId) {
      // Hapus baris lokal yang belum di-save ke backend
      setEditableGroups(editableGroups.filter((_, idx) => idx !== gIndex));
      return;
    }
    if (!window.confirm("Apakah Anda yakin ingin menghapus grup ini beserta seluruh aktivitas di dalamnya?")) return;
    setActionLoading(true);
    try {
      await deleteHiraGroup(groupId);
      setSuccessMessage("Grup berhasil dihapus.");
      fetchHiraDetail();
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Gagal menghapus grup."));
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Hapus Activity Granular
  const handleDeleteActivity = async (gIndex: number, aIndex: number, activityId?: number) => {
    if (!activityId) {
      // Hapus baris lokal yang belum di-save ke backend
      const updated = [...editableGroups];
      updated[gIndex].activities = updated[gIndex].activities.filter((_, idx) => idx !== aIndex);
      setEditableGroups(updated);
      return;
    }
    if (!window.confirm("Apakah Anda yakin ingin menghapus aktivitas ini?")) return;
    setActionLoading(true);
    try {
      await deleteHiraActivity(activityId);
      setSuccessMessage("Aktivitas berhasil dihapus.");
      fetchHiraDetail();
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "Gagal menghapus aktivitas."));
    } finally {
      setActionLoading(false);
    }
  };

  // Helper Perubahan Input Lokal
  const handleGroupTextChange = (gIndex: number, val: string) => {
    const updated = [...editableGroups];
    updated[gIndex].location_function = val;
    setEditableGroups(updated);
  };

  const handleActivityFieldChange = (
    gIndex: number,
    aIndex: number,
    field: keyof HiraActivity,
    val: unknown
  ) => {
    const updated = [...editableGroups];
    updated[gIndex].activities[aIndex] = {
      ...updated[gIndex].activities[aIndex],
      [field]: val,
    };
    setEditableGroups(updated);
  };

  const addNewGroupLocal = () => {
    setEditableGroups([
      ...editableGroups,
      {
        location_function: "",
        activities: [
          {
            activity_name: "",
            activity_type: "NR",
            potential_hazard: "",
            risk_impact: "",
            initial_severity: 1,
            initial_likelihood: 1,
            residual_severity: 1,
            residual_likelihood: 1,
          },
        ],
      },
    ]);
  };

  const addNewActivityLocal = (gIndex: number) => {
    const updated = [...editableGroups];
    updated[gIndex].activities.push({
      activity_name: "",
      activity_type: "NR",
      potential_hazard: "",
      risk_impact: "",
      initial_severity: 1,
      initial_likelihood: 1,
      residual_severity: 1,
      residual_likelihood: 1,
    });
    setEditableGroups(updated);
  };

  // ==========================================
  // ACTION HANDLERS UMUM DOKUMEN
  // ==========================================

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

  // Pengecekan Hak Akses
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
  const canDeleteDraft = hira.status === "draft" && hira.submission_round === 0;

  // Status apakah pengguna dapat mengedit isian form secara granular
  const isEditable = canEdit && (hira.status === "draft" || hira.status === "rejected");

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

      {/* SECTION 1: HEADER DOKUMEN (FORM & SAVE HEADER) */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center">
          <span>1. Informasi Umum Dokumen</span>
          {isEditable && (
            <button
              type="button"
              className="btn btn-light btn-sm text-success fw-bold"
              onClick={handleSaveHeader}
              disabled={actionLoading}
            >
              Simpan Perubahan Header
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Paket Pekerjaan</label>
              <input
                type="text"
                className="form-control"
                value={editWorkPackage}
                onChange={(e) => setEditWorkPackage(e.target.value)}
                disabled={!isEditable}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Area Pekerjaan</label>
              <input
                type="text"
                className="form-control"
                value={editWorkArea}
                onChange={(e) => setEditWorkArea(e.target.value)}
                disabled={!isEditable}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Tanggal Dokumen</label>
              <input
                type="date"
                className="form-control"
                value={editDocumentDate}
                onChange={(e) => setEditDocumentDate(e.target.value)}
                disabled={!isEditable}
              />
            </div>
          </div>

          <div className="row g-3 bg-light p-3 rounded mt-2">
            <div className="col-md-3">
              <small className="text-muted d-block">Proyek</small>
              <span className="fw-semibold">{hira.project_name}</span>
            </div>
            <div className="col-md-3">
              <small className="text-muted d-block">No. Dokumen</small>
              <span className="fw-semibold">{hira.document_number || "Belum Diatur"}</span>
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

      {/* Action Bar (Dokumen Level) */}
      {(canSubmit || canSetNumber || canCancel || canDeleteDraft) && (
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-body d-flex flex-wrap align-items-center gap-2">
            <span className="fw-bold me-2">Aksi Dokumen:</span>

            {canSubmit && (
              <button
                className="btn btn-success fw-semibold"
                onClick={handleSubmit}
                disabled={actionLoading}
              >
                Submit / Ajukan Dokumen
              </button>
            )}

            {canDeleteDraft && (
              <button
                className="btn btn-outline-danger fw-semibold"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                Hapus Draft
              </button>
            )}

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

      {/* SECTION 2: IDENTIFIKASI BAHAYA & PENILAIAN RISIKO (GROUPS & ACTIVITIES) */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">2. Identifikasi Bahaya &amp; Penilaian Risiko</h4>
        {isEditable && (
          <button type="button" className="btn btn-dark btn-sm" onClick={addNewGroupLocal}>
            + Tambah Grup / Lokasi
          </button>
        )}
      </div>

      {editableGroups.length === 0 ? (
        <p className="text-muted">Belum ada grup lokasi/aktivitas yang ditambahkan.</p>
      ) : (
        editableGroups.map((grp: HiraGroup, gIdx: number) => (
          <div key={grp.id || `local-grp-${gIdx}`} className="card shadow-sm border-0 mb-4 border-start border-4 border-dark">
            {/* Header Grup & Save Button */}
            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
              <div className="flex-grow-1 me-3">
                <input
                  type="text"
                  className="form-control form-control-sm fw-bold"
                  placeholder="Lokasi / Fungsi Pekerjaan..."
                  value={grp.location_function}
                  onChange={(e) => handleGroupTextChange(gIdx, e.target.value)}
                  disabled={!isEditable}
                />
              </div>
              {isEditable && (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success btn-sm text-nowrap"
                    onClick={() => handleSaveGroup(grp, gIdx)}
                    disabled={actionLoading}
                  >
                    Simpan Grup Ini
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteGroup(gIdx, grp.id)}
                    disabled={actionLoading}
                  >
                    Hapus Grup
                  </button>
                </div>
              )}
            </div>

            {/* List Aktivitas */}
            <div className="card-body">
              {grp.activities.map((act: HiraActivity, aIdx: number) => {
                const initialRisk = calculateRisk(act.initial_severity, act.initial_likelihood);
                const residualRisk = calculateRisk(act.residual_severity, act.residual_likelihood);

                return (
                  <div key={act.id || `local-act-${aIdx}`} className="p-3 mb-3 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-secondary">Aktivitas #{aIdx + 1}</span>
                      {isEditable && (
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm fw-bold"
                            onClick={() => handleSaveActivity(act, grp.id)}
                            disabled={actionLoading}
                          >
                            Simpan Aktivitas Ini
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm text-decoration-none"
                            onClick={() => handleDeleteActivity(gIdx, aIdx, act.id)}
                            disabled={actionLoading}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-md-5">
                        <label className="form-label small fw-semibold">Nama Aktivitas *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Contoh: Penerimaan Bekisting"
                          value={act.activity_name}
                          onChange={(e) =>
                            handleActivityFieldChange(gIdx, aIdx, "activity_name", e.target.value)
                          }
                          disabled={!isEditable}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">Sifat Pekerjaan *</label>
                        <select
                          className="form-select form-select-sm"
                          value={act.activity_type || "NR"}
                          onChange={(e) =>
                            handleActivityFieldChange(
                              gIdx,
                              aIdx,
                              "activity_type",
                              e.target.value as ActivityType
                            )
                          }
                          disabled={!isEditable}
                        >
                          <option value="R">R (Rutin)</option>
                          <option value="NR">NR (Non-Rutin)</option>
                          <option value="E">E (Darurat)</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Regulasi Berlaku</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Contoh: UU No.1 Th 1970"
                          value={act.applicable_regulation || ""}
                          onChange={(e) =>
                            handleActivityFieldChange(gIdx, aIdx, "applicable_regulation", e.target.value)
                          }
                          disabled={!isEditable}
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Potensi Bahaya *</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Contoh: Terlindas truk, Terjatuh dari truk"
                          value={act.potential_hazard}
                          onChange={(e) =>
                            handleActivityFieldChange(gIdx, aIdx, "potential_hazard", e.target.value)
                          }
                          disabled={!isEditable}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Risiko / Dampak *</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Contoh: Luka, Cidera, Shock"
                          value={act.risk_impact}
                          onChange={(e) =>
                            handleActivityFieldChange(gIdx, aIdx, "risk_impact", e.target.value)
                          }
                          disabled={!isEditable}
                        />
                      </div>
                    </div>

                    {/* Matrix Risiko Awal */}
                    <div className="p-2 mb-2 bg-white rounded border">
                      <div className="fw-semibold small mb-2 text-dark">
                        Risiko Awal (Live Preview: Rt = {initialRisk.score} | Category = {initialRisk.category})
                      </div>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Keparahan (R / Severity):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.initial_severity}
                            onChange={(e) =>
                              handleActivityFieldChange(gIdx, aIdx, "initial_severity", Number(e.target.value))
                            }
                            disabled={!isEditable}
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>R = {v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Kemungkinan (L / Likelihood):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.initial_likelihood}
                            onChange={(e) =>
                              handleActivityFieldChange(gIdx, aIdx, "initial_likelihood", Number(e.target.value))
                            }
                            disabled={!isEditable}
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>L = {v}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Pengendalian */}
                    <div className="row g-2 mb-2">
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold">Pengendalian Awal</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Contoh: Security mengatur lalu lintas..."
                          value={act.existing_controls || ""}
                          onChange={(e) =>
                            handleActivityFieldChange(gIdx, aIdx, "existing_controls", e.target.value)
                          }
                          disabled={!isEditable}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Kategori Pengendalian</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Contoh: ADM, APD"
                          value={act.control_category || "ADM, APD"}
                          onChange={(e) =>
                            handleActivityFieldChange(gIdx, aIdx, "control_category", e.target.value)
                          }
                          disabled={!isEditable}
                        />
                      </div>
                    </div>

                    {/* Matrix Sisa Risiko */}
                    <div className="p-2 mb-2 bg-white rounded border">
                      <div className="fw-semibold small mb-2 text-dark">
                        Sisa Risiko (Live Preview: Rt = {residualRisk.score} | Acceptable = {residualRisk.isAcceptable ? "Y" : "N"})
                      </div>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Keparahan Sisa (R):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.residual_severity}
                            onChange={(e) =>
                              handleActivityFieldChange(gIdx, aIdx, "residual_severity", Number(e.target.value))
                            }
                            disabled={!isEditable}
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>R = {v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Kemungkinan Sisa (L):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.residual_likelihood}
                            onChange={(e) =>
                              handleActivityFieldChange(gIdx, aIdx, "residual_likelihood", Number(e.target.value))
                            }
                            disabled={!isEditable}
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>L = {v}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Peluang */}
                    <div>
                      <label className="form-label small fw-semibold">Peluang (Opsional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Catatan peluang perbaikan..."
                        value={act.opportunity || ""}
                        onChange={(e) =>
                          handleActivityFieldChange(gIdx, aIdx, "opportunity", e.target.value)
                        }
                        disabled={!isEditable}
                      />
                    </div>
                  </div>
                );
              })}

              {isEditable && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary w-100 mt-2"
                  onClick={() => addNewActivityLocal(gIdx)}
                >
                  + Tambah Aktivitas ke Grup Ini
                </button>
              )}
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