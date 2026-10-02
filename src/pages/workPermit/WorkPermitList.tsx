// src/pages/workPermit/WorkPermitList.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import type {
  WorkPermitListItem,
  WorkPermitType,
  WorkPermitStatus,
} from "../../types/WorkPermitList";

/** Data Dummy Fallback jika backend belum aktif/data kosong */
const DUMMY_PERMITS: WorkPermitListItem[] = [
  {
    id: 101,
    project: "Proyek Pembangunan Gedung A",
    type: "HEIGHT",
    location: "Lantai 5 - Sektor Utam",
    date: "2026-09-28",
    status: "SUBMITTED",
    createdBy: "subcon_inti",
    canClose: false,
  },
  {
    id: 102,
    project: "Proyek Pembangunan Gedung A",
    type: "HOT_WORK",
    location: "Basement 2 - Area Utility",
    date: "2026-09-29",
    status: "VERIFIED",
    createdBy: "subcon_inti",
    canClose: false,
  },
  {
    id: 103,
    project: "Proyek Pembangunan Gedung A",
    type: "CONFINED_SPACE",
    location: "Tangki Ground Water Reservoir",
    date: "2026-09-30",
    status: "APPROVED",
    createdBy: "subcon_inti",
    canClose: true,
  },
  {
    id: 104,
    project: "Proyek Pembangunan Gedung A",
    type: "TOWER_CRANE",
    location: "Zone 1 - Site Crane 02",
    date: "2026-09-25",
    status: "CLOSED",
    createdBy: "subcon_mitra",
    canClose: false,
  },
  {
    id: 105,
    project: "Proyek Pembangunan Gedung A",
    type: "LIFTING",
    location: "Area Loading Dock",
    date: "2026-09-30",
    status: "SUBMITTED",
    createdBy: "subcon_mitra",
    canClose: false,
  },
];

/** Helper: label jenis izin (untuk tampilan user) */
function typeLabel(type: WorkPermitType): string {
  switch (type) {
    case "HEIGHT":
      return "Kerja di Ketinggian";
    case "CONFINED_SPACE":
      return "Ruang Terbatas";
    case "HOT_WORK":
      return "Pekerjaan Panas (Hot Work)";
    case "LIFTING":
      return "Pekerjaan Mengangkat";
    case "TOWER_CRANE":
      return "Instalasi / Segmen Tower Crane";
    default:
      return type;
  }
}

/** Helper: badge status */
function statusBadge(status: WorkPermitStatus) {
  let className = "badge bg-secondary";
  if (status === "DRAFT") className = "badge bg-secondary";
  if (status === "SUBMITTED") className = "badge bg-info";
  if (status === "VERIFIED") className = "badge bg-warning text-dark";
  if (status === "APPROVED") className = "badge bg-success";
  if (status === "CLOSED") className = "badge bg-dark";

  return <span className={className}>{status}</span>;
}

export default function WorkPermitList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role;
  const username = user?.username;

  const [permits, setPermits] = useState<WorkPermitListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<WorkPermitType | "ALL">("ALL");

  // state untuk aksi verifikasi / approve / close
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);

  // state untuk modal close
  const [selectedPermit, setSelectedPermit] = useState<WorkPermitListItem | null>(
    null
  );
  const [completionPhotos, setCompletionPhotos] = useState<File[]>([]);
  const [completionNote, setCompletionNote] = useState("");
  const [submittingClose, setSubmittingClose] = useState(false);

  /** Ambil list izin kerja dari backend dengan fallback Data Dummy */
  const loadPermits = async () => {
    try {
      setLoading(true);
      const res = await api.get<WorkPermitListItem[]>("/work-permit/");
      if (res.data && res.data.length > 0) {
        setPermits(res.data);
      } else {
        // Jika data dari API kosong, pakai dummy
        setPermits(DUMMY_PERMITS);
      }
    } catch (err) {
      console.warn("Gagal terhubung ke API backend, menggunakan data dummy.");
      setPermits(DUMMY_PERMITS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermits();
  }, []);

  /** Filter tampilan berdasarkan tipe dan filter privasi Subcontractor */
  const visiblePermits = permits.filter((p) => {
    // Filter 1: Jika user adalah subcontractor, hanya tampilkan izin yang dibuatnya
    if (role === "subcontractor" && p.createdBy !== username) {
      return false;
    }

    // Filter 2: Filter berdasarkan dropdown jenis izin
    if (filterType !== "ALL" && p.type !== filterType) {
      return false;
    }

    return true;
  });

  /** Subcontractor boleh tutup izin: hanya izin miliknya + sudah approved + backend izinkan */
  const canCloseUi = (permit: WorkPermitListItem) => {
    return (
      role === "subcontractor" &&
      username === permit.createdBy &&
      permit.canClose &&
      permit.status === "APPROVED"
    );
  };

  /** Buka modal tutup izin */
  const openCloseModal = (permit: WorkPermitListItem) => {
    setSelectedPermit(permit);
    setCompletionPhotos([]);
    setCompletionNote("");
  };

  /** Tutup modal */
  const closeModal = () => {
    if (submittingClose) return;
    setSelectedPermit(null);
    setCompletionPhotos([]);
    setCompletionNote("");
  };

  /** Handle upload foto penyelesaian */
  const handleCompletionPhotosChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) setCompletionPhotos(Array.from(e.target.files));
  };

  /** Konfirmasi close izin (upload foto + note) */
  const handleConfirmClose = async () => {
    if (!selectedPermit) return;

    if (completionPhotos.length === 0) {
      alert("Harap upload minimal satu foto bukti pekerjaan telah selesai.");
      return;
    }

    if (
      !confirm(
        "Yakin menutup izin kerja ini? Pastikan pekerjaan sudah selesai dan area aman."
      )
    ) {
      return;
    }

    try {
      setSubmittingClose(true);
      setClosingId(selectedPermit.id);

      const formData = new FormData();
      formData.append("note", completionNote);
      completionPhotos.forEach((file) => {
        formData.append("completion_photos", file);
      });

      await api.post(`/work-permit/${selectedPermit.id}/close/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Izin kerja berhasil ditutup.");
      await loadPermits();
      closeModal();
    } catch (err) {
      console.error("Gagal menutup via API, memperbarui UI secara lokal.", err);
      // Update lokal jika API gagal (untuk pengetesan dengan dummy)
      setPermits((prev) =>
        prev.map((p) =>
          p.id === selectedPermit.id ? { ...p, status: "CLOSED", canClose: false } : p
        )
      );
      alert("Izin kerja berhasil ditutup (Simulasi Lokal).");
      closeModal();
    } finally {
      setSubmittingClose(false);
      setClosingId(null);
    }
  };

  /** SHE Officer: verifikasi */
  const handleVerify = async (permit: WorkPermitListItem) => {
    if (
      !confirm(
        `Verifikasi izin kerja #${permit.id}? Tindakan ini hanya untuk SHE Officer.`
      )
    ) {
      return;
    }

    try {
      setVerifyingId(permit.id);
      await api.post(`/work-permit/${permit.id}/verify/`);
      alert("Izin kerja berhasil diverifikasi.");
      await loadPermits();
    } catch (err) {
      console.error("Gagal verifikasi via API, memperbarui UI secara lokal.", err);
      setPermits((prev) =>
        prev.map((p) => (p.id === permit.id ? { ...p, status: "VERIFIED" } : p))
      );
      alert("Izin kerja berhasil diverifikasi (Simulasi Lokal).");
    } finally {
      setVerifyingId(null);
    }
  };

  /** Project Manager: approve */
  const handleApprove = async (permit: WorkPermitListItem) => {
    if (
      !confirm(
        `Approve izin kerja #${permit.id}? Pastikan sudah diverifikasi SHE Officer.`
      )
    ) {
      return;
    }

    try {
      setApprovingId(permit.id);
      await api.post(`/work-permit/${permit.id}/approve/`);
      alert("Izin kerja berhasil di-approve.");
      await loadPermits();
    } catch (err) {
      console.error("Gagal approve via API, memperbarui UI secara lokal.", err);
      setPermits((prev) =>
        prev.map((p) =>
          p.id === permit.id ? { ...p, status: "APPROVED", canClose: true } : p
        )
      );
      alert("Izin kerja berhasil di-approve (Simulasi Lokal).");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div>
      {/* Header + filter */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 mb-1">Daftar Izin Kerja</h1>
          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Subcontractor mengajukan izin kerja. SHE Officer melakukan verifikasi, Project
            Manager melakukan persetujuan, dan Subcontractor menutup izin setelah
            pekerjaan selesai.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0" style={{ fontSize: 14 }}>
            Filter jenis:
          </label>
          <select
            className="form-select form-select-sm"
            style={{ width: 230 }}
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value === "ALL"
                  ? "ALL"
                  : (e.target.value as WorkPermitType)
              )
            }
          >
            <option value="ALL">Semua jenis</option>
            <option value="HEIGHT">Kerja di Ketinggian</option>
            <option value="CONFINED_SPACE">Ruang Terbatas</option>
            <option value="HOT_WORK">Pekerjaan Panas (Hot Work)</option>
            <option value="LIFTING">Pekerjaan Mengangkat</option>
            <option value="TOWER_CRANE">Instalasi / Segmen Tower Crane</option>
          </select>
        </div>
      </div>

      {/* Tabel list */}
      {loading ? (
        <p>Sedang memuat data...</p>
      ) : visiblePermits.length === 0 ? (
        <div className="alert alert-info">Tidak ada izin kerja untuk filter ini.</div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>Proyek</th>
                    <th>Jenis</th>
                    <th>Lokasi</th>
                    <th style={{ width: 120 }}>Tanggal</th>
                    <th style={{ width: 120 }}>Status</th>
                    <th style={{ width: 160 }}>Dibuat oleh</th>
                    <th style={{ width: 260 }}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {visiblePermits.map((permit) => {
                    const hasWorkflowAction =
                      (role === "she_officer" && permit.status === "SUBMITTED") ||
                      (role === "project_manager" && permit.status === "VERIFIED") ||
                      canCloseUi(permit);

                    return (
                      <tr key={permit.id}>
                        <td>#{permit.id}</td>
                        <td>{permit.project}</td>
                        <td>{typeLabel(permit.type)}</td>
                        <td>{permit.location}</td>
                        <td>{permit.date}</td>
                        <td>{statusBadge(permit.status)}</td>
                        <td>{permit.createdBy}</td>

                        <td>
                          {/* Aksi universal: Detail + Print */}
                          <button
                            className="btn btn-outline-secondary btn-sm me-2"
                            onClick={() => navigate(`/work-permit/${permit.id}`)}
                          >
                            Detail
                          </button>

                          <button
                            className="btn btn-outline-dark btn-sm me-2"
                            onClick={() => navigate(`/work-permit/${permit.id}/print`)}
                          >
                            Print
                          </button>

                          {/* SHE Officer: Verifikasi */}
                          {role === "she_officer" && permit.status === "SUBMITTED" && (
                            <button
                              className="btn btn-outline-warning btn-sm me-2"
                              onClick={() => handleVerify(permit)}
                              disabled={verifyingId === permit.id}
                            >
                              {verifyingId === permit.id
                                ? "Memverifikasi..."
                                : "Verifikasi"}
                            </button>
                          )}

                          {/* Project Manager: Approve */}
                          {role === "project_manager" && permit.status === "VERIFIED" && (
                            <button
                              className="btn btn-outline-primary btn-sm me-2"
                              onClick={() => handleApprove(permit)}
                              disabled={approvingId === permit.id}
                            >
                              {approvingId === permit.id
                                ? "Menyetujui..."
                                : "Approve"}
                            </button>
                          )}

                          {/* Subcontractor: Tutup izin setelah APPROVED */}
                          {canCloseUi(permit) && (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => openCloseModal(permit)}
                              disabled={closingId === permit.id}
                            >
                              {closingId === permit.id ? "Menutup..." : "Tutup Izin"}
                            </button>
                          )}

                          {!hasWorkflowAction && (
                            <span className="text-muted" style={{ fontSize: 12 }}>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tutup Izin */}
      {selectedPermit && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: 520 }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0">Tutup Izin Kerja #{selectedPermit.id}</h2>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeModal}
                disabled={submittingClose}
              />
            </div>

            <div className="card-body">
              <p className="text-muted" style={{ fontSize: 14 }}>
                Pastikan pekerjaan sudah selesai dan area kerja aman. Upload minimal
                satu foto sebagai bukti pekerjaan telah selesai.
              </p>

              <div className="mb-3">
                <label className="form-label">Foto bukti selesai</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleCompletionPhotosChange}
                  disabled={submittingClose}
                />
                {completionPhotos.length > 0 && (
                  <small className="text-muted d-block mt-1">
                    {completionPhotos.length} file dipilih:{" "}
                    {completionPhotos.map((f) => f.name).join(", ")}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Catatan (opsional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  disabled={submittingClose}
                  placeholder="Contoh: Pekerjaan selesai pukul 16:30, area sudah dibersihkan."
                />
              </div>
            </div>

            <div className="card-footer d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={closeModal}
                disabled={submittingClose}
              >
                Batal
              </button>

              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleConfirmClose}
                disabled={submittingClose}
              >
                {submittingClose ? "Menyimpan..." : "Konfirmasi Tutup Izin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}