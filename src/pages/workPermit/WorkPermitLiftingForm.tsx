// src/pages/workPermit/WorkPermitLiftingForm.tsx
import { useState } from "react";
import api from "../../services/api";
import type { WorkPermitLifting } from "../../types/WorkPermitLifting";
import type { YesNo } from "../../types/common";

export default function WorkPermitLiftingForm() {
  const [form, setForm] = useState<WorkPermitLifting>({
    project: "",
    date: "",
    location: "",
    description: "",
    equipment: "",
    timeFrom: "",
    timeTo: "",
    responsible: "",
    workersCount: "",

    areaPerifer: false,
    areaFabrikasi: false,
    areaTopFloor: false,

    chkSpkSigned: "",
    chkResponsibleAssigned: "",
    chkWeatherGood: "",
    chkPpePrepared: "",
    chkSafetyInduction: "",
    chkExperienced: "",
    chkNoBalanceIssue: "",
    chkEmergencyProcedureUnderstood: "",
    chkSignsInstalled: "",
    chkSafetyLineDeckInstalled: "",
    chkSlingCapacityCalculated: "",
    chkMobileCraneInspected: "",
    chkLiftingEquipmentInspected: "",
    chkCraneSlingInspected: "",
    chkSmallMaterialBucketProvided: "",
    chkAreaBelowClear: "",

    apdHelmet: false,
    apdGloves: false,
    apdShoes: false,
    apdOthers: "",

    notes: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof WorkPermitLifting) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === "checkbox" ? target.checked : target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value as any,
      }));
    };

  const handleYesNo =
    (field: keyof WorkPermitLifting, value: YesNo) => () => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const yesNoRow = (
    field: keyof WorkPermitLifting,
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
      // sementara kirim JSON; nanti kalau mau kirim foto pakai FormData
      await api.post("/work-permit/lifting/", form);
      alert("Form Izin Kerja Pekerjaan Mengangkat berhasil disimpan.");
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
        Form Izin Kerja Pekerjaan Mengangkat
        <span className="badge bg-info text-dark">
          Risiko pengangkatan material
        </span>
      </h1>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Digunakan saat melakukan pekerjaan pengangkatan material dengan crane
        atau peralatan sejenis. Izin diajukan sebelum pekerjaan dimulai dan
        disetujui oleh Project Manager setelah seluruh checklist keselamatan
        dipenuhi.
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
                    <label className="form-label">Peralatan yang digunakan</label>
                    <input
                      className="form-control"
                      value={form.equipment}
                      onChange={handleChange("equipment")}
                      placeholder="Crane, hoist, dll."
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Yang bertanggung jawab</label>
                    <input
                      className="form-control"
                      value={form.responsible}
                      onChange={handleChange("responsible")}
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
                    <label className="form-label">Jumlah tenaga kerja</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={form.workersCount}
                      onChange={handleChange("workersCount")}
                    />
                  </div>
                </div>

                {/* Checklist area */}
                <div className="mb-3">
                  <label className="form-label d-block">
                    Checklist keselamatan – Area
                  </label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="areaPerifer"
                      checked={form.areaPerifer}
                      onChange={handleChange("areaPerifer")}
                    />
                    <label className="form-check-label" htmlFor="areaPerifer">
                      (A) Area Perifer (Pinggiran)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="areaFabrikasi"
                      checked={form.areaFabrikasi}
                      onChange={handleChange("areaFabrikasi")}
                    />
                    <label className="form-check-label" htmlFor="areaFabrikasi">
                      (B) Area Fabrikasi / Bekisting
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="areaTopFloor"
                      checked={form.areaTopFloor}
                      onChange={handleChange("areaTopFloor")}
                    />
                    <label className="form-check-label" htmlFor="areaTopFloor">
                      (C) Area Top Floor
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist keselamatan 16 poin */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0">
                <h2 className="h6 mb-0">
                  Sebelum pekerjaan disetujui, semua checklist di bawah ini harus diisi.
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
                        "Apakah pekerja tidak mengalami gangguan keseimbangan?",
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
                        "chkSafetyLineDeckInstalled",
                        "Apakah safety line dan safety deck sudah terpasang?",
                        10
                      )}
                      {yesNoRow(
                        "chkSlingCapacityCalculated",
                        "Apakah kapasitas beban seling sudah diperhitungkan?",
                        11
                      )}
                      {yesNoRow(
                        "chkMobileCraneInspected",
                        "Apakah mobile crane sudah diinspeksi dan layak pakai?",
                        12
                      )}
                      {yesNoRow(
                        "chkLiftingEquipmentInspected",
                        "Apakah peralatan untuk mengangkat sudah diinspeksi dan layak pakai?",
                        13
                      )}
                      {yesNoRow(
                        "chkCraneSlingInspected",
                        "Apakah seling crane untuk mengangkat sudah diinspeksi dan layak pakai?",
                        14
                      )}
                      {yesNoRow(
                        "chkSmallMaterialBucketProvided",
                        "Apakah terdapat peralatan seperti bucket untuk mengangkat material kecil?",
                        15
                      )}
                      {yesNoRow(
                        "chkAreaBelowClear",
                        "Apakah area pekerjaan sudah dibersihkan dan area di bawahnya bebas dari area kerja dan lalu lintas orang?",
                        16
                      )}
                    </tbody>
                  </table>
                </div>

                {/* APD */}
                <div className="mb-3">
                  <label className="form-label d-block">Alat Pelindung Diri</label>
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
                      placeholder="APD lain (misalnya rompi reflektif, goggles, dll.)"
                      value={form.apdOthers}
                      onChange={handleChange("apdOthers")}
                    />
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
                    placeholder="Contoh: Pengangkatan dilakukan di luar jam kerja utama, area sekitar sudah dibersihkan."
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
                      : "Simpan Form Izin Kerja Pekerjaan Mengangkat"}
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
                <h2 className="h6 mb-0">Alur singkat izin kerja mengangkat</h2>
              </div>
              <div className="card-body bg-light">
                <ol className="mb-0" style={{ fontSize: 14 }}>
                  <li>
                    Foreman mengisi form izin kerja mengangkat dan checklist
                    keselamatan, serta melampirkan informasi beban bila diperlukan.
                  </li>
                  <li>
                    SHE Officer memverifikasi kondisi area, rambu, APD, dan
                    kelayakan crane/peralatan angkat.
                  </li>
                  <li>
                    Project Manager / Site Manager memberikan persetujuan
                    sebelum pekerjaan pengangkatan dilaksanakan.
                  </li>
                  <li>
                    Pekerjaan dilaksanakan sesuai ketentuan di dalam izin dengan
                    pengawasan personel yang kompeten.
                  </li>
                  <li>
                    Setelah pekerjaan selesai dan area dinyatakan aman, izin
                    kerja ditutup di sistem dengan dokumentasi yang memadai.
                  </li>
                </ol>
              </div>
            </div>

            {/* Kotak kuning – catatan penting */}
            <div className="card shadow-sm border-warning">
              <div className="card-header bg-warning text-dark py-2">
                <h2 className="h6 mb-0">
                  Catatan penting pekerjaan mengangkat
                </h2>
              </div>
              <div className="card-body bg-light">
                <ul className="mb-0" style={{ fontSize: 13, paddingLeft: 18 }}>
                  <li>
                    Jangan pernah mengizinkan orang berada di bawah beban yang
                    sedang diangkat.
                  </li>
                  <li>
                    Perubahan kecil pada kondisi tanah, kemiringan, atau halangan
                    di sekitar crane dapat mempengaruhi stabilitas secara signifikan.
                  </li>
                  <li>
                    Komunikasi antara operator dan pekerja di lapangan harus jelas
                    dan menggunakan isyarat yang disepakati.
                  </li>
                  <li>
                    Status tanda tangan pada form kertas digantikan oleh status
                    digital di sistem (Draft, Diverifikasi, Disetujui, Ditutup).
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
