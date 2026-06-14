from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape


OUTPUT_PATH = Path(__file__).resolve().parents[1] / "Tabel_Data_Master.xlsx"


ROWS = [
    ["TABEL DATA MASTER CIGITS GEMASTIK ITS"],
    ["Catatan", "File ini disusun sebagai contoh data awal. Data solo dipakai sebagai pool peserta per divisi untuk dishare, sedangkan data tim adalah pendaftaran resmi yang diverifikasi admin."],
    [],
    ["DIVISI"],
    ["id_divisi", "jenis_perlombaan", "nama_divisi"],
    [1, "KOMPETISI", "Pemrograman"],
    [2, "KOMPETISI", "Keamanan Siber"],
    [3, "KOMPETISI", "Penambangan Data"],
    [4, "KARYA CIPTA", "Desain Pengalaman Pengguna"],
    [5, "KARYA CIPTA", "Animasi"],
    [6, "KARYA CIPTA", "Kota Cerdas"],
    [7, "KARYA CIPTA", "Karya Tulis Ilmiah TIK"],
    [8, "KARYA CIPTA", "Pengembangan Perangkat Lunak"],
    [9, "KARYA CIPTA", "Piranti Cerdas, Sistem Benam, dan IoT"],
    [10, "KARYA CIPTA", "Pengembangan Aplikasi Permainan"],
    [11, "KARYA CIPTA", "Pengembangan Bisnis TIK"],
    [],
    ["DOSEN"],
    ["id_dosen", "nama_dosen", "nidn", "email", "catatan"],
    [1, "Dr. Budi Santoso, S.Kom., M.Kom.", "0010017601", "budi.santoso@its.ac.id", "Contoh dosen dari input pendaftaran tim"],
    [2, "Dr. Siti Rahmawati, S.T., M.T.", "0021048202", "siti.rahmawati@its.ac.id", "Contoh dosen dari input pendaftaran tim"],
    [3, "Prof. Andi Wijaya, S.Kom., M.Sc.", "0009037003", "andi.wijaya@its.ac.id", "Contoh dosen dari input pendaftaran tim"],
    [4, "Dewi Lestari, S.Kom., M.Kom.", "0015088804", "dewi.lestari@its.ac.id", "Contoh dosen dari input pendaftaran tim"],
    [5, "Rizky Pratama, S.T., M.T.", "0022128505", "rizky.pratama@its.ac.id", "Contoh dosen dari input pendaftaran tim"],
    [],
    ["ANGGOTA"],
    ["id_anggota", "id_divisi_minat", "nama_anggota", "no_whatsapp", "jurusan", "nrp", "jenis_data", "catatan"],
    [1, 10, "Ahmad Fauzan", "081234567890", "Informatika", "5025221001", "SOLO", "Pool solo Game Development untuk dishare per divisi"],
    [2, 10, "Nadia Putri", "081298765432", "Sistem Informasi", "5026221002", "SOLO", "Pool solo Game Development untuk mencari tim"],
    [3, 9, "Raka Aditya", "081233344455", "Teknik Komputer", "5027221003", "TIM", "Ketua tim resmi, masuk relasi anggota_tim"],
    [4, 9, "Salsa Kirana", "081266677788", "Informatika", "5025221004", "TIM", "Anggota tim resmi, masuk relasi anggota_tim"],
    [5, 8, "Dimas Prakoso", "081299900011", "Sistem Informasi", "5026221005", "TIM", "Ketua tim resmi, masuk relasi anggota_tim"],
    [6, 8, "Alya Maharani", "081211122233", "Teknik Komputer", "5027221006", "TIM", "Anggota tim resmi, masuk relasi anggota_tim"],
    [7, 8, "Bagas Ramadhan", "081244455566", "Informatika", "5025221007", "TIM", "Anggota tim resmi, masuk relasi anggota_tim"],
    [8, 10, "Citra Lestari", "081277788899", "Desain Produk Industri", "0825221008", "TIM", "Ketua tim resmi, masuk relasi anggota_tim"],
    [9, 10, "Fajar Nugroho", "081300011122", "Sistem Informasi", "5026221009", "TIM", "Anggota tim resmi, masuk relasi anggota_tim"],
    [10, 10, "Melati Safira", "081333344455", "Informatika", "5025221010", "TIM", "Anggota tim resmi, masuk relasi anggota_tim"],
    [],
    ["TIM"],
    ["id_tim", "nama_tim", "id_divisi", "id_dosen", "judul", "tanggal_daftar", "status_pendaftaran", "catatan"],
    [1, "Cigits Dev Team", 8, 1, "Sistem Informasi Pendaftaran CiGITS GEMASTIK ITS", "2026-06-14", "MENUNGGU", "Baru submit, menunggu pengecekan admin"],
    [2, "GameLab ITS", 10, 2, "Game Edukasi Strategi Data untuk Mahasiswa", "2026-06-14", "TERKONFIRMASI", "Data lengkap, sudah diverifikasi admin"],
    [3, "IoT Vision", 9, 3, "Sistem Monitoring Ruang Berbasis IoT", "2026-06-14", "DITOLAK", "Contoh data ditolak karena belum lengkap"],
    [],
    ["ANGGOTA_TIM"],
    ["id_anggota_tim", "id_tim", "id_anggota", "peran"],
    [1, 1, 5, "KETUA"],
    [2, 1, 6, "ANGGOTA"],
    [3, 1, 7, "ANGGOTA"],
    [4, 2, 8, "KETUA"],
    [5, 2, 9, "ANGGOTA"],
    [6, 2, 10, "ANGGOTA"],
    [7, 3, 3, "KETUA"],
    [8, 3, 4, "ANGGOTA"],
    [],
    ["ENUM_REFERENCE"],
    ["kolom", "nilai_enum", "keterangan"],
    ["divisi.jenis_perlombaan", "KOMPETISI", "Divisi kategori kompetisi"],
    ["divisi.jenis_perlombaan", "KARYA CIPTA", "Divisi kategori karya cipta"],
    ["tim.status_pendaftaran", "MENUNGGU", "Status awal setelah tim submit"],
    ["tim.status_pendaftaran", "TERKONFIRMASI", "Tim diterima/terdaftar setelah diverifikasi admin"],
    ["tim.status_pendaftaran", "DITOLAK", "Tim ditolak admin karena data tidak sesuai/tidak lengkap"],
    ["anggota_tim.peran", "KETUA", "Satu tim wajib punya tepat satu ketua"],
    ["anggota_tim.peran", "ANGGOTA", "Anggota selain ketua"],
    [],
    ["ALUR DATA"],
    ["data", "alur"],
    ["Solo", "Masuk tabel anggota dengan jenis_data SOLO. Solo belum masuk anggota_tim, lalu data dapat difilter per id_divisi_minat untuk dishare agar peserta mencari pasangan/tim."],
    ["Tim", "Masuk tabel tim dengan status MENUNGGU. Anggota tim masuk tabel anggota dan relasinya masuk anggota_tim. Admin mengubah status menjadi TERKONFIRMASI atau DITOLAK."],
    ["Dosen", "Form tim mengisi nama, NIDN, dan email dosen. Backend nanti melakukan cek/insert ke tabel dosen, lalu tim menyimpan id_dosen."],
]


def column_name(index):
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def cell_xml(row_index, col_index, value):
    ref = f"{column_name(col_index)}{row_index}"
    if value is None or value == "":
        return f'<c r="{ref}"/>'
    if isinstance(value, (int, float)):
        return f'<c r="{ref}"><v>{value}</v></c>'
    return f'<c r="{ref}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'


def worksheet_xml():
    sheet_rows = []
    for row_index, row in enumerate(ROWS, start=1):
        cells = "".join(cell_xml(row_index, col_index, value) for col_index, value in enumerate(row, start=1))
        sheet_rows.append(f'<row r="{row_index}">{cells}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
        '<sheetFormatPr defaultRowHeight="16"/>'
        '<cols>'
        '<col min="1" max="1" width="18" customWidth="1"/>'
        '<col min="2" max="2" width="18" customWidth="1"/>'
        '<col min="3" max="3" width="34" customWidth="1"/>'
        '<col min="4" max="4" width="18" customWidth="1"/>'
        '<col min="5" max="5" width="26" customWidth="1"/>'
        '<col min="6" max="6" width="18" customWidth="1"/>'
        '<col min="7" max="8" width="24" customWidth="1"/>'
        '</cols>'
        f'<sheetData>{"".join(sheet_rows)}</sheetData>'
        '</worksheet>'
    )


WORKBOOK_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    '<sheets><sheet name="Data Master" sheetId="1" r:id="rId1"/></sheets>'
    '</workbook>'
)


WORKBOOK_RELS_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    '</Relationships>'
)


CONTENT_TYPES_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    '<Default Extension="xml" ContentType="application/xml"/>'
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
    '</Types>'
)


ROOT_RELS_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
    '</Relationships>'
)


STYLES_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
    '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
    '</styleSheet>'
)


def main():
    with ZipFile(OUTPUT_PATH, "w", ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", CONTENT_TYPES_XML)
        archive.writestr("_rels/.rels", ROOT_RELS_XML)
        archive.writestr("xl/workbook.xml", WORKBOOK_XML)
        archive.writestr("xl/_rels/workbook.xml.rels", WORKBOOK_RELS_XML)
        archive.writestr("xl/styles.xml", STYLES_XML)
        archive.writestr("xl/worksheets/sheet1.xml", worksheet_xml())
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
