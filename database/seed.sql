INSERT INTO divisi (id_divisi, jenis_perlombaan, nama_divisi) VALUES
(1, 'KOMPETISI', 'Pemrograman'),
(2, 'KOMPETISI', 'Keamanan Siber'),
(3, 'KOMPETISI', 'Penambangan Data'),
(4, 'KARYA CIPTA', 'Desain Pengalaman Pengguna'),
(5, 'KARYA CIPTA', 'Animasi'),
(6, 'KARYA CIPTA', 'Kota Cerdas'),
(7, 'KARYA CIPTA', 'Karya Tulis Ilmiah TIK'),
(8, 'KARYA CIPTA', 'Pengembangan Perangkat Lunak'),
(9, 'KARYA CIPTA', 'Piranti Cerdas, Sistem Benam, dan IoT'),
(10, 'KARYA CIPTA', 'Pengembangan Aplikasi Permainan'),
(11, 'KARYA CIPTA', 'Pengembangan Bisnis TIK');

INSERT INTO dosen (id_dosen, nama_dosen, nidn, email) VALUES
(1, 'Dr. Budi Santoso, S.Kom., M.Kom.', '0010017601', 'budi.santoso@its.ac.id'),
(2, 'Dr. Siti Rahmawati, S.T., M.T.', '0021048202', 'siti.rahmawati@its.ac.id'),
(3, 'Prof. Andi Wijaya, S.Kom., M.Sc.', '0009037003', 'andi.wijaya@its.ac.id'),
(4, 'Dewi Lestari, S.Kom., M.Kom.', '0015088804', 'dewi.lestari@its.ac.id'),
(5, 'Rizky Pratama, S.T., M.T.', '0022128505', 'rizky.pratama@its.ac.id');

INSERT INTO anggota (id_anggota, id_divisi_minat, nama_anggota, no_whatsapp, jurusan, nrp) VALUES
(1, 10, 'Ahmad Fauzan', '081234567890', 'Informatika', '5025221001'),
(2, 10, 'Nadia Putri', '081298765432', 'Sistem Informasi', '5026221002'),
(3, 9, 'Raka Aditya', '081233344455', 'Teknik Komputer', '5027221003'),
(4, 9, 'Salsa Kirana', '081266677788', 'Informatika', '5025221004'),
(5, 8, 'Dimas Prakoso', '081299900011', 'Sistem Informasi', '5026221005'),
(6, 8, 'Alya Maharani', '081211122233', 'Teknik Komputer', '5027221006'),
(7, 8, 'Bagas Ramadhan', '081244455566', 'Informatika', '5025221007'),
(8, 10, 'Citra Lestari', '081277788899', 'Desain Produk Industri', '0825221008'),
(9, 10, 'Fajar Nugroho', '081300011122', 'Sistem Informasi', '5026221009'),
(10, 10, 'Melati Safira', '081333344455', 'Informatika', '5025221010');

INSERT INTO tim (id_tim, nama_tim, id_divisi, id_dosen, judul, tanggal_daftar, status_pendaftaran) VALUES
(1, 'Cigits Dev Team', 8, 1, 'Sistem Informasi Pendaftaran CiGITS GEMASTIK ITS', '2026-06-14', 'MENUNGGU'),
(2, 'GameLab ITS', 10, 2, 'Game Edukasi Strategi Data untuk Mahasiswa', '2026-06-14', 'TERKONFIRMASI'),
(3, 'IoT Vision', 9, 3, 'Sistem Monitoring Ruang Berbasis IoT', '2026-06-14', 'DITOLAK');

INSERT INTO anggota_tim (id_anggota_tim, id_tim, id_anggota, peran) VALUES
(1, 1, 5, 'KETUA'),
(2, 1, 6, 'ANGGOTA'),
(3, 1, 7, 'ANGGOTA'),
(4, 2, 8, 'KETUA'),
(5, 2, 9, 'ANGGOTA'),
(6, 2, 10, 'ANGGOTA'),
(7, 3, 3, 'KETUA'),
(8, 3, 4, 'ANGGOTA');
