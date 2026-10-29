// src/pages/AuditTrail.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuditLogs } from "../services/auditService";
import type { AuditEntry, AuditAction, AuditQueryParams } from "../types/audit";

// Label tampilan untuk resource_type dari backend (nilai asli tidak diubah)
const RESOURCE_LABELS: Record<string, string> = {
  "permits.permit": "Izin Kerja",
  "hira.hiradocument": "Dokumen HIRA",
  "hira.hiragroup": "Grup Lokasi HIRA",
  "hira.hiraactivity": "Aktivitas HIRA",
  "projects.project": "Proyek",
};

// Halaman yang bisa dibuka dari resource (grup & aktivitas HIRA tidak punya halaman sendiri)
const RESOURCE_ROUTES: Partial<Record<string, (id: string | number) => string>> = {
  "hira.hiradocument": (id) => `/hira/${id}`,
  "permits.permit": (id) => `/work-permit/${id}`,
};

// Aksi dalam bahasa Indonesia
const ACTION_LABELS: Record<string, string> = {
  created: "Membuat",
  updated: "Mengubah",
  deleted: "Menghapus",
  submitted: "Mengajukan",
  approved: "Menyetujui",
  rejected: "Menolak",
  cancelled: "Membatalkan",
  close_requested: "Mengajukan penutupan",
  closed: "Menutup",
  number_set: "Menetapkan nomor",
  photo_added: "Menambahkan foto",
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

// Nama kolom data (snapshot) dalam bahasa Indonesia. Kolom yang belum terdaftar ditampilkan dengan nama yang dirapikan.
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

// "work_package" -> "Work Package" (untuk kolom yang belum punya label)
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

// "Subcontractor One <a@b.com> (subcontractor)" -> { name: "Subcontractor One", role: "Subkontraktor" }
const parseActor = (label?: string | null): { name: string; role: string } => {
  if (!label) return { name: "Sistem", role: "" };
  const match = label.match(/^(.*?)\s*(?:<[^>]*>)?\s*(?:\(([^)]*)\))?\s*$/);
  const name = match?.[1]?.trim() || label;
  const roleSlug = match?.[2]?.trim() || "";
  return { name, role: ROLE_LABELS[roleSlug] ?? roleSlug };
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

// Jam tanpa detik, dengan titik dua (bawaan id-ID memakai titik)
const formatTime = (iso: string): string =>
  new Date(iso)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":");

// Keterangan waktu relatif; hanya untuk 7 hari terakhir
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
      case "close_requested":
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
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
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
                {Object.entries(RESOURCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
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
                  <th className="py-3 px-3" style={{ width: "16%" }}>Waktu</th>
                  <th className="py-3 px-3" style={{ width: "24%" }}>Pelaku</th>
                  <th className="py-3 px-3" style={{ width: "36%" }}>Aktivitas</th>
                  <th className="py-3 px-3" style={{ width: "14%" }}>IP Address</th>
                  <th className="py-3 px-3 text-center" style={{ width: "10%" }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="spinner-border text-success spinner-border-sm me-2" role="status"></div>
                      <span className="text-muted small">Memuat data audit log...</span>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      Tidak ada riwayat aktivitas ditemukan.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const actor = parseActor(log.actor_label || (log.user != null ? String(log.user) : null));
                    const relative = formatRelative(log.timestamp);
                    const resourceLabel = RESOURCE_LABELS[log.resource_type] || log.resource_type;
                    const routeFor = RESOURCE_ROUTES[log.resource_type];
                    const canOpen = routeFor && log.action !== "deleted";

                    return (
                      <tr key={log.id}>
                        <td className="px-3" title={new Date(log.timestamp).toLocaleString("id-ID")}>
                          <small className="fw-semibold text-dark">{formatDate(log.timestamp)}</small>
                          <br />
                          <span className="text-muted" style={{ fontSize: "11px" }}>
                            {formatTime(log.timestamp)}
                            {relative && ` · ${relative}`}
                          </span>
                        </td>

                        <td className="px-3">
                          <div className="fw-semibold text-dark small text-truncate">{actor.name}</div>
                          {actor.role && (
                            <div className="text-muted" style={{ fontSize: "11px" }}>{actor.role}</div>
                          )}
                          {log.remarks && (
                            <span className="text-muted d-block fst-italic" style={{ fontSize: "11px" }}>
                              {log.remarks}
                            </span>
                          )}
                        </td>

                        <td className="px-3">
                          <span className={`badge ${getActionBadgeClass(log.action)} rounded-pill px-2 py-1 me-2`}>
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                          {canOpen ? (
                            <Link
                              to={routeFor(log.resource_id)}
                              className="fw-semibold small text-decoration-none"
                              title="Buka dokumen"
                            >
                              {resourceLabel} #{log.resource_id}
                            </Link>
                          ) : (
                            <span className="fw-semibold text-dark small">
                              {resourceLabel} #{log.resource_id}
                            </span>
                          )}
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
                              title="Lihat isi data saat aktivitas ini terjadi"
                            >
                              <i className="bi bi-file-code"></i> Detail
                            </button>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
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

      {/* Modal Detail Data (Snapshot) */}
      {selectedSnapshot && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title h6 fw-bold">Isi Data Saat Aktivitas Terjadi</h5>
                <button type="button" className="btn-close" onClick={closeSnapshot}></button>
              </div>
              <div className="modal-body p-3">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="table table-sm table-striped align-middle mb-0">
                    <tbody>
                      {Object.entries(selectedSnapshot).map(([key, value]) => (
                        <tr key={key}>
                          <td className="fw-semibold small text-secondary" style={{ width: "35%" }}>
                            {FIELD_LABELS[key] || humanizeKey(key)}
                          </td>
                          <td className="small text-break">{formatSnapshotValue(key, value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none px-0 mt-2"
                  onClick={() => setShowRawJson((v) => !v)}
                >
                  {showRawJson ? "Sembunyikan data teknis" : "Lihat data teknis (JSON)"}
                </button>
                {showRawJson && (
                  <pre className="bg-dark text-light p-3 rounded mb-0 small" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {JSON.stringify(selectedSnapshot, null, 2)}
                  </pre>
                )}
              </div>
              <div className="modal-footer border-top py-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={closeSnapshot}>
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