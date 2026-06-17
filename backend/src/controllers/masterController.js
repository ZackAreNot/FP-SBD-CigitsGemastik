const db = require('../config/db');

const getDivisi = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id_divisi, jenis_perlombaan, nama_divisi FROM divisi ORDER BY id_divisi'
    );

    res.json({
      success: true,
      message: 'Data divisi berhasil diambil',
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const getDosen = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id_dosen, nama_dosen, nidn, email FROM dosen ORDER BY nama_dosen'
    );

    res.json({
      success: true,
      message: 'Data dosen berhasil diambil',
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const getTimTerverifikasi = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
        t.id_tim,
        fn_GenerateKodeRegistrasi(t.id_tim) AS kode_registrasi,
        t.nama_tim,
        t.id_divisi,
        d.nama_divisi,
        d.jenis_perlombaan,
        dosen.nama_dosen,
        t.judul,
        DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
        fn_GetJumlahAnggota(t.id_tim) AS jumlah_anggota
      FROM tim t
      JOIN divisi d ON d.id_divisi = t.id_divisi
      JOIN dosen ON dosen.id_dosen = t.id_dosen
      WHERE t.status_pendaftaran = 'TERKONFIRMASI'
      ORDER BY d.id_divisi, t.nama_tim`
    );

    res.json({
      success: true,
      message: 'Data tim terverifikasi berhasil diambil',
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

const getTimDitolak = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
        t.id_tim,
        fn_GenerateKodeRegistrasi(t.id_tim) AS kode_registrasi,
        t.nama_tim,
        t.id_divisi,
        d.nama_divisi,
        d.jenis_perlombaan,
        dosen.nama_dosen,
        t.judul,
        DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
        t.komentar_penolakan,
        fn_GetJumlahAnggota(t.id_tim) AS jumlah_anggota
      FROM tim t
      JOIN divisi d ON d.id_divisi = t.id_divisi
      JOIN dosen ON dosen.id_dosen = t.id_dosen
      WHERE t.status_pendaftaran = 'DITOLAK'
      ORDER BY d.id_divisi, t.nama_tim`
    );

    res.json({
      success: true,
      message: 'Data tim ditolak berhasil diambil',
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDivisi,
  getDosen,
  getTimTerverifikasi,
  getTimDitolak
};
