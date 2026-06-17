const db = require('../config/db');

const getSolo = async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT
        a.id_anggota,
        a.id_divisi_minat,
        a.nama_anggota,
        a.no_whatsapp,
        a.jurusan,
        a.nrp,
        d.nama_divisi
      FROM anggota a
      JOIN divisi d ON d.id_divisi = a.id_divisi_minat
      LEFT JOIN anggota_tim at ON at.id_anggota = a.id_anggota
      WHERE at.id_anggota_tim IS NULL
      ORDER BY a.id_anggota DESC`
    );

    res.json({
      success: true,
      message: 'Data pendaftar solo berhasil diambil',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getTim = async (req, res, next) => {
  try {
    const [data] = await db.query(
      `SELECT
        t.id_tim,
        fn_GenerateKodeRegistrasi(t.id_tim) AS kode_registrasi,
        t.nama_tim,
        t.id_divisi,
        d.nama_divisi,
        dosen.id_dosen,
        dosen.nama_dosen,
        dosen.nidn,
        dosen.email AS email_dosen,
        t.judul,
        DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
        t.komentar_penolakan,
        t.status_pendaftaran AS status,
        fn_GetJumlahAnggota(t.id_tim) AS jumlah_anggota
      FROM tim t
      JOIN divisi d ON d.id_divisi = t.id_divisi
      JOIN dosen ON dosen.id_dosen = t.id_dosen
      ORDER BY t.id_tim DESC`
    );

    res.json({
      success: true,
      message: 'Data tim berhasil diambil',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getDetailTim = async (req, res, next) => {
  const { id } = req.params;

  try {
    const [timRows] = await db.query(
      `SELECT
        t.id_tim,
        fn_GenerateKodeRegistrasi(t.id_tim) AS kode_registrasi,
        t.nama_tim,
        t.id_divisi,
        d.nama_divisi,
        dosen.id_dosen,
        dosen.nama_dosen,
        dosen.nidn,
        dosen.email AS email_dosen,
        t.judul,
        DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
        t.komentar_penolakan,
        t.status_pendaftaran AS status
      FROM tim t
      JOIN divisi d ON d.id_divisi = t.id_divisi
      JOIN dosen ON dosen.id_dosen = t.id_dosen
      WHERE t.id_tim = ?`,
      [Number(id)]
    );

    if (timRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tim tidak ditemukan'
      });
    }

    const [anggota] = await db.query(
      `SELECT
        at.id_anggota_tim,
        at.peran,
        a.id_anggota,
        a.nama_anggota,
        a.nrp,
        a.jurusan,
        a.no_whatsapp
      FROM anggota_tim at
      JOIN anggota a ON a.id_anggota = at.id_anggota
      WHERE at.id_tim = ?
      ORDER BY
        CASE at.peran WHEN 'KETUA' THEN 0 ELSE 1 END,
        at.id_anggota_tim`,
      [Number(id)]
    );

    res.json({
      success: true,
      message: 'Detail tim berhasil diambil',
      data: {
        ...timRows[0],
        anggota
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusTim = async (req, res, next, status) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE tim SET status_pendaftaran = ? WHERE id_tim = ?',
      [status, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tim tidak ditemukan'
      });
    }

    const [rows] = await db.query(
      `SELECT
        t.id_tim,
        t.nama_tim,
        t.status_pendaftaran AS status
      FROM tim t
      WHERE t.id_tim = ?`,
      [Number(id)]
    );

    res.json({
      success: true,
      message: `Status tim berhasil diubah menjadi ${status}`,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const verifikasiTim = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Call the stored procedure instead of just a simple UPDATE
    await db.query('CALL sp_VerifikasiTim(?)', [Number(id)]);

    const [rows] = await db.query(
      `SELECT
        t.id_tim,
        t.nama_tim,
        t.status_pendaftaran AS status
      FROM tim t
      WHERE t.id_tim = ?`,
      [Number(id)]
    );

    res.json({
      success: true,
      message: `Status tim berhasil diubah menjadi TERKONFIRMASI`,
      data: rows[0]
    });
  } catch (error) {
    // Catch custom SIGNAL errors from stored procedure
    if (error.sqlState === '45000') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const tolakTim = async (req, res, next) => {
  const { id } = req.params;
  const { komentar_penolakan } = req.body;

  if (!komentar_penolakan || String(komentar_penolakan).trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Komentar penolakan wajib diisi'
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE tim
       SET status_pendaftaran = 'DITOLAK',
           komentar_penolakan = ?
       WHERE id_tim = ?`,
      [String(komentar_penolakan).trim(), Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tim tidak ditemukan'
      });
    }

    const [rows] = await db.query(
      `SELECT
        t.id_tim,
        t.nama_tim,
        t.status_pendaftaran AS status,
        t.komentar_penolakan
      FROM tim t
      WHERE t.id_tim = ?`,
      [Number(id)]
    );

    res.json({
      success: true,
      message: 'Status tim berhasil diubah menjadi DITOLAK',
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [rows] = await db.query('CALL sp_GetDashboardStats()');
    // SP returns result in the first element of the array
    const stats = rows[0][0]; 

    res.json({
      success: true,
      message: 'Dashboard stats berhasil diambil',
      data: {
        total_solo: stats.total_solo,
        total_tim: stats.total_tim,
        tim_menunggu: stats.tim_menunggu,
        tim_terkonfirmasi: stats.tim_terkonfirmasi
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSolo,
  getTim,
  getDetailTim,
  verifikasiTim,
  tolakTim,
  getDashboardStats
};
