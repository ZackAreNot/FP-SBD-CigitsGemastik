from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape


OUTPUT_PATH = Path(__file__).resolve().parents[1] / "database-template-cigits.xlsx"


SHEETS = [
    (
        "README",
        [
            ["Template Database CiGITS GEMASTIK ITS"],
            [""],
            ["Sheet", "Keterangan"],
            ["divisi", "Data master 11 divisi GEMASTIK. Dipakai untuk seed.sql."],
            ["dosen", "Data dosen dummy/testing. Saat implementasi, dosen juga bisa ditambahkan dari form pendaftaran tim."],
            ["anggota", "Contoh data mahasiswa/pendaftar. Solo dan anggota tim sama-sama masuk tabel anggota."],
            ["tim", "Contoh data tim pendaftar."],
            ["anggota_tim", "Relasi anggota ke tim beserta peran KETUA/ANGGOTA."],
            ["enum_reference", "Referensi nilai ENUM yang dipakai dalam database."],
            [""],
            ["Catatan"],
            ["1. NRP pada tabel anggota sebaiknya UNIQUE."],
            ["2. NIDN dan email pada tabel dosen sebaiknya UNIQUE."],
            ["3. Peserta solo adalah anggota yang belum punya baris di anggota_tim."],
            ["4. Setiap tim wajib punya tepat satu KETUA."],
            ["5. Status awal tim adalah MENUNGGU."],
        ],
    ),
    (
        "divisi",
        [
            ["id_divisi", "jenis_perlombaan", "nama_divisi"],
            [1, "KOMPETISI", "Pemrograman"],
            [2, "KOMPETISI", "Keamanan Siber"],
            [3, "KOMPETISI", "Penambangan Data"],
            [4, "KOMPETISI", "Desain Pengalaman Pengguna"],
            [5, "KOMPETISI", "Animasi"],
            [6, "KOMPETISI", "Kota Cerdas"],
            [7, "KOMPETISI", "Karya Tulis Ilmiah TIK"],
            [8, "KARYA CIPTA", "Pengembangan Perangkat Lunak"],
            [9, "KARYA CIPTA", "Piranti Cerdas, Sistem Benam, dan IoT"],
            [10, "KARYA CIPTA", "Pengembangan Aplikasi Permainan"],
            [11, "KARYA CIPTA", "Pengembangan Bisnis TIK"],
        ],
    ),
    (
        "dosen",
        [
            ["id_dosen", "nama_dosen", "nidn", "email", "catatan"],
            [1, "Dr. Budi Santoso, S.Kom., M.Kom.", "0010017601", "budi.santoso@its.ac.id", "Dummy testing"],
            [2, "Dr. Siti Rahmawati, S.T., M.T.", "0021048202", "siti.rahmawati@its.ac.id", "Dummy testing"],
            [3, "Prof. Andi Wijaya, S.Kom., M.Sc.", "0009037003", "andi.wijaya@its.ac.id", "Dummy testing"],
            [4, "Dewi Lestari, S.Kom., M.Kom.", "0015088804", "dewi.lestari@its.ac.id", "Dummy testing"],
            [5, "Rizky Pratama, S.T., M.T.", "0022128505", "rizky.pratama@its.ac.id", "Dummy testing"],
        ],
    ),
    (
        "anggota",
        [
            ["id_anggota", "id_divisi_minat", "nama_anggota", "no_whatsapp", "jurusan", "nrp", "jenis_data"],
            [1, 1, "Ahmad Fauzan", "081234567890", "Informatika", "5025221001", "SOLO"],
            [2, 3, "Nadia Putri", "081298765432", "Sistem Informasi", "5026221002", "SOLO"],
            [3, 8, "Raka Aditya", "081233344455", "Informatika", "5025221003", "TIM"],
            [4, 8, "Salsa Kirana", "081266677788", "Teknik Komputer", "5027221004", "TIM"],
            [5, 10, "Dimas Prakoso", "081299900011", "Sistem Informasi", "5026221005", "TIM"],
        ],
    ),
    (
        "tim",
        [
            ["id_tim", "nama_tim", "id_divisi", "id_dosen", "judul", "tanggal_daftar", "status_pendaftaran"],
            [1, "Cigits Dev Team", 8, 1, "Sistem Informasi Pendaftaran GEMASTIK", "2026-06-14", "MENUNGGU"],
            [2, "GameLab ITS", 10, 2, "Game Edukasi Strategi Data", "2026-06-14", "TERKONFIRMASI"],
        ],
    ),
    (
        "anggota_tim",
        [
            ["id_anggota_tim", "id_tim", "id_anggota", "peran"],
            [1, 1, 3, "KETUA"],
            [2, 1, 4, "ANGGOTA"],
            [3, 2, 5, "KETUA"],
        ],
    ),
    (
        "enum_reference",
        [
            ["kolom", "nilai_enum", "keterangan"],
            ["divisi.jenis_perlombaan", "KOMPETISI", "Divisi kategori kompetisi"],
            ["divisi.jenis_perlombaan", "KARYA CIPTA", "Divisi kategori karya cipta"],
            ["tim.status_pendaftaran", "MENUNGGU", "Status awal pendaftaran tim"],
            ["tim.status_pendaftaran", "TERKONFIRMASI", "Tim diterima/diverifikasi admin"],
            ["tim.status_pendaftaran", "DITOLAK", "Tim ditolak admin"],
            ["anggota_tim.peran", "KETUA", "Ketua tim"],
            ["anggota_tim.peran", "ANGGOTA", "Anggota tim"],
        ],
    ),
]


def column_name(index):
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def cell_xml(row_index, col_index, value):
    ref = f"{column_name(col_index)}{row_index}"
    if value is None:
        return f'<c r="{ref}"/>'
    if isinstance(value, (int, float)):
        return f'<c r="{ref}"><v>{value}</v></c>'
    text = escape(str(value))
    return f'<c r="{ref}" t="inlineStr"><is><t>{text}</t></is></c>'


def worksheet_xml(rows):
    sheet_rows = []
    for row_index, row in enumerate(rows, start=1):
        cells = "".join(cell_xml(row_index, col_index, value) for col_index, value in enumerate(row, start=1))
        sheet_rows.append(f'<row r="{row_index}">{cells}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
        '<sheetFormatPr defaultRowHeight="15"/>'
        f'<sheetData>{"".join(sheet_rows)}</sheetData>'
        '</worksheet>'
    )


def workbook_xml():
    sheets_xml = []
    for index, (name, _) in enumerate(SHEETS, start=1):
        sheets_xml.append(f'<sheet name="{escape(name)}" sheetId="{index}" r:id="rId{index}"/>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<sheets>{"".join(sheets_xml)}</sheets>'
        '</workbook>'
    )


def workbook_rels_xml():
    relationships = []
    for index, _ in enumerate(SHEETS, start=1):
        relationships.append(
            f'<Relationship Id="rId{index}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{index}.xml"/>'
        )
    relationships.append(
        f'<Relationship Id="rId{len(SHEETS) + 1}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/>'
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        f'{"".join(relationships)}'
        '</Relationships>'
    )


def content_types_xml():
    overrides = [
        '<Override PartName="/xl/workbook.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/styles.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    ]
    for index, _ in enumerate(SHEETS, start=1):
        overrides.append(
            f'<Override PartName="/xl/worksheets/sheet{index}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        f'{"".join(overrides)}'
        '</Types>'
    )


ROOT_RELS_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
    'Target="xl/workbook.xml"/>'
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
        archive.writestr("[Content_Types].xml", content_types_xml())
        archive.writestr("_rels/.rels", ROOT_RELS_XML)
        archive.writestr("xl/workbook.xml", workbook_xml())
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml())
        archive.writestr("xl/styles.xml", STYLES_XML)

        for index, (_, rows) in enumerate(SHEETS, start=1):
            archive.writestr(f"xl/worksheets/sheet{index}.xml", worksheet_xml(rows))

    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
