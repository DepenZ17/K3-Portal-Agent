import { useState } from "react";
import api from "../../services/api";
import type { WorkPermitTowerCrane } from "../../types/WorkPermitTowerCrane";
import type { YesNo } from "../../types/common";

export default function WorkPermitTowerCraneForm() {
  const [form, setForm] = useState<WorkPermitTowerCrane>({
    project: "",
    date: "",
    location: "",
    description: "",
    equipment: "",
    timeFrom: "",
    timeTo: "",
    responsible: "",
    workersCount: "",

    areaTowerCrane: false,
    areaTopFloor: false,

    chkSpkSigned: "",
    chkResponsibleAssigned: "",
    chkWeatherGood: "",
    chkTrainingTC: "",
    chkPpePrepared: "",
    chkSafetyInduction: "",
    chkExperienced: "",
    chkNoBalanceIssue: "",
    chkAreaFreeFromElectric: "",
    chkSignsInstalled: "",
    chkSafetyLineInstalled: "",
    chkTcBeltInspected: "",
    chkMobileCraneInspected: "",
    chkEquipmentInspected: "",
    chkCraneSlingInspected: "",

    apdHelmet: false,
    apdBodyHarness: false,
    apdGloves: false,
    apdOthers: "",

    notes: "",
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof WorkPermitTowerCrane) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === "checkbox" ? target.checked : target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value as any,
      }));
    };

  const handleYesNo =
    (field: keyof WorkPermitTowerCrane, value: YesNo) => () => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const yesNoRow = (
    field: keyof WorkPermitTowerCrane,
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
    if (e.target.files) setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // sementara kirim JSON; nanti kalau mau kirim foto pakai FormData
      await api.post("/work-permit/tower-crane/", form);
      alert("Form Izin Kerja Instalasi & Segmen Tower Crane (TC) berhasil disimpan.");
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
        Form Izin Kerja Instalasi & Segmen Tower Crane (TC)
        <span className="badge bg-info text-dark">Pemasangan TC</span>
      </h1>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Izin diajukan apabila akan melakukan pekerjaan pemasangan Tower Crane (TC).
        Diajukan 24 jam sebelum pekerjaan dan harus mendapat persetujuan Project Manager.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* KIRI */}
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
                      placeholder="Mobile crane, tools instalasi, dll."
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
                      id="areaTowerCrane"
                      checked={form.areaTowerCrane}
                      onChange={handleChange("areaTowerCrane")}
                    />
                    <label className="form-check-label" htmlFor="areaTowerCrane">
                      (A) Area Tower Crane (TC)
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
                      (B) Area Top Floor
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist keselamatan 15 poin */}
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
                      {yesNoRow("chkSpkSigned", "Apakah SPK / kontrak pekerjaan ini sudah ditandatangani?", 1)}
                      {yesNoRow("chkResponsibleAssigned", "Apakah penanggung jawab pekerjaan sudah ditentukan?", 2)}
                      {yesNoRow("chkWeatherGood", "Apakah cuaca cerah dan tidak mendung (hujan)?", 3)}
                      {yesNoRow("chkTrainingTC", "Apakah sudah pernah ada pelatihan mengenai instalasi Tower Crane (TC)?", 4)}
                      {yesNoRow("chkPpePrepared", "Apakah pekerja sudah memakai dan mempersiapkan APD yang sesuai?", 5)}
                      {yesNoRow("chkSafetyInduction", "Apakah pekerja sudah mendapatkan pengarahan K3 (Safety Induction)?", 6)}
                      {yesNoRow("chkExperienced", "Apakah pekerja mempunyai pengalaman dan kompeten melakukan pekerjaan ini?", 7)}
                      {yesNoRow("chkNoBalanceIssue", "Apakah pekerja tidak mengalami gangguan keseimbangan?", 8)}
                      {yesNoRow("chkAreaFreeFromElectric", "Apakah area instalasi bebas dari segala jenis arus listrik?", 9)}
                      {yesNoRow("chkSignsInstalled", "Apakah rambu-rambu yang diperlukan sudah terpasang?", 10)}
                      {yesNoRow("chkSafetyLineInstalled", "Apakah safety line sudah terpasang?", 11)}
                      {yesNoRow("chkTcBeltInspected", "Apakah sabuk TC sudah diinspeksi dan layak pakai?", 12)}
                      {yesNoRow("chkMobileCraneInspected", "Apakah mobile crane sudah diinspeksi dan layak pakai sehingga tidak akan roboh?", 13)}
                      {yesNoRow("chkEquipmentInspected", "Apakah peralatan yang akan digunakan sudah diinspeksi dan layak pakai?", 14)}
                      {yesNoRow("chkCraneSlingInspected", "Apakah seling crane sudah diinspeksi dan layak pakai?", 15)}
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
                      id="apdBodyHarness"
                      checked={form.apdBodyHarness}
                      onChange={handleChange("apdBodyHarness")}
                    />
                    <label className="form-check-label" htmlFor="apdBodyHarness">
                      Body Harness
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

                  <div className="mt-2">
                    <input
                      className="form-control"
                      placeholder="APD lain (opsional)"
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
                    placeholder="Contoh: area sudah dipasang rambu, safety line terpasang, sumber listrik dipastikan aman."
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
                      {photos.length} file dipilih: {photos.map((f) => f.name).join(", ")}
                    </small>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Form Izin Kerja Instalasi & Segmen Tower Crane (TC)"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* KANAN */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-success mb-3">
              <div className="card-header bg-success text-white py-2">
                <h2 className="h6 mb-0">Alur singkat izin kerja instalasi TC</h2>
              </div>
              <div className="card-body bg-light">
                <ol className="mb-0" style={{ fontSize: 14 }}>
                  <li>Foreman mengisi form + checklist, termasuk area & kelayakan alat.</li>
                  <li>SHE Officer verifikasi kondisi area, rambu, APD, dan safety line.</li>
                  <li>Project Manager / Site Manager memberikan persetujuan sebelum pekerjaan dimulai.</li>
                  <li>Pekerjaan instalasi dilakukan oleh personel kompeten sesuai prosedur.</li>
                  <li>Setelah selesai, izin ditutup di sistem dengan dokumentasi.</li>
                </ol>
              </div>
            </div>

            <div className="card shadow-sm border-warning">
              <div className="card-header bg-warning text-dark py-2">
                <h2 className="h6 mb-0">Catatan penting instalasi TC</h2>
              </div>
              <div className="card-body bg-light">
                <ul className="mb-0" style={{ fontSize: 13, paddingLeft: 18 }}>
                  <li>Pastikan area instalasi bebas dari arus listrik/instalasi listrik aktif.</li>
                  <li>Wajib personel terlatih instalasi TC dan komunikasi kerja jelas.</li>
                  <li>Gunakan Body Harness & pastikan safety line terpasang sebelum bekerja.</li>
                  <li>Pastikan inspeksi: mobile crane, peralatan, dan seling crane.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
