-- Patch data untuk tim IoT Vision agar jumlah anggota tidak 0.
-- Jalankan di phpMyAdmin pada database cigits_gemastik jika seed lama sudah terlanjur di-import.

UPDATE anggota
SET id_divisi_minat = 9,
    jurusan = 'Teknik Komputer',
    nrp = '5027221003'
WHERE id_anggota = 3;

UPDATE anggota
SET id_divisi_minat = 9
WHERE id_anggota = 4;

INSERT IGNORE INTO anggota_tim (id_anggota_tim, id_tim, id_anggota, peran) VALUES
(7, 3, 3, 'KETUA'),
(8, 3, 4, 'ANGGOTA');
