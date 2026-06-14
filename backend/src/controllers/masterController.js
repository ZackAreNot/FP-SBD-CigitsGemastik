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

module.exports = {
  getDivisi,
  getDosen
};
