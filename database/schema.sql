SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS riwayat_status_tim;
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

CREATE INDEX idx_anggota_id_divisi_minat ON anggota(id_divisi_minat);
CREATE INDEX idx_tim_id_divisi ON tim(id_divisi);
CREATE INDEX idx_tim_id_dosen ON tim(id_dosen);
CREATE INDEX idx_anggota_tim_id_tim ON anggota_tim(id_tim);
CREATE INDEX idx_anggota_tim_id_anggota ON anggota_tim(id_anggota);

DELIMITER //

-- Trigger: Audit log for team status changes
DROP TRIGGER IF EXISTS trg_audit_status_tim //
CREATE TRIGGER trg_audit_status_tim
AFTER UPDATE ON tim
FOR EACH ROW
BEGIN
    IF OLD.status_pendaftaran != NEW.status_pendaftaran THEN
        INSERT INTO riwayat_status_tim (id_tim, status_lama, status_baru)
        VALUES (OLD.id_tim, OLD.status_pendaftaran, NEW.status_pendaftaran);
    END IF;
END //

-- Trigger: Enforce only 1 KETUA per team
DROP TRIGGER IF EXISTS trg_cek_ketua_tim //
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
END //

-- Trigger: Auto-format anggota names to UPPERCASE
DROP TRIGGER IF EXISTS trg_format_anggota //
CREATE TRIGGER trg_format_anggota
BEFORE INSERT ON anggota
FOR EACH ROW
BEGIN
    SET NEW.nama_anggota = UPPER(NEW.nama_anggota);
    SET NEW.nrp = UPPER(NEW.nrp);
END //

-- Function: Get total members of a team
DROP FUNCTION IF EXISTS fn_GetJumlahAnggota //
CREATE FUNCTION fn_GetJumlahAnggota(p_id_tim INT) 
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total FROM anggota_tim WHERE id_tim = p_id_tim;
    RETURN total;
END //

-- Function: Generate a unique registration code (e.g., CIGITS-2024-0001)
DROP FUNCTION IF EXISTS fn_GenerateKodeRegistrasi //
CREATE FUNCTION fn_GenerateKodeRegistrasi(p_id_tim INT) 
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE yr VARCHAR(4);
    DECLARE padded_id VARCHAR(10);
    SET yr = YEAR(CURDATE());
    SET padded_id = LPAD(p_id_tim, 4, '0');
    RETURN CONCAT('CIGITS-', yr, '-', padded_id);
END //

-- Procedure: Get dashboard summary statistics
DROP PROCEDURE IF EXISTS sp_GetDashboardStats //
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
END //

-- Procedure: Verify Team safely
DROP PROCEDURE IF EXISTS sp_VerifikasiTim //
CREATE PROCEDURE sp_VerifikasiTim(IN p_id_tim INT)
BEGIN
    DECLARE current_status VARCHAR(20);
    DECLARE ketua_count INT;

    -- Start Transaction
    START TRANSACTION;

    SELECT status_pendaftaran INTO current_status FROM tim WHERE id_tim = p_id_tim FOR UPDATE;

    IF current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tim tidak ditemukan.';
        ROLLBACK;
    ELSEIF current_status != 'MENUNGGU' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tim tidak dalam status MENUNGGU.';
        ROLLBACK;
    ELSE
        -- Ensure team has a KETUA
        SELECT COUNT(*) INTO ketua_count FROM anggota_tim WHERE id_tim = p_id_tim AND peran = 'KETUA';
        IF ketua_count != 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tim tidak valid. Harus memiliki tepat 1 KETUA.';
            ROLLBACK;
        ELSE
            UPDATE tim SET status_pendaftaran = 'TERKONFIRMASI' WHERE id_tim = p_id_tim;
            COMMIT;
        END IF;
    END IF;
END //

DELIMITER ;
