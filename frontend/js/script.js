const API_BASE_URL = 'http://localhost:5000/api';
let latestSoloData = [];
let latestVerifiedTeams = [];
let latestRejectedTeams = [];
let latestDivisiData = [];

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Terjadi kesalahan');
  }

  return result.data;
};

const fillSelect = (select, items, idKey, textKey, placeholder) => {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item[idKey];
    option.textContent = item[textKey];
    select.appendChild(option);
  });
};

const getFormData = (form) => Object.fromEntries(new FormData(form).entries());

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatTanggalIndonesia = (date = new Date()) => new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(date);

const initSoloPage = async () => {
  const form = document.getElementById('soloForm');
  const divisiSelect = document.getElementById('soloDivisi');

  try {
    const divisi = await request('/divisi');
    fillSelect(divisiSelect, divisi, 'id_divisi', 'nama_divisi', 'Pilih divisi minat');
  } catch (error) {
    alert(error.message);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = getFormData(form);
    payload.id_divisi_minat = Number(payload.id_divisi_minat);

    try {
      await request('/pendaftaran/solo', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert('Pendaftaran solo berhasil');
      form.reset();
    } catch (error) {
      alert(error.message);
    }
  });
};

const buildMemberPayload = (memberElement) => {
  const inputs = memberElement.querySelectorAll('input');
  const member = { peran: memberElement.dataset.role };

  inputs.forEach((input) => {
    member[input.dataset.field] = input.value.trim();
  });

  const hasAnyValue = Object.entries(member)
    .filter(([key]) => key !== 'peran')
    .some(([, value]) => value !== '');

  if (!hasAnyValue && member.peran === 'ANGGOTA') {
    return null;
  }

  return member;
};

const initTimPage = async () => {
  const form = document.getElementById('timForm');
  const divisiSelect = document.getElementById('timDivisi');

  try {
    const divisi = await request('/divisi');
    fillSelect(divisiSelect, divisi, 'id_divisi', 'nama_divisi', 'Pilih divisi');
  } catch (error) {
    alert(error.message);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = getFormData(form);
    const anggota = Array.from(document.querySelectorAll('.member'))
      .map(buildMemberPayload)
      .filter(Boolean);

    const payload = {
      nama_tim: formData.nama_tim,
      id_divisi: Number(formData.id_divisi),
      dosen: {
        nama_dosen: formData.nama_dosen,
        nidn: formData.nidn,
        email: formData.email_dosen
      },
      judul: formData.judul,
      anggota
    };

    try {
      await request('/pendaftaran/tim', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      alert('Pendaftaran tim berhasil');
      form.reset();
    } catch (error) {
      alert(error.message);
    }
  });
};

const statusBadge = (status) => `<span class="badge ${status}">${status}</span>`;

const renderSoloTable = (solo) => {
  const tbody = document.getElementById('soloTableBody');

  if (solo.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row">Belum ada pendaftar solo</td></tr>';
    return;
  }

  tbody.innerHTML = solo.map((item) => `
    <tr>
      <td>${item.nama_anggota}</td>
      <td>${item.nrp}</td>
      <td>${item.jurusan}</td>
      <td>${item.no_whatsapp}</td>
      <td>${item.nama_divisi}</td>
    </tr>
  `).join('');
};

const renderTimTable = (tim) => {
  const tbody = document.getElementById('timTableBody');

  if (tim.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row">Belum ada pendaftar tim</td></tr>';
    return;
  }

  tbody.innerHTML = tim.map((item) => `
    <tr>
      <td><span class="badge primary">${escapeHtml(item.kode_registrasi)}</span></td>
      <td>${escapeHtml(item.nama_tim)}</td>
      <td>${escapeHtml(item.nama_divisi)}</td>
      <td>${escapeHtml(item.nama_dosen)}</td>
      <td>${escapeHtml(item.judul)}</td>
      <td>${item.jumlah_anggota}</td>
      <td>
        <div class="status-cell">
          ${statusBadge(escapeHtml(item.status))}
          ${item.status === 'DITOLAK'
            ? `<button class="btn small ghost-dark status-comment-btn" type="button" data-action="komentar" data-id="${item.id_tim}">${item.komentar_penolakan ? 'Lihat Komentar' : 'Isi Komentar'}</button>`
            : ''}
        </div>
      </td>
      <td>
        <div class="action-group">
          <button class="btn small secondary" type="button" data-action="verifikasi" data-id="${item.id_tim}">Verifikasi</button>
          ${item.status !== 'DITOLAK'
            ? `<button class="btn small danger" type="button" data-action="tolak" data-id="${item.id_tim}">Tolak</button>`
            : ''}
          <button class="btn small ghost-dark" type="button" data-action="detail" data-id="${item.id_tim}">Detail</button>
        </div>
      </td>
    </tr>
  `).join('');
};

const updateStats = (solo, tim) => {
  document.getElementById('totalSolo').textContent = solo.length;
  document.getElementById('totalTim').textContent = tim.length;
  document.getElementById('totalMenunggu').textContent = tim.filter((item) => item.status === 'MENUNGGU').length;
  document.getElementById('totalTerkonfirmasi').textContent = tim.filter((item) => item.status === 'TERKONFIRMASI').length;
  document.getElementById('totalDitolak').textContent = tim.filter((item) => item.status === 'DITOLAK').length;
};

const renderVerifiedGroups = (divisiList, teams, selectedDivisiId = 'all') => {
  const container = document.getElementById('verifiedGroups');

  const filteredDivisi = selectedDivisiId === 'all'
    ? divisiList
    : divisiList.filter((item) => String(item.id_divisi) === String(selectedDivisiId));

  container.innerHTML = filteredDivisi.map((divisi) => {
    const teamsInDivisi = teams.filter((team) => Number(team.id_divisi) === Number(divisi.id_divisi));
    const countText = `${teamsInDivisi.length} tim`;

    const cards = teamsInDivisi.length > 0
      ? teamsInDivisi.map((team) => `
          <article class="verified-card">
            <div class="verified-card-top">
              <span class="badge primary">${escapeHtml(team.kode_registrasi)}</span>
              <span class="badge TERKONFIRMASI">TERKONFIRMASI</span>
            </div>
            <h3>${escapeHtml(team.nama_tim)}</h3>
            <p class="verified-title">${escapeHtml(team.judul)}</p>
            <div class="verified-meta">
              <div><span>Dosen</span><strong>${escapeHtml(team.nama_dosen)}</strong></div>
              <div><span>Jumlah Anggota</span><strong>${escapeHtml(team.jumlah_anggota)}</strong></div>
              <div><span>Tanggal Daftar</span><strong>${escapeHtml(team.tanggal_daftar)}</strong></div>
              <div><span>Kategori</span><strong>${escapeHtml(divisi.jenis_perlombaan)}</strong></div>
            </div>
          </article>
        `).join('')
      : `
        <div class="verified-empty-card">
          Belum ada tim terverifikasi pada divisi ini.
        </div>
      `;

    return `
      <section class="verified-group">
        <div class="verified-group-header">
          <div>
            <p class="verified-group-type">${escapeHtml(divisi.jenis_perlombaan)}</p>
            <h2>${escapeHtml(divisi.nama_divisi)}</h2>
          </div>
          <span class="verified-count">${countText}</span>
        </div>
        <div class="verified-card-grid">
          ${cards}
        </div>
      </section>
    `;
  }).join('');
};

const updateVerifiedStats = (divisiList, teams, selectedDivisiId = 'all') => {
  const filteredTeams = selectedDivisiId === 'all'
    ? teams
    : teams.filter((team) => String(team.id_divisi) === String(selectedDivisiId));

  const activeDivisiCount = selectedDivisiId === 'all'
    ? divisiList.filter((divisi) => filteredTeams.some((team) => Number(team.id_divisi) === Number(divisi.id_divisi))).length
    : (filteredTeams.length > 0 ? 1 : 0);

  const totalAnggota = filteredTeams.reduce((sum, team) => sum + Number(team.jumlah_anggota || 0), 0);

  document.getElementById('verifiedTotalTim').textContent = filteredTeams.length;
  document.getElementById('verifiedTotalDivisi').textContent = activeDivisiCount;
  document.getElementById('verifiedTotalAnggota').textContent = totalAnggota;
};

const renderRejectedGroups = (divisiList, teams, selectedDivisiId = 'all') => {
  const container = document.getElementById('rejectedGroups');

  const filteredDivisi = selectedDivisiId === 'all'
    ? divisiList
    : divisiList.filter((item) => String(item.id_divisi) === String(selectedDivisiId));

  container.innerHTML = filteredDivisi.map((divisi) => {
    const teamsInDivisi = teams.filter((team) => Number(team.id_divisi) === Number(divisi.id_divisi));
    const countText = `${teamsInDivisi.length} tim`;

    const cards = teamsInDivisi.length > 0
      ? teamsInDivisi.map((team) => `
          <article class="verified-card rejected-card">
            <div class="verified-card-top">
              <span class="badge primary">${escapeHtml(team.kode_registrasi)}</span>
              <span class="badge DITOLAK">DITOLAK</span>
            </div>
            <h3>${escapeHtml(team.nama_tim)}</h3>
            <p class="verified-title">${escapeHtml(team.judul)}</p>
            <div class="verified-meta rejected-meta">
              <div><span>Dosen</span><strong>${escapeHtml(team.nama_dosen)}</strong></div>
              <div><span>Jumlah Anggota</span><strong>${escapeHtml(team.jumlah_anggota)}</strong></div>
              <div><span>Tanggal Daftar</span><strong>${escapeHtml(team.tanggal_daftar)}</strong></div>
              <div><span>Kategori</span><strong>${escapeHtml(divisi.jenis_perlombaan)}</strong></div>
            </div>
            <div class="rejected-comment-box">
              <span>Komentar Penolakan</span>
              <p>${escapeHtml(team.komentar_penolakan || 'Belum ada komentar penolakan.')}</p>
            </div>
          </article>
        `).join('')
      : `
        <div class="verified-empty-card">
          Belum ada tim ditolak pada divisi ini.
        </div>
      `;

    return `
      <section class="verified-group rejected-group">
        <div class="verified-group-header">
          <div>
            <p class="verified-group-type">${escapeHtml(divisi.jenis_perlombaan)}</p>
            <h2>${escapeHtml(divisi.nama_divisi)}</h2>
          </div>
          <span class="verified-count rejected-count">${countText}</span>
        </div>
        <div class="verified-card-grid">
          ${cards}
        </div>
      </section>
    `;
  }).join('');
};

const updateRejectedStats = (divisiList, teams, selectedDivisiId = 'all') => {
  const filteredTeams = selectedDivisiId === 'all'
    ? teams
    : teams.filter((team) => String(team.id_divisi) === String(selectedDivisiId));

  const activeDivisiCount = selectedDivisiId === 'all'
    ? divisiList.filter((divisi) => filteredTeams.some((team) => Number(team.id_divisi) === Number(divisi.id_divisi))).length
    : (filteredTeams.length > 0 ? 1 : 0);

  const totalKomentar = filteredTeams.filter((team) => String(team.komentar_penolakan || '').trim() !== '').length;

  document.getElementById('rejectedTotalTim').textContent = filteredTeams.length;
  document.getElementById('rejectedTotalDivisi').textContent = activeDivisiCount;
  document.getElementById('rejectedTotalKomentar').textContent = totalKomentar;
};

const initVerifiedPage = async () => {
  const filterSelect = document.getElementById('verifiedDivisiFilter');

  try {
    const [divisi, teams] = await Promise.all([
      request('/divisi'),
      request('/tim-terverifikasi')
    ]);

    latestDivisiData = divisi;
    latestVerifiedTeams = teams;

    fillSelect(filterSelect, divisi, 'id_divisi', 'nama_divisi', 'Semua divisi');
    filterSelect.value = '';

    updateVerifiedStats(divisi, teams, 'all');
    renderVerifiedGroups(divisi, teams, 'all');
  } catch (error) {
    alert(error.message);
  }

  filterSelect.addEventListener('change', () => {
    const selectedDivisiId = filterSelect.value || 'all';
    updateVerifiedStats(latestDivisiData, latestVerifiedTeams, selectedDivisiId);
    renderVerifiedGroups(latestDivisiData, latestVerifiedTeams, selectedDivisiId);
  });
};

const initRejectedPage = async () => {
  const filterSelect = document.getElementById('rejectedDivisiFilter');

  try {
    const [divisi, teams] = await Promise.all([
      request('/divisi'),
      request('/tim-ditolak')
    ]);

    latestDivisiData = divisi;
    latestRejectedTeams = teams;

    fillSelect(filterSelect, divisi, 'id_divisi', 'nama_divisi', 'Semua divisi');
    filterSelect.value = '';

    updateRejectedStats(divisi, teams, 'all');
    renderRejectedGroups(divisi, teams, 'all');
  } catch (error) {
    alert(error.message);
  }

  filterSelect.addEventListener('change', () => {
    const selectedDivisiId = filterSelect.value || 'all';
    updateRejectedStats(latestDivisiData, latestRejectedTeams, selectedDivisiId);
    renderRejectedGroups(latestDivisiData, latestRejectedTeams, selectedDivisiId);
  });
};

const loadAdminData = async () => {
  const [solo, tim] = await Promise.all([
    request('/admin/solo'),
    request('/admin/tim')
  ]);

  latestSoloData = solo;
  updateStats(solo, tim);
  renderSoloTable(solo);
  renderTimTable(tim);
};

const exportSoloPdf = () => {
  if (latestSoloData.length === 0) {
    alert('Belum ada data peserta solo untuk diexport');
    return;
  }

  const tanggal = formatTanggalIndonesia();
  const rows = latestSoloData.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.nama_anggota)}</td>
      <td>${escapeHtml(item.nrp)}</td>
      <td>${escapeHtml(item.jurusan)}</td>
      <td>${escapeHtml(item.no_whatsapp)}</td>
      <td>${escapeHtml(item.nama_divisi)}</td>
    </tr>
  `).join('');

  const printWindow = window.open('', '_blank', 'width=1100,height=800');

  if (!printWindow) {
    alert('Popup diblokir browser. Izinkan popup untuk export PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Data Peserta Solo CiGITS GEMASTIK ITS</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 16mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
        }

        .letterhead {
          display: grid;
          grid-template-columns: 74px 1fr;
          gap: 14px;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 3px solid #06346f;
        }

        .logo-box {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border: 2px solid #06346f;
          border-radius: 12px;
          color: #0757b8;
          font-weight: 900;
          font-size: 15px;
        }

        .letterhead h1,
        .letterhead p {
          margin: 0;
        }

        .letterhead h1 {
          color: #06346f;
          font-size: 18px;
          text-transform: uppercase;
        }

        .letterhead p {
          margin-top: 4px;
          color: #374151;
          font-size: 11px;
        }

        .title {
          margin: 18px 0 12px;
          text-align: center;
        }

        .title h2 {
          margin: 0;
          color: #06346f;
          font-size: 16px;
          text-transform: uppercase;
          text-decoration: underline;
        }

        .title p {
          margin: 6px 0 0;
          font-weight: 700;
        }

        .meta {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 4px 10px;
          margin-bottom: 12px;
          font-weight: 700;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          border: 1px solid #1f2937;
          padding: 7px 8px;
          text-align: left;
          vertical-align: top;
        }

        th {
          color: #ffffff;
          background: #06346f;
          text-align: center;
          text-transform: uppercase;
        }

        td:first-child {
          width: 36px;
          text-align: center;
        }

        .signature {
          width: 240px;
          margin: 28px 0 0 auto;
          text-align: center;
          font-weight: 700;
        }

        .signature-space {
          height: 58px;
        }

        .footer-note {
          margin-top: 16px;
          color: #4b5563;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <header class="letterhead">
        <div class="logo-box">CiGITS</div>
        <div>
          <h1>CiGITS GEMASTIK ITS</h1>
          <p>Sistem Pendaftaran Seleksi Internal GEMASTIK</p>
          <p>Institut Teknologi Sepuluh Nopember</p>
        </div>
      </header>

      <section class="title">
        <h2>Data Peserta Solo</h2>
        <p>Pool Peserta Solo Seleksi Internal GEMASTIK ITS</p>
      </section>

      <section class="meta">
        <span>Tanggal Cetak</span><span>: ${tanggal}</span>
        <span>Total Peserta</span><span>: ${latestSoloData.length} peserta</span>
        <span>Status Data</span><span>: Peserta solo belum tergabung dalam tim</span>
      </section>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>NRP</th>
            <th>Jurusan</th>
            <th>No WhatsApp</th>
            <th>Divisi Minat</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <section class="signature">
        <p>Surabaya, ${tanggal}</p>
        <p>Admin CiGITS GEMASTIK ITS</p>
        <div class="signature-space"></div>
        <p>(________________________)</p>
      </section>

      <p class="footer-note">
        Dokumen ini dihasilkan otomatis dari Sistem Informasi Pendaftaran CiGITS GEMASTIK ITS.
      </p>

      <script>
        window.addEventListener('load', () => {
          window.print();
        });
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
};

const showDetailTim = async (id) => {
  const detail = await request(`/admin/tim/${id}`);
  const panel = document.getElementById('detailPanel');
  const content = document.getElementById('detailContent');
  const komentarPenolakan = detail.komentar_penolakan
    ? `<div class="detail-item"><span>Komentar Penolakan</span><strong>${escapeHtml(detail.komentar_penolakan)}</strong></div>`
    : '';

  content.innerHTML = `
    <div class="detail-list">
      <div class="detail-item"><span>Kode Reg.</span><strong>${escapeHtml(detail.kode_registrasi)}</strong></div>
      <div class="detail-item"><span>Nama Tim</span><strong>${escapeHtml(detail.nama_tim)}</strong></div>
      <div class="detail-item"><span>Status</span><strong>${escapeHtml(detail.status)}</strong></div>
      <div class="detail-item"><span>Divisi</span><strong>${escapeHtml(detail.nama_divisi)}</strong></div>
      <div class="detail-item"><span>Dosen</span><strong>${escapeHtml(detail.nama_dosen)}</strong></div>
      <div class="detail-item"><span>Judul</span><strong>${escapeHtml(detail.judul)}</strong></div>
      <div class="detail-item"><span>Tanggal Daftar</span><strong>${escapeHtml(detail.tanggal_daftar)}</strong></div>
      ${komentarPenolakan}
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Peran</th>
            <th>Nama</th>
            <th>NRP</th>
            <th>Jurusan</th>
            <th>No WA</th>
          </tr>
        </thead>
        <tbody>
          ${detail.anggota.map((anggota) => `
            <tr>
              <td>${escapeHtml(anggota.peran)}</td>
              <td>${escapeHtml(anggota.nama_anggota)}</td>
              <td>${escapeHtml(anggota.nrp)}</td>
              <td>${escapeHtml(anggota.jurusan)}</td>
              <td>${escapeHtml(anggota.no_whatsapp)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const openRejectModal = (id, existingComment = '') => {
  document.getElementById('rejectTimId').value = id;
  document.getElementById('rejectComment').value = existingComment;
  document.getElementById('rejectModal').hidden = false;
};

const closeRejectModal = () => {
  document.getElementById('rejectModal').hidden = true;
};

const initAdminPage = async () => {
  const timTableBody = document.getElementById('timTableBody');
  const closeDetailButton = document.getElementById('closeDetail');
  const detailPanel = document.getElementById('detailPanel');
  const exportSoloPdfButton = document.getElementById('exportSoloPdf');
  const rejectModal = document.getElementById('rejectModal');
  const closeRejectModalButton = document.getElementById('closeRejectModal');
  const rejectForm = document.getElementById('rejectForm');

  try {
    await loadAdminData();
  } catch (error) {
    alert(error.message);
  }

  timTableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;

    try {
      if (action === 'detail') {
        await showDetailTim(id);
        return;
      }

      if (action === 'tolak') {
        openRejectModal(id);
        return;
      }

      if (action === 'komentar') {
        const detail = await request(`/admin/tim/${id}`);
        openRejectModal(id, detail.komentar_penolakan || '');
        return;
      }

      await request(`/admin/tim/${id}/${action}`, { method: 'PATCH' });
      await loadAdminData();
    } catch (error) {
      alert(error.message);
    }
  });

  closeDetailButton.addEventListener('click', () => {
    detailPanel.classList.add('hidden');
  });

  exportSoloPdfButton.addEventListener('click', exportSoloPdf);
  closeRejectModalButton.addEventListener('click', closeRejectModal);

  rejectModal.addEventListener('click', (event) => {
    if (event.target === rejectModal) {
      closeRejectModal();
    }
  });

  rejectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('rejectTimId').value;
    const komentar_penolakan = document.getElementById('rejectComment').value.trim();

    try {
      await request(`/admin/tim/${id}/tolak`, {
        method: 'PATCH',
        body: JSON.stringify({ komentar_penolakan })
      });
      closeRejectModal();
      await loadAdminData();
    } catch (error) {
      alert(error.message);
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'solo') initSoloPage();
  if (page === 'tim') initTimPage();
  if (page === 'admin') initAdminPage();
  if (page === 'verified') initVerifiedPage();
  if (page === 'rejected') initRejectedPage();
});
