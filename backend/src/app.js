const express = require('express');
const cors = require('cors');
require('dotenv').config();

const masterRoutes = require('./routes/masterRoutes');
const pendaftaranRoutes = require('./routes/pendaftaranRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API CiGITS GEMASTIK ITS berjalan',
    data: null
  });
});

app.use('/api', masterRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server'
  });
});

app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});
