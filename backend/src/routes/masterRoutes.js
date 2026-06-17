const express = require('express');
const {
  getDivisi,
  getDosen,
  getTimTerverifikasi,
  getTimDitolak
} = require('../controllers/masterController');

const router = express.Router();

router.get('/divisi', getDivisi);
router.get('/dosen', getDosen);
router.get('/tim-terverifikasi', getTimTerverifikasi);
router.get('/tim-ditolak', getTimDitolak);

module.exports = router;
