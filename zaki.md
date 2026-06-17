# Materi Presentasi Zaki

## Fokus Bagian Saya

Bagian yang saya jelaskan saat presentasi adalah:

- sedikit gambaran frontend
- penjelasan backend
- relasi frontend dengan backend
- relasi backend dengan database

Jadi fokus saya adalah menjelaskan bagaimana data bergerak dari tampilan web sampai masuk ke database MySQL.

## 1. Penjelasan Frontend Secara Singkat

Frontend pada project ini dibuat secara sederhana menggunakan:

- HTML
- CSS
- JavaScript vanilla
- Vite sebagai development server

Frontend terdiri dari empat halaman utama:

- `index.html` untuk landing page
- `daftar-solo.html` untuk pendaftaran solo
- `daftar-tim.html` untuk pendaftaran tim
- `admin.html` untuk dashboard admin

Tugas frontend secara umum bukan untuk mengolah database secara langsung, tetapi untuk:

- menampilkan form ke user
- mengambil input dari user
- mengirim request ke backend
- menerima response dari backend
- menampilkan data hasil response

Jadi frontend pada sistem ini berperan sebagai antarmuka atau penghubung antara user dan sistem backend.

## 2. Gambaran Umum Backend

Backend pada project ini dibangun menggunakan:

- Node.js
- Express.js
- CORS
- dotenv
- mysql2/promise
- nodemon

Backend berfungsi sebagai pusat logika aplikasi. Artinya, semua request dari frontend tidak langsung masuk ke database, tetapi selalu melewati backend terlebih dahulu.

Tugas backend pada sistem ini adalah:

- menerima request dari frontend
- membaca request body dari user
- memvalidasi data
- menjalankan query SQL ke MySQL
- mengatur response JSON
- menangani error jika terjadi masalah

Dengan cara ini, sistem menjadi lebih aman dan lebih terstruktur karena aturan bisnis tidak diletakkan di frontend, tetapi di backend dan database.

## 3. Struktur Backend

Struktur backend disusun menjadi beberapa bagian agar lebih rapi:

```text
backend/src/
├── app.js
├── config/
│   └── db.js
├── controllers/
│   ├── masterController.js
│   ├── pendaftaranController.js
│   └── adminController.js
└── routes/
    ├── masterRoutes.js
    ├── pendaftaranRoutes.js
    └── adminRoutes.js
```

Penjelasan setiap bagian:

- `app.js` adalah file utama backend
- `config/db.js` untuk koneksi ke database MySQL
- `controllers/` berisi logika utama tiap fitur
- `routes/` berisi daftar endpoint API

## 4. Penjelasan `app.js`

File `app.js` adalah titik masuk backend.

Fungsinya:

- membuat aplikasi Express
- membaca konfigurasi dari `.env`
- mengaktifkan `cors()` agar frontend bisa mengakses backend
- mengaktifkan `express.json()` agar request JSON bisa dibaca
- menghubungkan route master, pendaftaran, dan admin
- menyediakan error handler
- menjalankan server di port tertentu

Alurnya:

1. user mengakses frontend
2. frontend mengirim request ke `http://localhost:5000/api/...`
3. request masuk ke `app.js`
4. `app.js` meneruskan request ke route yang sesuai
5. route memanggil controller
6. controller menjalankan query ke database

## 5. Penjelasan `db.js`

File `backend/src/config/db.js` dipakai untuk koneksi backend ke database MySQL.

Isi utamanya adalah:

- import `mysql2/promise`
- membaca `.env`
- membuat connection pool

Kenapa memakai connection pool:

- lebih efisien daripada membuat koneksi baru setiap request
- cocok untuk aplikasi web
- mempermudah query biasa dan transaction

Konfigurasi penting yang dipakai:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`

Jadi file ini adalah jembatan utama backend ke MySQL.

## 6. Penjelasan Routes

Routes digunakan untuk mendefinisikan URL endpoint yang bisa dipanggil frontend.

### `masterRoutes.js`

Berisi endpoint:

- `GET /api/divisi`
- `GET /api/dosen`

Fungsi:

- mengambil data master dari database

### `pendaftaranRoutes.js`

Berisi endpoint:

- `POST /api/pendaftaran/solo`
- `POST /api/pendaftaran/tim`

Fungsi:

- menangani input pendaftaran dari user

### `adminRoutes.js`

Berisi endpoint:

- `GET /api/admin/stats`
- `GET /api/admin/solo`
- `GET /api/admin/tim`
- `GET /api/admin/tim/:id`
- `PATCH /api/admin/tim/:id/verifikasi`
- `PATCH /api/admin/tim/:id/tolak`

Fungsi:

- menangani kebutuhan dashboard admin

## 7. Penjelasan Controllers

Controller adalah bagian backend yang berisi logika utama sistem.

### `masterController.js`

Controller ini mengelola data master.

#### Fungsi `getDivisi`

Fungsi ini mengambil data divisi dari tabel `divisi`.

Query yang dijalankan:

```sql
SELECT id_divisi, jenis_perlombaan, nama_divisi
FROM divisi
ORDER BY id_divisi
```

Data ini dipakai frontend untuk dropdown divisi.

#### Fungsi `getDosen`

Fungsi ini mengambil data dosen dari tabel `dosen`.

Query:

```sql
SELECT id_dosen, nama_dosen, nidn, email
FROM dosen
ORDER BY nama_dosen
```

Data ini dipakai untuk kebutuhan referensi dan admin.

### `pendaftaranController.js`

Controller ini adalah inti proses pendaftaran.

#### Fungsi `daftarSolo`

Alur kerja:

1. backend menerima data dari form solo
2. backend memeriksa apakah semua field wajib terisi
3. backend mengecek apakah `id_divisi_minat` valid
4. backend insert data ke tabel `anggota`
5. jika NRP sudah ada, MySQL akan menolak karena `UNIQUE`

Query validasi divisi:

```sql
SELECT id_divisi
FROM divisi
WHERE id_divisi = ?
```

Query insert peserta solo:

```sql
INSERT INTO anggota
  (id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp)
VALUES (?, ?, ?, ?, ?)
```

Poin penting:

- peserta solo disimpan di tabel `anggota`
- peserta disebut solo jika belum punya relasi di `anggota_tim`

#### Fungsi `daftarTim`

Ini adalah bagian backend paling penting, karena memakai transaction.

Alur besar:

1. validasi data tim
2. validasi data dosen
3. validasi anggota
4. buka transaction
5. cek divisi
6. insert atau reuse dosen
7. insert tim
8. insert atau update anggota
9. insert relasi ke `anggota_tim`
10. commit jika sukses
11. rollback jika ada error

Kenapa ini penting:

- karena pendaftaran tim melibatkan banyak tabel sekaligus
- backend harus memastikan data tidak setengah masuk

Tabel yang terlibat:

- `dosen`
- `tim`
- `anggota`
- `anggota_tim`

Jadi bagian ini bagus dijelaskan saat presentasi karena menunjukkan bahwa backend tidak hanya menerima input, tetapi juga mengatur konsistensi database.

### `adminController.js`

Controller ini menangani dashboard admin.

#### Fungsi `getSolo`

Menampilkan peserta solo dari query:

```sql
SELECT
  a.id_anggota,
  a.id_divisi_minat,
  a.nama_anggota,
  a.no_whatsapp,
  a.jurusan,
  a.nrp,
  d.nama_divisi
FROM anggota a
JOIN divisi d ON d.id_divisi = a.id_divisi_minat
LEFT JOIN anggota_tim at ON at.id_anggota = a.id_anggota
WHERE at.id_anggota_tim IS NULL
```

Maknanya:

- peserta solo adalah anggota yang belum masuk ke tabel `anggota_tim`

#### Fungsi `getTim`

Menampilkan daftar seluruh tim lengkap dengan:

- kode registrasi
- nama tim
- divisi
- dosen
- jumlah anggota
- status

Di sini backend memakai function SQL seperti:

- `fn_GenerateKodeRegistrasi`
- `fn_GetJumlahAnggota`

Jadi controller admin tidak hanya membaca tabel mentah, tetapi juga memanfaatkan function dari database.

#### Fungsi `getDetailTim`

Menampilkan satu tim secara lengkap, termasuk seluruh anggota yang bergabung di tim itu.

#### Fungsi `verifikasiTim`

Fungsi ini tidak hanya update biasa, tetapi memanggil stored procedure:

```sql
CALL sp_VerifikasiTim(?)
```

Tujuannya:

- memastikan tim memang valid sebelum diverifikasi
- memastikan tim punya tepat satu ketua
- memastikan status sebelumnya benar

#### Fungsi `tolakTim`

Fungsi ini mengubah status tim menjadi `DITOLAK`.

#### Fungsi `getDashboardStats`

Fungsi ini mengambil ringkasan statistik dashboard dari stored procedure:

```sql
CALL sp_GetDashboardStats()
```

## 8. Relasi Frontend dengan Backend

Relasi frontend dan backend dalam project ini adalah hubungan client-server.

Frontend bertindak sebagai client.
Backend bertindak sebagai server API.

Cara kerjanya:

1. user mengisi form di frontend
2. JavaScript frontend membaca input
3. frontend mengirim request ke backend menggunakan `fetch`
4. backend menerima request itu melalui route Express
5. backend memproses dan memberi response JSON
6. frontend menampilkan hasilnya ke user

Contoh sederhana pada frontend:

```js
await request('/pendaftaran/solo', {
  method: 'POST',
  body: JSON.stringify(payload)
});
```

Artinya:

- frontend memanggil endpoint backend `/api/pendaftaran/solo`
- data dikirim dalam format JSON
- backend lalu menyimpan data ke database

Contoh hubungan lain:

- frontend memanggil `GET /api/divisi` untuk mengisi dropdown divisi
- frontend memanggil `GET /api/admin/tim` untuk menampilkan daftar tim
- frontend memanggil `PATCH /api/admin/tim/:id/verifikasi` saat admin menekan tombol verifikasi

Jadi frontend tidak tahu struktur SQL secara langsung. Frontend hanya tahu endpoint API yang disediakan backend.

## 9. Relasi Backend dengan Database

Relasi backend dengan database adalah hubungan antara layer aplikasi dan layer penyimpanan data.

Backend menjadi perantara antara user dan database.

Peran backend terhadap database:

- mengirim query `SELECT`
- mengirim query `INSERT`
- mengirim query `UPDATE`
- menjalankan transaction
- memanggil trigger, function, dan procedure secara tidak langsung atau langsung

Contoh relasinya:

### Kasus 1: Ambil data divisi

- frontend meminta data divisi
- backend menjalankan query:

```sql
SELECT id_divisi, jenis_perlombaan, nama_divisi
FROM divisi
ORDER BY id_divisi
```

- database mengembalikan row
- backend mengubahnya menjadi response JSON

### Kasus 2: Daftar solo

- frontend mengirim data solo
- backend insert ke tabel `anggota`
- database menyimpan data
- jika `nrp` duplikat, database melempar error
- backend menangkap error lalu mengirim pesan gagal

### Kasus 3: Daftar tim

- backend membuka transaction
- backend insert atau reuse dosen
- backend insert ke tabel `tim`
- backend insert atau update anggota
- backend insert ke `anggota_tim`
- database menjalankan constraint dan trigger
- jika semua sukses backend commit
- jika gagal backend rollback

### Kasus 4: Verifikasi tim

- admin menekan tombol verifikasi di frontend
- frontend memanggil backend
- backend memanggil stored procedure `sp_VerifikasiTim`
- database memeriksa status tim dan jumlah ketua
- jika valid status tim berubah menjadi `TERKONFIRMASI`
- trigger audit mencatat perubahan ke `riwayat_status_tim`

Jadi relasi backend dengan database bukan hanya sekadar baca tulis data, tetapi juga menjalankan aturan bisnis yang ada di MySQL.

## 10. Inti yang Bisa Saya Sampaikan Saat Presentasi

Kalau dijelaskan singkat saat demo, saya bisa mengatakan:

Project kami menggunakan frontend sederhana sebagai antarmuka user. Frontend hanya bertugas menampilkan form dan mengirim request ke backend. Semua logika utama diletakkan di backend Express. Backend menerima request, memvalidasi input, lalu menjalankan query ke MySQL menggunakan `mysql2/promise`. Untuk proses sederhana seperti mengambil divisi, backend cukup menjalankan query `SELECT`. Tetapi untuk proses kompleks seperti pendaftaran tim, backend memakai transaction karena data masuk ke beberapa tabel sekaligus, yaitu `dosen`, `tim`, `anggota`, dan `anggota_tim`. Di sisi database, kami juga menggunakan constraint, trigger, function, dan stored procedure agar integritas data tetap terjaga.

## 11. Poin Penting yang Bisa Ditekankan

- frontend tidak langsung mengakses database
- backend adalah pusat logika aplikasi
- database adalah pusat penyimpanan dan integritas data
- relasi frontend-backend terjadi melalui REST API
- relasi backend-database terjadi melalui query SQL dan transaction
- trigger, function, dan stored procedure membantu memindahkan sebagian aturan bisnis ke MySQL

## 12. Pertanyaan yang Mungkin Ditanyakan ke Saya

### Kenapa frontend tidak langsung ke database?

Karena lebih aman dan lebih terstruktur jika semua akses data melewati backend.

### Kenapa backend perlu dipisah menjadi routes dan controllers?

Agar kode lebih rapi, modular, dan mudah dipelihara.

### Kenapa pendaftaran tim memakai transaction?

Karena prosesnya menyentuh banyak tabel, jadi harus dijaga agar tidak setengah masuk.

### Kenapa backend memakai `mysql2/promise`?

Karena memudahkan penulisan query async/await dan cocok dipakai untuk Express.

### Kenapa verifikasi tim memakai stored procedure?

Karena validasinya tidak sederhana, jadi lebih aman jika sebagian logikanya dipindahkan ke database.

## 13. Penutup Bagian Saya

Kesimpulan dari bagian yang saya jelaskan adalah:

- frontend adalah antarmuka
- backend adalah pengatur logika
- database adalah tempat penyimpanan dan penjaga integritas data

Ketiga layer ini saling terhubung dan membentuk satu alur sistem yang utuh, mulai dari input user sampai data tersimpan secara relasional di MySQL.
