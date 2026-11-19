// src/pages/workPermit/WorkPermitList.tsx
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getWorkPermits } from "../../services/workPermitServices";
import type {
  WorkPermitListItem,
  WorkPermitListParams,
  WorkPermitStatus,
  RiskCategory,
} from "../../types/workPermit";

export default function WorkPermitList() {
  const navigate = useNavigate();

  const [permits, setPermits] = useState<WorkPermitListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filter & Paginasi States
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Helper Format Tanggal ke DD-MM-YYYY
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    return `${day}-${month}-${year}`;
  };

  const fetchPermits = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const params: WorkPermitListParams = { 
        permit_type: "working_at_height",
        page,
        page_size: 10,
      };
      if (selectedStatus) params.status = selectedStatus as WorkPermitStatus;
      if (selectedRisk) params.risk_category = selectedRisk as RiskCategory;

      const data = await getWorkPermits(params);
      
      if (Array.isArray(data)) {
        setPermits(data);
        setTotalItems(data.length);
        setTotalPages(1);
      } else {
        const paginatedData = data as { results?: WorkPermitListItem[]; count?: number };
        setPermits(paginatedData.results || []);
        setTotalItems(paginatedData.count || 0);
        setTotalPages(Math.ceil((paginatedData.count || 0) / 10));
      }
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
  }, [page, selectedStatus, selectedRisk]);

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
      pending_close: { label: "Menunggu Konfirmasi Penutupan", bg: "bg-secondary text-white" },
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
  const renderRiskBadge = (category?: RiskCategory | string | null) => {
    const colorMap: Record<string, { bg: string; color: string }> = {
      R: { bg: "#198754", color: "#fff" },
      M: { bg: "#ffc107", color: "#212529" },
      T: { bg: "#fd7e14", color: "#fff" },
      E: { bg: "#dc3545", color: "#fff" },
    };
    const c = category ? colorMap[category] : undefined;
    return (
      <span
        className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold shadow-sm"
        style={{
          width: 28,
          height: 28,
          fontSize: "0.75rem",
          backgroundColor: c?.bg ?? "#6c757d",
          color: c?.color ?? "#fff",
        }}
      >
        {category || "-"}
      </span>
    );
  };

  return (
    <div className="container-fluid py-3 py-md-4 px-2 px-md-4">
      <style>{WORK_PERMIT_LIST_CSS}</style>

      {/* Header & Button Create (Responsif: Menumpuk di HP, Sejajar di Desktop) */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1 fs-4 fs-md-3">Izin Kerja di Ketinggian</h2>
          <p className="text-muted small mb-0">Kelola dan pantau izin kerja berisiko tinggi di area ketinggian.</p>
        </div>
        <Link to="/work-permit" className="btn btn-success fw-semibold shadow-sm px-3 py-2 text-nowrap align-self-start align-self-md-auto">
          <i className="bi bi-file-earmark-plus me-1"></i> Buat Izin Kerja Baru
        </Link>
      </div>

      {/* Filter Bar (Responsif menumpuk di perangkat kecil) */}
      <div className="card shadow-sm border-0 mb-4 rounded-3">
        <div className="card-body bg-light rounded-3 d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center">
          <div className="flex-grow-1">
            <label htmlFor="permit-filter-status" className="form-label small fw-semibold text-secondary mb-1">FILTER STATUS:</label>
            <select
              id="permit-filter-status"
              name="status"
              className="form-select form-select-sm border-0 shadow-sm"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="pending_supervisor">Menunggu Supervisor</option>
              <option value="pending_officer">Menunggu HSE Officer</option>
              <option value="pending_pm">Menunggu Project Manager</option>
              <option value="pending_mk">Menunggu Manajemen Konstruksi</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="pending_close">Menunggu Konfirmasi Penutupan</option>
              <option value="closed">Ditutup</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="flex-grow-1">
            <label htmlFor="permit-filter-risk" className="form-label small fw-semibold text-secondary mb-1">FILTER RISIKO:</label>
            <select
              id="permit-filter-risk"
              name="risk_category"
              className="form-select form-select-sm border-0 shadow-sm"
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Semua Risiko</option>
              <option value="R">Rendah (R)</option>
              <option value="M">Menengah (M)</option>
              <option value="T">Tinggi (T)</option>
              <option value="E">Ekstrem (E)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && <div className="alert alert-danger border-0 shadow-sm">{errorMessage}</div>}

      {/* Table List & Paginasi Wrapper */}
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ minWidth: 850 }}>
            <thead className="table-light small text-uppercase text-muted">
              <tr>
                <th className="ps-3 ps-md-4 py-3" style={{ width: "14%" }}>No. Dokumen</th>
                <th className="py-3" style={{ width: "18%" }}>Proyek / Lokasi</th>
                <th className="py-3" style={{ width: "18%" }}>Aktivitas HIRA</th>
                <th className="text-center py-3" style={{ width: "10%" }}>Risiko</th>
                <th className="py-3" style={{ width: "14%" }}>Tanggal Kerja</th>
                <th className="py-3" style={{ width: "16%" }}>Status</th>
                <th className="text-center pe-3 pe-md-4 py-3" style={{ width: "10%" }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="small">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-success spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted small">Memuat daftar izin kerja...</span>
                  </td>
                </tr>
              ) : permits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="bi bi-folder2-open fs-2 d-block mb-2 text-secondary opacity-50"></i>
                    Belum ada data izin kerja di ketinggian.
                  </td>
                </tr>
              ) : (
                permits.map((item) => (
                  <tr key={item.id} className="wp-row-item">
                    <td className="ps-3 ps-md-4 fw-semibold text-secondary">{item.document_number || "Belum Diatur"}</td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: "160px" }}>{item.project_name}</div>
                      <div className="text-muted text-truncate" style={{ fontSize: "11px", maxWidth: "160px" }}>{item.work_location || "-"}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "160px" }}>
                        {item.hira_activity_name || item.work_description || "-"}
                      </div>
                      {item.hira_activity_name && item.work_description && (
                        <div className="text-muted text-truncate" style={{ fontSize: "11px", maxWidth: "160px" }}>{item.work_description}</div>
                      )}
                    </td>
                    <td className="text-center">{renderRiskBadge(item.highest_initial_category || item.risk_category)}</td>
                    <td className="text-nowrap">{formatDate(item.work_date)}</td>
                    <td>{renderStatusBadge(item.status)}</td>
                    <td className="text-center pe-3 pe-md-4">
                      <button
                        className="btn btn-sm btn-outline-success fw-semibold px-2.5 py-1"
                        onClick={() => navigate(`/work-permit/${item.id}`)}
                      >
                        Detail &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Paginasi (Responsif tumpuk di HP) */}
        {!loading && totalPages > 1 && (
          <div className="card-footer bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 py-3 px-3">
            <small className="text-muted mb-0 text-center text-md-start">
              Menampilkan {permits.length} dari total {totalItems} entri
            </small>

            <nav>
              <ul className="pagination pagination-sm mb-0 justify-content-center">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link me-1 rounded-2" onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                    &laquo; Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <li key={pageNum} className={`page-item ${page === pageNum ? "active" : ""}`}>
                    <button className="page-link rounded-2 mx-0.5" onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link ms-1 rounded-2" onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
                    Next &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling Responsif & Tema
const WORK_PERMIT_LIST_CSS = `
  .wp-row-item {
    transition: background-color 0.15s ease;
  }
  .wp-row-item:hover {
    background-color: #f8fff9 !important;
  }
  .pagination .page-item.active .page-link {
    background-color: #198754 !important;
    border-color: #198754 !important;
    color: #fff !important;
  }
  .pagination .page-link {
    color: #198754;
    border: 1px solid #dee2e6;
  }
  .pagination .page-link:hover {
    background-color: #e9ecef;
    color: #0f5132;
  }
  /* Optimasi tampilan teks panjang pada layar mobile yang digeser horizontal */
  @media (max-width: 768px) {
    .container-fluid {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
  }
`;