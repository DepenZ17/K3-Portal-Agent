// src/pages/workPermit/WorkPermitDetail.tsx
import { useState, useEffect, useCallback } from "react";
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
  setWorkPermitNumber,
  uploadWorkPermitPhotos,
  deleteWorkPermitPhoto
} from "../../services/workPermitServices";
import type {
  WorkPermitDetail,
  WorkPermitAllowedAction,
  RiskCategory,
  GpsLocationData,
  PermitPhoto,
} from "../../types/workPermit";

// Cek allowed_actions (mendukung bentuk objek maupun array)
const isActionAllowed = (
  allowed: WorkPermitDetail["allowed_actions"],
  key: WorkPermitAllowedAction
): boolean => {
  if (Array.isArray(allowed)) return allowed.includes(key);
  if (allowed && typeof allowed === "object") return Boolean(allowed[key]);
  return false;
};

// Mengambil pesan error dari backend ({detail} atau {field: [...]}), 503 foto, atau error biasa (mis. GPS)
const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data && typeof data.detail === "string") return data.detail;
    if (data && typeof data === "object") {
      const firstKey = Object.keys(data)[0];
      const val = firstKey ? data[firstKey] : undefined;
      const msg = Array.isArray(val) ? val.join(", ") : typeof val === "string" ? val : "";
      if (msg) return `${firstKey}: ${msg}`;
    }
    if (err.response?.status === 503) {
      return "Penyimpanan foto sedang tidak dapat dijangkau. Silakan coba lagi.";
    }
    return fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

export default function WorkPermitDetailComponent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [permit, setPermit] = useState<WorkPermitDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Modal / Input States for Actions
  const [remarksInput, setRemarksInput] = useState<string>("");
  const [cancelReasonInput, setCancelReasonInput] = useState<string>("");
  const [postWorkEvalInput, setPostWorkEvalInput] = useState<string>("");
  const [docNumberInput, setDocNumberInput] = useState<string>("");
  const [afterPhotoFiles, setAfterPhotoFiles] = useState<File[]>([]); // Foto "after" saat request close
  const [afterInputKey, setAfterInputKey] = useState<number>(0); // Untuk mengosongkan input file
  const [activeModal, setActiveModal] = useState<string | null>(null); // "approve", "reject", "cancel", "close", "set-number"

  const fetchPermitDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getWorkPermitById(id);
      setPermit(data);
      if (data.document_number) {
        setDocNumberInput(data.document_number);
      }
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal memuat detail izin kerja."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPermitDetail();
  }, [fetchPermitDetail]);

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setErrorMessage("");
  };

  const countPhotos = (stage: "before" | "after") =>
    (permit?.photos ?? []).filter((p) => p.stage === stage).length;

  // Helper Badge Risk Category
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

  // Helper untuk mendapatkan koordinat GPS terkini (selalu pembacaan baru: maximumAge 0)
  const getCurrentGpsLocation = (): Promise<GpsLocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation tidak didukung oleh browser Anda."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsPayload: GpsLocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            captured_at: new Date(position.timestamp).toISOString(),
          };
          // Batas akurasi 50 meter adalah aturan frontend, bukan validasi server
          if (gpsPayload.accuracy > 50) {
            reject(new Error(`Akurasi GPS terlalu rendah (${gpsPayload.accuracy.toFixed(1)} meter). Maksimal akurasi 50 meter.`));
          } else {
            resolve(gpsPayload);
          }
        },
        () => reject(new Error("Lokasi wajib diaktifkan untuk melanjutkan. Pastikan izin lokasi diizinkan.")),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  // 1. Action Submit (Creator - wajib GPS + minimal 1 foto before)
  const handleSubmitPermit = async () => {
    if (!id) return;
    resetMessages();

    if (countPhotos("before") === 0) {
      setErrorMessage("Minimal satu foto sebelum kerja (before) wajib diunggah. Buka Edit Draft untuk mengunggahnya.");
      return;
    }

    setActionLoading(true);
    try {
      const gpsPayload = await getCurrentGpsLocation();
      await submitWorkPermit(id, gpsPayload);
      setSuccessMessage("Izin kerja berhasil disubmit dengan data lokasi GPS.");
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal mensubmit izin kerja."));
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Action Approve (GPS wajib hanya jika decide_requires_location = true: Supervisor & HSE Officer)
  const handleApprove = async () => {
    if (!id) return;
    resetMessages();
    setActionLoading(true);
    try {
      let gpsPayload: GpsLocationData | undefined;
      if (isActionAllowed(permit?.allowed_actions, "decide_requires_location")) {
        gpsPayload = await getCurrentGpsLocation();
      }

      await approveWorkPermit(id, {
        remarks: remarksInput.trim() || undefined,
        ...gpsPayload,
      });

      setSuccessMessage("Izin kerja berhasil disetujui.");
      setActiveModal(null);
      setRemarksInput("");
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menyetujui izin kerja."));
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Action Reject (remarks wajib, tanpa lokasi)
  const handleReject = async () => {
    if (!id) return;
    resetMessages();
    if (!remarksInput.trim()) {
      setErrorMessage("Catatan (remarks) wajib diisi saat menolak.");
      return;
    }
    setActionLoading(true);
    try {
      await rejectWorkPermit(id, remarksInput);
      setSuccessMessage("Izin kerja ditolak.");
      setActiveModal(null);
      setRemarksInput("");
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menolak izin kerja."));
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Action Cancel
  const handleCancel = async () => {
    if (!id) return;
    resetMessages();
    if (!cancelReasonInput.trim()) {
      setErrorMessage("Alasan pembatalan wajib diisi.");
      return;
    }
    setActionLoading(true);
    try {
      await cancelWorkPermit(id, cancelReasonInput);
      setSuccessMessage("Izin kerja dibatalkan.");
      setActiveModal(null);
      setCancelReasonInput("");
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal membatalkan izin kerja."));
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Action Request Close (evaluasi wajib + minimal 1 foto after)
  const handleRequestClose = async () => {
    if (!id) return;
    resetMessages();
    if (!postWorkEvalInput.trim()) {
      setErrorMessage("Evaluasi pasca-pekerjaan wajib diisi.");
      return;
    }
    if (countPhotos("after") === 0 && afterPhotoFiles.length === 0) {
      setErrorMessage("Minimal satu foto sesudah kerja (after) wajib diunggah.");
      return;
    }

    setActionLoading(true);
    try {
      if (afterPhotoFiles.length > 0) {
        const withPhotos = await uploadWorkPermitPhotos(id, "after", afterPhotoFiles);
        setPermit(withPhotos); // Foto tidak terunggah ulang jika langkah berikutnya gagal dan dicoba lagi
        setAfterPhotoFiles([]);
        setAfterInputKey((k) => k + 1);
      }

      await requestCloseWorkPermit(id, postWorkEvalInput);
      setSuccessMessage("Permintaan penutupan izin kerja berhasil diajukan.");
      setActiveModal(null);
      setPostWorkEvalInput("");
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal mengajukan penutupan izin kerja."));
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Action Confirm Close
  const handleConfirmClose = async () => {
    if (!id) return;
    resetMessages();
    setActionLoading(true);
    try {
      await confirmCloseWorkPermit(id);
      setSuccessMessage("Izin kerja berhasil ditutup secara resmi.");
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal mengkonfirmasi penutupan."));
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Action Set Document Number
  const handleSetNumber = async () => {
    if (!id) return;
    resetMessages();
    if (!docNumberInput.trim()) {
      setErrorMessage("Nomor dokumen wajib diisi.");
      return;
    }
    setActionLoading(true);
    try {
      await setWorkPermitNumber(id, docNumberInput);
      setSuccessMessage("Nomor dokumen berhasil disimpan.");
      setActiveModal(null);
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menetapkan nomor dokumen."));
    } finally {
      setActionLoading(false);
    }
  };

  // Helper Hapus Foto
  const handleDeletePhoto = async (photoId: string | number) => {
    if (!id || !window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) return;
    resetMessages();
    try {
      await deleteWorkPermitPhoto(id, photoId);
      setSuccessMessage("Foto berhasil dihapus.");
      await fetchPermitDetail();
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, "Gagal menghapus foto."));
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

  const can = (key: WorkPermitAllowedAction) => isActionAllowed(permit.allowed_actions, key);
  const decideRequiresLocation = can("decide_requires_location");
  const beforePhotos = permit.photos?.filter((p) => p.stage === "before") || [];
  const afterPhotos = permit.photos?.filter((p) => p.stage === "after") || [];

  // Thumbnail foto. url bisa null jika penyimpanan foto sedang bermasalah.
  const renderPhoto = (p: PermitPhoto, canDelete: boolean) => (
    <div key={p.id} className="position-relative">
      {p.url ? (
        <a href={p.url} target="_blank" rel="noopener noreferrer">
          <img
            src={p.url}
            alt={p.original_name || "Foto bukti"}
            className="img-thumbnail rounded shadow-sm"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />
        </a>
      ) : (
        <div
          className="img-thumbnail rounded d-flex align-items-center justify-content-center text-muted small text-center"
          style={{ width: "120px", height: "120px" }}
        >
          Foto tidak tersedia
        </div>
      )}
      {canDelete && (
        <button
          className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 px-1"
          style={{ fontSize: "10px" }}
          onClick={() => handleDeletePhoto(p.id)}
          title="Hapus Foto"
        >
          &times;
        </button>
      )}
    </div>
  );

  return (
    <div className="container py-4" style={{ maxWidth: "1000px" }}>
      
      {/* Alert Messages (saat modal terbuka, error tampil di dalam modal) */}
      {errorMessage && !activeModal && <div className="alert alert-danger shadow-sm alert-dismissible fade show">{errorMessage}</div>}
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
              {can("can_edit") && (
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/work-permit/${permit.id}/edit`)}>
                  Edit Draft
                </button>
              )}
              {can("can_submit") && (
                <button className="btn btn-success btn-sm" onClick={handleSubmitPermit} disabled={actionLoading}>
                  {actionLoading ? "Memproses GPS & Submit..." : "Submit Permohonan"}
                </button>
              )}
              {can("can_decide") && (
                <>
                  <button className="btn btn-success btn-sm" onClick={() => { resetMessages(); setActiveModal("approve"); }}>
                    Setujui (Approve)
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => { resetMessages(); setActiveModal("reject"); }}>
                    Tolak (Reject)
                  </button>
                </>
              )}
              {can("can_set_number") && (
                <button className="btn btn-info btn-sm text-white" onClick={() => { resetMessages(); setActiveModal("set-number"); }}>
                  Set Nomor Dokumen
                </button>
              )}
              {can("can_request_close") && (
                <button className="btn btn-warning btn-sm" onClick={() => { resetMessages(); setActiveModal("close"); }}>
                  Ajukan Penutupan (Request Close)
                </button>
              )}
              {can("can_confirm_close") && (
                <button className="btn btn-success btn-sm" onClick={handleConfirmClose} disabled={actionLoading}>
                  Konfirmasi Penutupan (Confirm Close)
                </button>
              )}
              {can("can_cancel") && (
                <button className="btn btn-dark btn-sm" onClick={() => { resetMessages(); setActiveModal("cancel"); }}>
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

              <p className="mb-2"><strong>Jumlah Pekerja:</strong> {permit.worker_count} Orang</p>
              <p className="mb-2"><strong>Penanggung Jawab (PIC):</strong> {permit.person_in_charge}</p>
              <p className="mb-2"><strong>Peralatan Digunakan:</strong> {permit.equipment_used || "-"}</p>
            </div>
            
            <div className="col-md-6">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Deskripsi &amp; Evaluasi</h5>
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
            </div>
          </div>

          {/* Stempel GPS (geo_stamps). Server menyimpan lokasi apa adanya tanpa verifikasi, reviewer yang memeriksa. */}
          <div className="mb-4">
            <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Stempel Geolokasi GPS (Geo Stamps)</h5>
            {permit.geo_stamps && permit.geo_stamps.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tahapan (Step)</th>
                      <th>Koordinat GPS</th>
                      <th>Akurasi</th>
                      <th>Waktu Deteksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permit.geo_stamps.map((stamp) => {
                      // Backend bisa mengirim angka sebagai string (Decimal)
                      const lat = Number(stamp.latitude);
                      const lng = Number(stamp.longitude);
                      return (
                        <tr key={stamp.id}>
                          <td className="fw-bold text-uppercase">{stamp.step.replace('_', ' ')}</td>
                          <td>
                            <a
                              href={`https://www.google.com/maps?q=${lat},${lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-success text-decoration-none fw-bold"
                            >
                              <i className="bi bi-geo-alt-fill"></i> {lat.toFixed(5)}, {lng.toFixed(5)} (Buka Maps)
                            </a>
                          </td>
                          <td>{Number(stamp.accuracy).toFixed(1)} meter</td>
                          <td className="small text-muted">{new Date(stamp.captured_at).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted small">Belum ada stempel lokasi GPS yang tersimpan.</p>
            )}
          </div>

          {/* Galeri Foto Bukti (Before & After) */}
          <div className="mb-4">
            <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Foto Bukti Lapangan</h5>
            
            <h6 className="fw-bold text-muted small mb-2">Foto Sebelum Kerja (Before):</h6>
            {beforePhotos.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {beforePhotos.map((p) => renderPhoto(p, can("can_upload_before_photos")))}
              </div>
            ) : (
              <p className="text-muted small mb-3">Belum ada foto sebelum kerja.</p>
            )}

            <h6 className="fw-bold text-muted small mb-2">Foto Sesudah Kerja (After):</h6>
            {afterPhotos.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {afterPhotos.map((p) => renderPhoto(p, can("can_upload_after_photos")))}
              </div>
            ) : (
              <p className="text-muted small">Belum ada foto sesudah kerja.</p>
            )}
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

          {/* Riwayat Persetujuan */}
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
                        <td>{app.decided_by?.full_name || app.decided_by_name || "-"}</td>
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
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {errorMessage && <div className="alert alert-danger py-2 small">{errorMessage}</div>}

                {activeModal === 'approve' && (
                  <>
                    {decideRequiresLocation && (
                      <div className="alert alert-info py-2 small">
                        Lokasi GPS Anda akan diambil saat menyetujui (wajib untuk tahap ini).
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label" htmlFor="approve-remarks">Catatan Persetujuan (Opsional):</label>
                      <textarea id="approve-remarks" name="remarks" className="form-control" rows={3} value={remarksInput} onChange={(e) => setRemarksInput(e.target.value)} placeholder="Tulis catatan jika ada..."></textarea>
                    </div>
                  </>
                )}
                {activeModal === 'reject' && (
                  <div className="mb-3">
                    <label className="form-label text-danger fw-bold" htmlFor="reject-remarks">Alasan Penolakan (Wajib)*:</label>
                    <textarea id="reject-remarks" name="remarks" className="form-control" rows={3} value={remarksInput} onChange={(e) => setRemarksInput(e.target.value)} placeholder="Berikan alasan penolakan..."></textarea>
                  </div>
                )}
                {activeModal === 'cancel' && (
                  <div className="mb-3">
                    <label className="form-label text-danger fw-bold" htmlFor="cancel-reason">Alasan Pembatalan (Wajib)*:</label>
                    <textarea id="cancel-reason" name="reason" className="form-control" rows={3} value={cancelReasonInput} onChange={(e) => setCancelReasonInput(e.target.value)} placeholder="Alasan pembatalan izin kerja..."></textarea>
                  </div>
                )}
                {activeModal === 'close' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-bold" htmlFor="close-evaluation">Evaluasi Pasca-Pekerjaan (Wajib)*:</label>
                      <textarea id="close-evaluation" name="post_work_evaluation" className="form-control" rows={3} value={postWorkEvalInput} onChange={(e) => setPostWorkEvalInput(e.target.value)} placeholder="Hasil evaluasi setelah pekerjaan selesai..."></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold" htmlFor="close-after-photos">Unggah Foto Sesudah Kerja (After Photo)*:</label>
                      <input
                        key={afterInputKey}
                        id="close-after-photos"
                        name="photos"
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setAfterPhotoFiles(Array.from(e.target.files || []))}
                      />
                      <small className="text-muted d-block mt-1">
                        Minimal satu foto. Format JPEG, PNG, WebP (maksimal 5 MB per file, maksimal 5 foto).
                        {afterPhotos.length > 0 && ` Sudah terunggah: ${afterPhotos.length} foto.`}
                      </small>
                    </div>
                  </>
                )}
                {activeModal === 'set-number' && (
                  <div className="mb-3">
                    <label className="form-label fw-bold" htmlFor="doc-number">Nomor Dokumen (Wajib)*:</label>
                    <input id="doc-number" name="document_number" type="text" className="form-control" value={docNumberInput} onChange={(e) => setDocNumberInput(e.target.value)} placeholder="Contoh: KPT/001/X/2026" />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={closeModal}>Batal</button>
                {activeModal === 'approve' && <button type="button" className="btn btn-success btn-sm" onClick={handleApprove} disabled={actionLoading}>{actionLoading ? "Memproses..." : "Setujui"}</button>}
                {activeModal === 'reject' && <button type="button" className="btn btn-danger btn-sm" onClick={handleReject} disabled={actionLoading}>Tolak</button>}
                {activeModal === 'cancel' && <button type="button" className="btn btn-dark btn-sm" onClick={handleCancel} disabled={actionLoading}>Batalkan</button>}
                {activeModal === 'close' && <button type="button" className="btn btn-warning btn-sm" onClick={handleRequestClose} disabled={actionLoading}>{actionLoading ? "Memproses..." : "Kirim Pengajuan"}</button>}
                {activeModal === 'set-number' && <button type="button" className="btn btn-info text-white btn-sm" onClick={handleSetNumber} disabled={actionLoading}>Simpan Nomor</button>}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}