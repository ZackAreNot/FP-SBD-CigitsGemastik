SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS anggota_tim;
DROP TABLE IF EXISTS tim;
DROP TABLE IF EXISTS anggota;
DROP TABLE IF EXISTS dosen;
DROP TABLE IF EXISTS divisi;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE divisi (
  id_divisi INT PRIMARY KEY AUTO_INCREMENT,
  jenis_perlombaan ENUM('KOMPETISI', 'KARYA CIPTA') NOT NULL,
  nama_divisi VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE dosen (
  id_dosen INT PRIMARY KEY AUTO_INCREMENT,
  nama_dosen VARCHAR(100) NOT NULL,
  nidn VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE INDEX idx_anggota_id_divisi_minat ON anggota(id_divisi_minat);
CREATE INDEX idx_tim_id_divisi ON tim(id_divisi);
CREATE INDEX idx_tim_id_dosen ON tim(id_dosen);
CREATE INDEX idx_anggota_tim_id_tim ON anggota_tim(id_tim);
CREATE INDEX idx_anggota_tim_id_anggota ON anggota_tim(id_anggota);
