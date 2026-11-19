
// src/pages/WorkPermitMenu.tsx

import { useNavigate } from "react-router-dom";

interface PermitMenuItem {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  route: string;
  available: boolean;
  code: string;
}

const permitTypes: PermitMenuItem[] = [
  {
    code: "WAH",
    title: "Pekerjaan pada Ketinggian",
    subtitle: "Working at Height",
    description:
      "Izin pekerjaan yang dilakukan pada ketinggian dengan potensi bahaya jatuh dan risiko keselamatan lainnya.",
    icon: "bi-arrow-up-square",
    route: "/work-permit/height",
    available: true,
  },
  {
    code: "CS",
    title: "Pekerjaan Ruang Terbatas",
    subtitle: "Confined Space",
    description:
      "Izin pekerjaan di ruang terbatas dengan potensi bahaya atmosfer, kekurangan oksigen, dan akses terbatas.",
    icon: "bi-door-closed",
    route: "/work-permit/confined-space",
    available: false,
  },
  {
    code: "HW",
    title: "Pekerjaan Panas",
    subtitle: "Hot Work",
    description:
      "Izin pekerjaan yang menghasilkan panas, percikan api, atau sumber penyalaan yang berpotensi menyebabkan kebakaran.",
    icon: "bi-fire",
    route: "/work-permit/hot-work",
    available: false,
  },
  {
    code: "LFT",
    title: "Pekerjaan Pengangkatan",
    subtitle: "Lifting",
    description:
      "Izin kegiatan pemindahan dan pengangkatan material menggunakan peralatan angkat.",
    icon: "bi-box-seam",
    route: "/work-permit/lifting",
    available: false,
  },
  {
    code: "TC",
    title: "Pekerjaan Tower Crane",
    subtitle: "Tower Crane",
    description:
      "Izin pekerjaan pemasangan, pembongkaran, dan kegiatan terkait instalasi Tower Crane.",
    icon: "bi-building",
    route: "/work-permit/tower-crane",
    available: false,
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Pengajuan",
    description:
      "Subkontraktor memilih HIRA yang telah disetujui, menentukan aktivitas pekerjaan, melengkapi checklist, dokumen, foto sebelum bekerja, dan lokasi GPS.",
  },
  {
    number: "02",
    title: "Pemeriksaan",
    description:
      "Pengajuan diperiksa oleh Supervisor dan dilanjutkan kepada petugas terkait sesuai kategori risiko pekerjaan.",
  },
  {
    number: "03",
    title: "Persetujuan",
    description:
      "Izin disetujui melalui tahapan otorisasi berdasarkan kategori risiko awal pekerjaan.",
  },
  {
    number: "04",
    title: "Pelaksanaan",
    description:
      "Pekerjaan dapat dilaksanakan setelah seluruh tahapan persetujuan selesai.",
  },
  {
    number: "05",
    title: "Penutupan",
    description:
      "Subkontraktor mengajukan penutupan dengan evaluasi pascapekerjaan dan foto setelah bekerja. HSE Officer melakukan konfirmasi hingga status izin menjadi Closed.",
  },
];

export default function WorkPermitMenu() {
  const navigate = useNavigate();

  const availableCount = permitTypes.filter(
    (item) => item.available
  ).length;

  return (
    <div className="container-fluid px-0">

      {/* PAGE HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-shield-check text-success"></i>
            <span className="text-success fw-semibold small text-uppercase">
              Work Permit Management
            </span>
          </div>

          <h1 className="h4 fw-bold text-dark mb-2">
            Izin Kerja Berisiko Tinggi
          </h1>

          <p className="text-muted mb-0" style={{ fontSize: 14 }}>
            Pilih jenis pekerjaan untuk membuat pengajuan izin kerja
            sesuai prosedur keselamatan dan kesehatan kerja (K3).
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center gap-2"
          onClick={() => navigate("/work-permit/list")}
        >
          <i className="bi bi-list-ul"></i>
          Lihat Semua Izin
        </button>
      </div>

      {/* INFORMATION BANNER */}
      <div className="card border-0 shadow-sm mb-4 overflow-hidden">
        <div className="card-body p-3 p-md-4">
          <div className="row align-items-center g-3">
            <div className="col-auto">
              <div
                className="rounded-3 bg-success bg-opacity-10 d-flex align-items-center justify-content-center"
                style={{ width: 54, height: 54 }}
              >
                <i className="bi bi-shield-fill-check text-success fs-2"></i>
              </div>
            </div>

            <div className="col">
              <h2 className="h6 fw-bold text-dark mb-1">
                Pastikan Keselamatan Sebelum Bekerja
              </h2>

              <p className="text-muted small mb-0">
                Setiap pengajuan Izin Kerja wajib mengacu pada
                dokumen HIRA yang telah disetujui dan memenuhi
                seluruh persyaratan keselamatan pekerjaan.
              </p>
            </div>

            <div className="col-12 col-lg-auto">
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle py-2 px-3">
                  <i className="bi bi-check-circle me-1"></i>
                  HIRA
                </span>

                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle py-2 px-3">
                  <i className="bi bi-clipboard-check me-1"></i>
                  Checklist K3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PERMIT TYPE HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="h6 fw-bold text-dark mb-1">
            Pilih Jenis Pekerjaan
          </h2>

          <p className="text-muted small mb-0">
            Pilih formulir berdasarkan aktivitas pekerjaan.
          </p>
        </div>

        <span className="badge bg-light text-dark border px-3 py-2">
          {availableCount} dari {permitTypes.length} tersedia
        </span>
      </div>

      {/* PERMIT CARDS */}
      <div className="row g-3 mb-4">
        {permitTypes.map((item) => (
          <div className="col-12 col-sm-6 col-xl-4" key={item.code}>
            <div
              className={`card h-100 border shadow-sm ${
                item.available
                  ? "border-success"
                  : "border-light"
              }`}
              style={{
                opacity: item.available ? 1 : 0.75,
                transition: "transform .2s ease, box-shadow .2s ease",
              }}
            >
              <div className="card-body p-3 p-md-4 d-flex flex-column">

                {/* CARD TOP */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className={`rounded-3 d-flex align-items-center justify-content-center ${
                      item.available
                        ? "bg-success bg-opacity-10 text-success"
                        : "bg-light text-secondary"
                    }`}
                    style={{ width: 52, height: 52 }}
                  >
                    <i className={`bi ${item.icon} fs-3`}></i>
                  </div>

                  <span
                    className={`badge ${
                      item.available
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {item.available
                      ? "Tersedia"
                      : "Belum Tersedia"}
                  </span>
                </div>

                {/* CARD CONTENT */}
                <div className="mb-3">
                  <div className="text-muted small fw-semibold mb-1">
                    {item.code}
                  </div>

                  <h3 className="h6 fw-bold text-dark mb-1">
                    {item.title}
                  </h3>

                  <div className="small text-success fw-semibold mb-2">
                    {item.subtitle}
                  </div>

                  <p className="text-muted small mb-0">
                    {item.description}
                  </p>
                </div>

                {/* CARD ACTION */}
                <div className="mt-auto pt-3 border-top">
                  <button
                    type="button"
                    className={`btn btn-sm w-100 d-flex justify-content-center align-items-center gap-2 ${
                      item.available
                        ? "btn-success"
                        : "btn-light text-muted"
                    }`}
                    disabled={!item.available}
                    onClick={() => navigate(item.route)}
                  >
                    {item.available ? (
                      <>
                        Buat Izin Kerja
                        <i className="bi bi-arrow-right"></i>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-lock"></i>
                        Segera Tersedia
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
  <h2 className="h5 mb-3">Alur Proses Izin Kerja</h2>

  <div className="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-3">
    {workflowSteps.map((step) => (
      <div className="col" key={step.number}>
        <div className="card h-100 border shadow-sm">
          <div className="card-body">
            <div className="text-success fw-bold small mb-2">
              TAHAP {step.number}
            </div>
            <h3 className="h6 fw-semibold">{step.title}</h3>
            <p className="text-muted small mb-0">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
  </div>
      {/* FOOTER NOTE */}
      <div className="d-flex align-items-start gap-2 px-1 mb-3">
        <i className="bi bi-info-circle text-primary mt-1"></i>

        <p className="text-muted small mb-0">
          Pastikan seluruh informasi pekerjaan, dokumen pendukung,
          checklist keselamatan, dan bukti lapangan telah lengkap
          sebelum pengajuan dikirim untuk proses pemeriksaan dan persetujuan.
        </p>
      </div>

    </div>
  );
}
