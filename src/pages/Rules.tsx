
// src/pages/Rules.tsx

interface RoleProcedure {
  name: string;
  label: string;
  color: string;
  description: string;
  responsibilities: string[];
}

interface ProcedureStep {
  title: string;
  description: string;
  note?: string;
}

interface Regulation {
  id: number;
  title: string;
  type: string;
  description: string;
  relevance: string;
  url: string;
}

const roleProcedures: RoleProcedure[] = [
  {
    name: "Subkontraktor",
    label: "Pelaksana Pekerjaan",
    color: "primary",
    description:
      "Bertanggung jawab mengidentifikasi bahaya, menyusun penilaian risiko, mengajukan dokumen HIRA dan Izin Kerja, serta memastikan persyaratan keselamatan terpenuhi sebelum pekerjaan dilaksanakan.",
    responsibilities: [
      "Memastikan proyek yang dipilih masih aktif dan merupakan proyek tempatnya terdaftar.",
      "Menyusun dokumen HIRA yang mencakup tahapan pekerjaan, area kerja, kelompok aktivitas, potensi bahaya, risiko, dan tindakan pengendalian.",
      "Melakukan penilaian risiko awal dan risiko sisa untuk setiap aktivitas pekerjaan.",
      "Mengajukan HIRA untuk diperiksa oleh HSE Officer dan Project Manager.",
      "Memperbaiki dan mengajukan kembali dokumen apabila mendapatkan penolakan.",
      "Membuat Izin Kerja dengan mengacu pada HIRA yang telah disetujui.",
      "Memilih aktivitas HIRA yang relevan serta mengisi checklist keselamatan dan kebutuhan APD.",
      "Mengunggah dokumen fit-to-work, sertifikat, dan foto kondisi pekerjaan sebelum dimulai.",
      "Mengirimkan bukti lokasi terkini ketika mengajukan Izin Kerja.",
      "Mengajukan penutupan pekerjaan dengan mengisi evaluasi pasca-pekerjaan dan mengunggah foto setelah pekerjaan selesai."
    ]
  },
  {
    name: "Supervisor",
    label: "Pengawasan Lapangan",
    color: "info",
    description:
      "Bertanggung jawab melakukan pemeriksaan awal terhadap Izin Kerja dan memastikan pekerjaan yang diajukan sesuai dengan kondisi serta persyaratan keselamatan di lapangan.",
    responsibilities: [
      "Memeriksa Izin Kerja yang diajukan pada proyek yang menjadi tanggung jawabnya.",
      "Memeriksa kesesuaian informasi pekerjaan, lokasi, waktu, jumlah pekerja, dan dokumen pendukung.",
      "Memeriksa keterkaitan aktivitas pekerjaan dengan dokumen HIRA yang telah disetujui.",
      "Memastikan persyaratan keselamatan yang tercantum dalam Izin Kerja telah diperhatikan.",
      "Memberikan persetujuan atau penolakan pada tahap Supervisor.",
      "Menyertakan bukti lokasi terkini ketika memberikan persetujuan Izin Kerja.",
      "Memberikan alasan apabila menolak pengajuan agar Subkontraktor dapat melakukan perbaikan."
    ]
  },
  {
    name: "HSE Officer",
    label: "Pemeriksaan dan Verifikasi K3",
    color: "success",
    description:
      "Bertanggung jawab memeriksa aspek keselamatan dan kesehatan kerja dalam dokumen HIRA dan Izin Kerja, termasuk proses verifikasi persyaratan sebelum dan sesudah pekerjaan.",
    responsibilities: [
      "Memeriksa dan memberikan keputusan terhadap HIRA pada tahap HSE Officer.",
      "Memastikan identifikasi bahaya, penilaian risiko, dan pengendalian risiko telah diperhatikan.",
      "Memastikan nilai risiko sisa (Rt) memenuhi batas penerimaan untuk persetujuan HIRA.",
      "Memeriksa Izin Kerja sesuai tahapan persetujuan yang berlaku.",
      "Memberikan persetujuan atau penolakan terhadap Izin Kerja pada tahap HSE Officer.",
      "Mengirimkan bukti lokasi terkini saat menyetujui Izin Kerja.",
      "Memeriksa dan mengonfirmasi permintaan penutupan Izin Kerja.",
      "Menetapkan nomor dokumen HIRA atau Izin Kerja.",
      "Mengirim ulang tautan persetujuan MK apabila diperlukan."
    ]
  },
  {
    name: "Project Manager",
    label: "Persetujuan Manajemen Proyek",
    color: "warning",
    description:
      "Bertanggung jawab melakukan pemeriksaan dan memberikan keputusan pada tahap manajemen proyek untuk memastikan dokumen telah memenuhi persyaratan sebelum pekerjaan dilaksanakan.",
    responsibilities: [
      "Memeriksa HIRA yang telah mendapatkan persetujuan HSE Officer.",
      "Memberikan persetujuan atau penolakan HIRA pada tahap Project Manager.",
      "Memeriksa Izin Kerja yang diteruskan melalui tahapan persetujuan sebelumnya.",
      "Mempertimbangkan kategori risiko, ruang lingkup pekerjaan, dan dokumen pendukung.",
      "Memberikan persetujuan atau penolakan Izin Kerja pada tahap Project Manager apabila diperlukan sesuai kategori risiko.",
      "Memberikan alasan penolakan agar dokumen dapat diperbaiki oleh Subkontraktor.",
      "Meneruskan proses persetujuan kepada MK untuk Izin Kerja dengan kategori risiko Tinggi atau Ekstrem."
    ]
  },
  {
    name: "HSE Coordinator",
    label: "Koordinasi dan Pengendalian HSE",
    color: "danger",
    description:
      "Bertanggung jawab melakukan pengawasan koordinasi dokumen HSE serta pengendalian administrasi dan pembatalan dokumen sesuai kewenangan sistem.",
    responsibilities: [
      "Memantau seluruh dokumen HIRA dan Izin Kerja dari seluruh proyek.",
      "Memantau dokumen yang masih dalam proses pengajuan dan persetujuan.",
      "Melakukan pengawasan terhadap riwayat aktivitas melalui Audit Trail.",
      "Melakukan pembatalan HIRA apabila diperlukan dengan menyertakan alasan.",
      "Melakukan pembatalan Izin Kerja sesuai ketentuan status dokumen.",
      "Menetapkan nomor dokumen HIRA dan Izin Kerja.",
      "Memantau status pengiriman tautan persetujuan MK.",
      "Mengirim ulang tautan persetujuan MK apabila terjadi kendala."
    ]
  }
];

const hiraSteps: ProcedureStep[] = [
  {
    title: "Persiapan dan Identifikasi Pekerjaan",
    description:
      "Subkontraktor menentukan proyek, tahapan pekerjaan (Work Package), area kerja (Work Area), lokasi atau fungsi pekerjaan, dan aktivitas yang akan dilaksanakan."
  },
  {
    title: "Identifikasi Bahaya dan Penilaian Risiko",
    description:
      "Setiap aktivitas diidentifikasi berdasarkan potensi bahaya, risiko atau dampak, tingkat keparahan (Severity), dan kemungkinan (Likelihood)."
  },
  {
    title: "Penetapan Pengendalian Risiko",
    description:
      "Subkontraktor menetapkan tindakan pengendalian yang diperlukan, kategori pengendalian, dan peluang perbaikan untuk mengurangi risiko pekerjaan."
  },
  {
    title: "Pengajuan Dokumen HIRA",
    description:
      "Setelah kelompok dan aktivitas pekerjaan dilengkapi, Subkontraktor mengajukan dokumen HIRA melalui sistem.",
    note:
      "Pengajuan tidak dapat dilakukan apabila dokumen belum memiliki aktivitas atau terdapat kelompok yang belum memiliki aktivitas."
  },
  {
    title: "Pemeriksaan HSE Officer",
    description:
      "HSE Officer memeriksa identifikasi bahaya, penilaian risiko, dan tindakan pengendalian. HSE Officer dapat menyetujui atau menolak dokumen."
  },
  {
    title: "Persetujuan Project Manager",
    description:
      "HIRA yang telah disetujui HSE Officer diteruskan kepada Project Manager untuk pemeriksaan dan keputusan akhir."
  },
  {
    title: "Penyelesaian Dokumen HIRA",
    description:
      "Setelah disetujui oleh kedua approver, status dokumen menjadi Approved dan HIRA dapat digunakan sebagai dasar pengajuan Izin Kerja."
  }
];

const permitSteps: ProcedureStep[] = [
  {
    title: "Pembuatan Izin Kerja",
    description:
      "Subkontraktor memilih proyek aktif dan melengkapi informasi jenis pekerjaan, tanggal, waktu, lokasi, deskripsi, penanggung jawab, jumlah pekerja, dan peralatan yang digunakan."
  },
  {
    title: "Pemilihan Dokumen HIRA",
    description:
      "Subkontraktor memilih satu HIRA yang telah disetujui, berasal dari proyek yang sama, dan dibuat oleh Subkontraktor tersebut. Aktivitas pekerjaan yang relevan dipilih dari dokumen HIRA.",
    note:
      "Minimal satu dan maksimal sepuluh aktivitas dapat dipilih dari satu dokumen HIRA."
  },
  {
    title: "Pemenuhan Persyaratan Keselamatan",
    description:
      "Subkontraktor menentukan area keselamatan, mengisi seluruh pertanyaan checklist, memilih APD, dan melengkapi kebutuhan dokumen pendukung."
  },
  {
    title: "Pengunggahan Dokumen dan Foto",
    description:
      "Subkontraktor mengunggah dokumen medical (fit-to-work), certificate, dan foto kondisi pekerjaan sebelum pekerjaan dimulai.",
    note:
      "Minimal satu PDF medical, satu PDF certificate, dan satu foto before wajib tersedia untuk pengajuan."
  },
  {
    title: "Pengajuan Izin Kerja",
    description:
      "Setelah seluruh persyaratan terpenuhi, Subkontraktor mengirimkan pengajuan Izin Kerja beserta koordinat lokasi terkini."
  },
  {
    title: "Pemeriksaan dan Persetujuan",
    description:
      "Izin Kerja diperiksa secara berurutan oleh pihak yang berwenang berdasarkan kategori risiko awal tertinggi dari aktivitas HIRA yang dipilih."
  },
  {
    title: "Pelaksanaan Pekerjaan",
    description:
      "Setelah seluruh tahapan persetujuan selesai dan status Izin Kerja menjadi Approved, pekerjaan dapat dilaksanakan sesuai ruang lingkup izin dan ketentuan keselamatan yang berlaku."
  },
  {
    title: "Evaluasi Pasca-Pekerjaan",
    description:
      "Setelah pekerjaan selesai, Subkontraktor melakukan evaluasi pasca-pekerjaan dan mengunggah foto kondisi setelah pekerjaan (after)."
  },
  {
    title: "Penutupan Izin Kerja",
    description:
      "Subkontraktor mengajukan permintaan penutupan. HSE Officer melakukan pemeriksaan dan konfirmasi sehingga status dokumen berubah menjadi Closed."
  }
];

const approvalChains = [
  {
    category: "Rendah (R)",
    chain: ["Supervisor"],
    color: "success"
  },
  {
    category: "Menengah (M)",
    chain: ["Supervisor", "HSE Officer"],
    color: "info"
  },
  {
    category: "Tinggi (T)",
    chain: ["Supervisor", "HSE Officer", "Project Manager", "MK"],
    color: "warning"
  },
  {
    category: "Ekstrem (E)",
    chain: ["Supervisor", "HSE Officer", "Project Manager", "MK"],
    color: "danger"
  }
];

const externalRegulations: Regulation[] = [
  {
    id: 1,
    title: "Undang-Undang Nomor 1 Tahun 1970 tentang Keselamatan Kerja",
    type: "Undang-Undang",
    description:
      "Menjadi dasar hukum penyelenggaraan keselamatan kerja di tempat kerja, termasuk pencegahan kecelakaan, pemenuhan persyaratan keselamatan, pembinaan tenaga kerja, dan penggunaan perlindungan kerja.",
    relevance: "Dasar hukum umum K3",
    url:
      "https://jdih.kemnaker.go.id/peraturan/detail/49/undang-undang-nomor-1-tahun-1970"
  },
  {
    id: 2,
    title: "Peraturan Pemerintah Nomor 50 Tahun 2012 tentang Penerapan SMK3",
    type: "Peraturan Pemerintah",
    description:
      "Mengatur penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3), termasuk perencanaan, pelaksanaan, pemantauan, dan evaluasi pengendalian risiko K3.",
    relevance: "Sistem manajemen K3",
    url:
      "https://jdih.kemnaker.go.id/peraturan/detail/58/peraturan-pemerintah-nomor-50-tahun-2012"
  },
  {
    id: 3,
    title: "Permenaker Nomor 9 Tahun 2016 tentang K3 dalam Pekerjaan pada Ketinggian",
    type: "Peraturan Menteri",
    description:
      "Mengatur persyaratan keselamatan dan kesehatan kerja untuk pekerjaan pada ketinggian, termasuk kompetensi tenaga kerja, sistem perlindungan jatuh, peralatan, dan prosedur kerja.",
    relevance: "Relevan langsung dengan Working at Height",
    url:
      "https://jdih.kemnaker.go.id/peraturan/detail/1210/peraturan-menteri-ketenagakerjaan-nomor-9-tahun-2016"
  },
  {
    id: 4,
    title: "Permenaker Nomor 8 Tahun 2010 tentang Alat Pelindung Diri",
    type: "Peraturan Menteri",
    description:
      "Mengatur kewajiban penggunaan APD dan jenis perlindungan yang diperlukan sesuai potensi bahaya di tempat kerja, termasuk pelindung kepala, mata, pernapasan, tangan, kaki, dan alat pelindung jatuh.",
    relevance: "Penggunaan dan pengelolaan APD",
    url:
      "https://jdih.kemnaker.go.id/peraturan/detail/158/peraturan-menteri-nomor-8-tahun-2010"
  },
  {
    id: 5,
    title: "Permenaker Nomor 5 Tahun 2018 tentang K3 Lingkungan Kerja",
    type: "Peraturan Menteri",
    description:
      "Mengatur persyaratan K3 lingkungan kerja, termasuk pengendalian faktor fisika, kimia, biologi, ergonomi, dan psikologi di lingkungan kerja.",
    relevance: "Pengendalian kondisi lingkungan kerja",
    url:
      "https://jdih.kemnaker.go.id/peraturan/detail/1546/peraturan-menteri%20nomor-5-tahun-2018"
  },
  {
    id: 6,
    title: "Permen PUPR Nomor 10 Tahun 2021 tentang Pedoman Sistem Manajemen Keselamatan Konstruksi",
    type: "Peraturan Menteri PUPR",
    description:
      "Menjadi pedoman penerapan Sistem Manajemen Keselamatan Konstruksi (SMKK) dalam penyelenggaraan jasa konstruksi.",
    relevance: "Relevan untuk proyek konstruksi",
    url:
      "https://jdih.pu.go.id/detail-dokumen/PermenPUPR-nomor-10-tahun-2021-Pedoman-Sistem-Manajemen-Keselamatan-Konstruksi"
  },
  {
    id: 7,
    title: "Permenaker Nomor 11 Tahun 2023 tentang K3 di Ruang Terbatas",
    type: "Peraturan Menteri",
    description:
      "Mengatur persyaratan K3 pada pekerjaan di ruang terbatas, termasuk prosedur izin masuk, pengujian atmosfer, isolasi energi, dan kompetensi personel terkait.",
    relevance: "Referensi eksternal; jenis izin belum tersedia di aplikasi",
    url:
      "https://jdih.kemnaker.go.id/peraturan/detail/2412/peraturan-menteri-ketenagakerjaan-nomor-11-tahun-2023"
  }
];

export default function Rules() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-2">
          Prosedur Operasional K3
        </h1>
        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
          Pedoman pelaksanaan Keselamatan dan Kesehatan Kerja (K3)
          dalam kegiatan konstruksi, mulai dari identifikasi bahaya,
          penilaian risiko, pengajuan izin kerja, pengawasan,
          hingga penyelesaian pekerjaan.
        </p>
      </div>

      {/* INTRODUCTION */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body bg-light p-4">
          <div className="d-flex gap-3 align-items-start">
            <div className="text-success fs-3">
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <h2 className="h6 fw-bold mb-2">
                Tujuan dan Ruang Lingkup Prosedur K3
              </h2>
              <p className="text-muted mb-2" style={{ fontSize: 13 }}>
                Prosedur Operasional K3 disusun sebagai pedoman bagi
                seluruh pengguna dalam mengidentifikasi potensi bahaya,
                menentukan pengendalian risiko, memastikan kelengkapan
                persyaratan keselamatan, dan melaksanakan pekerjaan
                berdasarkan izin yang telah disetujui.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success">
                  Identifikasi Bahaya
                </span>
                <span className="badge bg-primary">
                  Penilaian Risiko
                </span>
                <span className="badge bg-info text-dark">
                  Pengendalian K3
                </span>
                <span className="badge bg-secondary">
                  Pengawasan Pekerjaan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCOPE WARNING */}
      <div className="alert alert-info border-0 shadow-sm mb-4">
        <div className="d-flex gap-2">
          <i className="bi bi-info-circle fs-5"></i>
          <div>
            <strong>Ruang lingkup aplikasi</strong>
            <p className="small mb-0 mt-1">
              Alur Izin Kerja yang saat ini tersedia pada sistem adalah
              Izin Kerja Pekerjaan pada Ketinggian (Working at Height).
              Jenis pekerjaan lainnya masih mengikuti prosedur dan
              ketentuan perusahaan yang berlaku di luar alur aplikasi ini.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1 - ROLE PROCEDURES */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <h2 className="h6 fw-bold mb-1">
            1. Prosedur dan Tanggung Jawab Berdasarkan Role
          </h2>
          <p className="text-muted small mb-0">
            Setiap pengguna wajib menjalankan tugas sesuai fungsi
            dan kewenangan masing-masing.
          </p>
        </div>

        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            {roleProcedures.map((role) => (
              <div className="col-12 col-lg-6" key={role.name}>
                <div className="border rounded h-100 p-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                    <h3 className="h6 fw-bold mb-0">
                      {role.name}
                    </h3>
                    <span className={`badge bg-${role.color}`}>
                      {role.label}
                    </span>
                  </div>

                  <p className="text-muted small mb-3">
                    {role.description}
                  </p>

                  <div className="fw-semibold small mb-2">
                    Tanggung Jawab Operasional
                  </div>

                  <ul className="small text-muted ps-3 mb-0">
                    {role.responsibilities.map((item, index) => (
                      <li className="mb-2" key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="alert alert-light border mt-3 mb-0 small">
            <i className="bi bi-info-circle me-2"></i>
            Hak akses pengguna tetap ditentukan oleh role dan
            kebijakan otorisasi pada backend. Halaman ini merupakan
            panduan pelaksanaan, bukan pengaturan hak akses.
          </div>
        </div>
      </div>

      {/* SECTION 2 - HIRA */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <h2 className="h6 fw-bold mb-1">
            2. Prosedur Identifikasi Bahaya dan Penilaian Risiko (HIRA)
          </h2>
          <p className="text-muted small mb-0">
            Alur penyusunan, pemeriksaan, dan persetujuan dokumen HIRA.
          </p>
        </div>

        <div className="card-body p-3 p-md-4">
          <div className="mb-4">
            {hiraSteps.map((step, index) => (
              <div className="d-flex gap-3 mb-4" key={index}>
                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center flex-shrink-0 fw-bold"
                  style={{
                    width: 32,
                    height: 32,
                    fontSize: 13
                  }}
                >
                  {index + 1}
                </div>

                <div className="flex-grow-1">
                  <h3 className="h6 fw-bold mb-1">
                    {step.title}
                  </h3>

                  <p className="small text-muted mb-0">
                    {step.description}
                  </p>

                  {step.note && (
                    <div className="alert alert-warning py-2 px-3 mt-2 mb-0 small">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {step.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RISK CALCULATION */}
          <div className="border rounded p-3 mb-3">
            <h3 className="h6 fw-bold mb-2">
              Ketentuan Penilaian Risiko
            </h3>

            <p className="small text-muted">
              Nilai risiko ditentukan dengan mengalikan tingkat
              keparahan (Severity) dengan kemungkinan (Likelihood).
            </p>

            <div className="bg-light rounded p-3 text-center mb-3">
              <div className="fw-bold">
                Risk = Severity × Likelihood
              </div>
              <small className="text-muted">
                Skala Severity dan Likelihood: 1–5
              </small>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Kategori</th>
                    <th>Nilai Risiko</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge bg-success">R</span></td>
                    <td>≤ 4</td>
                    <td>Rendah</td>
                  </tr>
                  <tr>
                    <td><span className="badge bg-info text-dark">M</span></td>
                    <td>5–9</td>
                    <td>Menengah</td>
                  </tr>
                  <tr>
                    <td><span className="badge bg-warning text-dark">T</span></td>
                    <td>10–16</td>
                    <td>Tinggi</td>
                  </tr>
                  <tr>
                    <td><span className="badge bg-danger">E</span></td>
                    <td>&gt; 16</td>
                    <td>Ekstrem</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="alert alert-danger mb-0">
            <h3 className="h6 fw-bold mb-2">
              Batas Penerimaan Risiko Sisa (Residual Risk)
            </h3>
            <p className="small mb-2">
              Persetujuan HIRA mensyaratkan nilai risiko sisa
              (Residual Risk / Rt) setiap aktivitas tidak lebih
              dari 4.
            </p>
            <span className="badge bg-success">
              Rt ≤ 4 : Dapat disetujui
            </span>
            <span className="badge bg-danger ms-2">
              Rt &gt; 4 : Tidak dapat disetujui
            </span>
            <p className="small mt-2 mb-0">
              Nilai Rt di atas 4 masih dapat disimpan dan diajukan,
              tetapi backend akan menolak persetujuan. Dokumen perlu
              dievaluasi kembali melalui proses penolakan dan
              pengajuan ulang.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3 - WORK PERMIT */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <h2 className="h6 fw-bold mb-1">
            3. Prosedur Pengajuan dan Pelaksanaan Izin Kerja
          </h2>
          <p className="text-muted small mb-0">
            Tahapan pengajuan Izin Kerja oleh Subkontraktor
            sampai dengan pelaksanaan pekerjaan.
          </p>
        </div>

        <div className="card-body p-3 p-md-4">
          {permitSteps.map((step, index) => (
            <div className="d-flex gap-3 mb-4" key={index}>
              <div
                className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center flex-shrink-0 fw-bold"
                style={{
                  width: 32,
                  height: 32,
                  fontSize: 13
                }}
              >
                {index + 1}
              </div>

              <div className="flex-grow-1">
                <h3 className="h6 fw-bold mb-1">
                  {step.title}
                </h3>

                <p className="small text-muted mb-0">
                  {step.description}
                </p>

                {step.note && (
                  <div className="alert alert-warning py-2 px-3 mt-2 mb-0 small">
                    <i className="bi bi-info-circle me-2"></i>
                    {step.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4 - APPROVAL CHAIN */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <h2 className="h6 fw-bold mb-1">
            4. Prosedur Persetujuan Berdasarkan Risiko
          </h2>
          <p className="small text-muted mb-0">
            Jalur persetujuan ditentukan berdasarkan kategori risiko
            awal tertinggi dari seluruh aktivitas HIRA yang dipilih.
          </p>
        </div>

        <div className="card-body p-3 p-md-4">
          {approvalChains.map((item) => (
            <div className="border rounded p-3 mb-3" key={item.category}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className={`badge bg-${item.color}`}>
                  {item.category}
                </span>
                <span className="small text-muted">
                  Jalur persetujuan
                </span>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2">
                {item.chain.map((role, index) => (
                  <div className="d-flex align-items-center gap-2" key={role}>
                    <span className="badge bg-light text-dark border py-2 px-3">
                      {role}
                    </span>
                    {index < item.chain.length - 1 && (
                      <i className="bi bi-arrow-right text-muted"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="alert alert-info mb-0 small">
            <strong>Catatan persetujuan MK:</strong>
            <br />
            Untuk kategori Tinggi dan Ekstrem, persetujuan
            Project Manager dilanjutkan kepada Manajemen
            Konstruksi (MK). MK menerima tautan melalui email
            dan melakukan verifikasi menggunakan kode OTP.
            MK tidak memiliki akun login pada aplikasi.
          </div>
        </div>
      </div>

      {/* SECTION 5 - SUPPORTING REQUIREMENTS */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <h2 className="h6 fw-bold mb-1">
            5. Persyaratan Keselamatan dan Bukti Pendukung
          </h2>
          <p className="small text-muted mb-0">
            Persyaratan yang harus dipenuhi dalam pengajuan
            dan penutupan Izin Kerja.
          </p>
        </div>

        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h3 className="h6 fw-bold mb-3">
                  <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                  Dokumen Pendukung
                </h3>
                <ul className="small text-muted ps-3 mb-0">
                  <li className="mb-2">
                    Minimal satu dokumen medical (fit-to-work).
                  </li>
                  <li className="mb-2">
                    Minimal satu dokumen certificate.
                  </li>
                  <li className="mb-2">Format dokumen PDF.</li>
                  <li className="mb-2">Maksimal 3 MB per file.</li>
                  <li>
                    Maksimal 10 file untuk masing-masing jenis.
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h3 className="h6 fw-bold mb-3">
                  <i className="bi bi-camera text-primary me-2"></i>
                  Bukti Foto Pekerjaan
                </h3>
                <ul className="small text-muted ps-3 mb-0">
                  <li className="mb-2">
                    Foto before sebelum pengajuan Izin Kerja.
                  </li>
                  <li className="mb-2">
                    Foto after sebelum permintaan penutupan.
                  </li>
                  <li className="mb-2">
                    Format JPEG, PNG, atau WebP.
                  </li>
                  <li className="mb-2">Maksimal 5 MB per foto.</li>
                  <li>
                    Maksimal 5 foto untuk setiap tahap.
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h3 className="h6 fw-bold mb-3">
                  <i className="bi bi-geo-alt text-success me-2"></i>
                  Bukti Lokasi
                </h3>
                <ul className="small text-muted ps-3 mb-0">
                  <li className="mb-2">
                    Subkontraktor mengirimkan lokasi saat pengajuan.
                  </li>
                  <li className="mb-2">
                    Supervisor mengirimkan lokasi saat persetujuan.
                  </li>
                  <li>
                    HSE Officer mengirimkan lokasi saat persetujuan.
                  </li>
                </ul>
                <p className="small text-muted mt-3 mb-0">
                  Project Manager dan MK tidak diwajibkan
                  mengirimkan bukti lokasi untuk persetujuan.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h3 className="h6 fw-bold mb-3">
                  <i className="bi bi-clipboard-check text-info me-2"></i>
                  Checklist dan Evaluasi
                </h3>
                <ul className="small text-muted ps-3 mb-0">
                  <li className="mb-2">
                    Seluruh pertanyaan checklist wajib dijawab.
                  </li>
                  <li className="mb-2">
                    Minimal satu area keselamatan dipilih.
                  </li>
                  <li className="mb-2">
                    APD disesuaikan dengan kebutuhan pekerjaan.
                  </li>
                  <li>
                    Evaluasi pasca-pekerjaan wajib diisi
                    sebelum meminta penutupan.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="alert alert-warning mt-3 mb-0 small">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Pengambilan lokasi memerlukan koneksi HTTPS dan
            persetujuan akses lokasi dari browser.
            Sistem menyimpan koordinat yang dikirimkan dan
            tidak memverifikasinya secara otomatis terhadap
            batas lokasi proyek.
          </div>
        </div>
      </div>

      {/* SECTION 6 - REJECTION AND CANCELLATION */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <h2 className="h6 fw-bold mb-1">
            6. Prosedur Penolakan dan Pembatalan
          </h2>
        </div>

        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h3 className="h6 fw-bold text-danger mb-2">
                  Penolakan (Rejection)
                </h3>
                <p className="small text-muted mb-2">
                  Apabila HIRA atau Izin Kerja ditolak oleh
                  approver, status dokumen berubah menjadi Rejected.
                </p>
                <p className="small text-muted mb-0">
                  Subkontraktor dapat memperbaiki dokumen,
                  meninjau kembali penilaian risiko dan
                  persyaratan keselamatan, kemudian mengajukan ulang.
                  Approver wajib memberikan alasan saat melakukan
                  penolakan.
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <h3 className="h6 fw-bold text-warning mb-2">
                  Pembatalan (Cancellation)
                </h3>
                <p className="small text-muted mb-2">
                  HSE Coordinator memiliki kewenangan untuk
                  membatalkan HIRA dan Izin Kerja dengan
                  menyertakan alasan pembatalan.
                </p>
                <p className="small text-muted mb-0">
                  Pembatalan HIRA juga membatalkan Izin Kerja
                  terkait yang belum berstatus Closed atau Cancelled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7 - GENERAL PROVISIONS */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <h2 className="h6 fw-bold mb-1">
            7. Ketentuan Umum Operasional K3
          </h2>
        </div>

        <div className="card-body px-3 px-md-4">
          <ul className="small text-muted ps-3 mb-0">
            <li className="mb-2">
              Pekerjaan wajib mengikuti ruang lingkup Izin Kerja
              yang telah disetujui.
            </li>
            <li className="mb-2">
              HIRA harus telah disetujui sebelum digunakan
              sebagai dasar pengajuan Izin Kerja.
            </li>
            <li className="mb-2">
              Perubahan kondisi pekerjaan perlu dievaluasi
              dan disesuaikan dengan identifikasi bahaya serta
              penilaian risiko.
            </li>
            <li className="mb-2">
              Dokumen yang sedang dalam proses pemeriksaan
              tidak dapat diubah oleh pembuatnya.
            </li>
            <li className="mb-2">
              Proyek tidak aktif bersifat read-only. Pembaruan
              dan pengajuan dokumen tidak dapat dilakukan
              sampai proyek kembali aktif.
            </li>
            <li className="mb-2">
              Setiap persetujuan, penolakan, perubahan,
              dan pembatalan dicatat dalam Audit Trail.
            </li>
            <li>
              Notifikasi digunakan untuk menyampaikan
              informasi pengajuan, keputusan, dan tindakan
              yang perlu dilakukan oleh pengguna.
            </li>
          </ul>
        </div>
      </div>

      {/* SECTION 8 - EXTERNAL REGULATIONS */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 px-3 px-md-4 pt-4">
          <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
            <div>
              <h2 className="h6 fw-bold mb-1">
                8. Dasar Hukum dan Regulasi Eksternal K3
              </h2>
              <p className="small text-muted mb-0">
                Peraturan perundang-undangan yang menjadi
                referensi pelaksanaan keselamatan dan kesehatan
                kerja di Indonesia.
              </p>
            </div>

            <span className="badge bg-primary">
              Referensi Nasional
            </span>
          </div>
        </div>

        <div className="card-body p-3 p-md-4">
          <div className="alert alert-info small">
            <i className="bi bi-info-circle me-2"></i>
            Regulasi berikut merupakan referensi eksternal K3,
            bukan seluruhnya fitur atau jenis pekerjaan yang
            telah tersedia dalam aplikasi.
          </div>

          <div className="d-flex flex-column gap-3">
            {externalRegulations.map((regulation) => (
              <div className="border rounded p-3" key={regulation.id}>
                <div className="d-flex gap-3">
                  <div className="text-primary fs-4 flex-shrink-0">
                    <i className="bi bi-file-earmark-text"></i>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                      <span className="badge bg-light text-dark border">
                        {regulation.type}
                      </span>

                      <span className="badge bg-success">
                        Referensi K3
                      </span>
                    </div>

                    <h3 className="h6 fw-bold mb-2">
                      {regulation.title}
                    </h3>

                    <p className="small text-muted mb-2">
                      {regulation.description}
                    </p>

                    <div className="small mb-2">
                      <strong>Relevansi:</strong>{" "}
                      <span className="text-muted">
                        {regulation.relevance}
                      </span>
                    </div>

                    <a
                      href={regulation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i>
                      Buka Dokumen JDIH
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="alert alert-warning mt-3 mb-0 small">
            <strong>Catatan:</strong> Penerapan regulasi perlu
            disesuaikan dengan jenis pekerjaan, kondisi proyek,
            ketentuan perusahaan, dan perubahan peraturan yang
            berlaku. Untuk pekerjaan yang belum didukung aplikasi,
            tetap gunakan prosedur dan persyaratan K3 khusus
            sesuai peraturan terkait.
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-muted py-4">
        <i className="bi bi-shield-check fs-3 text-success"></i>
        <p className="fw-semibold small mt-2 mb-1">
          Keselamatan Kerja Merupakan Tanggung Jawab Bersama
        </p>
        <p className="small mb-0">
          Prosedur Operasional Keselamatan dan Kesehatan Kerja
          (K3) - Agent Portal
        </p>
      </div>
    </>
  );
}
