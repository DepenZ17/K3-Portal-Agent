// src/pages/workPermit/WorkPermitList.tsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getWorkPermits } from "../../services/workPermitServices";
import type { WorkPermitDetail, WorkPermitStatus, RiskCategory } from "../../types/workPermit";

export default function WorkPermitList() {
  const navigate = useNavigate();

  const [permits, setPermits] = useState<WorkPermitDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<string>("");

  const fetchPermits = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params: Record<string, unknown> = { permit_type: "working_at_height" };
      if (selectedStatus) params.status = selectedStatus;
      if (selectedRisk) params.risk_category = selectedRisk;

      const data = await getWorkPermits(params);
      setPermits(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMsg = err.response?.data?.detail || err.message;
        setErrorMessage(`Gagal memuat daftar izin kerja: ${backendMsg}`);
      } else {
        setErrorMessage("Gagal memuat daftar izin kerja di ketinggian karena kesalahan tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedRisk]);

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  // Helper Badge Status
  const renderStatusBadge = (status: WorkPermitStatus) => {
    const badgeMap: Record<WorkPermitStatus, { label: string; bg: string }> = {
      draft: { label: "Draft", bg: "bg-secondary" },
      pending_supervisor: { label: "Menunggu Supervisor", bg: "bg-warning text-dark" },
      pending_officer: { label: "Menunggu HSE Officer", bg: "bg-warning text-dark" },
      pending_pm: { label: "Menunggu Project Manager", bg: "bg-info text-dark" },
      pending_mk: { label: "Menunggu Manajemen Konstruksi", bg: "bg-primary" },
      approved: { label: "Disetujui", bg: "bg-success" },
      rejected: { label: "Ditolak", bg: "bg-danger" },
      pending_close: { label: "Menunggu Konfirmasi Tutup", bg: "bg-secondary text-white" },
      closed: { label: "Ditutup", bg: "bg-dark" },
      cancelled: { label: "Dibatalkan", bg: "bg-danger" },
    };
    const config = badgeMap[status] || { label: status, bg: "bg-secondary" };
    return (
      <span className={`badge ${config.bg}`} style={{ whiteSpace: "nowrap" }}>
        {config.label}
      </span>
    );
  };

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

  return (
    <div className="container py-4">
      {/* Header & Button Create */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Izin Kerja di Ketinggian (Working at Height)</h2>
          <p className="text-muted mb-0">Kelola dan pantau izin kerja berisiko tinggi di area ketinggian.</p>
        </div>
        <Link to="/work-permit" className="btn btn-success fw-semibold">
          + Buat Izin Kerja Baru
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex flex-wrap gap-3 align-items-center">
          <div className="flex-grow-1" style={{ minWidth: "200px" }}>
            <label className="form-label small fw-semibold">Filter Status:</label>
            <select
              className="form-select form-select-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="pending_supervisor">Menunggu Supervisor</option>
              <option value="pending_officer">Menunggu HSE Officer</option>
              <option value="pending_pm">Menunggu Project Manager</option>
              <option value="pending_mk">Menunggu Manajemen Konstruksi</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="pending_close">Menunggu Penutupan</option>
              <option value="closed">Ditutup</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="flex-grow-1" style={{ minWidth: "200px" }}>
            <label className="form-label small fw-semibold">Filter Risiko:</label>
            <select
              className="form-select form-select-sm"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
            >
              <option value="">Semua Risiko</option>
              <option value="R">Rendah (R)</option>
              <option value="M">Sedang (M)</option>
              <option value="T">Tinggi (T)</option>
              <option value="E">Ekstrem (E)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {/* Table List */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ tableLayout: "fixed", minWidth: 900 }}>
              <thead className="table-light small">
              <tr>
                <th className="ps-4" style={{ width: "14%" }}>No. Dokumen</th>
                <th style={{ width: "18%" }}>Proyek / Lokasi</th>
                <th style={{ width: "18%" }}>Aktivitas HIRA</th>
                <th className="text-center" style={{ width: "10%" }}>Risiko</th>
                <th style={{ width: "14%" }}>Tanggal Kerja</th>
                <th style={{ width: "16%" }}>Status</th>
                <th className="text-center pe-4" style={{ width: "10%" }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    Memuat daftar izin kerja...
                  </td>
                </tr>
              ) : permits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    Belum ada data izin kerja di ketinggian.
                  </td>
                </tr>
              ) : (
                permits.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4 fw-semibold">{item.document_number || "Belum Diatur"}</td>
                    <td>
                      <div className="fw-semibold text-truncate">{item.project_name}</div>
                      <div className="text-muted text-truncate">{item.work_location || "-"}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-truncate">
                        {item.hira_activity_name || item.work_description || "-"}
                      </div>
                      {item.hira_activity_name && item.work_description && (
                        <div className="text-muted text-truncate">{item.work_description}</div>
                      )}
                    </td>
                    <td className="text-center">{renderRiskBadge(item.risk_category)}</td>
                    <td className="text-nowrap">{item.work_date || "-"}</td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td className="text-center pe-4">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/work-permit/${item.id}`)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}