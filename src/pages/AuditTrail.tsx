// src/pages/AuditTrail.tsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getAuditLogs } from "../services/auditService";
import type { AuditEntry, AuditAction, AuditQueryParams } from "../types/audit";

// Label tampilan untuk resource_type dari backend (nilai asli tidak diubah)
const RESOURCE_LABELS: Record<string, string> = {
  "work_permit.workpermit": "Work Permit",
  "hira.hiradocument": "HIRA Document",
  "hira.hiragroup": "HIRA Group",
  "hira.hiraactivity": "HIRA Activity",
  "projects.project": "Project",
};

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // State untuk Filter & Paginasi
  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceType, setResourceType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // State Modal Detail Snapshot
  const [selectedSnapshot, setSelectedSnapshot] = useState<Record<string, unknown> | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const params: AuditQueryParams = {
        page,
        page_size: 10,
        action: actionFilter || undefined,
        resource_type: resourceType || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        search: searchQuery || undefined,
      };

      const data = await getAuditLogs(params);
      
      // Menangani format respons paginasi standar ({ count, results })
      if (Array.isArray(data)) {
        setLogs(data);
        setTotalItems(data.length);
        setTotalPages(1);
      } else {
        setLogs(data.results || []);
        setTotalItems(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 10));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.detail || "Gagal mengambil data audit log dari server."
        );
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan sistem saat memuat audit log.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, actionFilter, resourceType, dateFrom, dateTo, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset semua filter
  const handleResetFilters = () => {
    setActionFilter("");
    setResourceType("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setPage(1);
  };

  // Helper Badge Warna Aksi
  const getActionBadgeClass = (action: AuditAction | string) => {
    switch (action) {
      case "created":
        return "bg-success";
      case "updated":
        return "bg-info text-dark";
      case "deleted":
        return "bg-danger";
      case "submitted":
        return "bg-primary";
      case "approved":
        return "bg-success";
      case "rejected":
        return "bg-warning text-dark";
      case "cancelled":
        return "bg-secondary";
      case "request_closed":
        return "bg-warning text-dark";
      case "closed":
        return "bg-dark";
      case "number_set":
        return "bg-info text-white";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Audit Log</h2>
          <p className="text-muted small mb-0">
            Riwayat aktivitas dan catatan perubahan sistem keselamatan kerja (HSE).
          </p>
        </div>
        <button
          className="btn btn-outline-success btn-sm mt-3 mt-md-0 d-inline-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={fetchLogs}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh Data
        </button>
      </div>

      {/* Alert Error */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
          <small>{errorMessage}</small>
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMessage("")}
          ></button>
        </div>
      )}

      {/* Card Filter */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label htmlFor="audit-search" className="form-label fw-semibold text-secondary small">CARI KATA KUNCI</label>
              <input
                id="audit-search"
                type="text"
                className="form-control form-control-sm bg-light"
                placeholder="Cari kata kunci / ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Filter Tipe Aksi */}
            <div className="col-6 col-md-2">
              <label htmlFor="audit-action-filter" className="form-label fw-semibold text-secondary small">TIPE AKSI</label>
              <select
                id="audit-action-filter"
                className="form-select form-select-sm bg-light"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Semua Aksi</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="request_closed">Request Closed</option>
                <option value="closed">Closed</option>
                <option value="number_set">Number Set</option>
              </select>
            </div>

            {/* Filter Resource Type */}
            <div className="col-6 col-md-3">
              <label htmlFor="audit-resource-type" className="form-label fw-semibold text-secondary small">RESOURCE TYPE</label>
              <select
                id="audit-resource-type"
                className="form-select form-select-sm bg-light"
                value={resourceType}
                onChange={(e) => {
                  setResourceType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Semua Resource</option>
                <option value="work_permit.workpermit">Work Permit</option>
                <option value="hira.hiradocument">HIRA Document</option>
                <option value="hira.hiragroup">HIRA Group</option>
                <option value="hira.hiraactivity">HIRA Activity</option>
                <option value="projects.project">Project</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <label htmlFor="audit-date-from" className="form-label fw-semibold text-secondary small">DARI TANGGAL</label>
              <input
                id="audit-date-from"
                type="date"
                className="form-control form-control-sm bg-light"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="col-6 col-md-2">
              <label htmlFor="audit-date-to" className="form-label fw-semibold text-secondary small">SAMPAI TANGGAL</label>
              <input
                id="audit-date-to"
                type="date"
                className="form-control form-control-sm bg-light"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {(actionFilter || resourceType || dateFrom || dateTo || searchQuery) && (
            <div className="mt-3 text-end">
              <button
                type="button"
                className="btn btn-link text-decoration-none btn-sm text-danger p-0"
                onClick={handleResetFilters}
              >
                &times; Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabel Audit Logs */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ tableLayout: "fixed", minWidth: "900px" }}>
              <thead className="table-light border-bottom">
                <tr className="text-secondary small fw-bold text-uppercase">
                  <th className="py-3 px-3" style={{ width: "13%" }}>Waktu</th>
                  <th className="py-3 px-3" style={{ width: "33%" }}>Aktor / User</th>
                  <th className="py-3 px-3" style={{ width: "13%" }}>Aksi</th>
                  <th className="py-3 px-3" style={{ width: "17%" }}>Resource</th>
                  <th className="py-3 px-3" style={{ width: "14%" }}>IP Address</th>
                  <th className="py-3 px-3 text-center" style={{ width: "10%" }}>Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="spinner-border text-success spinner-border-sm me-2" role="status"></div>
                      <span className="text-muted small">Memuat data audit log...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Tidak ada riwayat aktivitas ditemukan.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-3 text-nowrap">
                        <small className="fw-semibold text-dark">
                          {new Date(log.timestamp).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </small>
                        <br />
                        <span className="text-muted" style={{ fontSize: "11px" }}>
                          {new Date(log.timestamp).toLocaleTimeString("id-ID")}
                        </span>
                      </td>

                      <td className="px-3">
                        <div className="fw-semibold text-dark small">{log.actor_label || log.user || "System"}</div>
                        {log.remarks && (
                          <span className="text-muted d-block" style={{ fontSize: "11px" }}>
                            {log.remarks}
                          </span>
                        )}
                      </td>

                      <td className="px-3">
                        <span className={`badge ${getActionBadgeClass(log.action)} text-uppercase rounded-pill px-2 py-1`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="px-3">
                        <span className="fw-semibold text-dark small">
                          {RESOURCE_LABELS[log.resource_type] || log.resource_type}
                        </span>
                        <span className="text-muted ms-1 small">#{log.resource_id}</span>
                      </td>

                      <td className="px-3 text-nowrap">
                        <code className="text-dark bg-light px-2 py-1 rounded small">
                          {log.ip_address || "-"}
                        </code>
                      </td>

                      <td className="px-3 text-center">
                        {log.snapshot ? (
                          <button
                            className="btn btn-sm btn-outline-secondary px-3"
                            onClick={() => setSelectedSnapshot(log.snapshot)}
                            title="Lihat Detail Snapshot"
                          >
                            <i className="bi bi-file-code"></i> Detail
                          </button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Paginasi */}
        {!isLoading && totalPages > 1 && (
          <div className="card-footer bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-center py-3 px-3">
            <small className="text-muted mb-2 mb-md-0">
              Menampilkan {logs.length} dari total {totalItems} entri
            </small>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link me-1" onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                    &laquo; Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <li key={pageNum} className={`page-item ${page === pageNum ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(pageNum)}>
                      {pageNum}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link ms-1" onClick={() => setPage((p) => Math.min(p + 1, totalPages))}>
                    Next &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Modal Detail Snapshot */}
      {selectedSnapshot && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title h6 fw-bold">Detail Snapshot Payload</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSnapshot(null)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <pre className="bg-dark text-light p-3 rounded fs-6 mb-0" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {JSON.stringify(selectedSnapshot, null, 2)}
                </pre>
              </div>
              <div className="modal-footer border-top py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedSnapshot(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}