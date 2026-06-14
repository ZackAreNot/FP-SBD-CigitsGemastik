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
        t.nama_tim,
        t.id_divisi,
        d.nama_divisi,
        dosen.id_dosen,
        dosen.nama_dosen,
        dosen.nidn,
        dosen.email AS email_dosen,
        t.judul,
        DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
        t.status_pendaftaran AS status,
        COUNT(at.id_anggota_tim) AS jumlah_anggota
      FROM tim t
      JOIN divisi d ON d.id_divisi = t.id_divisi
      JOIN dosen ON dosen.id_dosen = t.id_dosen
      LEFT JOIN anggota_tim at ON at.id_tim = t.id_tim
      GROUP BY
        t.id_tim,
        t.nama_tim,
        t.id_divisi,
        d.nama_divisi,
        dosen.id_dosen,
        dosen.nama_dosen,
        dosen.nidn,
        dosen.email,
        t.judul,
        t.tanggal_daftar,
        t.status_pendaftaran
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
        t.nama_tim,
        t.id_divisi,
        d.nama_divisi,
        dosen.id_dosen,
        dosen.nama_dosen,
        dosen.nidn,
        dosen.email AS email_dosen,
        t.judul,
        DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
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

const verifikasiTim = (req, res, next) => updateStatusTim(req, res, next, 'TERKONFIRMASI');

const tolakTim = (req, res, next) => updateStatusTim(req, res, next, 'DITOLAK');

module.exports = {
  getSolo,
  getTim,
  getDetailTim,
  verifikasiTim,
  tolakTim
};
