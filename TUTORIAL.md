# Tutorial Menjalankan Project CiGITS GEMASTIK ITS

Dokumen ini dipakai agar setiap anggota kelompok bisa menjalankan project di laptop masing-masing dengan database lokal sendiri.

## 1. Prasyarat

Pastikan sudah install:

- Node.js
- npm
- XAMPP
- Browser
- Git

Cara cek Node.js dan npm:

```bash
node -v
npm -v
```

Jika versi muncul, berarti aman.

## 2. Ambil Project dari GitHub

Clone repository:

```bash
git clone URL_REPOSITORY_GITHUB
cd FP-SBD-CigitsGemastik
```

Jika project dikirim sebagai ZIP:

1. Extract ZIP.
2. Buka terminal di folder hasil extract repository.

Struktur folder yang benar:

```text
FP-SBD-CigitsGemastik/
├── backend/
├── database/
├── frontend/
├── scripts/
├── package.json
├── package-lock.json
├── README.md
└── TUTORIAL.md
```

Catatan: nama folder boleh berbeda, tergantung nama repository ketika di-clone. Yang penting isi foldernya seperti struktur di atas.

## 3. Install Dependency

Dari folder utama repository, jalankan:

```bash
npm run install:all
```

Perintah ini akan install dependency untuk:

- root project
- backend
- frontend

Jika gagal, install manual:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## 4. Jalankan XAMPP

Buka XAMPP Control Panel, lalu start:

```text
Apache
MySQL
```

Pastikan keduanya berstatus running.

## 5. Buat Database di phpMyAdmin

Buka browser:

```text
http://localhost/phpmyadmin
```

Buat database baru:

```text
cigits_gemastik
```

Gunakan collation:

```text
utf8mb4_general_ci
```

## 6. Import Tabel Database

Klik database `cigits_gemastik`, lalu buka tab `SQL`.

Pertama, buka file:

```text
database/schema.sql
```

Copy semua isinya, paste ke tab SQL phpMyAdmin, lalu klik `Go`.

Setelah berhasil, buka file:

```text
database/seed.sql
```

Copy semua isinya, paste ke tab SQL phpMyAdmin, lalu klik `Go`.

Setelah selesai, harus ada 5 tabel:

```text
divisi
dosen
anggota
tim
anggota_tim
```

Jumlah data awal:

```text
divisi       11
dosen        5
anggota      10
tim          3
anggota_tim  8
```

## 7. Buat File .env Backend

Masuk ke folder:

```text
backend/
```

Copy file:

```text
.env.example
```

menjadi:

```text
.env
```

Isi `.env` sesuai MySQL lokal masing-masing.

Contoh XAMPP default tanpa password:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cigits_gemastik
DB_PORT=3306
```

Jika MySQL kalian punya password, isi bagian `DB_PASSWORD`.

Contoh:

```env
DB_PASSWORD=password_mysql_kalian
```

Penting:

- Jangan push file `.env` ke GitHub.
- Yang boleh dipush hanya `.env.example`.
- Password MySQL setiap orang boleh berbeda.

## 8. Jalankan Project

Dari folder utama repository, jalankan:

```bash
npm run dev
```

Jika berhasil, akan muncul:

```text
Backend  : http://localhost:5000
Frontend : http://localhost:5173
```

Buka frontend:

```text
http://localhost:5173
```

## 9. Test Koneksi Backend ke Database

Buka di browser:

```text
http://localhost:5000/api/divisi
```

Jika berhasil, response berisi data divisi.

Tes dosen:

```text
http://localhost:5000/api/dosen
```

Jika muncul data dosen, backend sudah berhasil terhubung ke MySQL lokal.

## 10. Test Fitur Aplikasi

Tes fitur berikut:

1. Daftar solo.
2. Cek tabel `anggota` di phpMyAdmin.
3. Daftar tim.
4. Cek tabel `tim`, `dosen`, `anggota`, dan `anggota_tim`.
5. Buka halaman admin.
6. Klik detail tim.
7. Klik verifikasi tim.
8. Klik tolak tim.
9. Klik export PDF peserta solo.

## 11. Jika Ada Error Umum

### Access denied for user root

Artinya password MySQL di `.env` salah.

Solusi:

```env
DB_PASSWORD=password_mysql_kalian
```

Lalu restart server:

```bash
Ctrl + C
npm run dev
```

### Database tidak ditemukan

Pastikan nama database sama:

```env
DB_NAME=cigits_gemastik
```

Pastikan database `cigits_gemastik` sudah dibuat di phpMyAdmin.

### Tabel tidak ditemukan

Berarti `schema.sql` belum berhasil dijalankan.

Ulangi langkah import:

```text
database/schema.sql
database/seed.sql
```

### Port 5000 sudah dipakai

Ubah `PORT` di `.env`, misalnya:

```env
PORT=5001
```

Lalu ubah juga `API_BASE_URL` di:

```text
frontend/js/script.js
```

dari:

```js
const API_BASE_URL = 'http://localhost:5000/api';
```

menjadi:

```js
const API_BASE_URL = 'http://localhost:5001/api';
```

## 12. Aturan Kolaborasi

- Setiap anggota memakai database lokal masing-masing.
- Jangan push `.env`.
- Jangan push `node_modules`.
- Jika struktur tabel berubah, update `database/schema.sql`.
- Jika data dummy berubah, update `database/seed.sql`.
- Jika ada patch data kecil, buat file SQL baru di folder `database/`.
- Sebelum demo, sepakati satu laptop utama untuk menjalankan database final.

## 13. Catatan GitHub

File yang perlu dipush:

```text
backend/
database/
frontend/
scripts/
package.json
package-lock.json
README.md
TUTORIAL.md
.gitignore
```

File/folder yang tidak perlu dipush:

```text
node_modules/
backend/node_modules/
frontend/node_modules/
backend/.env
```

Jika `node_modules` sudah terlanjur masuk GitHub, jalankan:

```bash
git rm -r --cached node_modules
git rm -r --cached backend/node_modules
git rm -r --cached frontend/node_modules
git add .gitignore
git commit -m "remove node_modules from repository"
git push
```

Jika salah satu folder tidak ada, lewati command untuk folder tersebut.

## 14. File Penting

```text
backend/.env.example        Template konfigurasi backend
database/schema.sql         Struktur tabel database
database/seed.sql           Data awal database
frontend/js/script.js       Koneksi frontend ke API backend
backend/src/config/db.js    Koneksi backend ke MySQL
```
