# Materi Presentasi FP Sistem Basis Data

## 1. Judul Project

**Sistem Informasi Pendaftaran CiGITS GEMASTIK ITS**

Project ini dibuat untuk membantu proses pendaftaran mahasiswa ITS ke seleksi internal GEMASTIK. Sistem mendukung dua skenario pendaftaran, yaitu peserta solo dan peserta tim. Selain itu, sistem menyediakan dashboard admin untuk memantau data pendaftaran, melihat detail tim, serta melakukan verifikasi atau penolakan pendaftaran.

## 2. Latar Belakang

Pada proses seleksi internal GEMASTIK, data peserta biasanya tersebar dan belum terkelola secara terstruktur. Permasalahan yang ingin diselesaikan oleh sistem ini adalah:

- pendataan peserta solo belum terpusat
- pendaftaran tim perlu validasi anggota dan dosen pembimbing
- admin perlu melihat status pendaftaran dengan cepat
- data perlu disimpan secara relasional agar konsisten dan mudah dikelola

Karena itu, kami membangun sistem berbasis database relasional MySQL dengan backend REST API untuk menangani proses bisnis utama.

## 3. Tujuan Sistem

Tujuan dari sistem yang kami bangun adalah:

- menyediakan form pendaftaran solo dan tim
- menyimpan data peserta secara terstruktur ke database
- menjaga integritas data menggunakan primary key, foreign key, unique, trigger, function, dan stored procedure
- membantu admin memverifikasi pendaftaran tim
- menampilkan data pendaftaran secara terorganisir melalui frontend

## 4. Ruang Lingkup Fitur

Fitur utama sistem:

- melihat master data divisi
- melihat master data dosen
- pendaftaran peserta solo
- pendaftaran peserta tim
- dashboard admin untuk melihat peserta solo
- dashboard admin untuk melihat seluruh tim
- melihat detail anggota suatu tim
- verifikasi tim
- menolak tim
- export PDF peserta solo

## 5. Teknologi yang Digunakan

### Frontend

Frontend dibuat secara sederhana dengan:

- HTML
- CSS
- JavaScript vanilla
- Vite untuk development server

Frontend berfungsi sebagai antarmuka user untuk pendaftaran dan antarmuka admin untuk monitoring data. Pada presentasi, frontend cukup dijelaskan secara umum karena fokus utama FP ini ada pada backend dan database.

### Backend

Backend dibuat menggunakan:

- Node.js
- Express.js
- CORS
- dotenv
- mysql2/promise
- nodemon

Backend bertugas menerima request dari frontend, melakukan validasi data, menjalankan query SQL ke MySQL, dan mengembalikan response JSON yang konsisten.

### Database

Database menggunakan:

- MySQL
- phpMyAdmin melalui XAMPP untuk development lokal

Database menjadi inti dari project karena seluruh struktur data, relasi, integritas, audit, dan otomatisasi berada di layer ini.

## 6. Arsitektur Sistem

Alur kerja sistem secara umum:

1. user mengisi form di frontend
2. frontend mengirim request ke backend melalui fetch API
3. backend menerima request dan melakukan validasi
4. backend menjalankan query ke MySQL
5. MySQL menyimpan atau mengambil data
6. backend mengembalikan response JSON
7. frontend menampilkan hasil ke user atau admin

## 7. Desain Database

Database utama terdiri dari 6 objek tabel:

### 1. `divisi`

Menyimpan daftar divisi GEMASTIK.

Kolom penting:

- `id_divisi`
- `jenis_perlombaan`
- `nama_divisi`

### 2. `dosen`

Menyimpan data dosen pembimbing.

Kolom penting:

- `id_dosen`
- `nama_dosen`
- `nidn`
- `email`

Constraint penting:

- `nidn` unique
- `email` unique

### 3. `anggota`

Menyimpan data mahasiswa yang mendaftar, baik peserta solo maupun anggota tim.

Kolom penting:

- `id_anggota`
- `id_divisi_minat`
- `nama_anggota`
- `no_whatsapp`
- `jurusan`
- `nrp`

Constraint penting:

- `nrp` unique

### 4. `tim`

Menyimpan data tim yang mendaftar.

Kolom penting:

- `id_tim`
- `nama_tim`
- `id_divisi`
- `id_dosen`
- `judul`
- `tanggal_daftar`
- `status_pendaftaran`

Status yang digunakan:

- `MENUNGGU`
- `TERKONFIRMASI`
- `DITOLAK`

### 5. `anggota_tim`

Tabel relasi many-to-one untuk menghubungkan anggota dengan tim.

Kolom penting:

- `id_anggota_tim`
- `id_tim`
- `id_anggota`
- `peran`

Peran yang digunakan:

- `KETUA`
- `ANGGOTA`

Constraint penting:

- `id_anggota` unique pada `anggota_tim`, sehingga satu anggota hanya boleh berada di satu tim

### 6. `riwayat_status_tim`

Tabel audit untuk mencatat perubahan status tim.

Kolom penting:

- `id_riwayat`
- `id_tim`
- `status_lama`
- `status_baru`
- `waktu_perubahan`

## 8. Relasi Antar Tabel

Relasi yang digunakan:

- satu `divisi` dapat diminati banyak `anggota`
- satu `divisi` dapat memiliki banyak `tim`
- satu `dosen` dapat membimbing banyak `tim`
- satu `tim` memiliki banyak anggota melalui `anggota_tim`
- satu `anggota` hanya boleh tergabung ke satu tim
- satu `tim` memiliki riwayat perubahan status melalui `riwayat_status_tim`

## 9. Alasan Pemilihan Desain

Beberapa keputusan desain penting:

- peserta solo tetap disimpan di tabel `anggota`, karena secara entitas mereka tetap mahasiswa pendaftar
- peserta solo dibedakan secara logika, yaitu anggota yang belum memiliki relasi di `anggota_tim`
- dosen pembimbing diinput manual oleh user, tetapi tetap disimpan ke tabel `dosen` agar konsisten dengan ERD
- relasi `anggota_tim` dipakai untuk menyimpan peran ketua dan anggota secara eksplisit
- riwayat perubahan status dipisah ke tabel audit agar perubahan status bisa ditelusuri

## 10. Constraint dan Integritas Data

Beberapa constraint yang digunakan:

- primary key pada semua tabel
- foreign key untuk menjaga relasi antar tabel
- unique pada `nrp`
- unique pada `nidn`
- unique pada `email`
- unique pada `anggota_tim.id_anggota`
- enum pada `jenis_perlombaan`, `status_pendaftaran`, dan `peran`

Manfaatnya:

- menghindari duplikasi data
- memastikan relasi valid
- menjaga konsistensi data saat insert atau update

## 11. Trigger, Function, dan Stored Procedure

### Trigger

#### `trg_audit_status_tim`

Trigger ini aktif setelah ada update pada tabel `tim`. Jika status pendaftaran berubah, data lama dan data baru otomatis dicatat ke tabel `riwayat_status_tim`.

Manfaat:

- mencatat histori perubahan status
- membantu audit data

#### `trg_cek_ketua_tim`

Trigger ini aktif sebelum insert ke tabel `anggota_tim`. Jika dalam satu tim sudah ada `KETUA`, maka insert ketua kedua akan ditolak.

Manfaat:

- menjamin satu tim hanya memiliki satu ketua

#### `trg_format_anggota`

Trigger ini aktif sebelum insert ke tabel `anggota`. Nama anggota dan NRP diubah ke format uppercase.

Manfaat:

- menyeragamkan format data

### Function

#### `fn_GetJumlahAnggota(p_id_tim)`

Function ini menghitung jumlah anggota dalam suatu tim berdasarkan `id_tim`.

Digunakan pada dashboard admin agar jumlah anggota bisa langsung tampil dari query SQL.

#### `fn_GenerateKodeRegistrasi(p_id_tim)`

Function ini menghasilkan kode registrasi tim dengan format seperti:

```text
CIGITS-2026-0001
```

Digunakan pada tampilan admin untuk identitas tim yang lebih formal.

### Stored Procedure

#### `sp_GetDashboardStats()`

Procedure ini menghasilkan ringkasan statistik dashboard:

- total peserta solo
- total tim
- tim menunggu
- tim terkonfirmasi

#### `sp_VerifikasiTim(p_id_tim)`

Procedure ini memverifikasi tim dengan aturan:

- tim harus ada
- status tim harus `MENUNGGU`
- tim harus memiliki tepat satu `KETUA`

Jika semua valid, status tim diubah menjadi `TERKONFIRMASI`.

## 12. Penjelasan Lengkap `schema.sql`

Bagian ini penting untuk demo, karena dosen bisa meminta kita menjelaskan bukan hanya tabel, tetapi juga alasan query DDL yang dipakai.

### Bagian awal: reset urutan tabel

```sql
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS riwayat_status_tim;
DROP TABLE IF EXISTS anggota_tim;
DROP TABLE IF EXISTS tim;
DROP TABLE IF EXISTS anggota;
DROP TABLE IF EXISTS dosen;
DROP TABLE IF EXISTS divisi;

SET FOREIGN_KEY_CHECKS = 1;
```

Penjelasan:

- `SET FOREIGN_KEY_CHECKS = 0` dipakai agar MySQL tidak menolak `DROP TABLE` yang masih punya relasi foreign key.
- `DROP TABLE IF EXISTS` dipakai supaya schema bisa dijalankan ulang tanpa error jika tabel lama masih ada.
- urutan drop dibuat dari tabel paling dependent ke tabel master.
- setelah itu `FOREIGN_KEY_CHECKS` diaktifkan lagi agar integritas data tetap dijaga.

### Query membuat tabel `divisi`

```sql
CREATE TABLE divisi (
  id_divisi INT PRIMARY KEY AUTO_INCREMENT,
  jenis_perlombaan ENUM('KOMPETISI', 'KARYA CIPTA') NOT NULL,
  nama_divisi VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Penjelasan:

- `id_divisi` adalah primary key dan auto increment.
- `jenis_perlombaan` memakai enum karena nilainya sudah pasti dan terbatas.
- `nama_divisi` wajib diisi.
- `ENGINE=InnoDB` dipilih karena mendukung foreign key dan transaction.
- `utf8mb4` dipakai agar encoding teks aman dan umum dipakai.

### Query membuat tabel `dosen`

```sql
CREATE TABLE dosen (
  id_dosen INT PRIMARY KEY AUTO_INCREMENT,
  nama_dosen VARCHAR(100) NOT NULL,
  nidn VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Penjelasan:

- `nidn` dibuat `UNIQUE` agar satu dosen tidak tercatat dua kali dengan NIDN sama.
- `email` juga dibuat `UNIQUE` untuk mencegah duplikasi dosen.
- tabel ini dipakai sebagai master dosen pembimbing tim.

### Query membuat tabel `anggota`

```sql
CREATE TABLE anggota (
  id_anggota INT PRIMARY KEY AUTO_INCREMENT,
  id_divisi_minat INT NOT NULL,
  nama_anggota VARCHAR(100) NOT NULL,
  no_whatsapp VARCHAR(20) NOT NULL,
  jurusan VARCHAR(100) NOT NULL,
  nrp VARCHAR(30) NOT NULL UNIQUE,
  CONSTRAINT fk_anggota_divisi
    FOREIGN KEY (id_divisi_minat)
    REFERENCES divisi(id_divisi)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Penjelasan:

- tabel `anggota` menyimpan seluruh mahasiswa pendaftar.
- `id_divisi_minat` adalah foreign key ke `divisi`.
- `nrp` dibuat `UNIQUE` karena satu mahasiswa tidak boleh punya lebih dari satu identitas di tabel ini.
- `ON UPDATE CASCADE` artinya jika `id_divisi` di tabel master berubah, relasinya ikut diperbarui.
- `ON DELETE RESTRICT` artinya divisi tidak bisa dihapus kalau masih dipakai anggota.

### Query membuat tabel `tim`

```sql
CREATE TABLE tim (
  id_tim INT PRIMARY KEY AUTO_INCREMENT,
  nama_tim VARCHAR(100) NOT NULL,
  id_divisi INT NOT NULL,
  id_dosen INT NOT NULL,
  judul VARCHAR(255) NOT NULL,
  tanggal_daftar DATE NOT NULL,
  status_pendaftaran ENUM('MENUNGGU', 'TERKONFIRMASI', 'DITOLAK') NOT NULL DEFAULT 'MENUNGGU',
  CONSTRAINT fk_tim_divisi
    FOREIGN KEY (id_divisi)
    REFERENCES divisi(id_divisi)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_tim_dosen
    FOREIGN KEY (id_dosen)
    REFERENCES dosen(id_dosen)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Penjelasan:

- satu tim harus terhubung ke satu divisi dan satu dosen pembimbing.
- `status_pendaftaran` default-nya `MENUNGGU`, sehingga setelah user mendaftar tim belum otomatis diterima.
- `judul` dibuat `VARCHAR(255)` karena judul proyek bisa lebih panjang dari nama tim.

### Query membuat tabel `anggota_tim`

```sql
CREATE TABLE anggota_tim (
  id_anggota_tim INT PRIMARY KEY AUTO_INCREMENT,
  id_tim INT NOT NULL,
  id_anggota INT NOT NULL,
  peran ENUM('KETUA', 'ANGGOTA') NOT NULL,
  CONSTRAINT fk_anggota_tim_tim
    FOREIGN KEY (id_tim)
    REFERENCES tim(id_tim)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_anggota_tim_anggota
    FOREIGN KEY (id_anggota)
    REFERENCES anggota(id_anggota)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT uq_anggota_per_tim UNIQUE (id_anggota)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Penjelasan:

- tabel ini adalah tabel penghubung antara `tim` dan `anggota`.
- `peran` disimpan di sini karena peran bergantung pada tim yang diikuti.
- `ON DELETE CASCADE` pada `id_tim` artinya jika tim dihapus, relasi anggota terhadap tim itu ikut hilang.
- `UNIQUE (id_anggota)` berarti satu anggota hanya boleh masuk satu tim.

### Query membuat tabel audit `riwayat_status_tim`

```sql
CREATE TABLE riwayat_status_tim (
  id_riwayat INT PRIMARY KEY AUTO_INCREMENT,
  id_tim INT NOT NULL,
  status_lama ENUM('MENUNGGU', 'TERKONFIRMASI', 'DITOLAK'),
  status_baru ENUM('MENUNGGU', 'TERKONFIRMASI', 'DITOLAK') NOT NULL,
  waktu_perubahan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_riwayat_tim
    FOREIGN KEY (id_tim)
    REFERENCES tim(id_tim)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Penjelasan:

- tabel ini menyimpan histori perubahan status tim.
- `status_lama` boleh null untuk kasus tertentu.
- `waktu_perubahan` otomatis terisi dengan waktu saat perubahan dicatat.

### Query index

```sql
CREATE INDEX idx_anggota_id_divisi_minat ON anggota(id_divisi_minat);
CREATE INDEX idx_tim_id_divisi ON tim(id_divisi);
CREATE INDEX idx_tim_id_dosen ON tim(id_dosen);
CREATE INDEX idx_anggota_tim_id_tim ON anggota_tim(id_tim);
CREATE INDEX idx_anggota_tim_id_anggota ON anggota_tim(id_anggota);
```

Penjelasan:

- index dipakai untuk mempercepat query yang sering melakukan join dan filtering.
- kolom foreign key biasanya memang baik diberi index karena sering dipakai pada `JOIN`.

### Trigger `trg_audit_status_tim`

```sql
CREATE TRIGGER trg_audit_status_tim
AFTER UPDATE ON tim
FOR EACH ROW
BEGIN
    IF OLD.status_pendaftaran != NEW.status_pendaftaran THEN
        INSERT INTO riwayat_status_tim (id_tim, status_lama, status_baru)
        VALUES (OLD.id_tim, OLD.status_pendaftaran, NEW.status_pendaftaran);
    END IF;
END
```

Penjelasan:

- trigger ini aktif setelah update pada tabel `tim`.
- `OLD` berarti nilai sebelum update, `NEW` berarti nilai sesudah update.
- jika status berubah, data dicatat ke tabel audit.

### Trigger `trg_cek_ketua_tim`

```sql
CREATE TRIGGER trg_cek_ketua_tim
BEFORE INSERT ON anggota_tim
FOR EACH ROW
BEGIN
    DECLARE jumlah_ketua INT;
    IF NEW.peran = 'KETUA' THEN
        SELECT COUNT(*) INTO jumlah_ketua
        FROM anggota_tim
        WHERE id_tim = NEW.id_tim AND peran = 'KETUA';

        IF jumlah_ketua > 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tim sudah memiliki KETUA. Hanya diperbolehkan 1 KETUA per tim.';
        END IF;
    END IF;
END
```

Penjelasan:

- trigger ini memeriksa apakah sebuah tim sudah punya ketua.
- jika masih menambahkan anggota biasa, trigger tidak melakukan apa-apa.
- jika menambahkan `KETUA` kedua, MySQL melempar error custom dengan `SIGNAL`.

### Trigger `trg_format_anggota`

```sql
CREATE TRIGGER trg_format_anggota
BEFORE INSERT ON anggota
FOR EACH ROW
BEGIN
    SET NEW.nama_anggota = UPPER(NEW.nama_anggota);
    SET NEW.nrp = UPPER(NEW.nrp);
END
```

Penjelasan:

- sebelum data anggota disimpan, nama dan NRP dibuat uppercase.
- tujuan utamanya untuk menyeragamkan format data.

### Function `fn_GetJumlahAnggota`

```sql
CREATE FUNCTION fn_GetJumlahAnggota(p_id_tim INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total FROM anggota_tim WHERE id_tim = p_id_tim;
    RETURN total;
END
```

Penjelasan:

- function ini menerima parameter `id_tim`.
- function menghitung berapa anggota yang terhubung ke tim tersebut.
- dipakai pada query admin agar jumlah anggota bisa langsung muncul sebagai kolom.

### Function `fn_GenerateKodeRegistrasi`

```sql
CREATE FUNCTION fn_GenerateKodeRegistrasi(p_id_tim INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE yr VARCHAR(4);
    DECLARE padded_id VARCHAR(10);
    SET yr = YEAR(CURDATE());
    SET padded_id = LPAD(p_id_tim, 4, '0');
    RETURN CONCAT('CIGITS-', yr, '-', padded_id);
END
```

Penjelasan:

- `LPAD` dipakai untuk memberi nol di depan angka ID tim.
- `CONCAT` menggabungkan prefix, tahun, dan nomor.
- contoh hasil: `CIGITS-2026-0001`.

### Procedure `sp_GetDashboardStats`

```sql
CREATE PROCEDURE sp_GetDashboardStats()
BEGIN
    DECLARE total_solo INT;
    DECLARE total_tim INT;
    DECLARE tim_menunggu INT;
    DECLARE tim_terkonfirmasi INT;

    SELECT COUNT(*) INTO total_solo
    FROM anggota a
    LEFT JOIN anggota_tim at ON a.id_anggota = at.id_anggota
    WHERE at.id_anggota IS NULL;

    SELECT COUNT(*) INTO total_tim FROM tim;
    SELECT COUNT(*) INTO tim_menunggu FROM tim WHERE status_pendaftaran = 'MENUNGGU';
    SELECT COUNT(*) INTO tim_terkonfirmasi FROM tim WHERE status_pendaftaran = 'TERKONFIRMASI';

    SELECT total_solo, total_tim, tim_menunggu, tim_terkonfirmasi;
END
```

Penjelasan:

- procedure ini tidak menerima parameter.
- pertama menghitung peserta solo dengan logika anggota yang belum punya relasi di `anggota_tim`.
- lalu menghitung total tim dan statistik status.
- hasil akhirnya dikembalikan sebagai satu row ringkasan.

### Procedure `sp_VerifikasiTim`

```sql
CREATE PROCEDURE sp_VerifikasiTim(IN p_id_tim INT)
BEGIN
    DECLARE current_status VARCHAR(20);
    DECLARE ketua_count INT;

    START TRANSACTION;

    SELECT status_pendaftaran INTO current_status
    FROM tim
    WHERE id_tim = p_id_tim
    FOR UPDATE;

    IF current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tim tidak ditemukan.';
        ROLLBACK;
    ELSEIF current_status != 'MENUNGGU' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tim tidak dalam status MENUNGGU.';
        ROLLBACK;
    ELSE
        SELECT COUNT(*) INTO ketua_count
        FROM anggota_tim
        WHERE id_tim = p_id_tim AND peran = 'KETUA';

        IF ketua_count != 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tim tidak valid. Harus memiliki tepat 1 KETUA.';
            ROLLBACK;
        ELSE
            UPDATE tim
            SET status_pendaftaran = 'TERKONFIRMASI'
            WHERE id_tim = p_id_tim;
            COMMIT;
        END IF;
    END IF;
END
```

Penjelasan:

- procedure ini memastikan verifikasi tim tidak sekadar update biasa.
- `FOR UPDATE` mengunci row tim yang sedang diproses.
- procedure mengecek tiga hal: tim ada, status masih `MENUNGGU`, dan jumlah ketua tepat satu.
- kalau valid, status diubah ke `TERKONFIRMASI`.

## 13. Penjelasan Lengkap `seed.sql`

`seed.sql` dipakai untuk mengisi data awal agar sistem bisa langsung didemokan tanpa harus menginput semuanya manual.

### Insert data `divisi`

```sql
INSERT INTO divisi (id_divisi, jenis_perlombaan, nama_divisi) VALUES
...
```

Penjelasan:

- mengisi 11 divisi GEMASTIK.
- `id_divisi` ditulis manual agar sesuai dengan acuan data dan lebih mudah dipakai di contoh.
- ada kombinasi dua kategori: `KOMPETISI` dan `KARYA CIPTA`.

### Insert data `dosen`

```sql
INSERT INTO dosen (id_dosen, nama_dosen, nidn, email) VALUES
...
```

Penjelasan:

- mengisi beberapa data dosen dummy untuk testing.
- data ini dipakai agar dashboard admin dan pendaftaran tim sudah punya contoh relasi dosen.

### Insert data `anggota`

```sql
INSERT INTO anggota (id_anggota, id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp) VALUES
...
```

Penjelasan:

- seluruh mahasiswa awal dimasukkan ke tabel `anggota`.
- sebagian anggota nanti tetap menjadi solo.
- sebagian anggota akan dipakai di tabel `anggota_tim` untuk menjadi anggota tim resmi.

### Insert data `tim`

```sql
INSERT INTO tim (id_tim, nama_tim, id_divisi, id_dosen, judul, tanggal_daftar, status_pendaftaran) VALUES
...
```

Penjelasan:

- membuat tiga data contoh tim.
- masing-masing tim dihubungkan ke divisi dan dosen.
- status sengaja dibuat bervariasi: `MENUNGGU`, `TERKONFIRMASI`, dan `DITOLAK` agar dashboard admin langsung punya contoh semua kondisi.

### Insert data `anggota_tim`

```sql
INSERT INTO anggota_tim (id_anggota_tim, id_tim, id_anggota, peran) VALUES
...
```

Penjelasan:

- menghubungkan anggota ke tim.
- data ini yang menentukan siapa ketua dan siapa anggota.
- dari sini juga sistem bisa menghitung siapa yang masih solo, yaitu anggota yang tidak muncul di tabel ini.

## 14. Penjelasan File Backend

### File `backend/src/app.js`

Fungsi file ini:

- membuat aplikasi Express
- mengaktifkan `cors()`
- mengaktifkan `express.json()` agar request body JSON bisa dibaca
- memuat route master, pendaftaran, dan admin
- menyediakan endpoint root `/`
- menyediakan handler `404`
- menyediakan global error handler
- menjalankan server pada port dari `.env`

Secara singkat, `app.js` adalah pintu masuk backend.

### File `backend/src/config/db.js`

Fungsi file ini:

- membaca konfigurasi `.env`
- membuat pool koneksi MySQL dengan `mysql2/promise`
- mengatur `connectionLimit`

Kenapa pakai pool:

- koneksi lebih efisien
- lebih aman untuk banyak request
- cocok untuk backend Express yang menerima banyak akses

### File `backend/src/routes/masterRoutes.js`

Route yang disediakan:

- `GET /api/divisi`
- `GET /api/dosen`

Tugas file route:

- menghubungkan URL ke controller yang sesuai

### File `backend/src/routes/pendaftaranRoutes.js`

Route yang disediakan:

- `POST /api/pendaftaran/solo`
- `POST /api/pendaftaran/tim`

### File `backend/src/routes/adminRoutes.js`

Route yang disediakan:

- `GET /api/admin/stats`
- `GET /api/admin/solo`
- `GET /api/admin/tim`
- `GET /api/admin/tim/:id`
- `PATCH /api/admin/tim/:id/verifikasi`
- `PATCH /api/admin/tim/:id/tolak`

### File `backend/src/controllers/masterController.js`

Controller ini berisi dua fungsi utama.

#### `getDivisi`

Query:

```sql
SELECT id_divisi, jenis_perlombaan, nama_divisi
FROM divisi
ORDER BY id_divisi
```

Penjelasan:

- mengambil seluruh data divisi
- diurutkan berdasarkan ID
- dipakai untuk dropdown frontend

#### `getDosen`

Query:

```sql
SELECT id_dosen, nama_dosen, nidn, email
FROM dosen
ORDER BY nama_dosen
```

Penjelasan:

- mengambil seluruh dosen
- diurutkan alfabetis

### File `backend/src/controllers/pendaftaranController.js`

Ini adalah controller terpenting karena menangani logika bisnis pendaftaran.

#### Fungsi `daftarSolo`

Langkah kerja:

1. membaca `nama_anggota`, `nrp`, `jurusan`, `no_whatsapp`, `id_divisi_minat`
2. memeriksa apakah ada field kosong
3. mengecek apakah `id_divisi_minat` valid
4. menyiapkan object `pendaftar`
5. insert ke tabel `anggota`
6. jika `nrp` sudah ada, MySQL akan melempar `ER_DUP_ENTRY`

Query validasi divisi:

```sql
SELECT id_divisi FROM divisi WHERE id_divisi = ?
```

Query insert solo:

```sql
INSERT INTO anggota
  (id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp)
VALUES (?, ?, ?, ?, ?)
```

Kenapa peserta solo masuk ke `anggota`:

- karena secara entitas mereka tetap mahasiswa pendaftar
- status solo ditentukan dari belum adanya relasi di `anggota_tim`

#### Fungsi `daftarTim`

Fungsi ini paling kompleks karena memakai transaction.

##### Tahap 1: validasi input

Backend memeriksa:

- `nama_tim`, `id_divisi`, `judul` wajib diisi
- object `dosen` wajib ada
- `nama_dosen`, `nidn`, `email` wajib diisi
- array `anggota` minimal satu
- harus ada tepat satu `KETUA`
- `nrp` anggota dalam request yang sama tidak boleh duplikat

##### Tahap 2: buka transaction

```js
connection = await db.getConnection();
await connection.beginTransaction();
```

Alasannya:

- proses menyentuh tabel `dosen`, `tim`, `anggota`, dan `anggota_tim`
- jika satu gagal, semua harus dibatalkan

##### Tahap 3: cek divisi

Query:

```sql
SELECT id_divisi FROM divisi WHERE id_divisi = ?
```

Jika divisi tidak ada, transaction rollback.

##### Tahap 4: insert atau reuse dosen

Query insert dosen:

```sql
INSERT INTO dosen (nama_dosen, nidn, email) VALUES (?, ?, ?)
```

Jika gagal karena duplicate:

```sql
SELECT id_dosen, nidn, email
FROM dosen
WHERE nidn = ? OR email = ?
LIMIT 1
```

Penjelasan:

- jika dosen belum ada, backend membuat dosen baru
- jika dosen sudah ada dan identitasnya cocok, backend memakai `id_dosen` lama
- jika NIDN dan email konflik dengan data dosen lain, backend menolak request

##### Tahap 5: insert tim

Query:

```sql
INSERT INTO tim
  (nama_tim, id_divisi, id_dosen, judul, tanggal_daftar, status_pendaftaran)
VALUES (?, ?, ?, ?, ?, 'MENUNGGU')
```

Penjelasan:

- setiap tim baru otomatis berstatus `MENUNGGU`
- tanggal daftar diisi dari backend

##### Tahap 6: insert atau update anggota

Query insert anggota:

```sql
INSERT INTO anggota
  (id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp)
VALUES (?, ?, ?, ?, ?)
```

Jika duplicate NRP:

```sql
UPDATE anggota
SET id_divisi_minat = ?, nama_anggota = ?, no_whatsapp = ?, jurusan = ?
WHERE nrp = ?
```

Lalu ambil kembali ID anggota:

```sql
SELECT id_anggota FROM anggota WHERE nrp = ? LIMIT 1
```

Penjelasan:

- jika anggota benar-benar baru, dibuat data baru
- jika anggota sudah pernah ada di tabel `anggota`, datanya disesuaikan lalu dipakai lagi

##### Tahap 7: hubungkan ke tabel `anggota_tim`

Query:

```sql
INSERT INTO anggota_tim (id_tim, id_anggota, peran) VALUES (?, ?, ?)
```

Di tahap ini ada dua proteksi:

- trigger memastikan satu tim hanya punya satu ketua
- unique `id_anggota` memastikan satu anggota tidak masuk dua tim

##### Tahap 8: commit atau rollback

- jika semua sukses, backend menjalankan `COMMIT`
- jika ada error, backend menjalankan `ROLLBACK`

### File `backend/src/controllers/adminController.js`

Controller ini menangani tampilan admin.

#### Fungsi `getSolo`

Query:

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
ORDER BY a.id_anggota DESC
```

Penjelasan:

- `JOIN divisi` dipakai untuk menampilkan nama divisi minat
- `LEFT JOIN anggota_tim` dipakai untuk mengecek apakah anggota sudah masuk tim
- `WHERE at.id_anggota_tim IS NULL` adalah logika inti untuk menentukan peserta solo

#### Fungsi `getTim`

Query:

```sql
SELECT
  t.id_tim,
  fn_GenerateKodeRegistrasi(t.id_tim) AS kode_registrasi,
  t.nama_tim,
  t.id_divisi,
  d.nama_divisi,
  dosen.id_dosen,
  dosen.nama_dosen,
  dosen.nidn,
  dosen.email AS email_dosen,
  t.judul,
  DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
  t.status_pendaftaran AS status,
  fn_GetJumlahAnggota(t.id_tim) AS jumlah_anggota
FROM tim t
JOIN divisi d ON d.id_divisi = t.id_divisi
JOIN dosen ON dosen.id_dosen = t.id_dosen
ORDER BY t.id_tim DESC
```

Penjelasan:

- query ini menampilkan daftar tim dengan data yang lebih lengkap dari sekadar tabel `tim`
- function `fn_GenerateKodeRegistrasi` membentuk kode registrasi
- function `fn_GetJumlahAnggota` menghitung total anggota
- `DATE_FORMAT` dipakai agar tanggal tampil rapi di frontend

#### Fungsi `getDetailTim`

Query pertama untuk header tim:

```sql
SELECT
  t.id_tim,
  fn_GenerateKodeRegistrasi(t.id_tim) AS kode_registrasi,
  t.nama_tim,
  t.id_divisi,
  d.nama_divisi,
  dosen.id_dosen,
  dosen.nama_dosen,
  dosen.nidn,
  dosen.email AS email_dosen,
  t.judul,
  DATE_FORMAT(t.tanggal_daftar, '%Y-%m-%d') AS tanggal_daftar,
  t.status_pendaftaran AS status
FROM tim t
JOIN divisi d ON d.id_divisi = t.id_divisi
JOIN dosen ON dosen.id_dosen = t.id_dosen
WHERE t.id_tim = ?
```

Query kedua untuk anggota tim:

```sql
SELECT
  at.id_anggota_tim,
  at.peran,
  a.id_anggota,
  a.nama_anggota,
  a.nrp,
  a.jurusan,
  a.no_whatsapp
FROM anggota_tim at
JOIN anggota a ON a.id_anggota = at.id_anggota
WHERE at.id_tim = ?
ORDER BY
  CASE at.peran WHEN 'KETUA' THEN 0 ELSE 1 END,
  at.id_anggota_tim
```

Penjelasan:

- query pertama mengambil identitas tim
- query kedua mengambil seluruh anggota tim
- `CASE at.peran WHEN 'KETUA' THEN 0 ELSE 1 END` memastikan ketua tampil paling atas

#### Fungsi `updateStatusTim`

Query update:

```sql
UPDATE tim SET status_pendaftaran = ? WHERE id_tim = ?
```

Setelah update, backend mengambil ulang data tim:

```sql
SELECT t.id_tim, t.nama_tim, t.status_pendaftaran AS status
FROM tim t
WHERE t.id_tim = ?
```

Penjelasan:

- fungsi ini dipakai oleh aksi tolak
- juga bisa dipakai untuk update status sederhana selain verifikasi

#### Fungsi `verifikasiTim`

Query utama:

```sql
CALL sp_VerifikasiTim(?)
```

Penjelasan:

- backend menyerahkan validasi bisnis verifikasi ke stored procedure
- kalau procedure melempar `SIGNAL`, backend membaca `sqlState = '45000'` lalu mengembalikan pesan error yang sesuai

#### Fungsi `getDashboardStats`

Query:

```sql
CALL sp_GetDashboardStats()
```

Penjelasan:

- backend memanggil stored procedure untuk mengambil ringkasan statistik
- hasil procedure dibaca dari `rows[0][0]`

## 15. Query Penting yang Bisa Dijelaskan Saat Demo

### Query master divisi

```sql
SELECT id_divisi, jenis_perlombaan, nama_divisi
FROM divisi
ORDER BY id_divisi;
```

Makna:

- ini query paling dasar untuk mengambil data master.
- dipakai di dropdown frontend dan bisa dijelaskan sebagai contoh query `SELECT` sederhana.

### Query master dosen

```sql
SELECT id_dosen, nama_dosen, nidn, email
FROM dosen
ORDER BY nama_dosen;
```

Makna:

- mengurutkan dosen secara alfabetis agar lebih nyaman ditampilkan.

### Query peserta solo

```sql
SELECT
  a.id_anggota,
  a.nama_anggota,
  a.nrp,
  a.jurusan,
  a.no_whatsapp,
  d.nama_divisi
FROM anggota a
JOIN divisi d ON d.id_divisi = a.id_divisi_minat
LEFT JOIN anggota_tim at ON at.id_anggota = a.id_anggota
WHERE at.id_anggota_tim IS NULL;
```

Makna:

- `JOIN divisi` dipakai agar tidak hanya menampilkan ID divisi tetapi nama divisinya.
- `LEFT JOIN anggota_tim` dipakai karena tidak semua anggota punya tim.
- filter `IS NULL` adalah inti identifikasi peserta solo.

### Query daftar tim lengkap

```sql
SELECT
  t.id_tim,
  fn_GenerateKodeRegistrasi(t.id_tim) AS kode_registrasi,
  t.nama_tim,
  d.nama_divisi,
  dosen.nama_dosen,
  t.judul,
  fn_GetJumlahAnggota(t.id_tim) AS jumlah_anggota,
  t.status_pendaftaran
FROM tim t
JOIN divisi d ON d.id_divisi = t.id_divisi
JOIN dosen ON dosen.id_dosen = t.id_dosen;
```

Makna:

- ini query menampilkan data gabungan dari beberapa tabel.
- cocok dijelaskan sebagai contoh query join yang memakai function.

### Query detail anggota tim

```sql
SELECT
  at.peran,
  a.nama_anggota,
  a.nrp,
  a.jurusan,
  a.no_whatsapp
FROM anggota_tim at
JOIN anggota a ON a.id_anggota = at.id_anggota
WHERE at.id_tim = 1;
```

Makna:

- query ini menunjukkan bagaimana relasi anggota dan tim dibaca kembali.
- bagus dijelaskan untuk menunjukkan fungsi tabel penghubung.

### Query riwayat status tim

```sql
SELECT *
FROM riwayat_status_tim
ORDER BY waktu_perubahan DESC;
```

Makna:

- query ini menunjukkan bahwa status tim tidak hanya berubah, tetapi juga tercatat historinya.

### Query statistik dashboard melalui procedure

```sql
CALL sp_GetDashboardStats();
```

Makna:

- menunjukkan bahwa sebagian logika rekap dipindah ke database, bukan dihitung manual di backend.

## 16. Contoh Modifikasi Database yang Mungkin Diminta Saat Demo

### Menambah divisi baru

```sql
INSERT INTO divisi (jenis_perlombaan, nama_divisi)
VALUES ('KARYA CIPTA', 'AI for Education');
```

### Mengubah nama dosen

```sql
UPDATE dosen
SET nama_dosen = 'Dr. Nama Baru, S.Kom., M.Kom.'
WHERE id_dosen = 1;
```

### Menampilkan semua tim yang masih menunggu

```sql
SELECT *
FROM tim
WHERE status_pendaftaran = 'MENUNGGU';
```

### Menolak tim tertentu

```sql
UPDATE tim
SET status_pendaftaran = 'DITOLAK'
WHERE id_tim = 2;
```

### Memverifikasi tim dengan stored procedure

```sql
CALL sp_VerifikasiTim(1);
```

### Menambah anggota ke tim

Langkah umum:

1. insert dulu ke tabel `anggota`
2. insert relasi ke tabel `anggota_tim`

Contoh:

```sql
INSERT INTO anggota (id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp)
VALUES (8, 'BUDI SETIAWAN', '081234567899', 'INFORMATIKA', '5025221999');

INSERT INTO anggota_tim (id_tim, id_anggota, peran)
VALUES (1, LAST_INSERT_ID(), 'ANGGOTA');
```

## 17. Transaction yang Kami Gunakan

Transaction utama berada pada proses pendaftaran tim.

Alurnya:

1. backend membuka transaction
2. cek divisi
3. insert atau ambil dosen
4. insert tim
5. insert atau update anggota
6. insert relasi anggota_tim
7. jika sukses semua maka `COMMIT`
8. jika ada error maka `ROLLBACK`

Alasan memakai transaction:

- karena pendaftaran tim menyentuh banyak tabel
- agar tidak ada data setengah masuk
- menjaga konsistensi database

## 18. Validasi yang Sudah Diimplementasikan

Validasi pada backend:

- semua field wajib diisi
- divisi harus valid
- tim harus punya minimal satu anggota
- tim harus punya tepat satu ketua
- peran anggota hanya `KETUA` atau `ANGGOTA`
- `nrp` anggota dalam satu tim tidak boleh sama
- satu anggota tidak boleh masuk ke lebih dari satu tim
- NIDN dan email dosen tidak boleh konflik

Validasi pada database:

- unique constraint
- foreign key
- trigger pembatas ketua
- stored procedure verifikasi tim

## 19. Frontend Secara Umum

Frontend terdiri dari empat halaman utama:

- `index.html` untuk landing page
- `daftar-solo.html` untuk form solo
- `daftar-tim.html` untuk form tim
- `admin.html` untuk dashboard admin

Secara umum, frontend hanya bertugas:

- menampilkan form
- mengirim data ke backend
- menampilkan data dari backend
- menampilkan aksi admin

Frontend tidak langsung mengakses database. Semua komunikasi dilakukan melalui backend REST API.

## 20. Deliverable yang Sudah Disiapkan

Deliverable yang diminta:

- simple report
- database
- source code backend

Pada project ini:

- simple report dapat disusun dari README, ERD, schema.sql, dan penjelasan sistem
- database sudah tersedia dalam `database/schema.sql` dan `database/seed.sql`
- source code backend tersedia dalam folder `backend/`

Tambahan yang juga sudah ada:

- frontend untuk demo sistem
- tutorial setup project
- template data master

## 21. Pembagian Penjelasan Saat Demo

Agar semua anggota siap, pembagian yang disarankan:

### Orang 1

Menjelaskan:

- latar belakang
- tujuan sistem
- alur bisnis solo dan tim
- gambaran frontend dan backend

### Orang 2

Menjelaskan:

- ERD
- tabel dan relasi
- constraint
- alasan desain database

### Orang 3

Menjelaskan:

- endpoint backend
- transaction pendaftaran tim
- validasi data
- alur request frontend ke backend ke database

### Orang 4

Menjelaskan:

- trigger
- function
- stored procedure
- query demo
- modifikasi database saat ditanya dosen

## 22. Kemungkinan Pertanyaan Dosen dan Jawaban Singkat

### Kenapa peserta solo disimpan di tabel anggota?

Karena solo tetap merupakan entitas mahasiswa pendaftar. Perbedaannya hanya pada status relasinya, yaitu belum tergabung di `anggota_tim`.

### Kenapa dosen tidak langsung dropdown?

Karena dosen pembimbing bisa sangat banyak dan tidak terbatas. Maka user menginput manual nama, NIDN, dan email, lalu backend mencocokkan atau menambahkan ke tabel `dosen`.

### Kenapa perlu tabel anggota_tim?

Karena relasi tim dengan anggota bersifat many-to-many secara konsep, dan tabel ini juga menyimpan atribut tambahan yaitu `peran`.

### Kenapa pendaftaran tim perlu transaction?

Karena prosesnya mencakup beberapa tabel sekaligus. Jika satu proses gagal, semua perubahan harus dibatalkan agar database tetap konsisten.

### Kenapa memakai trigger dan procedure?

Karena beberapa aturan bisnis lebih aman jika diletakkan langsung di database, misalnya audit status, pembatas satu ketua, dan prosedur verifikasi tim.

## 23. Penutup Singkat

Kesimpulannya, project ini tidak hanya menampilkan form pendaftaran, tetapi juga menerapkan konsep penting Sistem Basis Data:

- desain relasional
- primary key dan foreign key
- unique constraint
- query join
- transaction
- trigger
- function
- stored procedure
- audit data

Dengan demikian, sistem ini relevan sebagai implementasi Final Project Sistem Basis Data karena menunjukkan integrasi antara desain database, logika backend, dan penggunaan data pada aplikasi.
