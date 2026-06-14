const db = require('../config/db');

const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

const daftarSolo = async (req, res, next) => {
  const { nama_anggota, nrp, jurusan, no_whatsapp, id_divisi_minat } = req.body;

  try {
    const requiredFields = { nama_anggota, nrp, jurusan, no_whatsapp, id_divisi_minat };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (isEmpty(value)) {
        return res.status(400).json({
          success: false,
          message: `${field} wajib diisi`
        });
      }
    }

    const [divisiRows] = await db.query(
      'SELECT id_divisi FROM divisi WHERE id_divisi = ?',
      [Number(id_divisi_minat)]
    );

    if (divisiRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Divisi minat tidak ditemukan'
      });
    }

    const pendaftar = {
      id_divisi_minat: Number(id_divisi_minat),
      nama_anggota: String(nama_anggota).trim(),
      no_whatsapp: String(no_whatsapp).trim(),
      jurusan: String(jurusan).trim(),
      nrp: String(nrp).trim()
    };

    const [result] = await db.query(
      `INSERT INTO anggota
        (id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp)
       VALUES (?, ?, ?, ?, ?)`,
      [
        pendaftar.id_divisi_minat,
        pendaftar.nama_anggota,
        pendaftar.no_whatsapp,
        pendaftar.jurusan,
        pendaftar.nrp
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Pendaftaran solo berhasil',
      data: {
        id_anggota: result.insertId,
        ...pendaftar
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'NRP sudah terdaftar'
      });
    }
    next(error);
  }
};

const daftarTim = async (req, res, next) => {
  const { nama_tim, id_divisi, dosen, judul, anggota } = req.body;

  let connection;

  try {
    const requiredFields = { nama_tim, id_divisi, judul };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (isEmpty(value)) {
        return res.status(400).json({
          success: false,
          message: `${field} wajib diisi`
        });
      }
    }

    if (!dosen || typeof dosen !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Data dosen pembimbing wajib diisi'
      });
    }

    const requiredDosenFields = ['nama_dosen', 'nidn', 'email'];
    for (const field of requiredDosenFields) {
      if (isEmpty(dosen[field])) {
        return res.status(400).json({
          success: false,
          message: `${field} dosen wajib diisi`
        });
      }
    }

    if (!Array.isArray(anggota) || anggota.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Anggota tim minimal 1 orang'
      });
    }

    const jumlahKetua = anggota.filter((item) => item.peran === 'KETUA').length;
    if (jumlahKetua !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Tim wajib memiliki tepat satu KETUA'
      });
    }

    const daftarNrp = new Set();
    for (const item of anggota) {
      const requiredAnggotaFields = ['nama_anggota', 'nrp', 'jurusan', 'no_whatsapp', 'peran'];
      for (const field of requiredAnggotaFields) {
        if (isEmpty(item[field])) {
          return res.status(400).json({
            success: false,
            message: `${field} anggota wajib diisi`
          });
        }
      }

      if (!['KETUA', 'ANGGOTA'].includes(item.peran)) {
        return res.status(400).json({
          success: false,
          message: 'Peran anggota hanya boleh KETUA atau ANGGOTA'
        });
      }

      const nrpAnggota = String(item.nrp).trim();
      if (daftarNrp.has(nrpAnggota)) {
        return res.status(400).json({
          success: false,
          message: 'NRP anggota dalam satu tim tidak boleh duplikat'
        });
      }
      daftarNrp.add(nrpAnggota);
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [divisiRows] = await connection.query(
      'SELECT id_divisi FROM divisi WHERE id_divisi = ?',
      [Number(id_divisi)]
    );

    if (divisiRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Divisi tidak ditemukan'
      });
    }

    const namaDosen = String(dosen.nama_dosen).trim();
    const nidn = String(dosen.nidn).trim();
    const email = String(dosen.email).trim();

    let idDosen;
    try {
      const [dosenResult] = await connection.query(
        'INSERT INTO dosen (nama_dosen, nidn, email) VALUES (?, ?, ?)',
        [namaDosen, nidn, email]
      );
      idDosen = dosenResult.insertId;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const [dosenRows] = await connection.query(
          'SELECT id_dosen, nidn, email FROM dosen WHERE nidn = ? OR email = ? LIMIT 1',
          [nidn, email]
        );
        const dosenAda = dosenRows[0];
        if (dosenAda.nidn !== nidn || dosenAda.email !== email) {
          await connection.rollback();
          return res.status(409).json({
            success: false,
            message: 'NIDN atau email dosen sudah dipakai oleh data dosen lain'
          });
        }
        idDosen = dosenAda.id_dosen;
      } else {
        throw err;
      }
    }

    const tglDaftar = new Date().toISOString().slice(0, 10);
    const [timResult] = await connection.query(
      `INSERT INTO tim
        (nama_tim, id_divisi, id_dosen, judul, tanggal_daftar, status_pendaftaran)
       VALUES (?, ?, ?, ?, ?, 'MENUNGGU')`,
      [String(nama_tim).trim(), Number(id_divisi), idDosen, String(judul).trim(), tglDaftar]
    );

    const idTim = timResult.insertId;
    const anggotaTersimpan = [];

    for (const item of anggota) {
      const nrpAnggota = String(item.nrp).trim();
      const divMinat = Number(id_divisi);
      const namaAnggota = String(item.nama_anggota).trim();
      const noWa = String(item.no_whatsapp).trim();
      const jur = String(item.jurusan).trim();

      let idAnggota;
      try {
        const [anggotaResult] = await connection.query(
          `INSERT INTO anggota
            (id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp)
           VALUES (?, ?, ?, ?, ?)`,
          [divMinat, namaAnggota, noWa, jur, nrpAnggota]
        );
        idAnggota = anggotaResult.insertId;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          await connection.query(
            `UPDATE anggota SET id_divisi_minat = ?, nama_anggota = ?, no_whatsapp = ?, jurusan = ? WHERE nrp = ?`,
            [divMinat, namaAnggota, noWa, jur, nrpAnggota]
          );
          const [rows] = await connection.query(
            'SELECT id_anggota FROM anggota WHERE nrp = ? LIMIT 1',
            [nrpAnggota]
          );
          idAnggota = rows[0].id_anggota;
        } else {
          throw err;
        }
      }

      await connection.query(
        'INSERT INTO anggota_tim (id_tim, id_anggota, peran) VALUES (?, ?, ?)',
        [idTim, idAnggota, item.peran]
      );

      anggotaTersimpan.push({
        id_anggota: idAnggota,
        nama_anggota: namaAnggota,
        nrp: nrpAnggota,
        jurusan: jur,
        no_whatsapp: noWa,
        peran: item.peran
      });
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Pendaftaran tim berhasil',
      data: {
        id_tim: idTim,
        nama_tim: String(nama_tim).trim(),
        id_divisi: Number(id_divisi),
        id_dosen: idDosen,
        dosen: {
          nama_dosen: namaDosen,
          nidn,
          email
        },
        judul: String(judul).trim(),
        tanggal_daftar: tglDaftar,
        status: 'MENUNGGU',
        anggota: anggotaTersimpan
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('uq_anggota_per_tim')) {
        return res.status(400).json({
          success: false,
          message: 'Satu atau lebih anggota sudah terdaftar di tim lain'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Data duplikat ditemukan. Periksa NRP anggota, NIDN dosen, atau email dosen'
      });
    }

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  daftarSolo,
  daftarTim
};
