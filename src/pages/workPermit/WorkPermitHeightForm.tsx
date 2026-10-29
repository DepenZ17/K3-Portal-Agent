// src/pages/workPermit/WorkPermitHeightForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../services/api";
import { 
  createWorkPermit, 
  updateWorkPermit, 
  getWorkPermitById, 
  getWorkPermitFormSchema, 
  submitWorkPermit,
  uploadWorkPermitPhotos,
  uploadWorkPermitAttachments
} from "../../services/workPermitServices";
import type {
  HeightChecklist,
  WorkPermitPayload,
  WorkPermitDetail,
  GpsLocationData,
  PermitPhoto,
  PermitHiraGroup,
  PermitAttachment,
} from "../../types/workPermit";

interface ProjectOption {
  id: number;
  name: string;
}

interface HiraDocumentOption {
  id: number;
  document_number?: string | null;
  work_package: string;
  work_area: string;
  project: number;
  status: string;
  groups?: PermitHiraGroup[];
}

export default function WorkPermitHeightForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [draftId, setDraftId] = useState<number | null>(null);

  // Form Field States
  const [projectId, setProjectId] = useState<number | "">("");
  const [hiraDocumentId, setHiraDocumentId] = useState<number | "">("");
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const [workDate, setWorkDate] = useState<string>("");
  const [workStart, setWorkStart] = useState<string>("08:00");
  const [workEnd, setWorkEnd] = useState<string>("16:00");
  const [workLocation, setWorkLocation] = useState<string>("");
  
  // GPS Granular State
  const [gpsData, setGpsData] = useState<GpsLocationData | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState<number>(0);
  const [existingPhotos, setExistingPhotos] = useState<PermitPhoto[]>([]);

  // PDF Attachment States
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<PermitAttachment[]>([]);
  
  const [workDescription, setWorkDescription] = useState<string>("");
  const [equipmentUsed, setEquipmentUsed] = useState<string>("");
  const [personInCharge, setPersonInCharge] = useState<string>("");
  const [workerCount, setWorkerCount] = useState<number>(1);
  const [safetyAreas, setSafetyAreas] = useState<string[]>([]);
  const [selectedPpe, setSelectedPpe] = useState<string[]>([]);
  const [ppeOther, setPpeOther] = useState<string[]>([]);
  const [ppeOtherInput, setPpeOtherInput] = useState<string>("");

  // 14 Checklist Keselamatan Default
  const [checklist, setChecklist] = useState<HeightChecklist>({
    "1": false, "2": false, "3": false, "4": false, "5": false,
    "6": false, "7": false, "8": false, "9": false, "10": false,
    "11": false, "12": false, "13": false, "14": false,
  });

  // Dropdown Options from Backend
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [availableHiraDocs, setAvailableHiraDocs] = useState<HiraDocumentOption[]>([]);
  const [availableSafetyAreas, setAvailableSafetyAreas] = useState<{ code: string; name: string }[]>([]);
  const [availablePpeOptions, setAvailablePpeOptions] = useState<{ key: string; name: string }[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checklistDescriptions: Record<string, string> = {
    "1": "SPK/kontrak ditandatangani",
    "2": "Penanggung jawab ditentukan",
    "3": "Cuaca cerah & tidak mendung",
    "4": "Pekerja memakai & menyiapkan APD sesuai",
    "5": "Sudah mendapat pengarahan K3 (Safety Induction)",
    "6": "Punya pengalaman & kompeten",
    "7": "Tidak punya penyakit ayan, rabun senja, gangguan keseimbangan",
    "8": "Prosedur keadaan darurat dimengerti",
    "9": "Rambu-rambu dipasang",
    "10": "Safety line / safety net / safety deck terpasang",
    "11": "Climbing terpasang (pekerjaan corewall)",
    "12": "Area kerja & bawahnya bersih & bebas lalu lintas orang",
    "13": "Peralatan diinspeksi & layak pakai",
    "14": "Bahan kimia B3 aman, ada MSDS & label jelas",
  };

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newGps: GpsLocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          captured_at: new Date(position.timestamp).toISOString(),
        };
        setGpsData(newGps);
        setGpsLoading(false);
      },
      () => {
        alert("Gagal mendeteksi lokasi GPS. Pastikan izin lokasi diaktifkan.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const initForm = async () => {
      setFetchingData(true);
      try {
        const schemaRes = await getWorkPermitFormSchema("working_at_height");
        const schemaData = schemaRes?.data || schemaRes;

        const areasArray = schemaData?.safety_areas
          ? Object.entries(schemaData.safety_areas).map(([code, name]) => ({
              code,
              name: name as string,
            }))
          : [];
        setAvailableSafetyAreas(
          areasArray.length > 0
            ? areasArray
            : [
                { code: "A", name: "Area Perifer (Pinggiran)" },
                { code: "B", name: "Area Pit Lift/ Tangga" },
                { code: "C", name: "Pekerjaan perbaikan/ perawatan di ketinggian" },
              ]
        );

        const rawPpe = schemaData?.ppe ?? schemaData?.ppe_options;
        const ppeArray = rawPpe
          ? Object.entries(rawPpe).map(([key, name]) => ({
              key,
              name: name as string,
            }))
          : [];
        setAvailablePpeOptions(
          ppeArray.length > 0
            ? ppeArray
            : [
                { key: "sarung_tangan", name: "Sarung tangan" },
                { key: "safety_belt", name: "Safety Belt" },
                { key: "body_harness", name: "Body Harness" },
                { key: "sepatu", name: "Sepatu" },
              ]
        );

        const projRes = await api.get("/projects/", { params: { is_active: true } });
        setProjects(Array.isArray(projRes.data) ? projRes.data : projRes.data?.results || []);

        if (isEditMode && id) {
          const detail = await getWorkPermitById(id);
          setProjectId(detail.project);
          setHiraDocumentId(detail.hira_document || "");
          setSelectedActivityIds(detail.hira_activity_ids || []);
          setWorkDate(detail.work_date);
          setWorkStart(detail.work_start);
          setWorkEnd(detail.work_end);
          setWorkLocation(detail.work_location);
          
          if (detail.photos) {
            setExistingPhotos(detail.photos);
          }
          if (detail.attachments) {
            setExistingAttachments(detail.attachments);
          }

          setWorkDescription(detail.work_description);
          setEquipmentUsed(detail.equipment_used || "");
          setPersonInCharge(detail.person_in_charge);
          setWorkerCount(detail.worker_count);
          setSafetyAreas(detail.safety_areas || []);
          setSelectedPpe(detail.ppe || []);
          setPpeOther(detail.ppe_other || []);
          if (detail.checklist) {
            setChecklist(detail.checklist as HeightChecklist);
          }
          if (detail.project) {
            fetchHiraDocuments(detail.project);
          }
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setErrorMessage(err.response?.data?.detail || "Gagal memuat data form.");
        } else {
          setErrorMessage("Terjadi kesalahan saat memuat form.");
        }
      } finally {
        setFetchingData(false);
      }
    };

    initForm();
  }, [isEditMode, id]);

  const fetchHiraDocuments = async (projId: number | string) => {
    try {
      const res = await api.get(`/hira/documents/`, {
        params: { project: projId, status: "approved" }
      });
      const listData = Array.isArray(res.data) ? res.data : res.data?.results || [];
      
      const detailedDocs = await Promise.all(
        listData.map(async (doc: { id: number }) => {
          try {
            const detailRes = await api.get(`/hira/documents/${doc.id}/`);
            return detailRes.data;
          } catch {
            return doc;
          }
        })
      );

      setAvailableHiraDocs(detailedDocs);
    } catch (err) {
      console.error("Gagal memuat HIRA:", err);
      setAvailableHiraDocs([]);
    }
  };

  const handleProjectChange = (selectedProjId: string) => {
    const numId = selectedProjId ? Number(selectedProjId) : "";
    setProjectId(numId);
    setHiraDocumentId("");
    setSelectedActivityIds([]);
    setAvailableHiraDocs([]);

    if (numId) {
      fetchHiraDocuments(numId);
    }
  };

  const handleHiraDocumentChange = (docId: string) => {
    const numId = docId ? Number(docId) : "";
    setHiraDocumentId(numId);
    setSelectedActivityIds([]);
  };

  const handleActivityToggle = (actId: number) => {
    setSelectedActivityIds((prev) => {
      if (prev.includes(actId)) {
        return prev.filter((id) => id !== actId);
      } else {
        if (prev.length >= 10) {
          alert("Maksimal 10 aktivitas HIRA yang dapat dipilih.");
          return prev;
        }
        return [...prev, actId];
      }
    });
  };

  const handleChecklistToggle = (key: string) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSafetyAreaToggle = (code: string) => {
    setSafetyAreas((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const handlePpeToggle = (key: string) => {
    setSelectedPpe((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleAddPpeOther = () => {
    if (ppeOtherInput.trim() && ppeOther.length < 2) {
      setPpeOther([...ppeOther, ppeOtherInput.trim()]);
      setPpeOtherInput("");
    }
  };

  const selectedHiraDoc = availableHiraDocs.find((doc) => doc.id === hiraDocumentId);

  const handleSubmit = async (shouldSubmit: boolean = false) => {
    setLoading(true);
    setErrorMessage("");

    if (!projectId || !workDate || !workLocation || !workDescription || !personInCharge) {
      setErrorMessage("Mohon lengkapi semua field wajib yang bertanda bintang (*).");
      setLoading(false);
      return;
    }

    if (shouldSubmit) {
      if (!hiraDocumentId || selectedActivityIds.length === 0) {
        setErrorMessage("Dokumen HIRA dan minimal satu aktivitas HIRA wajib dipilih untuk melakukan submit.");
        setLoading(false);
        return;
      }
      if (!gpsData) {
        setErrorMessage("Data GPS wajib diambil untuk melakukan submit izin kerja.");
        setLoading(false);
        return;
      }
      if (gpsData.accuracy > 50) {
        setErrorMessage(`Akurasi GPS terlalu rendah (${gpsData.accuracy.toFixed(1)} meter). Maksimal akurasi yang diizinkan adalah 50 meter.`);
        setLoading(false);
        return;
      }
      if (!photoFile && existingPhotos.filter(p => p.stage === "before").length === 0) {
        setErrorMessage("Minimal satu foto sebelum kerja (before photo) wajib diunggah untuk melakukan submit.");
        setLoading(false);
        return;
      }
    }

    const payload: WorkPermitPayload = {
      project: Number(projectId),
      permit_type: "working_at_height",
      hira_document: hiraDocumentId ? Number(hiraDocumentId) : null,
      hira_activity_ids: selectedActivityIds,
      work_date: workDate,
      work_start: workStart,
      work_end: workEnd,
      work_location: workLocation,
      work_description: workDescription,
      equipment_used: equipmentUsed,
      person_in_charge: personInCharge,
      worker_count: Number(workerCount),
      safety_areas: safetyAreas,
      checklist,
      ppe: selectedPpe,
      ppe_other: ppeOther,
    };

    try {
      let savedPermit: WorkPermitDetail;
      const targetId = id ?? draftId;

      if (targetId) {
        savedPermit = await updateWorkPermit(targetId, payload);
      } else {
        savedPermit = await createWorkPermit(payload);
        setDraftId(savedPermit.id);
      }

      if (photoFile) {
        const withPhotos = await uploadWorkPermitPhotos(savedPermit.id, "before", [photoFile]);
        setExistingPhotos(withPhotos.photos ?? []);
        setPhotoFile(null);
        setPhotoInputKey((k) => k + 1);
      }

      if (medicalFile) {
        await uploadWorkPermitAttachments(savedPermit.id, "medical", [medicalFile]);
        setMedicalFile(null);
      }
      if (certificateFile) {
        await uploadWorkPermitAttachments(savedPermit.id, "certificate", [certificateFile]);
        setCertificateFile(null);
      }

      if (shouldSubmit && gpsData) {
        await submitWorkPermit(savedPermit.id, gpsData);
      }

      navigate(`/work-permit/${savedPermit.id}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        if (typeof errorData === "object" && errorData !== null) {
          if (typeof errorData.detail === "string") {
            setErrorMessage(errorData.detail);
          } else {
            const firstKey = Object.keys(errorData)[0];
            const errorMsg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
            setErrorMessage(`Gagal menyimpan: [${firstKey}] ${errorMsg}`);
          }
        } else {
          setErrorMessage("Gagal menyimpan izin kerja.");
        }
      } else {
        setErrorMessage("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2">Memuat data formulir...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      
      {errorMessage && <div className="alert alert-danger shadow-sm">{errorMessage}</div>}

      <div className="card shadow border-0 overflow-hidden">
        
        <div className="bg-primary text-white p-4 d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-light text-primary fw-bold mb-2">MODUL K3 BERISIKO TINGGI</span>
            <h2 className="fw-bold mb-1 text-white">
              {isEditMode ? "Edit Izin Kerja di Ketinggian" : "Formulir Izin Kerja di Ketinggian"}
            </h2>
            <p className="mb-0 text-white-50 small">Isi detail pekerjaan dan checklist keselamatan dengan teliti dan benar.</p>
          </div>
          <button className="btn btn-light btn-sm fw-semibold text-primary px-3 shadow-sm" onClick={() => navigate(-1)}>
            &larr; Kembali
          </button>
        </div>

        <div className="card-body p-4 p-md-5">
          
          {/* 1. Project & HIRA Selection */}
          <div className="mb-4 p-3 bg-light rounded border-start border-primary border-4">
            <h5 className="fw-bold text-dark mb-3">1. Referensi Proyek &amp; Dokumen HIRA</h5>
            
            <div className="mb-3">
              <label className="form-label fw-semibold small">Pilih Proyek*:</label>
              <select
                className="form-select"
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                disabled={isEditMode}
              >
                <option value="">-- Pilih Proyek --</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Pilih Dokumen HIRA (Disetujui)*:</label>
              <select
                className="form-select"
                value={hiraDocumentId}
                onChange={(e) => handleHiraDocumentChange(e.target.value)}
                disabled={!projectId}
              >
                <option value="">-- Pilih Dokumen HIRA --</option>
                {availableHiraDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    [Dok: {doc.document_number || doc.id}] - Paket: {doc.work_package} ({doc.work_area})
                  </option>
                ))}
              </select>
              <small className="text-muted">
                {!projectId ? "Silakan pilih proyek terlebih dahulu." : "Hanya menampilkan dokumen HIRA berstatus approved."}
              </small>
            </div>

            {selectedHiraDoc && selectedHiraDoc.groups && selectedHiraDoc.groups.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded border">
                <label className="form-label fw-semibold text-primary mb-2">Pilih Aktivitas HIRA (Minimal 1, Maksimal 10)*:</label>
                {selectedHiraDoc.groups.map((group, gIndex) => (
                  <div key={group.id || gIndex} className="mb-3">
                    <div className="fw-bold text-dark small bg-light p-2 rounded mb-2">
                      Grup: {group.location_function}
                    </div>
                    <div className="d-flex flex-column gap-2 ps-2">
                      {group.activities?.map((act) => (
                        <div className="form-check" key={act.id}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`hira-act-${act.id}`}
                            checked={act.id !== undefined && selectedActivityIds.includes(act.id)}
                            onChange={() => act.id !== undefined && handleActivityToggle(act.id)}
                          />
                          <label className="form-check-label small" htmlFor={`hira-act-${act.id}`}>
                            <strong>{act.activity_name}</strong> — Hazard: {act.potential_hazard} (Kategori Risiko: {act.initial_category || act.initial_score || 'N/A'})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="my-4 text-muted" />

          {/* 2. Detail Pekerjaan */}
          <h5 className="fw-bold text-dark mb-3">2. Detail Waktu &amp; Lokasi Kerja</h5>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Tanggal Kerja*:</label>
              <input
                type="date"
                className="form-control"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Jam Mulai*:</label>
              <input
                type="time"
                className="form-control"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small">Jam Selesai*:</label>
              <input
                type="time"
                className="form-control"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Lokasi Kerja (Area)*:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Lantai 3 Kolom C"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Koordinat GPS Granular (Wajib untuk Submit):</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  readOnly
                  placeholder="Belum diambil"
                  value={gpsData ? `${gpsData.latitude.toFixed(5)}, ${gpsData.longitude.toFixed(5)} (Akurasi: ${gpsData.accuracy.toFixed(1)}m)` : ""}
                />
                <button 
                  type="button" 
                  className="btn btn-outline-success d-flex align-items-center gap-1"
                  onClick={handleGetGps}
                  disabled={gpsLoading}
                >
                  {gpsLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-geo-alt-fill"></i>
                  )}
                  Ambil GPS
                </button>
              </div>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Akurasi wajib maksimal 50 meter.
              </small>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Jumlah Pekerja (Orang)*:</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={workerCount}
                onChange={(e) => setWorkerCount(Number(e.target.value))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Unggah Foto Sebelum Kerja (Before Photo)*:</label>
              <input
                key={photoInputKey}
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              />
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Wajib dilampirkan sebelum melakukan submit (JPG/JPEG, PNG, WebP maksimal 5 MB).
                {existingPhotos.filter((p) => p.stage === "before").length > 0 &&
                  ` Sudah terunggah: ${existingPhotos.filter((p) => p.stage === "before").length} foto.`}
              </small>
            </div>
          </div>

          {/* Lampiran Dokumen PDF Wajib (Medical & Certificate) */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Dokumen Medis / MCU (PDF):</label>
              <input
                type="file"
                className="form-control"
                accept="application/pdf"
                onChange={(e) => setMedicalFile(e.target.files?.[0] || null)}
              />
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Maksimal 10 file dengan ukuran 3 MB per file. 
                {existingAttachments.filter(a => a.kind === "medical").length > 0 && 
                  ` Sudah terunggah (${existingAttachments.filter(a => a.kind === "medical").length} file).`}
              </small>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold small">Sertifikat Kompetensi / Pelatihan (PDF):</label>
              <input
                type="file"
                className="form-control"
                accept="application/pdf"
                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
              />
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Maksimal 10 file dengan ukuran 3 MB per file. 
                {existingAttachments.filter(a => a.kind === "certificate").length > 0 && 
                  ` Sudah terunggah (${existingAttachments.filter(a => a.kind === "certificate").length} file).`}
              </small>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Deskripsi Pekerjaan*:</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Jelaskan detail pekerjaan yang akan dilakukan..."
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Penanggung Jawab (PIC)*:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nama penanggung jawab di lapangan"
                value={personInCharge}
                onChange={(e) => setPersonInCharge(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold small">Peralatan yang Digunakan:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Tangga, scaffolding"
                value={equipmentUsed}
                onChange={(e) => setEquipmentUsed(e.target.value)}
              />
            </div>
          </div>

          <hr className="my-4 text-muted" />

          {/* 3. Safety Areas */}
          <h5 className="fw-bold text-dark mb-2">3. Area Keselamatan (Safety Areas)*</h5>
          <p className="small text-muted mb-3">Pilih minimal satu area keselamatan yang relevan.</p>
          <div className="d-flex flex-column gap-2 mb-4 p-3 bg-light rounded">
            {Array.isArray(availableSafetyAreas) && availableSafetyAreas.map((area) => (
              <div className="form-check" key={area.code}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`area-${area.code}`}
                  checked={safetyAreas.includes(area.code)}
                  onChange={() => handleSafetyAreaToggle(area.code)}
                />
                <label className="form-check-label" htmlFor={`area-${area.code}`}>
                  <strong className="me-2">[{area.code}]</strong> {area.name}
                </label>
              </div>
            ))}
          </div>

          <hr className="my-4 text-muted" />

          {/* 4. 14 Checklist Keselamatan */}
          <h5 className="fw-bold text-dark mb-2">4. Checklist Keselamatan Kerja di Ketinggian*</h5>
          <p className="small text-muted mb-3">Semua item checklist wajib dijawab untuk melakukan submit izin kerja.</p>
          <div className="table-responsive mb-4 shadow-sm rounded">
            <table className="table table-bordered table-striped align-middle mb-0">
              <thead className="table-primary text-dark">
                <tr>
                  <th style={{ width: "60px" }} className="text-center">No</th>
                  <th>Poin Pemeriksaan Keselamatan</th>
                  <th style={{ width: "130px" }} className="text-center">Status (Ya / Tidak)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(checklistDescriptions).map((key) => (
                  <tr key={key}>
                    <td className="text-center fw-bold">{key}</td>
                    <td>{checklistDescriptions[key]}</td>
                    <td className="text-center">
                      <div className="form-check form-switch d-inline-block">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={checklist[key] || false}
                          onChange={() => handleChecklistToggle(key)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr className="my-4 text-muted" />

          {/* 5. PPE / APD */}
          <h5 className="fw-bold text-dark mb-2">5. Alat Pelindung Diri (APD / PPE)</h5>
          <p className="small text-muted mb-3">Pilih APD yang wajib digunakan oleh para pekerja.</p>
          <div className="d-flex flex-column gap-2 mb-3 p-3 bg-light rounded">
            {Array.isArray(availablePpeOptions) && availablePpeOptions.map((ppe) => (
              <div className="form-check" key={ppe.key}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`ppe-${ppe.key}`}
                  checked={selectedPpe.includes(ppe.key)}
                  onChange={() => handlePpeToggle(ppe.key)}
                />
                <label className="form-check-label" htmlFor={`ppe-${ppe.key}`}>
                  {ppe.name}
                </label>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small">APD Lainnya (Maksimal 2 baris):</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Nama APD tambahan..."
                value={ppeOtherInput}
                onChange={(e) => setPpeOtherInput(e.target.value)}
                disabled={ppeOther.length >= 2}
              />
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={handleAddPpeOther}
                disabled={ppeOther.length >= 2 || !ppeOtherInput.trim()}
              >
                Tambah
              </button>
            </div>
            {ppeOther.length > 0 && (
              <ul className="list-group">
                {ppeOther.map((item, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-1">
                    <span>{item}</span>
                    <button
                      type="button"
                      className="btn btn-sm text-danger"
                      onClick={() => setPpeOther(ppeOther.filter((_, i) => i !== idx))}
                    >
                      &times; Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-3 pt-4 border-top">
            <button
              type="button"
              className="btn btn-secondary px-4 shadow-sm"
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              Simpan sebagai Draft
            </button>
            <button
              type="button"
              className="btn btn-success px-4 shadow-sm"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan & Submit Izin Kerja"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}