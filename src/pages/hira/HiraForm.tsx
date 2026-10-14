// src/pages/hira/HiraForm.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  getProjects,
  getHiraDocumentById,
  createHiraDocument,
  updateHiraDocument,
} from "../../services/hiraServices";
import { calculateRisk } from "../../utils/hiraRisk";
import type {
  Project,
  HiraGroup,
  HiraActivity,
  HiraFormPayload,
  ActivityType,
} from "../../types/hira";

export default function HiraForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // State Utama Dokumen HIRA
  const [projectId, setProjectId] = useState<number | "">("");
  const [workPackage, setWorkPackage] = useState<string>("");
  const [workArea, setWorkArea] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [documentDate, setDocumentDate] = useState<string>("");

  // Hierarki Data: Groups & Activities
  const [groups, setGroups] = useState<HiraGroup[]>([]);

  // State Pendukung UI
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const selectedProject = projects.find((p) => p.id === Number(projectId));

  // Fetch Daftar Proyek
  const fetchProjects = useCallback(async () => {
    try {
      const data = await getProjects({ is_active: true });
      setProjects(data);
    } catch {
      setProjects([]);
    }
  }, []);

  // Fetch Data HIRA jika Edit Mode
  const fetchHiraDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getHiraDocumentById(id);
      setProjectId(data.project);
      setWorkPackage(data.work_package || "");
      setWorkArea(data.work_area || "");
      setDocumentNumber(data.document_number || "");
      setDocumentDate(data.document_date || "");
      setGroups(data.groups || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.detail || "Gagal memuat data HIRA.");
      } else {
        setErrorMessage("Terjadi kesalahan saat memuat data.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjects();
    if (isEditMode) {
      fetchHiraDetail();
    } else {
      // Default 1 Group & 1 Activity untuk dokumen baru
      setGroups([
        {
          location_function: "",
          activities: [
            {
              activity_name: "",
              activity_type: "NR",
              potential_hazard: "",
              risk_impact: "",
              applicable_regulation: "",
              initial_severity: 1,
              initial_likelihood: 1,
              existing_controls: "",
              control_category: "ADM, APD",
              residual_severity: 1,
              residual_likelihood: 1,
              opportunity: "",
            },
          ],
        },
      ]);
    }
  }, [fetchProjects, fetchHiraDetail, isEditMode]);

  // Handler Group (Level 2)
  const addGroup = () => {
    setGroups([
      ...groups,
      {
        location_function: "",
        activities: [
          {
            activity_name: "",
            activity_type: "NR",
            potential_hazard: "",
            risk_impact: "",
            applicable_regulation: "",
            initial_severity: 1,
            initial_likelihood: 1,
            existing_controls: "",
            control_category: "ADM, APD",
            residual_severity: 1,
            residual_likelihood: 1,
            opportunity: "",
          },
        ],
      },
    ]);
  };

  const removeGroup = (gIndex: number) => {
    if (groups.length === 1) {
      alert("Dokumen HIRA minimal harus memiliki 1 grup lokasi/fungsi.");
      return;
    }
    setGroups(groups.filter((_, index) => index !== gIndex));
  };

  const handleGroupChange = (gIndex: number, value: string) => {
    const updated = [...groups];
    updated[gIndex].location_function = value;
    setGroups(updated);
  };

  // Handler Activity (Level 3)
  const addActivity = (gIndex: number) => {
    const updated = [...groups];
    updated[gIndex].activities.push({
      activity_name: "",
      activity_type: "NR",
      potential_hazard: "",
      risk_impact: "",
      applicable_regulation: "",
      initial_severity: 1,
      initial_likelihood: 1,
      existing_controls: "",
      control_category: "ADM, APD",
      residual_severity: 1,
      residual_likelihood: 1,
      opportunity: "",
    });
    setGroups(updated);
  };

  const removeActivity = (gIndex: number, aIndex: number) => {
    if (groups[gIndex].activities.length === 1) {
      alert("Setiap grup minimal harus memiliki 1 aktivitas.");
      return;
    }
    const updated = [...groups];
    updated[gIndex].activities = updated[gIndex].activities.filter(
      (_, index) => index !== aIndex
    );
    setGroups(updated);
  };

  const handleActivityChange = (
    gIndex: number,
    aIndex: number,
    field: keyof HiraActivity,
    value: string | number
  ) => {
    const updated = [...groups];
    const target = updated[gIndex].activities[aIndex];
    updated[gIndex].activities[aIndex] = { ...target, [field]: value };
    setGroups(updated);
  };

  // Submit Handler (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!projectId) {
      setErrorMessage("Harap pilih Proyek.");
      return;
    }
    if (!workPackage.trim()) {
      setErrorMessage("Harap isi Paket Pekerjaan.");
      return;
    }
    if (!workArea.trim()) {
      setErrorMessage("Harap isi Area Pekerjaan.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && id) {
        // Mode Edit: PATCH dokumen utama tanpa menyertakan array groups
        const updatePayload = {
          work_package: workPackage,
          work_area: workArea,
          document_date: documentDate || undefined,
        };

        await updateHiraDocument(id, updatePayload);
        alert("Informasi dokumen HIRA berhasil diperbarui!");
        navigate(`/hira/${id}`);
      } else {
        // Mode Buat Baru: POST dokumen secara nested lengkap dengan groups
        const createPayload: HiraFormPayload = {
          project: Number(projectId),
          work_package: workPackage,
          work_area: workArea,
          document_date: documentDate || undefined,
          groups,
        };

        const res = await createHiraDocument(createPayload);
        alert("Dokumen HIRA baru berhasil dibuat!");
        navigate(`/hira/${res.id}`);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Gagal menyimpan data HIRA. Periksa kembali kelengkapan form."
        );
      } else {
        setErrorMessage("Terjadi kesalahan jaringan atau server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2 text-muted">Memuat formulir HIRA...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          {isEditMode ? "Edit Dokumen HIRA" : "Buat Dokumen HIRA Baru"}
        </h3>
        <Link to="/hira" className="btn btn-outline-secondary btn-sm">
          &larr; Batal &amp; Kembali
        </Link>
      </div>

      {errorMessage && <div className="alert alert-danger mb-4">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        {/* Card 1: Informasi Umum Dokumen */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-success text-white fw-bold">
            1. Informasi Umum Dokumen
          </div>
          <div className="card-body">
            <div className="row g-3">
              {/* Proyek */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Proyek <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={projectId}
                  onChange={(e) => setProjectId(Number(e.target.value) || "")}
                  disabled={isEditMode} // Proyek tidak boleh diubah saat edit
                  required
                >
                  <option value="">-- Pilih Proyek --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {selectedProject && (
                  <div className="mt-2 p-2 bg-light border rounded small text-secondary">
                    <div className="row g-1">
                      <div className="col-12">
                        <strong>Lokasi:</strong> {selectedProject.location || "-"}
                      </div>
                      <div className="col-6">
                        <strong>Klien:</strong> {selectedProject.client_name || "-"}
                      </div>
                      <div className="col-6">
                        <strong>Mulai:</strong> {selectedProject.start_date || "-"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paket Pekerjaan */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Paket Pekerjaan <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Pekerjaan Struktur Beton"
                  value={workPackage}
                  onChange={(e) => setWorkPackage(e.target.value)}
                  required
                />
              </div>

              {/* Area Pekerjaan */}
              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  Area Pekerjaan <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Zona A / Lantai 3"
                  value={workArea}
                  onChange={(e) => setWorkArea(e.target.value)}
                  required
                />
              </div>

              {/* No. Dokumen (Read-Only) */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">No. Dokumen</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={documentNumber || "Ditentukan oleh HSE Officer"}
                  disabled
                />
              </div>

              {/* Tanggal Dokumen */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tanggal Dokumen</label>
                <input
                  type="date"
                  className="form-control"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Identifikasi Bahaya & Penilaian Risiko */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">2. Identifikasi Bahaya &amp; Penilaian Risiko</h4>
          <button type="button" className="btn btn-sm btn-dark" onClick={addGroup}>
            + Tambah Grup / Lokasi
          </button>
        </div>

        {groups.map((grp, gIdx) => (
          <div key={gIdx} className="card shadow-sm border-0 mb-4 border-start border-4 border-dark">
            <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
              <span className="fw-bold text-uppercase">Grup #{gIdx + 1}</span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeGroup(gIdx)}
              >
                Hapus Grup
              </button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Lokasi / Fungsi Pekerjaan <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Alat Bekisting / Area Workshop"
                  value={grp.location_function}
                  onChange={(e) => handleGroupChange(gIdx, e.target.value)}
                  required
                />
              </div>

              <h6 className="fw-bold mt-4 mb-2 text-secondary">Daftar Aktivitas Pekerjaan:</h6>

              {grp.activities.map((act, aIdx) => {
                // Live preview nilai Rt untuk form
                const initialRisk = calculateRisk(act.initial_severity, act.initial_likelihood);
                const residualRisk = calculateRisk(act.residual_severity, act.residual_likelihood);

                return (
                  <div key={aIdx} className="p-3 mb-3 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-secondary">Aktivitas #{aIdx + 1}</span>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 text-decoration-none small"
                        onClick={() => removeActivity(gIdx, aIdx)}
                      >
                        Hapus Aktivitas
                      </button>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-md-5">
                        <label className="form-label small fw-semibold">Nama Aktivitas *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Contoh: Penerimaan Bekisting"
                          value={act.activity_name}
                          onChange={(e) =>
                            handleActivityChange(gIdx, aIdx, "activity_name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">Sifat Pekerjaan *</label>
                        <select
                          className="form-select form-select-sm"
                          value={act.activity_type || "NR"}
                          onChange={(e) =>
                            handleActivityChange(
                              gIdx,
                              aIdx,
                              "activity_type",
                              e.target.value as ActivityType
                            )
                          }
                        >
                          <option value="R">R (Rutin)</option>
                          <option value="NR">NR (Non-Rutin)</option>
                          <option value="E">E (Darurat)</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Regulasi Berlaku</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Contoh: UU No.1 Th 1970"
                          value={act.applicable_regulation || ""}
                          onChange={(e) =>
                            handleActivityChange(gIdx, aIdx, "applicable_regulation", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Potensi Bahaya *</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Contoh: Terlindas truk, Terjatuh dari truk"
                          value={act.potential_hazard}
                          onChange={(e) =>
                            handleActivityChange(gIdx, aIdx, "potential_hazard", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Risiko / Dampak *</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Contoh: Luka, Cidera, Shock"
                          value={act.risk_impact}
                          onChange={(e) =>
                            handleActivityChange(gIdx, aIdx, "risk_impact", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Matrix Risiko Awal */}
                    <div className="p-2 mb-2 bg-white rounded border">
                      <div className="fw-semibold small mb-2 text-dark">
                        Risiko Awal (Live Preview: Rt = {initialRisk.score} | Category = {initialRisk.category})
                      </div>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Keparahan (R / Severity):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.initial_severity}
                            onChange={(e) =>
                              handleActivityChange(gIdx, aIdx, "initial_severity", Number(e.target.value))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>R = {v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Kemungkinan (L / Likelihood):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.initial_likelihood}
                            onChange={(e) =>
                              handleActivityChange(gIdx, aIdx, "initial_likelihood", Number(e.target.value))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>L = {v}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Pengendalian */}
                    <div className="row g-2 mb-2">
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold">Pengendalian Awal</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Contoh: Security mengatur lalu lintas..."
                          value={act.existing_controls || ""}
                          onChange={(e) =>
                            handleActivityChange(gIdx, aIdx, "existing_controls", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Kategori Pengendalian</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Contoh: ADM, APD"
                          value={act.control_category || "ADM, APD"}
                          onChange={(e) =>
                            handleActivityChange(gIdx, aIdx, "control_category", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Matrix Sisa Risiko */}
                    <div className="p-2 mb-2 bg-white rounded border">
                      <div className="fw-semibold small mb-2 text-dark">
                        Sisa Risiko (Live Preview: Rt = {residualRisk.score} | Acceptable = {residualRisk.isAcceptable ? "Y" : "N"})
                      </div>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Keparahan Sisa (R):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.residual_severity}
                            onChange={(e) =>
                              handleActivityChange(gIdx, aIdx, "residual_severity", Number(e.target.value))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>R = {v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small text-muted">Kemungkinan Sisa (L):</label>
                          <select
                            className="form-select form-select-sm"
                            value={act.residual_likelihood}
                            onChange={(e) =>
                              handleActivityChange(gIdx, aIdx, "residual_likelihood", Number(e.target.value))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((v) => (
                              <option key={v} value={v}>L = {v}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Peluang */}
                    <div>
                      <label className="form-label small fw-semibold">Peluang (Opsional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Catatan peluang perbaikan..."
                        value={act.opportunity || ""}
                        onChange={(e) =>
                          handleActivityChange(gIdx, aIdx, "opportunity", e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 mt-2"
                onClick={() => addActivity(gIdx)}
              >
                + Tambah Aktivitas ke Grup Ini
              </button>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mb-5">
          <Link to="/hira" className="btn btn-light border px-4">
            Batal
          </Link>
          <button
            type="submit"
            className="btn btn-success fw-bold px-5"
            disabled={submitting}
          >
            {submitting
              ? "Menyimpan..."
              : isEditMode
              ? "Simpan Perubahan"
              : "Simpan Dokumen HIRA"}
          </button>
        </div>
      </form>
    </div>
  );
}