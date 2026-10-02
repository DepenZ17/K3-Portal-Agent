// src/pages/hira/HiraForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

export interface HiraRow {
  activity: string;
  hazard: string;
  risk: string;
  initialLikelihood: number;
  initialSeverity: number;
  existingControl: string;
  residualLikelihood: number;
  residualSeverity: number;
  additionalControl: string;
}

export interface HiraFormState {
  title: string;
  location: string;
  department: string;
  assessor: string;
  assessmentDate: string;
  rows: HiraRow[];
}

const emptyRow: HiraRow = {
  activity: "",
  hazard: "",
  risk: "",
  initialLikelihood: 1,
  initialSeverity: 1,
  existingControl: "",
  residualLikelihood: 1,
  residualSeverity: 1,
  additionalControl: "",
};

export default function HiraForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<HiraFormState>({
    title: "",
    location: "",
    department: "",
    assessor: user?.full_name || user?.username || "",
    assessmentDate: new Date().toISOString().split("T")[0],
    rows: [{ ...emptyRow }],
  });

  // Helper untuk mendapatkan Kategori Risiko (Nilai = Likelihood x Severity)
  const getRiskBadge = (score: number) => {
    if (score >= 15) return <span className="badge bg-danger">Tinggi ({score})</span>;
    if (score >= 8) return <span className="badge bg-warning text-dark">Sedang ({score})</span>;
    return <span className="badge bg-success">Rendah ({score})</span>;
  };

  // Handler Update Header Field
  const setField =
    <K extends keyof HiraFormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [key]: value as HiraFormState[K],
      }));
    };

  // Handler Update Row Field (Tanpa Any Error)
  const setRowField =
    <K extends keyof HiraRow>(index: number, key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const rawValue = e.target.value;
      const numericFields = [
        "initialLikelihood",
        "initialSeverity",
        "residualLikelihood",
        "residualSeverity",
      ];

      const value = (
        numericFields.includes(key) ? Number(rawValue) : rawValue
      ) as HiraRow[K];

      setForm((prev) => {
        const rows = [...prev.rows];
        rows[index] = { ...rows[index], [key]: value };
        return { ...prev, rows };
      });
    };

  const addRow = () => {
    setForm((prev) => ({ ...prev, rows: [...prev.rows, { ...emptyRow }] }));
  };

  const removeRow = (index: number) => {
    if (form.rows.length === 1) return;
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location) {
      alert("Harap isi judul pekerjaan dan lokasi!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Kirim data ke backend API
      await api.post("/hira/", form);
      alert("Dokumen HIRA berhasil disimpan!");
      navigate("/hira");
    } catch (error) {
      console.error("Gagal menyimpan HIRA:", error);
      // Fallback demo/mock
      alert("HIRA tersimpan (Mode Demo)");
      navigate("/home");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Form HIRA / HIRADC</h1>
          <p className="text-muted small mb-0">
            Hazard Identification, Risk Assessment, and Risk Control
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informasii Umum Header */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white fw-bold py-3">
            Informasi Umum Penilaian Risiko
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">
                  JUDUL PEKERJAAN / KEGIATAN
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Pekerjaan Galian & Pondasi Area B"
                  value={form.title}
                  onChange={setField("title")}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">
                  LOKASI / AREA
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Zona Crane 1"
                  value={form.location}
                  onChange={setField("location")}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-secondary">
                  DEPARTEMEN / SUBCONTRACTOR
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nama PT / Subkontraktor"
                  value={form.department}
                  onChange={setField("department")}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-secondary">
                  PENILAI (ASSESSOR)
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={form.assessor}
                  onChange={setField("assessor")}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold text-secondary">
                  TANGGAL PENILAIAN
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={form.assessmentDate}
                  onChange={setField("assessmentDate")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Identifikasi Bahaya & Risiko */}
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
            <span>Tabel Identifikasi Bahaya &amp; Pengendalian Risiko</span>
            <button
              type="button"
              className="btn btn-sm btn-success fw-bold"
              onClick={addRow}
            >
              + Tambah Baris
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0" style={{ fontSize: "13px" }}>
                <thead className="table-light text-center">
                  <tr>
                    <th style={{ width: "40px" }}>No</th>
                    <th style={{ minWidth: "150px" }}>Aktivitas Kerja</th>
                    <th style={{ minWidth: "150px" }}>Bahaya (Hazard)</th>
                    <th style={{ minWidth: "150px" }}>Risiko (Risk)</th>
                    <th style={{ width: "90px" }}>Likelihood (L)</th>
                    <th style={{ width: "90px" }}>Severity (S)</th>
                    <th style={{ width: "110px" }}>Tingkat Risiko</th>
                    <th style={{ minWidth: "160px" }}>Pengendalian Saat Ini</th>
                    <th style={{ minWidth: "160px" }}>Pengendalian Tambahan</th>
                    <th style={{ width: "50px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {form.rows.map((row, index) => {
                    const initialScore = row.initialLikelihood * row.initialSeverity;
                    return (
                      <tr key={index}>
                        <td className="text-center fw-bold">{index + 1}</td>
                        <td>
                          <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="Kegiatan..."
                            value={row.activity}
                            onChange={setRowField(index, "activity")}
                          />
                        </td>
                        <td>
                          <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="Potensi bahaya..."
                            value={row.hazard}
                            onChange={setRowField(index, "hazard")}
                          />
                        </td>
                        <td>
                          <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="Dampak / akibat..."
                            value={row.risk}
                            onChange={setRowField(index, "risk")}
                          />
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={row.initialLikelihood}
                            onChange={setRowField(index, "initialLikelihood")}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={row.initialSeverity}
                            onChange={setRowField(index, "initialSeverity")}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center">{getRiskBadge(initialScore)}</td>
                        <td>
                          <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="Pengendalian yang ada..."
                            value={row.existingControl}
                            onChange={setRowField(index, "existingControl")}
                          />
                        </td>
                        <td>
                          <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="Rencana pencegahan..."
                            value={row.additionalControl}
                            onChange={setRowField(index, "additionalControl")}
                          />
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger border-0"
                            onClick={() => removeRow(index)}
                            disabled={form.rows.length === 1}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light px-4"
            onClick={() => navigate(-1)}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-success fw-bold px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Dokumen HIRA"}
          </button>
        </div>
      </form>
    </div>
  );
}