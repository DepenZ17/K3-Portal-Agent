// src/pages/workPermit/WorkPermitHotWorkForm.tsx
import { useState } from "react";
import api from "../../services/api";
import type { WorkPermitHotWork } from "../../types/WorkPermitHotWork";
import type { YesNo } from "../../types/common";

export default function WorkPermitHotWorkForm() {
  const [form, setForm] = useState<WorkPermitHotWork>({
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

    jobWeldingElectric: false,
    jobWeldingGas: false,
    jobCuttingBending: false,
    jobOther: false,
    jobOtherDescription: "",

    chkSpkSigned: "",
    chkResponsibleAssigned: "",
    chkAreaFreeFromFlammableExplosive: "",
    chkAreaFreeFromPuddlesLeaksGas: "",
    chkAreaFreeFromOpenElectrical: "",
    chkAreaBarricadedAndSign: "",
    chkLightingAdequate: "",
    chkVentilationAdequate: "",
    chkAreaInspectedAndGasLeakFree: "",
    chkValveRegulatorHoseTorchOk: "",
    chkGasCylinderNotRustyOrDamaged: "",
    chkGasCylinderUprightAndChained: "",
    chkMaterialFixedSafePosition: "",
    chkPpePrepared: "",
    chkWorkersCompetent: "",
    chkFireExtinguisherAvailable: "",
    chkEmergencyProcedureUnderstood: "",
    chkChemicalB3SafeMsds: "",

    apdGasMask: false,
    apdLeatherGloves: false,
    apdWeldingGogglesElectric: false,
    apdNormalGoggles: false,
    apdSafetyShoes: false,
    apdOthers: "",

    notes: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof WorkPermitHotWork) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === "checkbox" ? target.checked : target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value as any,
      }));
    };

  const handleYesNo =
    (field: keyof WorkPermitHotWork, value: YesNo) => () => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const yesNoRow = (
    field: keyof WorkPermitHotWork,
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
      // sementara hanya kirim JSON; upload file bisa pakai FormData nanti
      await api.post("/work-permit/hot-work/", form);
      alert(
        "Form Izin Kerja Pekerjaan Berpotensi Kebakaran & Ledakan berhasil disimpan."
      );
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
      Form Izin Kerja Pekerjaan Berpotensi Kebakaran &amp; Ledakan (Hot Work)
      <span className="badge bg-danger">
        Risiko kebakaran &amp; ledakan
      </span>
    </h1>
    <p className="text-muted mb-4" style={{ fontSize: 14 }}>
      Digunakan untuk pekerjaan las listrik, las gas, cutting, bending, dan
      pekerjaan lain yang menimbulkan api serta panas. Form ini memastikan
      area kerja bebas bahan mudah terbakar, peralatan hot work layak pakai,
      dan APAR tersedia sebelum pekerjaan dimulai.
    </p>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* KIRI: form utama */}
          <div className="col-lg-8">
            {/* Informasi pekerjaan */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0">
                <h2 className="h6 mb-0">Informasi Pekerjaan</h2>
              </div>
              <div className="card-body">
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
                      placeholder="Mesin las, tabung gas, gerinda, dll."
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

                {/* Jenis pekerjaan A–D */}
                <div className="mb-3">
                  <label className="form-label d-block">
                    Checklist jenis pekerjaan (A, B, C, D)
                  </label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="jobWeldingElectric"
                      checked={form.jobWeldingElectric}
                      onChange={handleChange("jobWeldingElectric")}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="jobWeldingElectric"
                    >
                      (A) Pekerjaan Las Listrik
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="jobWeldingGas"
                      checked={form.jobWeldingGas}
                      onChange={handleChange("jobWeldingGas")}
                    />
                    <label className="form-check-label" htmlFor="jobWeldingGas">
                      (B) Pekerjaan Las Dengan Gas
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="jobCuttingBending"
                      checked={form.jobCuttingBending}
                      onChange={handleChange("jobCuttingBending")}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="jobCuttingBending"
                    >
                      (C) Pekerjaan cutting/bending
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
                      (D) Pekerjaan lainnya
                    </label>
                  </div>
                  {form.jobOther && (
                    <div className="mt-2">
                      <input
                        className="form-control"
                        placeholder="Uraikan pekerjaan lain (misalnya oxy cutting di area tangki, dsb.)"
                        value={form.jobOtherDescription}
                        onChange={handleChange("jobOtherDescription")}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist keselamatan 18 poin */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0">
                <h2 className="h6 mb-0">
                  Sebelum pekerjaan disetujui, semua checklist di bawah ini harus
                  diisi.
                </h2>
              </div>
              <div className="card-body">
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
                        "chkAreaFreeFromFlammableExplosive",
                        "Apakah area sudah diamankan dan dibebaskan dari bahan-bahan mudah terbakar dan mudah meledak?",
                        3
                      )}
                      {yesNoRow(
                        "chkAreaFreeFromPuddlesLeaksGas",
                        "Apakah area bebas dari genangan, bocoran, dan percikan gas?",
                        4
                      )}
                      {yesNoRow(
                        "chkAreaFreeFromOpenElectrical",
                        "Apakah area sudah bebas dari sambungan listrik terbuka?",
                        5
                      )}
                      {yesNoRow(
                        "chkAreaBarricadedAndSign",
                        'Apakah area sudah diberi pembatas (safety line) dan dipasang rambu "Yang Tidak Berwenang Dilarang Masuk"?',
                        6
                      )}
                      {yesNoRow(
                        "chkLightingAdequate",
                        "Apakah area kerja sudah diberi penerangan yang memadai?",
                        7
                      )}
                      {yesNoRow(
                        "chkVentilationAdequate",
                        "Apakah lubang ventilasi udara sudah disediakan, udara di dalam memadai, dan aliran udara keluar masuk baik? (jika dilakukan di ruang tertutup)",
                        8
                      )}
                      {yesNoRow(
                        "chkAreaInspectedAndGasLeakFree",
                        "Apakah area sudah diinspeksi dan bebas dari kebocoran gas?",
                        9
                      )}
                      {yesNoRow(
                        "chkValveRegulatorHoseTorchOk",
                        "Apakah valve, regulator, selang, dan torch las sudah diperiksa dan layak pakai?",
                        10
                      )}
                      {yesNoRow(
                        "chkGasCylinderNotRustyOrDamaged",
                        "Apakah tabung gas tidak berkarat, tidak penyok, dan tidak ada tanda-tanda retak? (untuk pengelasan dengan gas)",
                        11
                      )}
                      {yesNoRow(
                        "chkGasCylinderUprightAndChained",
                        "Apakah tabung gas dalam posisi tegak, seimbang, dan diikat dengan rantai? (untuk pengelasan dengan las)",
                        12
                      )}
                      {yesNoRow(
                        "chkMaterialFixedSafePosition",
                        "Apakah material yang akan dilas/dipotong/dibengkokkan dalam posisi yang aman, fix, dan tidak akan bergeser?",
                        13
                      )}
                      {yesNoRow(
                        "chkPpePrepared",
                        "Apakah pekerja sudah memakai dan mempersiapkan APD yang sesuai?",
                        14
                      )}
                      {yesNoRow(
                        "chkWorkersCompetent",
                        "Apakah pekerja mempunyai pengalaman dan kompeten melakukan pekerjaan ini?",
                        15
                      )}
                      {yesNoRow(
                        "chkFireExtinguisherAvailable",
                        "Apakah alat pemadam kebakaran sudah tersedia dan memadai? (CO2 atau powder untuk area terbuka)",
                        16
                      )}
                      {yesNoRow(
                        "chkEmergencyProcedureUnderstood",
                        "Apakah prosedur keadaan darurat sudah dimengerti dan pekerja sudah diberi pelatihan memadamkan api?",
                        17
                      )}
                      {yesNoRow(
                        "chkChemicalB3SafeMsds",
                        "Apakah bahan kimia B3 kemasannya memadai (bebas potensi bocor), sudah dilengkapi Material Safety Data Sheet (MSDS) dan diberi label yang jelas? (jika menggunakan bahan kimia B3)",
                        18
                      )}
                    </tbody>
                  </table>
                </div>

                {/* APD */}
                <div className="mb-3">
                  <label className="form-label d-block">Alat Pelindung Diri</label>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="apdGasMask"
                          checked={form.apdGasMask}
                          onChange={handleChange("apdGasMask")}
                        />
                        <label className="form-check-label" htmlFor="apdGasMask">
                          Masker gas
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="apdLeatherGloves"
                          checked={form.apdLeatherGloves}
                          onChange={handleChange("apdLeatherGloves")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="apdLeatherGloves"
                        >
                          Sarung Tangan Kulit
                        </label>
                      </div>
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
                          Safety Shoes
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="apdWeldingGogglesElectric"
                          checked={form.apdWeldingGogglesElectric}
                          onChange={handleChange("apdWeldingGogglesElectric")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="apdWeldingGogglesElectric"
                        >
                          Kacamata Las Listrik
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="apdNormalGoggles"
                          checked={form.apdNormalGoggles}
                          onChange={handleChange("apdNormalGoggles")}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="apdNormalGoggles"
                        >
                          Kacamata Las Biasa
                        </label>
                      </div>
                      <div className="mt-2">
                        <input
                          className="form-control"
                          placeholder="APD lain (misalnya pelindung pendengaran, rompi reflektif, dll.)"
                          value={form.apdOthers}
                          onChange={handleChange("apdOthers")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan + foto */}
                <div className="mb-3">
                  <label className="form-label">Catatan tambahan</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange("notes")}
                    placeholder="Contoh: Pekerjaan dilakukan di luar jam operasi, area sekitar tabung gas sudah diberi pembatas tambahan."
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
                    {isSubmitting
                      ? "Menyimpan..."
                      : "Simpan Form Izin Kerja Pekerjaan Berpotensi Kebakaran & Ledakan (Hot Work)"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* KANAN: alur & catatan penting */}
        <div className="col-lg-4">
        {/* Kotak hijau – alur singkat */}
        <div className="card shadow-sm border-success mb-3">
        <div className="card-header bg-success text-white py-2">
        <h2 className="h6 mb-0">Alur singkat izin kerja Hot Work</h2>
        </div>
        <div className="card-body bg-light">
        <ol className="mb-0" style={{ fontSize: 14 }}>
        <li>
          Foreman mengisi form, memilih jenis pekerjaan (las listrik, las gas,
          cutting/bending), dan melengkapi checklist keselamatan.
        </li>
        <li>
          SHE Officer memverifikasi kondisi area (bahan mudah terbakar,
          kebocoran gas, APAR, ventilasi) serta kelengkapan APD dan peralatan
          las.
        </li>
        <li>
          Site Manager memberikan persetujuan akhir sebelum pekerjaan hot work
          dimulai.
        </li>
        <li>
          Pekerjaan dilaksanakan sesuai ketentuan izin dengan pengawasan
          personel yang kompeten / fire watch bila diperlukan.
        </li>
        <li>
          Setelah pekerjaan selesai dan area dinyatakan aman, izin kerja hot
          work ditutup di sistem dengan bukti dokumentasi.
        </li>
      </ol>
        </div>
        </div>

        {/* Kotak kuning – catatan penting */}
        <div className="card shadow-sm border-warning">
        <div className="card-header bg-warning text-dark py-2">
      <h2 className="h6 mb-0">Catatan penting Hot Work</h2>
        </div>
        <div className="card-body bg-light">
        <ul className="mb-0" style={{ fontSize: 13, paddingLeft: 18 }}>
        <li>
          Hot work di area dengan bahan mudah terbakar atau tabung gas wajib
          mendapat pengamanan area dan ketersediaan APAR yang sesuai.
        </li>
        <li>
          Pemeriksaan tabung gas, selang, regulator, sambungan listrik, dan
          kebocoran gas merupakan bagian penting sebelum pekerjaan dimulai.
        </li>
        <li>
          Setelah pekerjaan selesai, lakukan pemantauan sejenak untuk
          memastikan tidak ada titik panas/tunggul api yang dapat memicu
          kebakaran.
        </li>
        <li>
          Status tanda tangan pada form kertas digantikan oleh status digital di
          sistem (Draft, Diverifikasi, Disetujui, Ditutup) sesuai role Foreman,
          SHE Officer, dan Site Manager.
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
