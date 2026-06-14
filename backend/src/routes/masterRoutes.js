const express = require('express');
const { getDivisi, getDosen } = require('../controllers/masterController');

const router = express.Router();

router.get('/divisi', getDivisi);
router.get('/dosen', getDosen);

module.exports = router;
