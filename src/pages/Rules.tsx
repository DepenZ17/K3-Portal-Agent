// src/pages/Rules.tsx
import { useAuth } from "../hooks/useAuth";

export default function Rules() {
  const { user } = useAuth();
  
  const currentRole = user?.role || "";
  
  // Memasukkan 4 role lain selain subcontractor yang memiliki hak akses edit
  const canEdit = [
    "she_officer",
    "she_coordinator",
    "supervisor",
    "project_manager"
  ].includes(currentRole);

  return (
    <>
      <h1 className="h4 mb-2">Rule &amp; Law K3 Proyek</h1>
      <p className="text-muted mb-4" style={{ fontSize: 14 }}>
        Halaman ini merangkum regulasi, standar, dan prosedur K3 yang menjadi
        dasar penerapan Izin Kerja Pekerjaan Berisiko Tinggi. Foreman dapat
        menggunakan halaman ini sebagai referensi, sementara SHE Officer dan
        Project Manager menggunakannya sebagai acuan verifikasi dan persetujuan.
      </p>

      {/* Banner ringkas */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body bg-light d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div>
            <h2 className="h6 mb-1">Regulasi sebagai dasar Izin Kerja</h2>
            <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
              Setiap form Izin Kerja (Kerja di Ketinggian, Ruang Terbatas,
              Lifting, Hot Work, Tower Crane) harus mengacu pada ketentuan K3
              yang berlaku, baik dari peraturan nasional maupun prosedur
              internal perusahaan.
            </p>
          </div>
          <div className="mt-3 mt-md-0 text-md-end">
            <span className="badge bg-success mb-1">Compliance &amp; Safety</span>
            <p className="mb-0 text-muted" style={{ fontSize: 12 }}>
              Pastikan pekerjaan tidak hanya “aman”, tapi juga “patuh aturan”.
            </p>
          </div>
        </div>
      </div>

      {/* Dua kolom info */}
      <div className="row g-3 mb-3">
        {/* Hierarki aturan K3 */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0">Hierarki aturan &amp; standar K3</h2>
              <span className="badge bg-primary">Rujukan umum</span>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush" style={{ fontSize: 14 }}>
                <li className="list-group-item px-0">
                  <strong>Regulasi nasional</strong>
                  <br />
                  <span className="text-muted">
                    Undang-undang dan peraturan pemerintah yang mengatur
                    keselamatan dan kesehatan kerja, misalnya ketentuan umum
                    keselamatan kerja di tempat kerja dan proyek konstruksi.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Peraturan turunan &amp; standar teknis</strong>
                  <br />
                  <span className="text-muted">
                    Peraturan menteri, standar teknis, dan pedoman yang
                    mengatur lebih detail, seperti penggunaan APD, pekerjaan
                    pada ketinggian, pengelolaan bahan kimia B3, dan ruang
                    terbatas.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Prosedur &amp; instruksi kerja perusahaan</strong>
                  <br />
                  <span className="text-muted">
                    Prosedur Izin Kerja Pekerjaan Berisiko Tinggi (kerja di
                    ketinggian, ruang terbatas, lifting, hot work, Tower
                    Crane), instruksi kerja, dan standar internal yang
                    disesuaikan dengan kondisi proyek.
                  </span>
                </li>
                <li className="list-group-item px-0">
                  <strong>Form &amp; checklist lapangan</strong>
                  <br />
                  <span className="text-muted">
                    Form Izin Kerja, JSA, checklist APD, dan berita acara
                    pemeriksaan yang digunakan sebagai bukti tertulis bahwa
                    pengendalian bahaya telah dilakukan.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Peran halaman + hak akses */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h2 className="h6 mb-0">Peran halaman Rule &amp; Law</h2>
              <span className="badge bg-warning text-dark">
                Informasi &amp; referensi
              </span>
            </div>
            <div className="card-body">
              <p className="text-muted" style={{ fontSize: 13 }}>
                Halaman ini membantu setiap peran memahami dasar aturan dari
                proses Izin Kerja:
              </p>
              <ul className="mb-3" style={{ fontSize: 14 }}>
                <li>
                  <strong>Foreman</strong> – mengerti kenapa checklist di Form
                  Izin Kerja harus diisi dan APD tertentu wajib digunakan.
                </li>
                <li>
                  <strong>SHE Officer</strong> – memastikan verifikasi mengacu
                  pada prosedur dan peraturan yang tertulis, bukan hanya
                  kebiasaan di lapangan.
                </li>
                <li>
                  <strong>Project Manager</strong> – memiliki dasar kuat saat
                  menyetujui (approve) pekerjaan berisiko tinggi.
                </li>
              </ul>

              <div className="border rounded p-2 bg-light mb-2">
                <p className="mb-1" style={{ fontSize: 13 }}>
                  <strong>Akses pengelolaan dokumen:</strong>
                </p>
                <ul className="mb-0" style={{ fontSize: 13, paddingLeft: 18 }}>
                  <li>Semua role dapat melihat daftar dokumen.</li>
                  <li>
                    Hanya <strong>SHE Officer</strong> dan{" "}
                    <strong>Project Manager</strong> yang dapat menambah atau
                    memperbarui daftar dokumen di sistem.
                  </li>
                </ul>
              </div>

              {canEdit && (
                <div className="d-flex justify-content-end">
                  {/* Nanti bisa dihubungkan ke modal / halaman manajemen dokumen */}
                  <button className="btn btn-sm btn-primary">
                    Tambah / Edit Dokumen
                  </button>
                </div>
              )}
              {!canEdit && (
                <small className="text-muted d-block mt-1" style={{ fontSize: 12 }}>
                  Untuk perubahan daftar dokumen, silakan hubungi SHE Officer
                  atau Project Manager.
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan dokumen K3 (placeholder yang terstruktur) */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <h2 className="h6 mb-0">Daftar Dokumen K3 Terkait Izin Kerja</h2>
          <span className="badge bg-info text-dark">Daftar referensi</span>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "30%" }}>Nama dokumen</th>
                  <th style={{ width: "22%" }}>Jenis</th>
                  <th>Berlaku untuk</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13 }}>
                <tr>
                  <td>
                    Prosedur Izin Kerja Pekerjaan Berisiko Tinggi
                  </td>
                  <td>Prosedur internal</td>
                  <td>
                    Kerja di ketinggian, ruang terbatas, pekerjaan mengangkat,
                    pekerjaan berpotensi kebakaran &amp; ledakan, instalasi
                    dan segmen Tower Crane.
                  </td>
                </tr>
                <tr>
                  <td>
                    Petunjuk Penggunaan APD pada Pekerjaan Konstruksi
                  </td>
                  <td>Panduan internal</td>
                  <td>
                    Semua pekerjaan yang tercakup dalam Izin Kerja, termasuk
                    penentuan APD minimal sesuai risiko dan hasil JSA.
                  </td>
                </tr>
                <tr>
                  <td>
                    Prosedur Pekerjaan di Ruang Terbatas (Confined Space)
                  </td>
                  <td>Prosedur khusus</td>
                  <td>
                    Penggalian, perbaikan alat dalam ruang tertutup, dan
                    pekerjaan lain yang dikategorikan sebagai ruang terbatas.
                  </td>
                </tr>
                <tr>
                  <td>
                    Prosedur Pekerjaan di Ketinggian
                  </td>
                  <td>Prosedur khusus</td>
                  <td>
                    Pekerjaan di tepi lantai, area perifer, corewall, tower,
                    atau area lain dengan risiko jatuh.
                  </td>
                </tr>
                <tr>
                  <td>
                    Prosedur Pekerjaan Mengangkat (Lifting Operation)
                  </td>
                  <td>Prosedur khusus</td>
                  <td>
                    Operasi crane, hoist, dan alat angkat lainnya, termasuk
                    pengaturan area aman dan komunikasi antar pihak terkait.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <small className="text-muted d-block mt-2" style={{ fontSize: 12 }}>
            Daftar di atas dapat disesuaikan dengan dokumen resmi yang digunakan
            di perusahaan. Sistem ini dapat dikembangkan untuk menyimpan file,
            link, ataupun nomor dokumen resmi sebagai rujukan saat proses Izin
            Kerja dilakukan.
          </small>
        </div>
      </div>
    </>
  );
}
