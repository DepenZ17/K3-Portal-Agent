// src/pages/workPermit/WorkPermitConfinedSpaceForm.tsx
import { useState } from "react";
import api from "../../services/api";
import type { WorkPermitConfinedSpace } from "../../types/WorkPermitConfinedSpace";
import type { YesNo } from "../../types/common";

const defaultYesNo: YesNo = "";

export default function WorkPermitConfinedSpaceForm() {
  const [form, setForm] = useState<WorkPermitConfinedSpace>({
    project: "",
    date: "",
    location: "",
    description: "",
    contractor: "",
    equipment: "",
    timeFrom: "",
    timeTo: "",
    responsible: "",
    workersCount: "",

    jobExcavation: false,
    jobEnclosedRepair: false,
    jobOther: false,
    jobOtherDescription: "",

    chkSpkSigned: defaultYesNo,
    chkResponsibleAssigned: defaultYesNo,
    chkAreaProtectedFromCollapse: defaultYesNo,
    chkAreaBarricadedAndSign: defaultYesNo,
    chkLightingAdequate: defaultYesNo,
    chkVentilationAdequate: defaultYesNo,
    chkFreeFromFlammable: defaultYesNo,
    chkFreeFromToxicGas: defaultYesNo,
    chkEquipmentInspected: defaultYesNo,
    chkMachineLockedOut: defaultYesNo,
    chkGotSafetyInduction: defaultYesNo,
    chkPpePrepared: defaultYesNo,
    chkWorkersCompetent: defaultYesNo,
    chkTwoPersonsAndStandby: defaultYesNo,
    chkEmergencyProcedureKnown: defaultYesNo,
    chkCommunicationAdequate: defaultYesNo,
    chkChemicalsSafeMsds: defaultYesNo,

    apdMask: false,
    apdGloves: false,
    apdHelmet: false,
    apdSafetyShoes: false,
    apdSafetyGoggles: false,
    apdOthers: "",

    notes: "",
  });

  const [supportPhotos, setSupportPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // helper input text/checkbox
  const handleChange =
    (field: keyof WorkPermitConfinedSpace) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const value =
        target.type === "checkbox" ? target.checked : target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value as any,
      }));
    };

  // helper YA/TIDAK
  const handleYesNo =
    (field: keyof WorkPermitConfinedSpace, value: YesNo) => () => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  // baris checklist YA/TIDAK
  const yesNoRow = (
    field: keyof WorkPermitConfinedSpace,
    label: string,
    no: number
  ) => (
    <tr key={no}>
      <td style={{ width: 40 }}>{no}.</td>
      <td>{label}</td>
      <td className="text-center" style={{ width: 60 }}>
        <input
          type="radio"
          className="form-check-input"
          name={String(field)}
          checked={form[field] === "yes"}
          onChange={handleYesNo(field, "yes")}
        />
      </td>
      <td className="text-center" style={{ width: 60 }}>
        <input
          type="radio"
          className="form-check-input"
          name={String(field)}
          checked={form[field] === "no"}
          onChange={handleYesNo(field, "no")}
        />
      </td>
    </tr>
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSupportPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.project || !form.location || !form.date) {
      alert("Mohon isi minimal Proyek, Lokasi, dan Tanggal.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("data", JSON.stringify(form));
      supportPhotos.forEach((file) => {
        formData.append("support_photos", file);
      });

      await api.post("/work-permit/confined-space/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Form Izin Kerja Ruang Terbatas berhasil disimpan.");
      setForm((prev) => ({
        ...prev,
        project: "",
        date: "",
        location: "",
        description: "",
        contractor: "",
        equipment: "",
        timeFrom: "",
        timeTo: "",
        responsible: "",
        workersCount: "",
        jobOtherDescription: "",
        notes: "",
      }));
      setSupportPhotos([]);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan form. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <>
    <h1 className="h4 mb-2 d-flex align-items-center gap-2">
      Form Izin Kerja Ruang Terbatas (Confined Space)
      <span className="badge bg-primary">
        Risiko ruang terbatas &amp; atmosfer berbahaya
      </span>
    </h1>
    <p className="text-muted mb-4" style={{ fontSize: 14 }}>
      Digunakan untuk pekerjaan galian, masuk ke ruang tertutup (enclosed),
      perbaikan alat di dalam tanki, pit, manhole, atau area dengan ventilasi
      terbatas. Form ini membantu memastikan kondisi atmosfer aman, akses
      evakuasi tersedia, dan pengawasan standby person diterapkan.
    </p>


      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* KIRI: form utama */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0">
                <h2 className="h6 mb-0">Informasi Pekerjaan</h2>
              </div>
              <div className="card-body">
                {/* Informasi pekerjaan */}
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label">Proyek</label>
                    <input
                      className="form-control"
                      value={form.project}
                      onChange={handleChange("project")}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Tanggal</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleChange("date")}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Lokasi pekerjaan</label>
                  <input
                    className="form-control"
                    value={form.location}
                    onChange={handleChange("location")}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Deskripsi pekerjaan</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={handleChange("description")}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Pekerjaan oleh (Kontraktor / Unit)
                    </label>
                    <input
                      className="form-control"
                      value={form.contractor}
                      onChange={handleChange("contractor")}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Peralatan yang digunakan</label>
                    <input
                      className="form-control"
                      value={form.equipment}
                      onChange={handleChange("equipment")}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Waktu pekerjaan</label>
                    <div className="d-flex gap-2">
                      <input
                        type="time"
                        className="form-control"
                        value={form.timeFrom}
                        onChange={handleChange("timeFrom")}
                      />
                      <span className="align-self-center">s/d</span>
                      <input
                        type="time"
                        className="form-control"
                        value={form.timeTo}
                        onChange={handleChange("timeTo")}
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Penanggung jawab</label>
                    <input
                      className="form-control"
                      value={form.responsible}
                      onChange={handleChange("responsible")}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Jumlah tenaga kerja</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={form.workersCount}
                      onChange={handleChange("workersCount")}
                    />
                  </div>
                  <div className="col-md-8 mb-3">
                    <label className="form-label d-block">
                      Checklist keselamatan – jenis pekerjaan
                    </label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="jobExcavation"
                        checked={form.jobExcavation}
                        onChange={handleChange("jobExcavation")}
                      />
                      <label className="form-check-label" htmlFor="jobExcavation">
                        (A) Pekerjaan Galian
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="jobEnclosedRepair"
                        checked={form.jobEnclosedRepair}
                        onChange={handleChange("jobEnclosedRepair")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="jobEnclosedRepair"
                      >
                        (B) Pekerjaan Perbaikan Alat Kondisi Tertutup (Enclosed)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="jobOther"
                        checked={form.jobOther}
                        onChange={handleChange("jobOther")}
                      />
                      <label className="form-check-label" htmlFor="jobOther">
                        (C) Pekerjaan lainnya
                      </label>
                    </div>
                    <input
                      className="form-control form-control-sm mt-1"
                      placeholder="Uraikan jika memilih (C)"
                      value={form.jobOtherDescription}
                      onChange={handleChange("jobOtherDescription")}
                    />
                  </div>
                </div>

                {/* Checklist keselamatan 17 poin */}
                <div className="mt-3 mb-2">
                  <h2 className="h6">
                    Sebelum pekerjaan disetujui, semua checklist di bawah ini harus diisi.
                  </h2>
                  <hr className="mt-1" />
                </div>

                <div className="table-responsive mb-3">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>No</th>
                        <th>Uraian</th>
                        <th className="text-center" style={{ width: 60 }}>
                          YA
                        </th>
                        <th className="text-center" style={{ width: 60 }}>
                          TIDAK
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {yesNoRow(
                        "chkSpkSigned",
                        "Apakah Surat Perintah Kerja (SPK) atau kontrak pekerjaan ini sudah ditandatangani?",
                        1
                      )}
                      {yesNoRow(
                        "chkResponsibleAssigned",
                        "Apakah penanggungjawab pekerjaan sudah ditentukan?",
                        2
                      )}
                      {yesNoRow(
                        "chkAreaProtectedFromCollapse",
                        "Apakah area sudah diamankan dari potensi longsor dan diberi proteksi (casing, pile, terasering, dll)?",
                        3
                      )}
                      {yesNoRow(
                        "chkAreaBarricadedAndSign",
                        'Apakah area sudah diberi pembatas (safety line) dan dipasang rambu "Yang Tidak Berwenang Dilarang Masuk"?',
                        4
                      )}
                      {yesNoRow(
                        "chkLightingAdequate",
                        "Apakah area kerja sudah diberi penerangan yang memadai?",
                        5
                      )}
                      {yesNoRow(
                        "chkVentilationAdequate",
                        "Apakah lubang ventilasi udara sudah disediakan dan udara di dalam memadai?",
                        6
                      )}
                      {yesNoRow(
                        "chkFreeFromFlammable",
                        "Apakah area sudah dibebaskan dari bahan mudah terbakar dan meledak?",
                        7
                      )}
                      {yesNoRow(
                        "chkFreeFromToxicGas",
                        "Apakah area kerja ruang terbatas bebas dari gas berbahaya dan mematikan?",
                        8
                      )}
                      {yesNoRow(
                        "chkEquipmentInspected",
                        "Apakah peralatan yang digunakan sudah diinspeksi dan layak pakai?",
                        9
                      )}
                      {yesNoRow(
                        "chkMachineLockedOut",
                        "Apakah mesin sudah dimatikan dan diberi rambu & label Lock Out Tag Out (LOTO)? (untuk perbaikan alat)",
                        10
                      )}
                      {yesNoRow(
                        "chkGotSafetyInduction",
                        "Apakah pekerja sudah mendapatkan pengarahan K3 (Safety Induction)?",
                        11
                      )}
                      {yesNoRow(
                        "chkPpePrepared",
                        "Apakah pekerja sudah memakai dan mempersiapkan APD yang sesuai?",
                        12
                      )}
                      {yesNoRow(
                        "chkWorkersCompetent",
                        "Apakah pekerja mempunyai pengalaman dan kompeten melakukan pekerjaan ini?",
                        13
                      )}
                      {yesNoRow(
                        "chkTwoPersonsAndStandby",
                        "Apakah pekerjaan dilakukan minimal 2 orang, dengan posisi 1 orang pekerja menunggu di luar untuk memonitor kondisi pekerja di dalam, dan bertugas mencari pertolongan saat keadaan darurat?",
                        14
                      )}
                      {yesNoRow(
                        "chkEmergencyProcedureKnown",
                        "Apakah prosedur keadaan darurat sudah dimengerti?",
                        15
                      )}
                      {yesNoRow(
                        "chkCommunicationAdequate",
                        "Apakah pekerja sudah dilengkapi alat komunikasi yang memadai (HT, dsb)?",
                        16
                      )}
                      {yesNoRow(
                        "chkChemicalsSafeMsds",
                        "Apakah bahan kimia B3 kemasannya memadai (bebas potensi bocor), sudah dilengkapi Material Safety Data Sheet (MSDS) dan diberi label yang jelas? (jika menggunakan bahan kimia B3)",
                        17
                      )}
                    </tbody>
                  </table>
                </div>

                {/* APD */}
                <div className="mt-3 mb-2">
                  <h2 className="h6">Alat Pelindung Diri (APD)</h2>
                  <hr className="mt-1" />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdMask"
                        checked={form.apdMask}
                        onChange={handleChange("apdMask")}
                      />
                      <label className="form-check-label" htmlFor="apdMask">
                        Masker
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdGloves"
                        checked={form.apdGloves}
                        onChange={handleChange("apdGloves")}
                      />
                      <label className="form-check-label" htmlFor="apdGloves">
                        Sarung Tangan
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdHelmet"
                        checked={form.apdHelmet}
                        onChange={handleChange("apdHelmet")}
                      />
                      <label className="form-check-label" htmlFor="apdHelmet">
                        Helm
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdSafetyShoes"
                        checked={form.apdSafetyShoes}
                        onChange={handleChange("apdSafetyShoes")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="apdSafetyShoes"
                      >
                        Sepatu Safety
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdSafetyGoggles"
                        checked={form.apdSafetyGoggles}
                        onChange={handleChange("apdSafetyGoggles")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="apdSafetyGoggles"
                      >
                        Kacamata Pengaman
                      </label>
                    </div>
                    <div className="mt-2">
                      <input
                        className="form-control"
                        placeholder="APD lainnya (opsional)"
                        value={form.apdOthers}
                        onChange={handleChange("apdOthers")}
                      />
                    </div>
                  </div>
                </div>

                {/* Catatan + Foto */}
                <div className="mb-3">
                  <label className="form-label">Catatan tambahan</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange("notes")}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Upload Foto Bukti (area, rambu, APD, peralatan)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={submitting}
                  />
                  {supportPhotos.length > 0 && (
                    <small className="text-muted d-block mt-1">
                      {supportPhotos.length} file dipilih:{" "}
                      {supportPhotos.map((f) => f.name).join(", ")}
                    </small>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Menyimpan..." : "Simpan Form Izin Kerja Ruang Terbatas (Confined Space)"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* KANAN: alur & catatan dalam kotak berwarna */}
    <div className="col-lg-4">
  {/* Kotak hijau – alur singkat */}
  <div className="card shadow-sm border-success mb-3">
    <div className="card-header bg-success text-white py-2">
      <h2 className="h6 mb-0">Alur singkat izin kerja ruang terbatas</h2>
    </div>
    <div className="card-body bg-light">
      <ol className="mb-0" style={{ fontSize: 14 }}>
        <li>
          Foreman mengisi form dan checklist keselamatan, serta
          melampirkan dokumen pendukung (JSA, gambar kerja, dll.).
        </li>
        <li>
          SHE Officer memeriksa kelengkapan checklist, kondisi area
          kerja, ventilasi, dan isolasi energi (LOTO).
        </li>
        <li>
          Project Manager / Site Manager memberikan persetujuan
          (approve) sebelum pekerjaan dimulai.
        </li>
        <li>
          Pekerjaan dilaksanakan sesuai ketentuan di form, dengan
          standby man di luar ruang terbatas.
        </li>
        <li>
          Setelah pekerjaan selesai dan area aman, SHE Officer
          melakukan evaluasi dan Foreman menutup izin di sistem.
        </li>
      </ol>
    </div>
  </div>

  {/* Kotak kuning – catatan penting */}
  <div className="card shadow-sm border-warning">
    <div className="card-header bg-warning text-dark py-2">
      <h2 className="h6 mb-0">Catatan penting</h2>
    </div>
    <div className="card-body bg-light">
      <p className="text-muted mb-1" style={{ fontSize: 13 }}>
        Untuk setiap pekerjaan ruang terbatas:
      </p>
      <ul className="mb-0" style={{ fontSize: 13, paddingLeft: 18 }}>
        <li>
          Minimal dua orang terlibat, satu di dalam dan satu standby
          di luar untuk memonitor kondisi dan siap mencari bantuan.
        </li>
        <li>
          Pastikan ventilasi, jalur evakuasi, dan prosedur keadaan
          darurat dipahami semua pekerja sebelum masuk ruang terbatas.
        </li>
        <li>
          Untuk penggunaan bahan kimia B3, pastikan kemasan baik,
          label jelas, dan MSDS tersedia di lokasi kerja.
        </li>
        </ul>
        </div>
        </div>
        </div>

        </div>
      </form>
    </>
  );
}
