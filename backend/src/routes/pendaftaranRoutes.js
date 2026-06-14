const express = require('express');
const { daftarSolo, daftarTim } = require('../controllers/pendaftaranController');

const router = express.Router();

router.post('/solo', daftarSolo);
router.post('/tim', daftarTim);

module.exports = router;
