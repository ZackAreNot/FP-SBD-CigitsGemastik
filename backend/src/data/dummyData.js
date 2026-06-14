const divisi = [
  { id_divisi: 1, jenis_perlombaan: 'KOMPETISI', nama_divisi: 'Pemrograman' },
  { id_divisi: 2, jenis_perlombaan: 'KOMPETISI', nama_divisi: 'Keamanan Siber' },
  { id_divisi: 3, jenis_perlombaan: 'KOMPETISI', nama_divisi: 'Penambangan Data' },
  { id_divisi: 4, jenis_perlombaan: 'KOMPETISI', nama_divisi: 'Desain Pengalaman Pengguna' },
  { id_divisi: 5, jenis_perlombaan: 'KOMPETISI', nama_divisi: 'Animasi' },
  { id_divisi: 6, jenis_perlombaan: 'KOMPETISI', nama_divisi: 'Kota Cerdas' },
  { id_divisi: 7, jenis_perlombaan: 'KOMPETISI', nama_divisi: 'Karya Tulis Ilmiah TIK' },
  { id_divisi: 8, jenis_perlombaan: 'KARYA CIPTA', nama_divisi: 'Pengembangan Perangkat Lunak' },
  { id_divisi: 9, jenis_perlombaan: 'KARYA CIPTA', nama_divisi: 'Piranti Cerdas, Sistem Benam, dan IoT' },
  { id_divisi: 10, jenis_perlombaan: 'KARYA CIPTA', nama_divisi: 'Pengembangan Aplikasi Permainan' },
  { id_divisi: 11, jenis_perlombaan: 'KARYA CIPTA', nama_divisi: 'Pengembangan Bisnis TIK' }
];

const dosen = [
  { id_dosen: 1, nama_dosen: 'Dr. Budi Santoso, S.Kom., M.Kom.', nidn: '0010017601', email: 'budi.santoso@its.ac.id' },
  { id_dosen: 2, nama_dosen: 'Dr. Siti Rahmawati, S.T., M.T.', nidn: '0021048202', email: 'siti.rahmawati@its.ac.id' },
  { id_dosen: 3, nama_dosen: 'Prof. Andi Wijaya, S.Kom., M.Sc.', nidn: '0009037003', email: 'andi.wijaya@its.ac.id' },
  { id_dosen: 4, nama_dosen: 'Dewi Lestari, S.Kom., M.Kom.', nidn: '0015088804', email: 'dewi.lestari@its.ac.id' },
  { id_dosen: 5, nama_dosen: 'Rizky Pratama, S.T., M.T.', nidn: '0022128505', email: 'rizky.pratama@its.ac.id' }
];

const soloPendaftar = [];
const timPendaftar = [];

let nextIdAnggota = 1;
let nextIdTim = 1;

const getNextIdAnggota = () => nextIdAnggota++;
const getNextIdTim = () => nextIdTim++;

module.exports = {
  divisi,
  dosen,
  soloPendaftar,
  timPendaftar,
  getNextIdAnggota,
  getNextIdTim
};
