// src/pages/Equipment.tsx
export default function Equipment() {
  return (
    <>
      <h1 className="h4 mb-3">Equipment & Alat Pelindung Diri (APD)</h1>

      {/* Banner ringkas */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body bg-dark text-white d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div>
            <h2 className="h6 mb-1">Peran APD dalam Izin Kerja</h2>
            <p className="mb-0" style={{ fontSize: 13 }}>
              Semua pekerjaan berisiko tinggi (kerja di ketinggian, ruang
              terbatas, lifting, instalasi Tower Crane, dan pekerjaan
              berpotensi kebakaran/ledakan) wajib menggunakan APD sesuai
              yang tercantum pada Form Izin Kerja.
            </p>
          </div>
          <div className="mt-3 mt-md-0 text-md-end">
            <span className="badge bg-success mb-1">Safety First</span>
            <p className="mb-0" style={{ fontSize: 12 }}>
              Form Izin Kerja & JSA menjadi dasar penentuan APD yang wajib.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {/* Kategori APD */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0">Kategori APD yang digunakan</h2>
              <span className="badge bg-primary">Referensi umum</span>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush" style={{ fontSize: 14 }}>
                <li className="list-group-item px-0">
                  <strong>Pelindung kepala</strong>
                  <br />
                  <span className="text-muted">
                    Helm proyek untuk melindungi dari benturan dan benda jatuh di
                    area kerja konstruksi.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Pelindung jatuh dari ketinggian</strong>
                  <br />
                  <span className="text-muted">
                    Safety belt dan body harness yang dipasang pada titik
                    anchorage yang kuat, terutama untuk kerja di ketinggian dan
                    instalasi/segmen Tower Crane.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Pelindung tangan</strong>
                  <br />
                  <span className="text-muted">
                    Sarung tangan kerja untuk melindungi dari goresan, panas,
                    permukaan tajam, atau paparan bahan kimia tertentu.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Pelindung kaki</strong>
                  <br />
                  <span className="text-muted">
                    Sepatu safety dengan sol anti-selip dan pelindung jari kaki,
                    digunakan di seluruh area proyek.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Pelindung pernapasan</strong>
                  <br />
                  <span className="text-muted">
                    Masker atau respirator pada pekerjaan ruang terbatas, area
                    berdebu, atau yang berpotensi terpapar uap/gas berbahaya.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Pelindung mata &amp; wajah</strong>
                  <br />
                  <span className="text-muted">
                    Kacamata pengaman (safety goggles) untuk menghindari
                    percikan partikel, debu, atau bahan kimia ke arah mata.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>APD tambahan</strong>
                  <br />
                  <span className="text-muted">
                    Rompi reflektif, pelindung pendengaran, dan APD lain yang
                    ditentukan berdasarkan hasil analisis bahaya (JSA) dan
                    jenis izin kerja.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Checklist kesiapan APD */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0">Checklist kesiapan APD</h2>
              <span className="badge bg-warning text-dark">
                Sebelum pekerjaan dimulai
              </span>
            </div>
            <div className="card-body">
              <p className="text-muted" style={{ fontSize: 13 }}>
                Ringkasan poin penting yang sering muncul pada checklist di
                berbagai Form Izin Kerja:
              </p>
              <ol className="mb-3" style={{ fontSize: 14, paddingLeft: 18 }}>
                <li>
                  APD yang digunakan sudah <strong>diinspeksi</strong> dan dalam
                  kondisi layak pakai (tidak rusak, sobek, atau aus berlebihan).
                </li>
                <li>
                  Pekerja sudah <strong>memakai APD lengkap</strong> sebelum
                  masuk area kerja (ketinggian, ruang terbatas, lifting,
                  dsb.).
                </li>
                <li>
                  Jenis APD sesuai dengan <strong>jenis izin kerja</strong> dan
                  hasil analisis bahaya (JSA), misalnya penggunaan respirator
                  pada ruang terbatas dengan risiko gas.
                </li>
                <li>
                  Untuk pekerjaan di ketinggian, body harness / safety belt
                  sudah terhubung ke <strong>anchorage yang aman</strong> dan
                  tidak digunakan pada titik sementara yang tidak kuat.
                </li>
                <li>
                  Bila menggunakan bahan kimia B3, APD mengacu pada{" "}
                  <strong>Material Safety Data Sheet (MSDS)</strong> yang
                  tercantum pada dokumen bahan tersebut.
                </li>
              </ol>

              <small className="text-muted d-block" style={{ fontSize: 12 }}>
                Catatan: checklist detail tetap mengacu pada setiap Form Izin
                Kerja (Kerja di Ketinggian, Ruang Terbatas, Hot Work, Lifting,
                dan Tower Crane) serta prosedur K3 perusahaan.
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan APD per jenis izin kerja */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <h2 className="h6 mb-0">Ringkasan APD per jenis Izin Kerja</h2>
          <span className="badge bg-info text-dark">Panduan cepat</span>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "28%" }}>Jenis pekerjaan</th>
                  <th>APD minimal yang direkomendasikan</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13 }}>
                <tr>
                  <td>Kerja di ketinggian</td>
                  <td>
                    Helm, sarung tangan, sepatu safety, safety belt / body
                    harness, dan APD lain sesuai hasil JSA (misalnya rompi
                    reflektif, pelindung mata).
                  </td>
                </tr>
                <tr>
                  <td>Ruang terbatas (confined space)</td>
                  <td>
                    Masker/respirator, sarung tangan, helm, sepatu safety,
                    kacamata pengaman, serta APD khusus bila menggunakan bahan
                    kimia B3 sesuai MSDS.
                  </td>
                </tr>
                <tr>
                  <td>
                    Pekerjaan berpotensi kebakaran &amp; ledakan (Hot Work)
                  </td>
                  <td>
                    Helm, sarung tangan, sepatu safety, pelindung mata, pakaian
                    kerja yang tidak mudah terbakar, dan pelindung pernapasan
                    bila terdapat asap/hasil pembakaran.
                  </td>
                </tr>
                <tr>
                  <td>Pekerjaan mengangkat (Lifting)</td>
                  <td>
                    Helm, sarung tangan, sepatu safety, rompi reflektif; posisi
                    pekerja diatur di luar area bahaya beban dan jalur ayunan.
                  </td>
                </tr>
                <tr>
                  <td>
                    Instalasi &amp; segmen Tower Crane (TC)
                  </td>
                  <td>
                    Helm, body harness / safety belt, sarung tangan, sepatu
                    safety, serta perlindungan jatuh lainnya sesuai prosedur
                    instalasi dan izin kerja terkait.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <small className="text-muted d-block mt-2" style={{ fontSize: 12 }}>
            Ringkasan ini disusun berdasarkan daftar APD yang tercantum dalam
            dokumen Form Izin Kerja. Implementasi di lapangan harus tetap
            mengacu pada prosedur K3 dan regulasi yang berlaku di perusahaan.
          </small>
        </div>
      </div>
    </>
  );
}
