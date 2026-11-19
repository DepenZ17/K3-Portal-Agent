// src/pages/AuditTrail.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuditLogs, getAuditLogDetail } from "../services/auditService";
import type { AuditEntry, AuditAction, AuditQueryParams } from "../types/audit";

interface AuditTrailProps {
  resourceType?: string;
  resourceId?: string | number;
}

const RESOURCE_ROUTES: Partial<Record<string, (id: string | number) => string>> = {
  "hira.hiradocument": (id) => `/hira/${id}`,
  "permits.permit": (id) => `/work-permit/${id}`,
};

const ROLE_LABELS: Record<string, string> = {
  subcontractor: "Subkontraktor",
  supervisor: "Supervisor",
  hse_officer: "HSE Officer",
  hse_coordinator: "HSE Coordinator",
  project_manager: "Project Manager",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_supervisor: "Menunggu Supervisor",
  pending_officer: "Menunggu HSE Officer",
  pending_pm: "Menunggu Project Manager",
  pending_mk: "Menunggu Manajemen Konstruksi",
  approved: "Disetujui",
  rejected: "Ditolak",
  pending_close: "Menunggu Konfirmasi Penutupan",
  closed: "Ditutup",
  cancelled: "Dibatalkan",
};

const FIELD_LABELS: Record<string, string> = {
  project: "Proyek",
  work_package: "Paket Pekerjaan",
  work_area: "Area Pekerjaan",
  document_number: "Nomor Dokumen",
  document_date: "Tanggal Dokumen",
  status: "Status",
  submission_round: "Putaran Pengajuan",
  location_function: "Lokasi / Fungsi Pekerjaan",
  applicable_regulation: "Regulasi yang Berlaku",
  order: "Urutan",
  activity_name: "Nama Aktivitas",
  activity_type: "Sifat Pekerjaan",
  potential_hazard: "Potensi Bahaya",
  risk_impact: "Risiko / Dampak",
  initial_severity: "Keparahan Awal",
  initial_likelihood: "Kemungkinan Awal",
  residual_severity: "Keparahan Sisa",
  residual_likelihood: "Kemungkinan Sisa",
  existing_controls: "Pengendalian Awal",
  control_category: "Kategori Pengendalian",
  opportunity: "Peluang",
  permit_type: "Jenis Izin",
  risk_category: "Kategori Risiko",
  work_date: "Tanggal Kerja",
  work_start: "Jam Mulai",
  work_end: "Jam Selesai",
  work_location: "Lokasi Kerja",
  work_description: "Deskripsi Pekerjaan",
  equipment_used: "Peralatan",
  person_in_charge: "Penanggung Jawab",
  worker_count: "Jumlah Pekerja",
  safety_areas: "Area Keselamatan",
  checklist: "Checklist Keselamatan",
  ppe: "APD",
  ppe_other: "APD Lainnya",
  post_work_evaluation: "Evaluasi Pasca-Pekerjaan",
  cancel_reason: "Alasan Pembatalan",
  created_at: "Dibuat Pada",
  updated_at: "Diubah Pada",
  name: "Nama",
  location: "Lokasi",
  client_name: "Klien",
  start_date: "Tanggal Mulai",
  is_active: "Aktif",
};

const humanizeKey = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatSnapshotValue = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "status" && typeof value === "string") return STATUS_LABELS[value] ?? value;
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    return value.every((v) => typeof v !== "object" || v === null)
      ? value.join(", ")
      : JSON.stringify(value);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getUserRole = (): string => {
  try {
    const userStr = localStorage.getItem("user") || localStorage.getItem("user_data");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role || "";
    }
  } catch {
    // Abaikan
  }
  return "";
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

const formatTime = (iso: string): string =>
  new Date(iso)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":");

const formatRelative = (iso: string): string | null => {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return null;
};

export default function AuditTrail({ resourceType: propResourceType, resourceId }: AuditTrailProps) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [selectedSnapshot, setSelectedSnapshot] = useState<Record<string, unknown> | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const closeSnapshot = () => {
    setSelectedSnapshot(null);
    setShowRawJson(false);
  };

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const params: AuditQueryParams = {
        page,
        page_size: 10,
        action: actionFilter || undefined,
        resource_type: propResourceType || resourceTypeFilter || undefined,
        resource_id: resourceId ? String(resourceId) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };

      const data = await getAuditLogs(params);
      
      let results = Array.isArray(data) ? data : (data.results || []);
      const role = getUserRole();

      if (role === "subcontractor") {
        results = results.filter((log) => {
          const isValidResource = log.resource_type === "permits.permit" || log.resource_type === "hira.hiradocument";
          const isValidAction = log.action !== "mk_otp_sent" && log.action !== "mk_otp_failed";
          return isValidResource && isValidAction;
        });
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        results = results.filter((log) => 
          (log.resource_title && log.resource_title.toLowerCase().includes(query)) ||
          (log.actor_name && log.actor_name.toLowerCase().includes(query)) ||
          (log.remarks && log.remarks.toLowerCase().includes(query)) ||
          (log.action_label && log.action_label.toLowerCase().includes(query)) ||
          (log.resource_id && String(log.resource_id).toLowerCase().includes(query))
        );
      }

      setLogs(results);
      if (Array.isArray(data)) {
        setTotalItems(results.length);
        setTotalPages(1);
      } else {
        setTotalItems(data.count || results.length);
        setTotalPages(Math.ceil((data.count || results.length) / 10));
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
  }, [page, actionFilter, propResourceType, resourceTypeFilter, resourceId, dateFrom, dateTo, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setActionFilter("");
    setResourceTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setPage(1);
  };

  const handleOpenDetail = async (log: AuditEntry) => {
    const role = getUserRole();
    if ((role === "hse_officer" || role === "hse_coordinator") && !log.snapshot) {
      try {
        setIsLoading(true);
        const detailData = await getAuditLogDetail(log.id);
        setSelectedSnapshot(detailData.snapshot || null);
      } catch {
        setErrorMessage("Gagal memuat detail audit log.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setSelectedSnapshot(log.snapshot || null);
    }
  };

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
      case "close_requested":
        return "bg-warning text-dark";
      case "closed":
        return "bg-dark";
      case "number_set":
        return "bg-info text-white";
      case "photo_added":
      case "attachment_added":
        return "bg-primary text-white";
      case "photo_removed":
      case "attachment_removed":
        return "bg-danger text-white";
      case "mk_link_issued":
      case "mk_otp_sent":
        return "bg-secondary text-white";
      case "mk_otp_failed":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  };

  const isTimelineMode = Boolean(propResourceType && resourceId);
  const currentRole = getUserRole();
  const canSeeDetail = currentRole === "hse_officer" || currentRole === "hse_coordinator";

  return (
    <div className={isTimelineMode ? "container-fluid py-2 px-0" : "container-fluid py-3 py-md-4 px-2 px-md-4"}>
      <style>{AUDIT_TRAIL_CSS}</style>

      {!isTimelineMode && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
          <div>
            <h2 className="h4 fw-bold text-dark mb-1 fs-4 fs-md-3">Audit Log</h2>
            <p className="text-muted small mb-0">
              Riwayat aktivitas dan catatan perubahan sistem keselamatan kerja (HSE).
            </p>
          </div>
          <button
            className="btn btn-outline-success btn-sm d-inline-flex align-items-center justify-content-center gap-2 shadow-sm px-3 py-2 text-nowrap align-self-start align-self-md-auto"
            onClick={fetchLogs}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh Data
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm border-0" role="alert">
          <small>{errorMessage}</small>
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMessage("")}
          ></button>
        </div>
      )}

      {!isTimelineMode && (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body bg-light rounded-3 p-3 p-md-4">
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label htmlFor="audit-search" className="form-label fw-semibold text-secondary small mb-1">CARI KATA KUNCI</label>
                <input
                  id="audit-search"
                  type="text"
                  className="form-control form-control-sm border-0 shadow-sm"
                  placeholder="Cari kata kunci / ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="col-6 col-md-2">
                <label htmlFor="audit-action-filter" className="form-label fw-semibold text-secondary small mb-1">TIPE AKSI</label>
                <select
                  id="audit-action-filter"
                  className="form-select form-select-sm border-0 shadow-sm"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Semua Aksi</option>
                  <option value="created">Membuat</option>
                  <option value="updated">Mengubah</option>
                  <option value="deleted">Menghapus</option>
                  <option value="submitted">Mengajukan</option>
                  <option value="approved">Menyetujui</option>
                  <option value="rejected">Menolak</option>
                  <option value="cancelled">Membatalkan</option>
                  <option value="close_requested">Mengajukan penutupan</option>
                  <option value="closed">Menutup</option>
                  <option value="mk_link_issued">Tautan MK</option>
                </select>
              </div>

              <div className="col-6 col-md-3">
                <label htmlFor="audit-resource-type" className="form-label fw-semibold text-secondary small mb-1">RESOURCE TYPE</label>
                <select
                  id="audit-resource-type"
                  className="form-select form-select-sm border-0 shadow-sm"
                  value={resourceTypeFilter}
                  onChange={(e) => {
                    setResourceTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Semua Resource</option>
                  <option value="permits.permit">Izin Kerja</option>
                  <option value="hira.hiradocument">Dokumen HIRA</option>
                  <option value="hira.hiragroup">Grup Lokasi HIRA</option>
                  <option value="hira.hiraactivity">Aktivitas HIRA</option>
                  <option value="projects.project">Proyek</option>
                </select>
              </div>

              <div className="col-6 col-md-2">
                <label htmlFor="audit-date-from" className="form-label fw-semibold text-secondary small mb-1">DARI TANGGAL</label>
                <input
                  id="audit-date-from"
                  type="date"
                  className="form-control form-control-sm border-0 shadow-sm"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="col-6 col-md-2">
                <label htmlFor="audit-date-to" className="form-label fw-semibold text-secondary small mb-1">SAMPAI TANGGAL</label>
                <input
                  id="audit-date-to"
                  type="date"
                  className="form-control form-control-sm border-0 shadow-sm"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {(actionFilter || resourceTypeFilter || dateFrom || dateTo || searchQuery) && (
              <div className="mt-3 text-end">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none btn-sm text-danger p-0 fw-semibold"
                  onClick={handleResetFilters}
                >
                  &times; Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabel Audit Logs / Timeline */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ minWidth: "900px" }}>
              <thead className="table-light border-bottom">
                <tr className="text-secondary small fw-bold text-uppercase">
                  <th className="py-3 px-3" style={{ width: "16%" }}>Waktu</th>
                  <th className="py-3 px-3" style={{ width: "20%" }}>Pelaku</th>
                  <th className="py-3 px-3" style={{ width: "18%" }}>Aksi</th>
                  <th className="py-3 px-3" style={{ width: "26%" }}>Dokumen & Keterangan</th>
                  {canSeeDetail && (
                    <th className="py-3 px-3 text-center" style={{ width: "10%" }}>Detail</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={canSeeDetail ? 5 : 4} className="text-center py-5">
                      <div className="spinner-border text-success spinner-border-sm me-2" role="status"></div>
                      <span className="text-muted small">Memuat data audit log...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={canSeeDetail ? 5 : 4} className="text-center py-5 text-muted">
                      <i className="bi bi-clock-history fs-2 d-block mb-2 text-secondary opacity-50"></i>
                      Tidak ada riwayat aktivitas ditemukan.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const relative = formatRelative(log.timestamp);
                    const routeFor = RESOURCE_ROUTES[log.resource_type];
                    const canOpen = !isTimelineMode && routeFor && log.action !== "deleted";
                    const roleName = ROLE_LABELS[log.actor_role] || log.actor_role;

                    return (
                      <tr key={log.id} className="audit-row-item">
                        {/* Kolom Waktu */}
                        <td className="px-3" title={new Date(log.timestamp).toLocaleString("id-ID")}>
                          <small className="fw-semibold text-dark">{formatDate(log.timestamp)}</small>
                          <br />
                          <span className="text-muted" style={{ fontSize: "11px" }}>
                            {formatTime(log.timestamp)}
                            {relative && ` · ${relative}`}
                          </span>
                        </td>

                        {/* Kolom Pelaku */}
                        <td className="px-3">
                          <div className="fw-semibold text-dark small text-truncate" style={{ maxWidth: "150px" }}>{log.actor_name || "Sistem"}</div>
                          {roleName && (
                            <div className="text-muted text-truncate" style={{ fontSize: "11px", maxWidth: "150px" }}>{roleName}</div>
                          )}
                        </td>

                        {/* Kolom Aksi */}
                        <td className="px-3">
                          <span className={`badge ${getActionBadgeClass(log.action)} rounded-pill px-2.5 py-1 fw-medium text-nowrap`}>
                            {log.action_label || log.action}
                          </span>
                        </td>

                        {/* Kolom Dokumen & Keterangan */}
                        <td className="px-3">
                          <div className="mb-1">
                            {canOpen ? (
                              <Link
                                to={routeFor(log.resource_id)}
                                className="fw-semibold small text-decoration-none text-success"
                                title="Buka dokumen"
                              >
                                <i className="bi bi-file-earmark-text me-1"></i>
                                <span>{log.resource_label || "Dokumen"} #{log.resource_id}</span>
                                {log.resource_title && (
                                  <span className="text-muted fw-normal ms-1">({log.resource_title})</span>
                                )}
                              </Link>
                            ) : (
                              <span className="fw-semibold text-dark small">
                                <i className="bi bi-file-earmark-text me-1"></i>
                                <span>{log.resource_label || "Dokumen"} #{log.resource_id}</span>
                                {log.resource_title && (
                                  <span className="text-muted fw-normal ms-1">({log.resource_title})</span>
                                )}
                              </span>
                            )}
                          </div>

                          {log.summary && (
                            <div className="text-secondary small fst-italic mt-1" style={{ fontSize: "12px" }}>
                              <span className="fw-semibold not-italic text-dark">Catatan:</span> {log.summary}
                            </div>
                          )}

                          {log.project_name && (
                            <div className="text-muted mt-1" style={{ fontSize: "11px" }}>
                              <i className="bi bi-folder2 me-1"></i> Proyek: <span className="fw-medium">{log.project_name}</span>
                            </div>
                          )}
                        </td>

                        {/* Kolom Detail */}
                        {canSeeDetail && (
                          <td className="px-3 text-center">
                            <button
                              className="btn btn-sm btn-outline-success px-2.5 py-1 fw-semibold text-nowrap"
                              onClick={() => handleOpenDetail(log)}
                              title="Lihat isi data saat aktivitas ini terjadi"
                            >
                              <i className="bi bi-file-code me-1"></i> Detail
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer & Paginasi (Responsif tumpuk di HP) */}
        {!isLoading && totalPages > 1 && (
          <div className="card-footer bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 py-3 px-3">
            <small className="text-muted mb-0 text-center text-md-start">
              Menampilkan {logs.length} dari total {totalItems} entri
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

      {/* Modal Detail Data (Snapshot) */}
      {selectedSnapshot && (
        <div className="modal show d-block px-3" tabIndex={-1} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
              <div className="modal-header border-bottom py-3 bg-light">
                <h5 className="modal-title h6 fw-bold text-dark">Isi Data Saat Aktivitas Terjadi</h5>
                <button type="button" className="btn-close" onClick={closeSnapshot}></button>
              </div>
              <div className="modal-body p-3">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="table table-sm table-striped align-middle mb-0">
                    <tbody>
                      {Object.entries(selectedSnapshot).map(([key, value]) => (
                        <tr key={key}>
                          <td className="fw-semibold small text-secondary py-2 px-3" style={{ width: "35%" }}>
                            {FIELD_LABELS[key] || humanizeKey(key)}
                          </td>
                          <td className="small text-break py-2 px-3">{formatSnapshotValue(key, value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none px-0 mt-3 text-success fw-semibold"
                  onClick={() => setShowRawJson((v) => !v)}
                >
                  {showRawJson ? "Sembunyikan data teknis" : "Lihat data teknis (JSON)"}
                </button>
                {showRawJson && (
                  <pre className="bg-dark text-light p-3 rounded-3 mb-0 small mt-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {JSON.stringify(selectedSnapshot, null, 2)}
                  </pre>
                )}
              </div>
              <div className="modal-footer border-top py-2 bg-light">
                <button type="button" className="btn btn-secondary btn-sm px-3" onClick={closeSnapshot}>
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

// Styling Responsif & Konsistensi Tema Audit Trail
const AUDIT_TRAIL_CSS = `
  .audit-row-item {
    transition: background-color 0.15s ease;
  }
  .audit-row-item:hover {
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
  @media (max-width: 768px) {
    .container-fluid {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
  }
`;