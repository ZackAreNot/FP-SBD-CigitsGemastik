const express = require('express');
const {
  getSolo,
  getTim,
  getDetailTim,
  verifikasiTim,
  tolakTim,
  getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/solo', getSolo);
router.get('/tim', getTim);
router.get('/tim/:id', getDetailTim);
router.patch('/tim/:id/verifikasi', verifikasiTim);
router.patch('/tim/:id/tolak', tolakTim);

module.exports = router;
