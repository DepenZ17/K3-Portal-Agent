// src/pages/workPermit/WorkPermitDetail.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  getWorkPermitById, 
  submitWorkPermit, 
  approveWorkPermit, 
  rejectWorkPermit, 
  cancelWorkPermit, 
  requestCloseWorkPermit, 
  confirmCloseWorkPermit, 
  setWorkPermitNumber 
} from "../../services/workPermitServices";
import type { WorkPermitDetail, RiskCategory } from "../../types/workPermit";

export default function WorkPermitDetailComponent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [permit, setPermit] = useState<WorkPermitDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Modal / Input States for Actions requiring body
  const [remarksInput, setRemarksInput] = useState<string>("");
  const [cancelReasonInput, setCancelReasonInput] = useState<string>("");
  const [postWorkEvalInput, setPostWorkEvalInput] = useState<string>("");
  const [docNumberInput, setDocNumberInput] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null); // "approve", "reject", "cancel", "close", "set-number"

  useEffect(() => {
    const fetchPermitDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getWorkPermitById(id);
        setPermit(data);
        if (data.document_number) {
          setDocNumberInput(data.document_number);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorMessage(err.response?.data?.detail || "Gagal memuat detail izin kerja.");
        } else {
          setErrorMessage("Terjadi kesalahan saat memuat data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPermitDetail();
  }, [id]);

  // Helper Badge Risk Category (Bulat)
  const renderRiskBadge = (category?: RiskCategory | string) => {
    const colorMap: Record<string, { bg: string; color: string }> = {
      R: { bg: "#198754", color: "#fff" },
      M: { bg: "#ffc107", color: "#212529" },
      T: { bg: "#fd7e14", color: "#fff" },
      E: { bg: "#dc3545", color: "#fff" },
    };
    const c = category ? colorMap[category] : undefined;
    return (
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold"
        style={{
          width: 30,
          height: 30,
          fontSize: "0.8rem",
          backgroundColor: c?.bg ?? "#6c757d",
          color: c?.color ?? "#fff",
        }}
      >
        {category || "-"}
      </span>
    );
  };

  // Handlers for Actions
  const handleSubmitPermit = async () => {
    if (!id) return;
    setActionLoading(true);
    setErrorMessage("");
    try {
      await submitWorkPermit(id);
      setSuccessMessage("Izin kerja berhasil disubmit.");
      const data = await getWorkPermitById(id);
      setPermit(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal mensubmit izin kerja.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    setErrorMessage("");
    try {
      await approveWorkPermit(id, remarksInput);
      setSuccessMessage("Izin kerja berhasil disetujui.");
      setActiveModal(null);
      setRemarksInput("");
      const data = await getWorkPermitById(id);
      setPermit(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal menyetujui izin kerja.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !remarksInput.trim()) {
      setErrorMessage("Catatan (remarks) wajib diisi saat menolak.");
      return;
    }
    setActionLoading(true);
    setErrorMessage("");
    try {
      await rejectWorkPermit(id, remarksInput);
      setSuccessMessage("Izin kerja ditolak.");
      setActiveModal(null);
      setRemarksInput("");
      const data = await getWorkPermitById(id);
      setPermit(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal menolak izin kerja.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !cancelReasonInput.trim()) {
      setErrorMessage("Alasan pembatalan wajib diisi.");
      return;
    }
    setActionLoading(true);
    setErrorMessage("");
    try {
      await cancelWorkPermit(id, cancelReasonInput);
      setSuccessMessage("Izin kerja dibatalkan.");
      setActiveModal(null);
      setCancelReasonInput("");
      const data = await getWorkPermitById(id);
      setPermit(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal membatalkan izin kerja.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestClose = async () => {
    if (!id || !postWorkEvalInput.trim()) {
      setErrorMessage("Evaluasi pasca-pekerjaan wajib diisi.");
      return;
    }
    setActionLoading(true);
    setErrorMessage("");
    try {
      await requestCloseWorkPermit(id, postWorkEvalInput);
      setSuccessMessage("Permintaan penutupan izin kerja berhasil dikirim.");
      setActiveModal(null);
      setPostWorkEvalInput("");
      const data = await getWorkPermitById(id);
      setPermit(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal mengajukan penutupan izin kerja.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmClose = async () => {
    if (!id) return;
    setActionLoading(true);
    setErrorMessage("");
    try {
      await confirmCloseWorkPermit(id);
      setSuccessMessage("Izin kerja berhasil ditutup secara resmi.");
      const data = await getWorkPermitById(id);
      setPermit(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal mengkonfirmasi penutupan.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetNumber = async () => {
    if (!id || !docNumberInput.trim()) {
      setErrorMessage("Nomor dokumen wajib diisi.");
      return;
    }
    setActionLoading(true);
    setErrorMessage("");
    try {
      await setWorkPermitNumber(id, docNumberInput);
      setSuccessMessage("Nomor dokumen berhasil disimpan.");
      setActiveModal(null);
      const data = await getWorkPermitById(id);
      setPermit(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal menetapkan nomor dokumen.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Memuat detail izin kerja...</p>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">Data izin kerja tidak ditemukan atau Anda tidak memiliki akses.</div>
        <button className="btn btn-light btn-sm fw-semibold text-primary px-3 shadow-sm" onClick={() => navigate("/work-permit/list")}>
          &larr; Kembali ke Daftar
        </button>
      </div>
    );
  }

  const actions = (permit.allowed_actions || {}) as Record<string, boolean>;

  return (
    <div className="container py-4" style={{ maxWidth: "1000px" }}>
      
      {/* Alert Messages */}
      {errorMessage && <div className="alert alert-danger shadow-sm alert-dismissible fade show">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success shadow-sm alert-dismissible fade show">{successMessage}</div>}

      <div className="card shadow border-0 overflow-hidden mb-4">
        
        {/* Header */}
        <div className="bg-primary text-white p-4 d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex gap-2 mb-2">
              <span className="badge bg-light text-primary fw-bold">
                {permit.form?.code || "F.01/P.10/SHE/KPT"} (Rev. {permit.form?.revision || "3"})
              </span>
              <span className={`badge bg-${permit.status === 'approved' ? 'success' : permit.status === 'rejected' ? 'danger' : 'warning'} text-dark text-uppercase`}>
                {permit.status.replace("_", " ")}
              </span>
            </div>
            <h2 className="fw-bold mb-1 text-white">
              Izin Kerja di Ketinggian {permit.document_number ? `(${permit.document_number})` : "(Belum ada No. Dokumen)"}
            </h2>
            <p className="mb-0 text-white-50 small">Proyek: {permit.project_name}</p>
          </div>
          <button className="btn btn-light btn-sm fw-semibold text-primary px-3 shadow-sm" onClick={() => navigate("/work-permit/list")}>
            &larr; Kembali ke Daftar
          </button>
        </div>

        <div className="card-body p-4 p-md-5">

          {/* Action Toolbar Berdasarkan allowed_actions */}
          <div className="d-flex flex-wrap gap-2 mb-4 p-3 bg-light rounded shadow-sm align-items-center justify-content-between">
            <span className="fw-semibold small text-muted">Aksi Tersedia:</span>
            <div className="d-flex flex-wrap gap-2">
              {actions.can_edit && (
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/work-permit/${permit.id}/edit`)}>
                  Edit Draft
                </button>
              )}
              {actions.can_submit && (
                <button className="btn btn-success btn-sm" onClick={handleSubmitPermit} disabled={actionLoading}>
                  Submit Permohonan
                </button>
              )}
              {actions.can_decide && (
                <>
                  <button className="btn btn-success btn-sm" onClick={() => setActiveModal("approve")}>
                    Setujui (Approve)
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setActiveModal("reject")}>
                    Tolak (Reject)
                  </button>
                </>
              )}
              {actions.can_set_number && (
                <button className="btn btn-info btn-sm text-white" onClick={() => setActiveModal("set-number")}>
                  Set Nomor Dokumen
                </button>
              )}
              {actions.can_request_close && (
                <button className="btn btn-warning btn-sm" onClick={() => setActiveModal("close")}>
                  Ajukan Penutupan (Request Close)
                </button>
              )}
              {actions.can_confirm_close && (
                <button className="btn btn-success btn-sm" onClick={handleConfirmClose} disabled={actionLoading}>
                  Konfirmasi Penutupan (Confirm Close)
                </button>
              )}
              {actions.can_cancel && (
                <button className="btn btn-dark btn-sm" onClick={() => setActiveModal("cancel")}>
                  Batalkan (Cancel)
                </button>
              )}
            </div>
          </div>

          {/* Approval Stepper (Approval Chain) */}
          {permit.approval_chain && permit.approval_chain.length > 0 && (
            <div className="mb-4 p-3 border rounded bg-white shadow-sm">
              <h6 className="fw-bold text-dark mb-3">Alur Persetujuan (Approval Chain)</h6>
              <div className="d-flex flex-wrap gap-2">
                {permit.approval_chain.map((item, index) => {
                  const badgeColor = 
                    item.state === 'approved' ? 'success' :
                    item.state === 'rejected' ? 'danger' :
                    item.state === 'pending' ? 'warning text-dark' : 'secondary';
                  return (
                    <div key={index} className={`p-2 border rounded flex-grow-1 text-center bg-light`}>
                      <div className="small fw-bold text-uppercase text-muted">{item.step.replace('_', ' ')}</div>
                      <span className={`badge bg-${badgeColor} mt-1 text-uppercase`}>{item.state}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Informasi Detail Utama */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Informasi Aktivitas &amp; Lokasi</h5>
              <p className="mb-2"><strong>Aktivitas HIRA:</strong> {permit.hira_activity_name} (Kategori: <span className="badge bg-secondary">{permit.hira_initial_category}</span>)</p>
              <div className="mb-2 d-flex align-items-center gap-2">
                <strong>Kategori Risiko Izin:</strong> 
                {renderRiskBadge(permit.risk_category)}
              </div>
              <p className="mb-2"><strong>Tanggal &amp; Jam Kerja:</strong> {permit.work_date} ({permit.work_start} - {permit.work_end} WIB)</p>
              <p className="mb-2"><strong>Lokasi Kerja:</strong> {permit.work_location}</p>
              
              {/* GPS Location dengan Link ke Maps */}
              <p className="mb-2">
                <strong>Koordinat GPS:</strong>{" "}
                {permit.gps_location ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${permit.gps_location}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success text-decoration-none fw-bold"
                  >
                    <i className="bi bi-geo-alt-fill"></i> {permit.gps_location} (Buka Maps)
                  </a>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </p>

              <p className="mb-2"><strong>Jumlah Pekerja:</strong> {permit.worker_count} Orang</p>
              <p className="mb-2"><strong>Penanggung Jawab (PIC):</strong> {permit.person_in_charge}</p>
              <p className="mb-2"><strong>Peralatan Digunakan:</strong> {permit.equipment_used || "-"}</p>
            </div>
            
            <div className="col-md-6">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Deskripsi, Evaluasi &amp; Foto</h5>
              <div className="p-3 bg-light rounded mb-3">
                <strong className="d-block small text-muted mb-1">Deskripsi Pekerjaan:</strong>
                <p className="mb-0">{permit.work_description}</p>
              </div>

              {permit.post_work_evaluation && (
                <div className="p-3 bg-light rounded mb-3">
                  <strong className="d-block small text-muted mb-1">Evaluasi Pasca-Pekerjaan:</strong>
                  <p className="mb-0">{permit.post_work_evaluation}</p>
                </div>
              )}

              {/* Pratinjau Foto */}
              {permit.photo && (
                <div className="mb-3">
                  <strong className="d-block small text-muted mb-1">Foto Lokasi / Pekerjaan:</strong>
                  <a href={permit.photo} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={permit.photo} 
                      alt="Foto Work Permit" 
                      className="img-thumbnail rounded shadow-sm" 
                      style={{ maxHeight: "150px", objectFit: "cover" }} 
                    />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Area Keselamatan & APD */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Area Keselamatan (Safety Areas)</h5>
              <ul className="list-group">
                {permit.safety_areas?.map((area, idx) => (
                  <li key={idx} className="list-group-item py-1">Area Kode: <strong>{area}</strong></li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Alat Pelindung Diri (PPE / APD)</h5>
              <div className="d-flex flex-wrap gap-1 mb-2">
                {permit.ppe?.map((item, idx) => (
                  <span key={idx} className="badge bg-secondary">{item}</span>
                ))}
              </div>
              {permit.ppe_other && permit.ppe_other.length > 0 && (
                <div className="small text-muted">
                  <strong>APD Lainnya:</strong> {permit.ppe_other.join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Riwayat Persetujuan (Approvals History) */}
          {permit.approvals && permit.approvals.length > 0 && (
            <div className="mb-4">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Riwayat Keputusan (Approval History)</h5>
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tahapan</th>
                      <th>Keputusan</th>
                      <th>Oleh</th>
                      <th>Catatan / Remarks</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permit.approvals.map((app, idx) => (
                      <tr key={idx}>
                        <td className="fw-bold text-uppercase">{app.step.replace('_', ' ')}</td>
                        <td>
                          <span className={`badge bg-${app.decision === 'approved' ? 'success' : 'danger'}`}>
                            {app.decision}
                          </span>
                        </td>
                        <td>{app.decided_by?.full_name || "-"}</td>
                        <td>{app.remarks || "-"}</td>
                        <td className="small text-muted">{app.decided_at ? new Date(app.decided_at).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODALS UNTUK AKSI */}
      {activeModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-capitalize">Formulir Aksi: {activeModal.replace('-', ' ')}</h5>
                <button type="button" className="btn-close" onClick={() => setActiveModal(null)}></button>
              </div>
              <div className="modal-body">
                {activeModal === 'approve' && (
                  <div className="mb-3">
                    <label className="form-label">Catatan Persetujuan (Opsional):</label>
                    <textarea className="form-control" rows={3} value={remarksInput} onChange={(e) => setRemarksInput(e.target.value)} placeholder="Tulis catatan jika ada..."></textarea>
                  </div>
                )}
                {activeModal === 'reject' && (
                  <div className="mb-3">
                    <label className="form-label text-danger fw-bold">Alasan Penolakan (Wajib)*:</label>
                    <textarea className="form-control" rows={3} value={remarksInput} onChange={(e) => setRemarksInput(e.target.value)} placeholder="Berikan alasan penolakan..."></textarea>
                  </div>
                )}
                {activeModal === 'cancel' && (
                  <div className="mb-3">
                    <label className="form-label text-danger fw-bold">Alasan Pembatalan (Wajib)*:</label>
                    <textarea className="form-control" rows={3} value={cancelReasonInput} onChange={(e) => setCancelReasonInput(e.target.value)} placeholder="Alasan pembatalan izin kerja..."></textarea>
                  </div>
                )}
                {activeModal === 'close' && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Evaluasi Pasca-Pekerjaan (Wajib)*:</label>
                    <textarea className="form-control" rows={3} value={postWorkEvalInput} onChange={(e) => setPostWorkEvalInput(e.target.value)} placeholder="Hasil evaluasi setelah pekerjaan selesai..."></textarea>
                  </div>
                )}
                {activeModal === 'set-number' && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nomor Dokumen (Wajib)*:</label>
                    <input type="text" className="form-control" value={docNumberInput} onChange={(e) => setDocNumberInput(e.target.value)} placeholder="Contoh: KPT/001/X/2026" />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveModal(null)}>Batal</button>
                {activeModal === 'approve' && <button type="button" className="btn btn-success btn-sm" onClick={handleApprove} disabled={actionLoading}>Setujui</button>}
                {activeModal === 'reject' && <button type="button" className="btn btn-danger btn-sm" onClick={handleReject} disabled={actionLoading}>Tolak</button>}
                {activeModal === 'cancel' && <button type="button" className="btn btn-dark btn-sm" onClick={handleCancel} disabled={actionLoading}>Batalkan</button>}
                {activeModal === 'close' && <button type="button" className="btn btn-warning btn-sm" onClick={handleRequestClose} disabled={actionLoading}>Kirim Pengajuan</button>}
                {activeModal === 'set-number' && <button type="button" className="btn btn-info text-white btn-sm" onClick={handleSetNumber} disabled={actionLoading}>Simpan Nomor</button>}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}