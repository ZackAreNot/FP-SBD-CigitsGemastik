# Backend CiGITS GEMASTIK ITS

Backend sederhana untuk Sistem Pendaftaran Seleksi Internal GEMASTIK ITS. Versi ini sudah memakai MySQL dengan `mysql2/promise`, sehingga data pendaftaran tersimpan permanen di database.

## Cara Install

Untuk menjalankan backend dan frontend sekaligus, masuk ke folder utama:

```bash
cd cigits-app
npm run install:all
```

Jika hanya ingin install backend:

```bash
cd cigits-app/backend
npm install
```

## Cara Menjalankan Backend dan Frontend Sekaligus

Dari folder `cigits-app`:

```bash
npm run dev
```

Perintah ini akan menjalankan:

- Backend Express di `http://localhost:5000`
- Frontend Vite di `http://localhost:5173`
- Auto refresh frontend saat file HTML, CSS, atau JavaScript diedit

## Cara Menjalankan Backend Saja

```bash
cd cigits-app/backend
npm run dev
```

Atau:

```bash
npm start
```

Backend berjalan di:

```text
http://localhost:5000
```

## Cara Membuka Frontend

Buka lewat Vite dev server:

```text
http://localhost:5173
```

Pastikan backend berjalan, karena frontend mengambil data dari API `http://localhost:5000/api`.

## Endpoint API

### Master

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/divisi` | Mengambil 11 divisi GEMASTIK dari MySQL |
| GET | `/api/dosen` | Mengambil data dosen dari MySQL |

### Pendaftaran

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| POST | `/api/pendaftaran/solo` | Mendaftarkan peserta solo |
| POST | `/api/pendaftaran/tim` | Mendaftarkan tim |

### Admin

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/admin/solo` | Mengambil semua pendaftar solo lengkap dengan nama divisi |
| GET | `/api/admin/tim` | Mengambil semua tim lengkap dengan divisi, dosen, jumlah anggota, dan status |
| GET | `/api/admin/tim/:id` | Mengambil detail tim beserta daftar anggota |
| PATCH | `/api/admin/tim/:id/verifikasi` | Mengubah status tim menjadi TERKONFIRMASI |
| PATCH | `/api/admin/tim/:id/tolak` | Mengubah status tim menjadi DITOLAK |

## Contoh Request Solo

```json
{
  "nama_anggota": "Ahmad Fauzan",
  "nrp": "5025221001",
  "jurusan": "Informatika",
  "no_whatsapp": "081234567890",
  "id_divisi_minat": 1
}
```

## Contoh Request Tim

```json
{
  "nama_tim": "Cigits Dev Team",
  "id_divisi": 8,
  "dosen": {
    "nama_dosen": "Dr. Budi Santoso, S.Kom., M.Kom.",
    "nidn": "0010017601",
    "email": "budi.santoso@its.ac.id"
  },
  "judul": "Sistem Informasi Pendaftaran GEMASTIK",
  "anggota": [
    {
      "nama_anggota": "Ahmad Fauzan",
      "nrp": "5025221001",
      "jurusan": "Informatika",
      "no_whatsapp": "081234567890",
      "peran": "KETUA"
    },
    {
      "nama_anggota": "Nadia Putri",
      "nrp": "5026221002",
      "jurusan": "Sistem Informasi",
      "no_whatsapp": "081298765432",
      "peran": "ANGGOTA"
    }
  ]
}
```

## Catatan

- Data sudah disimpan di MySQL.
- Pendaftaran tim memakai database transaction supaya data tidak setengah masuk jika ada error.
- Peserta solo disimpan di tabel `anggota` dan dianggap solo selama belum punya relasi di `anggota_tim`.
- Dosen pembimbing diinput manual dari form, lalu backend melakukan cek/insert ke tabel `dosen`.
- Frontend memakai HTML, CSS, dan JavaScript vanilla tanpa React.
