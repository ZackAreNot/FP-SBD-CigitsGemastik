# CiGITS GEMASTIK ITS

Project ini adalah sistem informasi pendaftaran seleksi internal GEMASTIK ITS untuk Final Project mata kuliah Sistem Basis Data. Acuan pengembangan mengikuti dokumen final project dari dosen dan progress laporan kelompok yang sudah sampai pada tahap penentuan ERD.

## Progress Saat Ini

### 1. Topik Sistem Sudah Ditentukan

Sistem yang dibuat adalah **Sistem Informasi Pendaftaran CiGITS GEMASTIK ITS**.

Fokus sistem:

- Pendaftaran peserta solo.
- Pendaftaran peserta tim.
- Pendataan divisi GEMASTIK.
- Pendataan dosen pembimbing.
- Dashboard admin untuk melihat dan memverifikasi pendaftaran tim.

### 2. ERD Sudah Ditentukan

Entitas utama yang digunakan:

| Entitas | Fungsi |
| --- | --- |
| `divisi` | Menyimpan data divisi GEMASTIK |
| `dosen` | Menyimpan data dosen pembimbing |
| `anggota` | Menyimpan data mahasiswa/pendaftar |
| `tim` | Menyimpan data tim pendaftar |
| `anggota_tim` | Menyimpan relasi anggota dan tim beserta peran |

Relasi utama:

- Satu `divisi` dapat diminati banyak `anggota`.
- Satu `divisi` dapat memiliki banyak `tim`.
- Satu `dosen` dapat membimbing banyak `tim`.
- Satu `tim` memiliki banyak `anggota`.
- Satu `anggota` dapat tergabung ke tim melalui tabel `anggota_tim`.
- Tabel `anggota_tim` menyimpan peran anggota sebagai `KETUA` atau `ANGGOTA`.

### 3. Struktur Tabel Final Sementara

Tabel yang direncanakan berdasarkan ERD:

```text
divisi
- id_divisi
- jenis_perlombaan
- nama_divisi

dosen
- id_dosen
- nama_dosen
- nidn
- email

anggota
- id_anggota
- id_divisi_minat
- nama_anggota
- no_whatsapp
- jurusan
- nrp

tim
- id_tim
- nama_tim
- id_divisi
- id_dosen
- judul
- tanggal_daftar
- status_pendaftaran

anggota_tim
- id_anggota_tim
- id_tim
- id_anggota
- peran
```

Catatan desain:

- `anggota.nrp` sebaiknya bersifat unik.
- `dosen.nidn` dan `dosen.email` sebaiknya bersifat unik.
- Status awal tim adalah `MENUNGGU`.
- Status tim dapat berubah menjadi `TERKONFIRMASI` atau `DITOLAK`.
- Setiap tim wajib memiliki tepat satu `KETUA`.

### 4. Keputusan Desain Dosen Pembimbing

Dosen pembimbing tidak dipilih dari dropdown tetap, karena dosen pembimbing bisa berasal dari banyak dosen.

Pada form pendaftaran tim, user mengisi:

- Nama dosen.
- NIDN.
- Email dosen.

Nanti saat sudah memakai MySQL, alurnya:

1. Backend mengecek apakah dosen dengan NIDN/email tersebut sudah ada di tabel `dosen`.
2. Jika sudah ada, gunakan `id_dosen` yang sudah ada.
3. Jika belum ada, insert dosen baru ke tabel `dosen`.
4. Data `tim` tetap menyimpan `id_dosen` sebagai foreign key.

Dengan cara ini, web tetap fleksibel untuk user, tetapi desain database tetap sesuai ERD.

### 5. Prototype Frontend Sudah Dibuat

Frontend dibuat menggunakan:

- HTML
- CSS
- JavaScript vanilla
- Vite untuk dev server dan auto refresh

Halaman yang sudah ada:

| Halaman | Fungsi |
| --- | --- |
| `index.html` | Landing page CiGITS GEMASTIK ITS |
| `daftar-solo.html` | Form pendaftaran peserta solo |
| `daftar-tim.html` | Form pendaftaran tim |
| `admin.html` | Dashboard admin |

Fitur frontend yang sudah berjalan:

- Mengambil data divisi dari backend.
- Submit pendaftaran solo.
- Submit pendaftaran tim.
- Input data dosen pembimbing: nama, NIDN, email.
- Menampilkan dashboard admin.
- Menampilkan total peserta solo, total tim, status menunggu, terkonfirmasi, dan ditolak.
- Verifikasi dan tolak tim.
- Melihat detail anggota tim.

### 6. Backend Sudah Terhubung MySQL

Backend dibuat menggunakan:

- Node.js
- Express.js
- CORS
- Nodemon
- dotenv
- mysql2/promise

Backend awalnya memakai array memory pada:

```text
backend/src/data/dummyData.js
```

Saat ini endpoint inti sudah dipindahkan ke MySQL:

- Master data `divisi` dan `dosen`.
- Pendaftaran solo ke tabel `anggota`.
- Pendaftaran tim ke tabel `dosen`, `tim`, `anggota`, dan `anggota_tim`.
- Dashboard admin solo dan tim.
- Detail tim.
- Verifikasi dan tolak tim.
- Pendaftaran tim memakai database transaction.

### 7. Endpoint API Sudah Dibuat

Master data:

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/divisi` | Mengambil data divisi |
| GET | `/api/dosen` | Mengambil data dosen dummy |

Pendaftaran:

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| POST | `/api/pendaftaran/solo` | Mendaftarkan peserta solo |
| POST | `/api/pendaftaran/tim` | Mendaftarkan tim |

Admin:

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/admin/solo` | Menampilkan semua pendaftar solo |
| GET | `/api/admin/tim` | Menampilkan semua tim |
| GET | `/api/admin/tim/:id` | Menampilkan detail tim |
| PATCH | `/api/admin/tim/:id/verifikasi` | Mengubah status tim menjadi TERKONFIRMASI |
| PATCH | `/api/admin/tim/:id/tolak` | Mengubah status tim menjadi DITOLAK |

## Cara Menjalankan Project

Install semua dependency:

```bash
cd cigits-app
npm run install:all
```

Jalankan backend dan frontend sekaligus:

```bash
npm run dev
```

URL saat development:

```text
Backend  : http://localhost:5000
Frontend : http://localhost:5173
```

Saat mengedit file frontend, Vite akan melakukan auto refresh di browser.

## Step Lanjut Berdasarkan FP Sistem Basis Data

### 1. Finalisasi ERD dan Skema Relasional

Pastikan ERD final sudah konsisten dengan fitur web:

- Tabel `dosen` tetap digunakan.
- Form web tetap input manual data dosen.
- Backend nantinya tetap menyimpan relasi `tim.id_dosen -> dosen.id_dosen`.

### 2. Buat `schema.sql`

File ini akan berisi:

- `CREATE DATABASE`
- `CREATE TABLE divisi`
- `CREATE TABLE dosen`
- `CREATE TABLE anggota`
- `CREATE TABLE tim`
- `CREATE TABLE anggota_tim`
- Primary key
- Foreign key
- Unique constraint
- Enum status/peran

File sudah tersedia di:

```text
database/schema.sql
```

### 3. Buat `seed.sql`

File ini akan berisi data awal:

- 11 divisi GEMASTIK.
- Beberapa data dosen dummy jika diperlukan untuk testing.
- 10 data contoh anggota.
- 3 data contoh tim.
- Relasi anggota tim untuk contoh data.

File sudah tersedia di:

```text
database/seed.sql
```

### 3.1 Import Database Lewat XAMPP/phpMyAdmin

1. Jalankan Apache dan MySQL dari XAMPP.
2. Buka `http://localhost/phpmyadmin`.
3. Buat database baru bernama `cigits_gemastik`.
4. Klik database `cigits_gemastik`.
5. Buka tab SQL.
6. Paste isi `database/schema.sql`, lalu klik Go.
7. Setelah berhasil, paste isi `database/seed.sql`, lalu klik Go.
8. Cek tabel `divisi`, `dosen`, `anggota`, `tim`, dan `anggota_tim`.

### 4. Hubungkan Backend ke MySQL

Backend sudah diganti dari array memory ke query MySQL untuk fitur inti.

Dependency yang akan digunakan:

- `mysql2`
- `dotenv`

Bagian yang sudah dibuat:

```text
backend/src/config/db.js
```

Bagian controller yang sudah memakai MySQL:

- `masterController.js`
- `pendaftaranController.js`
- `adminController.js`

### 5. Gunakan Transaction untuk Pendaftaran Tim

Pendaftaran tim harus memakai database transaction karena prosesnya melibatkan banyak tabel:

- Insert/select dosen.
- Insert tim.
- Insert/select anggota.
- Insert anggota_tim.

Jika salah satu proses gagal, semua proses harus rollback.

### 6. Testing Database

Skenario testing yang perlu dilakukan:

- Daftar solo.
- Daftar tim dengan dosen baru.
- Daftar tim dengan dosen yang sudah pernah dipakai.
- Admin melihat data solo.
- Admin melihat data tim.
- Admin melihat detail tim.
- Admin verifikasi tim.
- Admin menolak tim.
- Cek data langsung di MySQL.

### 7. Lengkapi Laporan

Bagian laporan yang perlu dilengkapi:

- Latar belakang.
- Tujuan sistem.
- Analisis kebutuhan.
- ERD.
- Skema relasional.
- Normalisasi.
- Implementasi SQL.
- Implementasi aplikasi.
- Screenshot frontend.
- Screenshot data di database.
- Kesimpulan.

## Pembagian Kerja yang Disarankan

| Anggota | Fokus |
| --- | --- |
| Orang 1 | ERD, skema relasional, normalisasi laporan |
| Orang 2 | `schema.sql`, `seed.sql`, query database |
| Orang 3 | Backend MySQL dan transaction |
| Orang 4 | Testing, screenshot, README, demo, dan rapihin frontend |

## Status Singkat

| Bagian | Status |
| --- | --- |
| Topik sistem | Selesai |
| ERD awal | Selesai |
| Frontend prototype | Selesai |
| Backend prototype in-memory | Selesai |
| Dev server frontend + backend | Selesai |
| Database MySQL | Selesai dibuat di XAMPP/phpMyAdmin |
| Schema SQL final | Selesai |
| Seed SQL awal | Selesai |
| Backend terhubung database | Selesai |
| Pendaftaran solo ke database | Selesai |
| Pendaftaran tim transaction | Selesai |
| Admin tim dari database | Selesai |
| Normalisasi laporan | Belum |
| Testing database | Belum |
