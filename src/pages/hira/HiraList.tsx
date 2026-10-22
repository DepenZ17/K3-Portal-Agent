// src/pages/hira/HiraList.tsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getHiraDocuments, getActiveProjectOptions } from "../../services/hiraServices";
import type { HiraDocumentList, HiraStatus, ProjectOption } from "../../types/hira";

export default function HiraList() {
  const [documents, setDocuments] = useState<HiraDocumentList[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  
  // State Filter & Paginasi
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // UI State
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Load daftar project untuk dropdown filter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getActiveProjectOptions();
        setProjects(data);
      } catch (err: unknown) {
        console.error("Gagal memuat daftar project", err);
      }
    };
    fetchProjects();
  }, []);

  // Load daftar HIRA berdasarkan filter dan halaman aktif
  const fetchHiraList = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getHiraDocuments({
        project: selectedProject || undefined,
        status: (selectedStatus as HiraStatus) || undefined,
        page,
        page_size: 10,
      });

      // Menangani format respons paginasi standar ({ count, results }) maupun array langsung
      if (Array.isArray(data)) {
        setDocuments(data);
        setTotalItems(data.length);
        setTotalPages(1);
      } else {
        const paginatedData = data as { results?: HiraDocumentList[]; count?: number };
        setDocuments(paginatedData.results || []);
        setTotalItems(paginatedData.count || 0);
        setTotalPages(Math.ceil((paginatedData.count || 0) / 10));
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail || "Gagal memuat dokumen HIRA.";
        setErrorMessage(detail);
      } else {
        setErrorMessage("Gagal terhubung ke server backend.");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedStatus, page]);

  useEffect(() => {
    fetchHiraList();
  }, [fetchHiraList]);

  // Utility untuk Badge Warna Status HIRA
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
    return (
      <span className={`badge ${config.bg}`} style={{ whiteSpace: "nowrap" }}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="container py-4">
      {/* Header & Button Create */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Daftar Dokumen HIRA</h2>
          <p className="text-muted small mb-0">Hazard Identification and Risk Assessment</p>
        </div>
        <Link to="/hira/create" className="btn btn-success fw-semibold shadow-sm">
          + Buat HIRA Baru
        </Link>
      </div>

      {/* Filter Section */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body bg-light rounded-3">
          <div className="row g-3">
            
            {/* Filter Project */}
            <div className="col-md-5">
              <label htmlFor="hira-filter-project" className="form-label fw-semibold small text-secondary">FILTER PROYEK</label>
              <select
                id="hira-filter-project"
                name="project"
                className="form-select"
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setPage(1); // Reset ke halaman 1 saat filter berubah
                }}
              >
                <option value="">Semua Proyek</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="col-md-5">
              <label htmlFor="hira-filter-status" className="form-label fw-semibold small text-secondary">FILTER STATUS</label>
              <select
                id="hira-filter-status"
                name="status"
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1); // Reset ke halaman 1 saat filter berubah
                }}
              >
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="pending_officer">Menunggu HSE Officer</option>
                <option value="pending_pm">Menunggu Project Manager</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            {/* Button Reset Filter */}
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100 d-inline-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  setSelectedProject("");
                  setSelectedStatus("");
                  setPage(1);
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Reset Filter
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-danger mb-4" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Table Data HIRA & Paginasi Wrapper */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ tableLayout: "fixed", minWidth: 1100 }}>
            <thead className="table-light border-bottom">
              <tr>
                <th className="py-3 px-3" style={{ width: "13%" }}>No. Dokumen</th>
                <th className="py-3 px-3" style={{ width: "25%" }}>Paket & Area Pekerjaan</th>
                <th className="py-3 px-3" style={{ width: "17%" }}>Proyek</th>
                <th className="py-3 px-3" style={{ width: "18%" }}>Dibuat Oleh</th>
                <th className="py-3 px-3 text-center" style={{ width: "17%" }}>Status</th>
                <th className="py-3 px-3 text-center" style={{ width: "10%" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-success mb-2" role="status"></div>
                    <p className="text-muted small mb-0">
                      Memuat data HIRA dari server...
                    </p>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    Tidak ada dokumen HIRA ditemukan.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-3 fw-semibold text-secondary">
                      {doc.document_number || <span className="text-muted fst-italic">Belum Diatur</span>}
                    </td>
                    <td className="px-3">
                      <div className="fw-bold text-dark">{doc.work_package}</div>
                      <small className="text-muted d-block">
                        Area: {doc.work_area || "-"}
                      </small>
                      <small className="text-muted">
                        Rev Round: #{doc.submission_round}
                      </small>
                    </td>
                    <td className="px-3">{doc.project_name}</td>
                    <td className="px-3">
                      <div>{doc.created_by.full_name}</div>
                      <small className="text-muted text-capitalize">({doc.created_by.role})</small>
                    </td>
                    <td className="px-3 text-center">
                      {renderStatusBadge(doc.status)}
                    </td>
                    <td className="px-3 text-center">
                      <Link
                        to={`/hira/${doc.id}`}
                        className="btn btn-sm btn-outline-primary fw-semibold"
                      >
                        Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Paginasi */}
        {!loading && totalPages > 1 && (
          <div className="card-footer bg-white border-0 d-flex flex-column flex-md-row justify-content-between align-items-center py-3 px-3">
            <small className="text-muted mb-2 mb-md-0">
              Menampilkan {documents.length} dari total {totalItems} entri
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
    </div>
  );
}