// src/pages/hira/HiraList.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

export interface HiraItem {
  id: string | number;
  title: string;
  location: string;
  department: string;
  assessor: string;
  assessmentDate: string;
  status: "Draft" | "Pending Review" | "Approved" | "Rejected";
  highRiskCount: number;
}

// Mock Data untuk fallback / mode demo sebelum backend terhubung
const dummyHiraList: HiraItem[] = [
  {
    id: "1",
    title: "Pekerjaan Galian & Pondasi Area B",
    location: "Zona Crane 1",
    department: "PT Konstruksi Utama",
    assessor: "Ahmad Subagio",
    assessmentDate: "2026-09-20",
    status: "Approved",
    highRiskCount: 1,
  },
  {
    id: "2",
    title: "Ereksi Struktur Baja Lantai 5",
    location: "Gedung Utama",
    department: "PT Mega Steel",
    assessor: "Budi Santoso",
    assessmentDate: "2026-09-25",
    status: "Pending Review",
    highRiskCount: 3,
  },
  {
    id: "3",
    title: "Pengelasan & Pemasangan Pipa Gas",
    location: "Basement 2",
    department: "Subkon Piping",
    assessor: "Dedi Setiadi",
    assessmentDate: "2026-09-27",
    status: "Draft",
    highRiskCount: 0,
  },
];

export default function HiraList() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Ambil data user dari AuthContext
  const [hiraList, setHiraList] = useState<HiraItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // User Check Rules
  const canCreateHira = user?.role === "hse_officer" || user?.role === "hse_coordinator" || user?.role === "project_manager";
  const userRoleDisplay = user?.role ? user.role.toUpperCase().replace("_", " ") : "GUEST";

  const fetchHiras = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/hira/");
      setHiraList(response.data);
    } catch (error) {
      console.warn("Gagal mengambil data dari API, menggunakan Mock Data Demo.", error);
      setHiraList(dummyHiraList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHiras();
  }, []);

  // Filter pencarian berdasarkan Judul, Lokasi, atau Assessor
  const filteredList = hiraList.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.assessor.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: HiraItem["status"]) => {
    switch (status) {
      case "Approved":
        return <span className="badge bg-success">Approved</span>;
      case "Pending Review":
        return <span className="badge bg-warning text-dark">Pending Review</span>;
      case "Rejected":
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Draft</span>;
    }
  };

  return (
    <div className="container py-4">
      {/* Header Halaman */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="h3 fw-bold text-dark mb-0">Daftar Dokumen HIRA / HIRADC</h1>
            <span className="badge bg-info-subtle text-info border border-info-subtle">
              Role: {userRoleDisplay}
            </span>
          </div>
          <p className="text-muted small mb-0">
            Hazard Identification, Risk Assessment, and Risk Control Management
          </p>
        </div>

        {/* User Check: Tombol hanya tampil jika user memiliki wewenang */}
        {canCreateHira ? (
          <button
            className="btn btn-success fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate("/hira/create")}
          >
            <span>+ Buat HIRA Baru</span>
          </button>
        ) : (
          <div className="text-muted small italic">
            * Mode lihat saja (Read-only)
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6 col-lg-4">
              <input
                type="text"
                className="form-control"
                placeholder="Cari judul, lokasi, atau penilai..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-auto ms-auto text-muted small">
              Total Dokumen: <strong>{filteredList.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Data HIRA */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: "14px" }}>
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }} className="text-center">#</th>
                  <th>Judul Kegiatan / Pekerjaan</th>
                  <th>Lokasi / Area</th>
                  <th>Subkontraktor / Dept</th>
                  <th>Penilai (Assessor)</th>
                  <th>Tanggal</th>
                  <th className="text-center">Potensi Risiko Tinggi</th>
                  <th className="text-center">Status</th>
                  <th className="text-end" style={{ minWidth: "100px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      Memuat data HIRA...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      Tidak ada dokumen HIRA yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-center fw-semibold text-muted">{index + 1}</td>
                      <td className="fw-semibold text-dark">{item.title}</td>
                      <td>{item.location}</td>
                      <td>{item.department || "-"}</td>
                      <td>{item.assessor}</td>
                      <td>{item.assessmentDate}</td>
                      <td className="text-center">
                        {item.highRiskCount > 0 ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">
                            {item.highRiskCount} Hazard Tinggi
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border">Rendah / Sedang</span>
                        )}
                      </td>
                      <td className="text-center">{getStatusBadge(item.status)}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => navigate(`/hira/${item.id}`)}
                          title="Lihat Detail"
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
    </div>
  );
}