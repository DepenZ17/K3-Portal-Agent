// src/pages/workPermit/WorkPermitHeightForm.tsx
import { useState } from "react";
import api from "../../services/api";
import type { WorkPermitHeight } from "../../types/WorkPermitHeight";
import type { YesNo } from "../../types/common";

export default function WorkPermitHeightForm() {
  const [form, setForm] = useState<WorkPermitHeight>({
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

    areaA: false,
    areaB: false,
    areaC: true,

    chkSpkSigned: "",
    chkResponsibleAssigned: "",
    chkWeatherGood: "",
    chkPpePrepared: "",
    chkSafetyInduction: "",
    chkExperienced: "",
    chkNoBalanceIssue: "",
    chkEmergencyProcedureUnderstood: "",
    chkSignsInstalled: "",
    chkSafetyLineNetDeckInstalled: "",
    chkClimbingInstalled: "",
    chkAreaBelowClear: "",
    chkEquipmentInspected: "",
    chkChemicalB3Controlled: "",

    apdGloves: false,
    apdSafetyBelt: false,
    apdBodyHarness: false,
    apdShoes: false,
    apdOthers: "",

    notes: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof WorkPermitHeight) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const value =
        target.type === "checkbox" ? target.checked : target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value as any,
      }));
    };

  const handleYesNo =
    (field: keyof WorkPermitHeight, value: YesNo) => () => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const yesNoRow = (
    field: keyof WorkPermitHeight,
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: jika nanti ingin upload foto ke backend,
      // ubah ke FormData seperti di form confined space.
      await api.post("/work-permit/height/", form);
      alert("Form Izin Kerja di Ketinggian berhasil disimpan.");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan form. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <>
    <h1 className="h4 mb-2 d-flex align-items-center gap-2">
      Form Izin Kerja di Ketinggian
      <span className="badge bg-warning text-dark">
        Risiko jatuh dari ketinggian
      </span>
    </h1>
    <p className="text-muted mb-4" style={{ fontSize: 14 }}>
      Digunakan untuk pekerjaan di area tepi lantai, perifer, pit lift/tangga,
      corewall, dan area lain yang memiliki potensi jatuh dari ketinggian.
      Form ini memastikan pengamanan area, kelayakan peralatan kerja di
      ketinggian, dan kelengkapan APD sebelum pekerjaan dimulai.
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
                    <label className="form-label">Pekerjaan oleh</label>
                    <input
                      className="form-control"
                      value={form.contractor}
                      onChange={handleChange("contractor")}
                      placeholder="Internal / Subkontraktor"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Peralatan yang digunakan</label>
                    <input
                      className="form-control"
                      value={form.equipment}
                      onChange={handleChange("equipment")}
                      placeholder="Scaffolding, gondola, tangga, dll."
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
                      Checklist area pekerjaan
                    </label>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="areaA"
                        checked={form.areaA}
                        onChange={handleChange("areaA")}
                      />
                      <label className="form-check-label" htmlFor="areaA">
                        (A) Area Perifer (Pinggiran)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="areaB"
                        checked={form.areaB}
                        onChange={handleChange("areaB")}
                      />
                      <label className="form-check-label" htmlFor="areaB">
                        (B) Area Pit Lift / Tangga
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="areaC"
                        checked={form.areaC}
                        onChange={handleChange("areaC")}
                      />
                      <label className="form-check-label" htmlFor="areaC">
                        (C) Pekerjaan perbaikan / perawatan di ketinggian
                      </label>
                    </div>
                  </div>
                </div>

                {/* Checklist keselamatan 14 poin */}
                <div className="mt-3 mb-2">
                  <h2 className="h6">
                    Sebelum pekerjaan disetujui, semua checklist di bawah ini
                    harus diisi.
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
                        "Apakah penanggung jawab pekerjaan sudah ditentukan?",
                        2
                      )}
                      {yesNoRow(
                        "chkWeatherGood",
                        "Apakah cuaca cerah dan tidak mendung?",
                        3
                      )}
                      {yesNoRow(
                        "chkPpePrepared",
                        "Apakah pekerja sudah memakai dan mempersiapkan APD yang sesuai?",
                        4
                      )}
                      {yesNoRow(
                        "chkSafetyInduction",
                        "Apakah pekerja sudah mendapatkan pengarahan K3 (Safety Induction)?",
                        5
                      )}
                      {yesNoRow(
                        "chkExperienced",
                        "Apakah pekerja mempunyai pengalaman dan kompeten melakukan pekerjaan ini?",
                        6
                      )}
                      {yesNoRow(
                        "chkNoBalanceIssue",
                        "Apakah pekerja tidak menderita penyakit ayan, rabun senja, atau gangguan keseimbangan?",
                        7
                      )}
                      {yesNoRow(
                        "chkEmergencyProcedureUnderstood",
                        "Apakah prosedur keadaan darurat sudah dimengerti?",
                        8
                      )}
                      {yesNoRow(
                        "chkSignsInstalled",
                        "Apakah rambu-rambu yang diperlukan sudah terpasang?",
                        9
                      )}
                      {yesNoRow(
                        "chkSafetyLineNetDeckInstalled",
                        "Apakah safety line, safety net, dan safety deck sudah terpasang?",
                        10
                      )}
                      {yesNoRow(
                        "chkClimbingInstalled",
                        "Apakah climbing sudah terpasang? (untuk pekerjaan corewall)",
                        11
                      )}
                      {yesNoRow(
                        "chkAreaBelowClear",
                        "Apakah area pekerjaan sudah dibersihkan dan area di bawahnya bebas dari area kerja dan lalu lintas orang?",
                        12
                      )}
                      {yesNoRow(
                        "chkEquipmentInspected",
                        "Apakah peralatan sudah diinspeksi dan layak pakai?",
                        13
                      )}
                      {yesNoRow(
                        "chkChemicalB3Controlled",
                        "Apakah bahan kimia B3 kemasannya memadai (bebas potensi bocor), sudah dilengkapi Material Safety Data Sheet (MSDS) dan diberi label yang jelas? (jika menggunakan bahan kimia B3)",
                        14
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
                        id="apdGloves"
                        checked={form.apdGloves}
                        onChange={handleChange("apdGloves")}
                      />
                      <label className="form-check-label" htmlFor="apdGloves">
                        Sarung tangan
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdSafetyBelt"
                        checked={form.apdSafetyBelt}
                        onChange={handleChange("apdSafetyBelt")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="apdSafetyBelt"
                      >
                        Safety Belt
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdBodyHarness"
                        checked={form.apdBodyHarness}
                        onChange={handleChange("apdBodyHarness")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="apdBodyHarness"
                      >
                        Body Harness
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apdShoes"
                        checked={form.apdShoes}
                        onChange={handleChange("apdShoes")}
                      />
                      <label className="form-check-label" htmlFor="apdShoes">
                        Sepatu
                      </label>
                    </div>
                    <div className="mt-2">
                      <input
                        className="form-control"
                        placeholder="APD lain (misalnya kacamata safety, rompi, dsb.)"
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
                    onChange={handlePhotoChange}
                  />
                  {photos.length > 0 && (
                    <small className="text-muted d-block mt-1">
                      {photos.length} file dipilih:{" "}
                      {photos.map((f) => f.name).join(", ")}
                    </small>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Form Izin Kerja di Ketinggian"}
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
                <h2 className="h6 mb-0">
                  Alur singkat izin kerja di ketinggian
                </h2>
              </div>
              <div className="card-body bg-light">
                <ol className="mb-0" style={{ fontSize: 14 }}>
                  <li>
                    Foreman mengisi form izin kerja di ketinggian dan checklist
                    keselamatan, serta melampirkan JSA / gambar kerja bila
                    diperlukan.
                  </li>
                  <li>
                    SHE Officer memeriksa kelengkapan form, kondisi area kerja,
                    APD, dan sarana pengaman (scaffolding, safety line, safety
                    net, dll.).
                  </li>
                  <li>
                    Site Manager / Project Manager memberikan persetujuan
                    (approve) sebelum pekerjaan di ketinggian dilaksanakan.
                  </li>
                  <li>
                    Pekerjaan dilaksanakan sesuai ketentuan di dalam izin dengan
                    pengawasan oleh personel yang kompeten.
                  </li>
                  <li>
                    Setelah pekerjaan selesai dan area dinyatakan aman, SHE
                    Officer melakukan evaluasi dan Foreman menutup izin pada
                    daftar izin kerja.
                  </li>
                </ol>
              </div>
            </div>

            {/* Kotak kuning – catatan penting */}
            <div className="card shadow-sm border-warning">
              <div className="card-header bg-warning text-dark py-2">
                <h2 className="h6 mb-0">
                  Catatan penting kerja di ketinggian
                </h2>
              </div>
              <div className="card-body bg-light">
                <ul className="mb-0" style={{ fontSize: 13, paddingLeft: 18 }}>
                  <li>
                    Pekerjaan pada ketinggian ≥ 2 m wajib menggunakan APD
                    pencegah jatuh (safety belt / body harness) yang terpasang
                    pada anchorage yang kuat.
                  </li>
                  <li>
                    Scaffolding, tangga, gondola dan safety net harus diperiksa
                    oleh personel yang kompeten sebelum digunakan dan diberi
                    label layak pakai.
                  </li>
                  <li>
                    Hindari bekerja saat cuaca buruk (hujan lebat, angin
                    kencang, petir) dan pastikan area di bawah diberi
                    pembatas serta rambu dilarang melintas.
                  </li>
                  <li>
                    Selalu pastikan jalur evakuasi dan prosedur keadaan darurat
                    sudah dipahami semua pekerja sebelum pekerjaan dimulai.
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
