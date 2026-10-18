// ===== RUANG PULIH — PORTAL MITRA (B2B) =====
// Everything an institution sees is aggregated and anonymous: groups under 10 people are hidden,
// and no individual activity, chat or Cek Diri result is ever exposed.

const K_MIN = 10;
const nf = n => n.toLocaleString('id-ID');
const pct = n => `${String(n).replace('.', ',')}%`;
const dec = n => n.toFixed(1).replace('.', ',');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Data (demo, BINUS University, October 2026) ----------
const PERIODS = {
  '7': { label: '7 hari', active: 1204, dA: 6, checkins: 2240, dC: 4, sessions: 84, dS: 11, wait: '2m 02s', dW: -9, csat: 4.9,
    funnel: [860, 151, 84, 41] },
  '30': { label: '30 hari', active: 1842, dA: 14, checkins: 9310, dC: 9, sessions: 345, dS: 8, wait: '2m 14s', dW: -12, csat: 4.8,
    funnel: [1420, 612, 345, 198] },
  'sem': { label: 'Semester', active: 2106, dA: 21, checkins: 38420, dC: 17, sessions: 1290, dS: 26, wait: '2m 31s', dW: -5, csat: 4.8,
    funnel: [1980, 1404, 1290, 702] },
};
const SPARKS = {
  active: [1310, 1402, 1460, 1525, 1610, 1702, 1790, 1842],
  checkins: [7.1, 7.6, 7.4, 8.2, 8.6, 9.4, 9.1, 9.3],
  sessions: [58, 61, 66, 70, 81, 104, 92, 86],
  wait: [168, 162, 158, 150, 171, 152, 140, 134],
};
const WEEKS = Array.from({ length: 12 }, (_, i) => { const d = new Date(2026, 6, 27 + i * 7); return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()]}`; });
const MOOD_INDEX = [3.6, 3.5, 3.6, 3.5, 3.4, 3.4, 3.2, 2.8, 2.9, 3.2, 3.4, 3.5];
const MOOD_DIST = [
  { label: 'Berat', v: 7, color: 'var(--div-1)', pebble: 1 },
  { label: 'Kurang', v: 17, color: 'var(--div-2)', pebble: 2 },
  { label: 'Biasa', v: 34, color: 'var(--div-3)', pebble: 3 },
  { label: 'Baik', v: 30, color: 'var(--div-4)', pebble: 4 },
  { label: 'Lega', v: 12, color: 'var(--div-5)', pebble: 5 },
];
const STRESSORS = [['Kuliah', 38], ['Tidur', 21], ['Keluarga', 14], ['Karir', 12], ['Relasi', 9], ['Uang', 6]];
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const BLOCKS = ['06–09', '09–12', '12–15', '15–18', '18–21', '21–24', '00–03'];
const HEAT = DAYS.map((_, d) => [60, 140, 120, 150, 260, 420, 190].map(b => Math.round(b * [1.15, 1.12, 1.08, 1, .85, .7, .9][d])));
const FUNNEL_STEPS = ['Aktif di Lingkar Pulih', 'Ngobrol dengan Teman Pulih', 'Sesi dengan psikolog', 'Lanjut sesi kedua'];
const FACULTIES = [
  ['School of Computer Science', 486, 64, 3.4, 92], ['BINUS Business School', 402, 58, 3.5, 71],
  ['School of Design', 238, 66, 3.2, 54], ['Faculty of Engineering', 311, 55, 3.3, 60],
  ['Faculty of Humanities (Psikologi)', 156, 72, 3.6, 31], ['School of Communication', 197, 59, 3.4, 37],
  ['Program Pascasarjana', 8, 0, 0, 0], ['Belum memilih fakultas', 44, 51, 3.3, 0],
];
const SESSIONS_WEEKLY = [58, 61, 66, 64, 70, 73, 81, 104, 92, 86, 84, 83];
const TOPICS = [['Kecemasan', 34], ['Akademik', 24], ['Relasi', 16], ['Keluarga', 14], ['Karir', 12]];
const CSAT = [['5 bintang', 82], ['4 bintang', 13], ['3 bintang', 3], ['2 bintang', 1], ['1 bintang', 1]];

const state = {
  page: (location.hash || '#ringkasan').slice(1),
  period: '30',
  tables: {},
  domains: ['binus.ac.id', 'binus.edu'],
  codes: [['BINUS-UAS26', 300, 214, '30 Nov 2026'], ['BINUS-DOSEN', 150, 61, '31 Des 2026']],
  pending: [['an•••@binus.ac.id', 'Email kampus belum di SSO'], ['rz•••@gmail.com', 'Kode BINUS-UAS26'], ['mi•••@binus.ac.id', 'Email kampus belum di SSO'], ['de•••@yahoo.com', 'Kode BINUS-DOSEN']],
  pendingTotal: 37,
  threshold: 15,
  // Students who opted in to the Program Pendampingan, with only the items each one chose to share.
  care: [
    { name: 'Rani A.', fac: 'School of Computer Science', items: ['mood', 'check', 'sos'], signal: 'sos', detail: 'Menekan SOS · 2 jam lalu', mood: [3, 3, 2, 2, 1], done: false },
    { name: 'Dimas P.', fac: 'Faculty of Engineering', items: ['mood', 'check'], signal: 'check', detail: 'Cek Diri: Berat (10/12) · kemarin', mood: [3, 2, 2, 2, 2], done: false },
    { name: 'Nadia K.', fac: 'School of Design', items: ['mood'], signal: 'mood', detail: 'Mood turun 4 minggu berturut-turut', mood: [4, 3, 3, 2, 2], done: false },
    { name: 'Yosef T.', fac: 'BINUS Business School', items: ['check', 'sos'], signal: 'check', detail: 'Cek Diri: Sedang (7/12) · 3 hari lalu', mood: null, done: false },
  ],
  digest: true,
  autoReport: true,
};
try { document.documentElement.dataset.theme = localStorage.getItem('rp-admin-theme') || 'light'; } catch { /* storage blocked */ }

// ---------- Link to the student app (same origin, demo only) ----------
// The prototype app stores its state under 'rp2'. Decisions made here are written back so the
// student sees them; a real build would do this through the backend, never the browser.
const APP_KEY = 'rp2';
const APP_ORG = 'BINUS University';
function readApp() { try { return JSON.parse(localStorage.getItem(APP_KEY)) || null; } catch { return null; } }
function writeApp(fn) { const a = readApp(); if (!a) return; fn(a); try { localStorage.setItem(APP_KEY, JSON.stringify(a)); } catch { /* storage blocked */ } }
const appRequest = () => { const a = readApp(); return a?.verification?.status === 'pending' && a.verification.org === APP_ORG ? a : null; };
const appCare = () => { const a = readApp(); return a?.org === APP_ORG && a.campusShare?.care && !state.appCareDone ? a : null; };
const pendingCount = () => state.pendingTotal + (appRequest() ? 1 : 0);
const appJoined = id => (readApp()?.eventsJoined || []).includes(id) ? 1 : 0;
const appRatings = () => Object.values(readApp()?.ratings || {}).filter(r => r.done).length;
function appCareRow() {
  const a = appCare(); if (!a) return null;
  const sh = a.campusShare;
  const items = ['mood', 'check', 'sos'].filter(k => sh[k]);
  const last = (a.moods || []).slice(-5);
  const lastV = last[last.length - 1]?.v;
  const sc = a.screening;
  let signal = 'mood', detail = 'Baru bergabung di Program Pendampingan';
  if (sh.check && sc && sc.score >= 6) { signal = 'check'; detail = `Cek Diri: ${sc.score >= 9 ? 'Berat' : 'Sedang'} (${sc.score}/12)`; }
  else if (sh.mood && lastV && lastV <= 2) { detail = `Check-in terakhir: ${lastV === 1 ? 'Berat' : 'Kurang'}`; }
  return { key: 'app', name: `${a.name} (akun demo)`, fac: 'Akun aplikasi demo', items, signal, detail, mood: sh.mood ? last.map(m => m.v) : null };
}
window.addEventListener('storage', e => { if (e.key === APP_KEY) render(); });

// ---------- Tiny pebble (same shapes as the app) ----------
const PEBBLE = [null,
  { d: 'M7 31c0-9 7-17 17-17s17 6 17 15c0 9-7 13-17 13S7 39 7 31z', eye: 28, mouth: 'M19 36q5-3.5 10 0' },
  { d: 'M6 27c0-10 8-17 18-17 10 1 18 7 17 17-1 9-8 14-17 14S6 36 6 27z', eye: 25, mouth: 'M19 33q5-1.6 10 0' },
  { d: 'M24 7c10 0 17 7 17 17s-7 17-17 17S7 34 7 24 14 7 24 7z', eye: 22, mouth: 'M19 30h10' },
  { d: 'M23 6c11-1 19 8 18 18-1 11-9 18-19 17C12 40 6 32 7 23 8 13 13 7 23 6z', eye: 21, mouth: 'M18.5 28.5q5.5 4 11 0' },
  { d: 'M25 4c9 0 15 6 16 14 1 9-3 18-12 21-10 3-21-3-22-13C6 15 14 4 25 4z', eye: 19, mouth: 'M17.5 26q6.5 6 13 0' }];
const pebble = (v, color) => { const p = PEBBLE[v]; return `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="${p.d}" fill="${color}"/><circle cx="19" cy="${p.eye}" r="2" fill="#1D2620"/><circle cx="29" cy="${p.eye}" r="2" fill="#1D2620"/><path d="${p.mouth}" stroke="#1D2620" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`; };

// ---------- Illustrated admin portraits ----------
function portrait(p) {
  const ink = '#1D2620';
  const hair = p.hijab ? `<path d="M11 50l3-16c-2-3-3-7-3-11 0-9 6-16 13-16s13 7 13 16c0 4-1 8-3 11l3 16z" fill="${p.hijab}"/>` : (p.long ? `<path d="M13 21c0-9 5-14 11-14s11 5 11 14v13c-4 2-18 2-22 0z" fill="${p.hair}"/>` : '');
  const front = p.hijab ? `<path d="M16.4 17c1.6-4.4 4.4-6.4 7.6-6.4s6 2 7.6 6.4c-2.4-1.6-5-2.2-7.6-2.2s-5.2.6-7.6 2.2z" fill="${p.hijab}"/>`
    : `<path d="M14.6 19c0-7 4.2-11 9.4-11s9.4 4 9.4 11c-2-3.4-5.4-5-9.4-5s-7.4 1.6-9.4 5z" fill="${p.hair}"/>`;
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" fill="${p.bg}"/>${hair}
    <path d="M7 50c0-11 7-18 17-18s17 7 17 18z" fill="${p.top}"/>
    ${p.hijab ? '' : `<rect x="21" y="27" width="6" height="7" rx="2" fill="${p.skin}"/>`}
    <ellipse cx="24" cy="21.5" rx="${p.hijab ? 7.4 : 8.4}" ry="${p.hijab ? 8.6 : 9.6}" fill="${p.skin}"/>${front}
    <circle cx="20.6" cy="20.5" r="1.15" fill="${ink}"/><circle cx="27.4" cy="20.5" r="1.15" fill="${ink}"/>
    <path d="M21.6 25q2.4 1.8 4.8 0" stroke="${ink}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${p.glasses ? `<g stroke="${ink}" stroke-width=".9" fill="none" opacity=".8"><circle cx="20.6" cy="20.6" r="2.7"/><circle cx="27.4" cy="20.6" r="2.7"/><path d="M23.3 20.6h1.4"/></g>` : ''}</svg>`;
}
const ADMINS = {
  team: { bg: '#F7E6C3', skin: '#D9A57E', hijab: '#6F9A70', top: '#6F9A70' },
  ratna: { bg: '#DDE7D8', skin: '#E2B48E', hair: '#2B211C', long: true, top: '#2F5A3C', glasses: true },
  maura: { bg: '#E3E9EF', skin: '#E2B48E', hijab: '#2F3B2F', top: '#2F3B2F' },
};

// ---------- Shell ----------
const PAGES = [
  { id: 'ringkasan', label: 'Ringkasan', icon: 'squares-four', title: 'Ringkasan kesejahteraan' },
  { id: 'pendampingan', label: 'Pendampingan', icon: 'heart', title: 'Program Pendampingan' },
  { id: 'layanan', label: 'Layanan', icon: 'hand-heart', title: 'Pemakaian layanan' },
  { id: 'anggota', label: 'Anggota & akses', icon: 'users-three', title: 'Anggota & akses' },
  { id: 'program', label: 'Program', icon: 'calendar-blank', title: 'Program & acara' },
  { id: 'laporan', label: 'Laporan', icon: 'file-text', title: 'Laporan' },
  { id: 'pengaturan', label: 'Pengaturan', icon: 'gear-six', title: 'Pengaturan institusi' },
];
function renderNav() {
  document.getElementById('sideNav').innerHTML = PAGES.map(p => `
    <button class="${state.page === p.id ? 'on' : ''}" onclick="go('${p.id}')" aria-current="${state.page === p.id ? 'page' : 'false'}">
      <i class="${state.page === p.id ? 'ph-fill' : 'ph'} ph-${p.icon}"></i>${p.label}
      ${p.id === 'pendampingan' && careQueue().length ? `<span class="count" aria-label="perlu disapa">${careQueue().length}</span>` : ''}
      ${p.id === 'anggota' && pendingCount() ? `<span class="count" aria-label="${pendingCount()} menunggu verifikasi">${pendingCount()}</span>` : ''}
    </button>`).join('');
}
function go(id) {
  if (!PAGES.some(p => p.id === id)) id = 'ringkasan';
  state.page = id;
  history.replaceState(null, '', '#' + id);
  render();
  window.scrollTo({ top: 0 });
}
function render() {
  hideTip();
  const page = PAGES.find(p => p.id === state.page);
  document.getElementById('pageTitle').textContent = page.title;
  const el = document.getElementById('page');
  el.innerHTML = VIEWS[page.id]();
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  renderNav();
  drawCharts();
}
const today = new Date();
document.getElementById('greet').textContent = `${today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · data teragregasi`;
document.getElementById('adminAvatar').innerHTML = portrait(ADMINS.team);

// ---------- Shared bits ----------
const privacyNote = (extra = '') => `<div class="privacy"><i class="ph-fill ph-shield-check"></i><span><b>Anonim & teragregasi.</b> Kelompok di bawah ${K_MIN} orang disembunyikan. Data individu hanya ada di Pendampingan, untuk mahasiswa yang memberi izin.${extra}</span></div>`;
const periodFilter = () => `
  <div class="seg" role="tablist" aria-label="Periode">${Object.entries(PERIODS).map(([k, p]) => `<button class="${state.period === k ? 'on' : ''}" onclick="state.period='${k}';render()">${p.label}</button>`).join('')}</div>`;
function delta(v, goodWhenDown = false) {
  const good = goodWhenDown ? v < 0 : v > 0;
  const cls = v === 0 ? 'flat' : good ? 'up' : 'down';
  const icon = v === 0 ? 'minus' : v > 0 ? 'trend-up' : 'trend-down';
  return `<span class="delta ${cls}"><i class="ph ph-${icon}"></i>${v > 0 ? '+' : ''}${v}%</span>`;
}
const kpi = (icon, label, value, d, spark, goodWhenDown, note) => `
  <div class="card kpi">
    <span class="kpi-label"><i class="ph ph-${icon}"></i>${label}</span>
    <span class="kpi-value">${value}</span>
    <div class="kpi-foot"><span class="kpi-note">${delta(d, goodWhenDown)}<span class="tiny">${note}</span></span>${spark ? `<svg class="spark" data-spark="${spark}" aria-hidden="true"></svg>` : ''}</div>
  </div>`;
// A chart card with a chart ⇄ table toggle (the table is the accessible view of the same numbers).
function chartCard(id, title, sub, table, extra = '') {
  const showTable = state.tables[id];
  return `
    <section class="card" aria-labelledby="h-${id}">
      <div class="card-h"><div><h3 id="h-${id}">${title}</h3><p>${sub}</p></div>
        <button class="view-toggle" onclick="state.tables['${id}']=!state.tables['${id}'];render()" aria-pressed="${!!showTable}"><i class="ph ph-${showTable ? 'chart-bar' : 'table'}"></i>${showTable ? 'Grafik' : 'Tabel'}</button></div>
      ${showTable ? table : `<div class="chart" data-chart="${id}"></div>${extra}`}
    </section>`;
}
const simpleTable = (head, rows) => `<table class="table"><thead><tr>${head.map((h, i) => `<th class="${i ? 'num' : ''}">${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i ? 'num' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

// ---------- Views ----------
const CARE_LABEL = { mood: ['chart-line', 'Tren mood'], check: ['clipboard-text', 'Cek Diri'], sos: ['lifebuoy', 'SOS'] };
const SIGNAL = { sos: ['s-serious', 'lifebuoy', 'Hubungi dalam 24 jam'], check: ['s-warn', 'warning', 'Sapa minggu ini'], mood: ['s-warn', 'trend-down', 'Sapa minggu ini'] };
const miniMood = vals => `<svg viewBox="0 0 60 20" width="60" height="20" aria-hidden="true"><path d="${vals.map((v, i) => `${i ? 'L' : 'M'}${i * 15} ${18 - (v - 1) * 4}`).join('')}" fill="none" stroke="var(--series)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const careQueue = () => [...(appCareRow() ? [appCareRow()] : []), ...state.care.map((c, i) => ({ ...c, key: i })).filter(c => !c.done)];

const VIEWS = {
  pendampingan() {
    const open = careQueue();
    return `
      <div class="privacy"><i class="ph-fill ph-identification-card"></i><span><b>Hanya untuk konselor berlisensi.</b> Daftar ini berisi mahasiswa yang memilih ikut Program Pendampingan, dan hanya data yang mereka izinkan. Setiap akses tercatat; izin bisa dicabut mahasiswa kapan saja.</span></div>
      <div class="grid g-3">
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-hand-heart"></i>Ikut pendampingan</span><span class="kpi-value">412<small>mahasiswa</small></span><span class="tiny">22% dari anggota aktif · naik dari 17%</span></div>
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-flask"></i>Setuju penelitian</span><span class="kpi-value">1.120<small>mahasiswa</small></span><span class="tiny">61% · data tanpa nama, komite etik</span></div>
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-bell-ringing"></i>Perlu disapa</span><span class="kpi-value">${open.length}</span><span class="tiny">dari sinyal minggu ini</span></div>
      </div>
      <section class="card mt"><div class="card-h"><div><h3>Antrean pendampingan</h3><p>Diurutkan dari yang paling mendesak</p></div></div>
        ${open.length ? open.map(c => { const [cls, ic, due] = SIGNAL[c.signal]; const i = typeof c.key === 'number' ? c.key : `'app'`; return `
          <div class="row list-row care-row">
            <span class="signal ${cls}" style="padding:0"><span class="s-ic"><i class="ph-fill ph-${ic}"></i></span></span>
            <div class="grow"><b>${c.name}</b> <span class="tiny">· ${c.fac}</span>
              <p class="tiny" style="color:var(--ink-2)">${c.detail} · <span class="s-state" style="font-size:10.5px">${due}</span></p>
              <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">${['mood', 'check', 'sos'].map(k => c.items.includes(k)
                ? `<span class="tag tag-forest"><i class="ph ph-${CARE_LABEL[k][0]}"></i>${CARE_LABEL[k][1]}</span>`
                : `<span class="tag" style="opacity:.55" title="Tidak dibagikan mahasiswa"><i class="ph ph-lock-simple"></i>${CARE_LABEL[k][1]}</span>`).join('')}</div></div>
            ${c.mood ? `<span class="care-spark">${miniMood(c.mood)}<span class="tiny">5 minggu</span></span>` : '<span class="care-spark tiny">Tren mood tidak dibagikan</span>'}
            <button class="btn btn-ghost btn-sm" onclick="markCared(${i})">Selesai</button>
            <button class="btn btn-primary btn-sm" onclick="openCareContact(${i})"><i class="ph ph-chat-circle-dots"></i>Sapa</button>
          </div>`; }).join('') : '<p class="tiny">Semua mahasiswa di antrean sudah disapa minggu ini.</p>'}
      </section>
      <section class="card mt"><div class="card-h"><div><h3>Komitmen kampus</h3><p>Ditampilkan ke mahasiswa saat memberi izin</p></div></div>
        <div class="grid g-3">${[['ph-hand-heart', 'Untuk mendampingi', 'Data dipakai untuk menyapa dan menyiapkan pendampingan yang sesuai.'],
          ['ph-prohibit', 'Bukan untuk penilaian', 'Tidak dipakai untuk nilai, beasiswa, atau sanksi.'],
          ['ph-arrow-counter-clockwise', 'Bisa dicabut', 'Mahasiswa bisa berhenti kapan saja; aksesnya langsung hilang di sini.']].map(([i, t, d]) => `
          <div><span class="r-ic" style="width:40px;height:40px;border-radius:13px;display:grid;place-items:center;background:var(--forest-tint);color:var(--forest);font-size:20px"><i class="ph ${i}"></i></span><b style="display:block;margin-top:10px">${t}</b><p class="tiny" style="margin-top:2px">${d}</p></div>`).join('')}</div>
      </section>`;
  },

  ringkasan() {
    const p = PERIODS[state.period];
    const [f0, f1, f2, f3] = p.funnel;
    return `
      <div class="filters">${periodFilter()}<span class="spacer"></span>
        <button class="btn btn-ghost" onclick="go('laporan')"><i class="ph ph-download-simple"></i>Unduh laporan</button></div>
      ${privacyNote()}
      <div class="grid g-4">
        ${kpi('users-three', 'Anggota aktif', nf(p.active), p.dA, 'active', false, `dari 2.310`)}
        ${kpi('smiley', 'Check-in mood', nf(p.checkins), p.dC, 'checkins', false, p.label)}
        ${kpi('chats-circle', 'Sesi psikolog', nf(p.sessions), p.dS, 'sessions', false, p.label)}
        ${kpi('timer', 'Waktu tunggu', p.wait, p.dW, 'wait', true, 'target < 3 mnt')}
      </div>

      <div class="grid g-21 mt">
        ${chartCard('mood', 'Indeks suasana hati', 'Rata-rata check-in mingguan, skala 1 (berat) – 5 (lega) · 12 minggu terakhir',
          simpleTable(['Minggu mulai', 'Indeks'], WEEKS.map((w, i) => [w, dec(MOOD_INDEX[i])])))}
        <section class="card">
          <div class="card-h"><div><h3>Sinyal dukungan dini</h3><p>Pola agregat yang perlu ditindaklanjuti</p></div></div>
          <div class="signal s-warn"><span class="s-ic"><i class="ph-fill ph-warning"></i></span><div>
            <span class="s-state">Perlu perhatian</span><b>Cek Diri sedang–berat naik ke 11%</b>
            <p>Bulan lalu 8%. Lonjakan terjadi di minggu UTS (14–25 Sep).</p>
            <button class="action" onclick="go('program');setTimeout(openEventRequest,250)"><i class="ph ph-calendar-plus"></i>Jadwalkan sesi stres jelang UAS</button></div></div>
          <div class="signal s-serious"><span class="s-ic"><i class="ph-fill ph-lifebuoy"></i></span><div>
            <span class="s-state">Dipantau</span><b>SOS dibuka 23 kali</b>
            <p>Kurang dari ${K_MIN} diteruskan ke hotline 119 ext. 8. Angka di bawah ${K_MIN} tidak ditampilkan; identitas hanya terlihat bila mahasiswa ikut Program Pendampingan.</p>
            <button class="action" onclick="toast('Protokol rujukan dikirim ke email tim konseling','ph-envelope-simple')"><i class="ph ph-file-text"></i>Lihat protokol rujukan</button></div></div>
          <div class="signal s-good"><span class="s-ic"><i class="ph-fill ph-check-circle"></i></span><div>
            <span class="s-state">Sesuai target</span><b>94% chat Teman Pulih dibalas < 3 menit</b>
            <p>Target layanan 90%. Median 1 mnt 48 dtk.</p></div></div>
        </section>
      </div>

      <div class="grid g-2 mt">
        ${chartCard('dist', 'Sebaran suasana hati', `Semua check-in ${p.label.toLowerCase()} terakhir`,
          simpleTable(['Suasana hati', 'Porsi'], MOOD_DIST.map(m => [m.label, pct(m.v)])),
          `<div class="legend">${MOOD_DIST.map(m => `<span>${pebble(m.pebble, m.color)}${m.label} <b>${pct(m.v)}</b></span>`).join('')}</div>`)}
        ${chartCard('stress', 'Pemicu yang paling sering dipilih', 'Dari tag check-in · satu check-in bisa punya beberapa tag',
          simpleTable(['Pemicu', 'Porsi check-in'], STRESSORS.map(([l, v]) => [l, pct(v)])))}
      </div>

      <div class="grid g-2 mt">
        ${chartCard('heat', 'Kapan mahasiswa mencari dukungan', 'Sesi aktif per hari & jam (WIB) · 30 hari terakhir',
          simpleTable(['Hari', ...BLOCKS], DAYS.map((d, i) => [d, ...HEAT[i].map(nf)])),
          `<div class="ramp">Lebih sedikit ${[0, 1, 2, 3, 4, 5].map(i => `<i style="background:var(--seq-${i})"></i>`).join('')} Lebih banyak</div>`)}
        ${chartCard('funnel', 'Tiga lapis ekosistem', `Dari komunitas ke psikolog · ${p.label}`,
          simpleTable(['Tahap', 'Mahasiswa'], FUNNEL_STEPS.map((s, i) => [s, nf(p.funnel[i])])),
          `<p class="tiny" style="margin-top:10px">${Math.round(f2 / f1 * 100)}% yang ngobrol dengan Teman Pulih melanjutkan ke psikolog; ${Math.round(f3 / f2 * 100)}% kembali untuk sesi kedua.</p>`)}
      </div>

      <section class="card mt">
        <div class="card-h"><div><h3>Per fakultas</h3><p>Hanya kelompok ≥ ${K_MIN} anggota yang ditampilkan</p></div></div>
        <div style="overflow-x:auto"><table class="table">
          <thead><tr><th>Fakultas</th><th class="num">Anggota</th><th class="num">Rutin check-in</th><th class="num">Indeks mood</th><th class="num">Sesi psikolog</th></tr></thead>
          <tbody>${FACULTIES.map(([n, m, r, mood, s]) => m < K_MIN
            ? `<tr class="masked"><td>${n}</td><td class="num">&lt; ${K_MIN}</td><td class="num" colspan="3">Disembunyikan untuk menjaga anonimitas</td></tr>`
            : `<tr><td>${n}</td><td class="num">${nf(m)}</td><td class="num"><span class="bar-inline" style="width:${r * .6}px"></span>${pct(r)}</td><td class="num">${dec(mood)}</td><td class="num">${s >= K_MIN ? nf(s) : `&lt; ${K_MIN}`}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>`;
  },

  layanan() {
    const used = 345, quota = 500;
    return `
      ${privacyNote()}
      <div class="grid g-4">
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-chats-circle"></i>Kuota sesi psikolog</span>
          <span class="kpi-value">${used}<small>/ ${quota}</small></span>
          <div class="quota" role="progressbar" aria-valuenow="${used}" aria-valuemax="${quota}" aria-label="Pemakaian kuota"><span style="width:${used / quota * 100}%"></span></div>
          <span class="tiny">${Math.round(used / quota * 100)}% terpakai · reset 1 Nov</span></div>
        ${kpi('timer', 'Waktu tunggu', '2m 14s', -12, 'wait', true, 'target < 3 mnt')}
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-star"></i>Kepuasan sesi</span><span class="kpi-value">4,8<small>/ 5</small></span><span class="tiny">dari ${210 + appRatings()} penilaian</span></div>
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-seal-check"></i>Teman Pulih aktif</span><span class="kpi-value">24</span><span class="tiny">mahasiswa psikologi tersertifikasi</span></div>
      </div>
      <div class="grid g-21 mt">
        ${chartCard('weekly', 'Sesi psikolog per minggu', '12 minggu terakhir · puncak di minggu UTS',
          simpleTable(['Minggu mulai', 'Sesi'], WEEKS.map((w, i) => [w, SESSIONS_WEEKLY[i]])))}
        ${chartCard('topics', 'Topik konsultasi', 'Dipilih mahasiswa saat memesan sesi',
          simpleTable(['Topik', 'Porsi'], TOPICS.map(([l, v]) => [l, pct(v)])))}
      </div>
      <div class="grid g-2 mt">
        ${chartCard('csat', 'Penilaian sesi', '210 penilaian · 30 hari terakhir', simpleTable(['Nilai', 'Porsi'], CSAT.map(([l, v]) => [l, pct(v)])))}
        <section class="card"><div class="card-h"><div><h3>Teman Pulih</h3><p>Lapisan dukungan sebaya</p></div></div>
          ${[['Percakapan dimulai', '612'], ['Median waktu balas', '1 mnt 48 dtk'], ['Percakapan selesai dengan baik', '88%'], ['Dirujuk ke psikolog', '64'], ['Dirujuk ke layanan darurat', '< 10']].map(([l, v]) =>
            `<div class="row list-row"><span class="grow muted">${l}</span><b>${v}</b></div>`).join('')}
        </section>
      </div>`;
  },

  anggota() {
    return `
      <div class="privacy"><i class="ph-fill ph-lock-key"></i><span><b>Portal hanya mengatur akses.</b> Aktivitas, isi chat, dan hasil Cek Diri setiap mahasiswa tidak pernah tersedia untuk institusi.</span></div>
      <div class="grid g-3">
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-identification-badge"></i>Terverifikasi</span><span class="kpi-value">2.310<small>/ 2.500 kursi</small></span>
          <div class="quota"><span style="width:92.4%"></span></div></div>
        ${kpi('users-three', 'Aktif 30 hari', '1.842', 14, 'active', false, '80% dari terverifikasi')}
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-hourglass-medium"></i>Menunggu verifikasi</span><span class="kpi-value">${pendingCount()}</span><span class="tiny">rata-rata diproses < 1 hari</span></div>
      </div>
      <div class="grid g-2 mt">
        <section class="card"><div class="card-h"><div><h3>Masuk otomatis (SSO)</h3><p>Mahasiswa dengan domain ini langsung terverifikasi</p></div><span class="tag tag-forest"><i class="ph-fill ph-check-circle"></i>Terhubung</span></div>
          <div class="row list-row"><span class="av" style="background:var(--sunken)"><i class="ph ph-microsoft-outlook-logo" style="font-size:20px"></i></span><div class="grow"><b>Microsoft Entra ID</b><p class="tiny">OpenID Connect · sinkron terakhir hari ini 06.00</p></div></div>
          <div class="row" style="flex-wrap:wrap;gap:8px;margin:12px 0">${state.domains.map(d => `<span class="tag">@${esc(d)}<button class="chip-del" onclick="removeDomain('${esc(d)}')" aria-label="Hapus domain ${esc(d)}"><i class="ph ph-x"></i></button></span>`).join('')}</div>
          <div class="row" style="gap:8px"><input class="field" id="newDomain" placeholder="tambah domain, mis. binus.edu" onkeydown="if(event.key==='Enter')addDomain()"><button class="btn btn-primary btn-sm" onclick="addDomain()">Tambah</button></div>
        </section>
        <section class="card"><div class="card-h"><div><h3>Kode undangan</h3><p>Untuk dosen, staf, atau mahasiswa tanpa email kampus</p></div><button class="btn btn-ghost btn-sm" onclick="newCode()"><i class="ph ph-plus"></i>Buat kode</button></div>
          <table class="table"><thead><tr><th>Kode</th><th class="num">Terpakai</th><th class="num">Berlaku s.d.</th><th></th></tr></thead>
          <tbody>${state.codes.map(([c, q, u, e]) => `<tr><td class="code">${c}</td><td class="num">${u} / ${q}</td><td class="num">${e}</td><td class="num"><button class="view-toggle" onclick="copyCode('${c}')"><i class="ph ph-copy"></i>Salin</button></td></tr>`).join('')}</tbody></table>
        </section>
      </div>
      <section class="card mt"><div class="card-h"><div><h3>Permintaan verifikasi</h3><p>Email disamarkan. Menampilkan ${state.pending.length + (appRequest() ? 1 : 0)} dari ${pendingCount()}.</p></div>
        <button class="btn btn-ghost btn-sm" onclick="toast('Unggah CSV daftar mahasiswa (simulasi)','ph-upload-simple')"><i class="ph ph-upload-simple"></i>Unggah CSV</button></div>
        ${appRequest() ? (() => { const a = appRequest(); return `
          <div class="row list-row app-req"><span class="av" style="background:var(--amber-tint)"><i class="ph ph-device-mobile" style="font-size:18px;color:#8A5B0E"></i></span>
            <div class="grow"><b class="code">${esc(a.account?.id || 'akun aplikasi')}</b> <span class="tag tag-forest">Baru · dari aplikasi demo</span><p class="tiny">${esc(a.verification.via)} · ${esc(a.name)}</p></div>
            <button class="btn btn-ghost btn-sm" onclick="decideApp(false)">Tolak</button><button class="btn btn-primary btn-sm" onclick="decideApp(true)">Setujui</button></div>`; })() : ''}
        ${state.pending.length ? state.pending.map(([e, s], i) => `
          <div class="row list-row"><span class="av" style="background:var(--sunken)"><i class="ph ph-user" style="font-size:18px;color:var(--ink-3)"></i></span>
            <div class="grow"><b class="code">${e}</b><p class="tiny">${s}</p></div>
            <button class="btn btn-ghost btn-sm" onclick="decide(${i},false)">Tolak</button><button class="btn btn-primary btn-sm" onclick="decide(${i},true)">Setujui</button></div>`).join('')
          : '<p class="tiny">Semua permintaan di halaman ini sudah diproses.</p>'}
      </section>`;
  },

  program() {
    const upcoming = [
      ['12', 'NOV', 'Webinar: Mengelola stres jelang UAS', 'Online · 14.00–15.30 WIB', `${nf(312 + appJoined('ev-uas'))} terdaftar`, 'Direkomendasikan dari sinyal Cek Diri'],
      ['18', 'NOV', 'Pelatihan Teman Pulih batch 4', 'Kampus Anggrek · 3 hari (20 jam)', `${42 + appJoined('ev-tp')} pendaftar`, 'Sertifikasi HIMPSI'],
      ['05', 'DES', 'Roadshow #SehatMentalBukanAib', 'Auditorium Kampus Anggrek', '— buka 15 Nov', ''],
    ];
    return `
      <div class="filters"><span class="spacer"></span><button class="btn btn-primary" onclick="openEventRequest()"><i class="ph ph-calendar-plus"></i>Ajukan program</button></div>
      <div class="grid g-21">
        <section class="card"><div class="card-h"><div><h3>Akan datang</h3><p>Hanya jumlah pendaftar · nama tidak dibagikan kecuali mahasiswa memilih menerima sertifikat</p></div></div>
          ${upcoming.map(([d, m, t, w, r, n]) => `<div class="row list-row"><span class="event-date"><b>${d}</b><span>${m}</span></span>
            <div class="grow"><b>${t}</b><p class="tiny">${w}${n ? ` · <span style="color:var(--forest)">${n}</span>` : ''}</p></div><span class="tag">${r}</span></div>`).join('')}
        </section>
        <section class="card"><div class="card-h"><div><h3>Saran dari data</h3><p>Berdasarkan pola bulan ini</p></div></div>
          <div class="signal s-warn"><span class="s-ic"><i class="ph-fill ph-moon-stars"></i></span><div><b>Kelas tidur sehat</b><p>Tidur adalah pemicu #2 (21%) dan penggunaan memuncak pukul 21–24.</p></div></div>
          <div class="signal s-good"><span class="s-ic"><i class="ph-fill ph-briefcase"></i></span><div><b>Sesi transisi karir</b><p>Karir naik jadi pemicu #4 di mahasiswa tingkat akhir.</p></div></div>
        </section>
      </div>
      <section class="card mt"><div class="card-h"><div><h3>Campus Ambassador</h3><p>Jumlah pendaftar lewat kode ajakan · siapa yang diajak tidak pernah ditampilkan</p></div><button class="btn btn-ghost btn-sm" onclick="toast('Kode ambassador baru dibuat (simulasi)','ph-plus')"><i class="ph ph-plus"></i>Kode baru</button></div>
        <table class="table"><thead><tr><th>Ambassador</th><th>Kode</th><th class="num">Pendaftar</th><th class="num">Aktif 30 hari</th></tr></thead>
        <tbody>${[['Raka · Psikologi', 'AMB-RAKA', 34, 27], ['Sekar · Psikologi', 'AMB-SEKAR', 21, 18], ['Nadia · DKV', 'AMB-NADIA', 17, 12]].map(([n, c, j, a]) => {
          const extra = (readApp()?.referredBy || '') === c ? 1 : 0;
          return `<tr><td>${n}</td><td class="code">${c}</td><td class="num">${j + extra}${extra ? ' <span class="tag tag-forest">+1 demo</span>' : ''}</td><td class="num">${a + extra}</td></tr>`; }).join('')}</tbody></table>
      </section>
      <section class="card mt"><div class="card-h"><div><h3>Sudah berlangsung</h3><p>Dampak diukur dari perubahan agregat setelah acara</p></div></div>
        <table class="table"><thead><tr><th>Program</th><th class="num">Hadir</th><th class="num">Nilai</th><th class="num">Check-in minggu berikutnya</th></tr></thead>
        <tbody><tr><td>Talkshow #SehatMentalBukanAib · 2 Okt</td><td class="num">486</td><td class="num">4,7</td><td class="num">${delta(18)}</td></tr>
        <tr><td>Webinar mindfulness untuk UTS · 10 Sep</td><td class="num">274</td><td class="num">4,6</td><td class="num">${delta(9)}</td></tr></tbody></table>
      </section>`;
  },

  laporan() {
    return `
      ${privacyNote(' Angka dibulatkan dan diuji sebelum diunduh.')}
      <div class="grid g-3">
        ${[['file-pdf', 'Laporan bulanan · Oktober 2026', 'PDF · ringkasan, tren, rekomendasi', "toast('Laporan Oktober disiapkan dan dikirim ke email tim','ph-envelope-simple')"],
          ['file-pdf', 'Ringkasan semester ganjil', 'PDF · untuk rapat pimpinan', "toast('Ringkasan semester akan tersedia 31 Jan 2027','ph-calendar')"],
          ['file-csv', 'Data agregat', 'CSV · mingguan, per fakultas (≥ 10 orang)', 'downloadCsv()']].map(([i, t, d, a]) => `
          <section class="card report"><span class="r-ic"><i class="ph ph-${i}"></i></span><b>${t}</b><p class="tiny">${d}</p>
            <button class="btn btn-ghost btn-sm" style="width:fit-content" onclick="${a}"><i class="ph ph-download-simple"></i>Unduh</button></section>`).join('')}
      </div>
      <section class="card mt"><div class="card-h"><div><h3>Kirim otomatis</h3><p>Laporan bulanan dikirim setiap tanggal 1</p></div>
        <button class="switch ${state.autoReport ? 'on' : ''}" role="switch" aria-checked="${state.autoReport}" aria-label="Kirim laporan otomatis" onclick="state.autoReport=!state.autoReport;render()"></button></div>
        ${['ko•••@binus.edu · Tim Konseling', 'wr•••@binus.edu · Wakil Rektor Kemahasiswaan', 'sa•••@binus.edu · Student Advisory Center'].map(r => `<div class="row list-row"><i class="ph ph-envelope-simple" style="color:var(--ink-3)"></i><span class="grow">${r}</span></div>`).join('')}
      </section>`;
  },

  pengaturan() {
    return `
      <div class="grid g-2">
        <section class="card"><div class="card-h"><div><h3>Institusi</h3><p>Kontrak 1 Agu 2026 – 31 Jul 2027</p></div></div>
          ${[['Nama', 'BINUS University'], ['Paket', 'Kampus · 2.500 kursi'], ['Konsultasi psikolog', '500 sesi / bulan'], ['Teman Pulih', 'Tanpa batas']].map(([l, v]) => `<div class="row list-row"><span class="grow muted">${l}</span><b>${v}</b></div>`).join('')}
        </section>
        <section class="card"><div class="card-h"><div><h3>Admin portal</h3><p>Hanya admin yang bisa melihat dashboard ini</p></div><button class="btn btn-ghost btn-sm" onclick="toast('Undangan admin dikirim (simulasi)','ph-user-plus')"><i class="ph ph-user-plus"></i>Undang</button></div>
          ${[['team', 'Tim Konseling', 'Pemilik · ko•••@binus.edu'], ['ratna', 'Dr. Ratna W.', 'Pelihat · Kepala Student Advisory']].map(([k, n, r]) => `<div class="row list-row"><span class="av">${portrait(ADMINS[k])}</span><div class="grow"><b>${n}</b><p class="tiny">${r}</p></div></div>`).join('')}
        </section>
      </div>
      <div class="grid g-2 mt">
        <section class="card"><div class="card-h"><div><h3>Peringatan</h3><p>Kami memberi tahu tim saat pola agregat berubah</p></div></div>
          <label class="muted" for="thr" style="font-size:13.5px">Kirim peringatan bila Cek Diri sedang–berat melebihi <b id="thrVal">${state.threshold}%</b></label>
          <input id="thr" type="range" min="5" max="30" value="${state.threshold}" oninput="state.threshold=+this.value;document.getElementById('thrVal').textContent=this.value+'%'">
          <div class="row list-row" style="margin-top:8px"><span class="grow">Ringkasan mingguan via email</span><button class="switch ${state.digest ? 'on' : ''}" role="switch" aria-checked="${state.digest}" aria-label="Ringkasan mingguan" onclick="state.digest=!state.digest;render()"></button></div>
        </section>
        <section class="card"><div class="card-h"><div><h3>Account manager</h3><p>Bantuan kontrak, kuota, dan program</p></div></div>
          <div class="row"><span class="av" style="width:52px;height:52px;border-radius:18px">${portrait(ADMINS.maura)}</span><div class="grow"><b>Maura L.P.</b><p class="tiny">Ruang Pulih · biasanya membalas dalam 1 jam</p></div><button class="btn btn-primary btn-sm" onclick="openSupport()"><i class="ph ph-chat-circle-dots"></i>Chat</button></div>
          <p class="tiny" style="margin-top:14px">Data disimpan 12 bulan lalu dihapus otomatis. Institusi tidak pernah menerima data individu.</p>
        </section>
      </div>`;
  },
};

// ---------- Actions ----------
function toast(msg, icon = 'ph-check') {
  const t = document.getElementById('toast');
  t.innerHTML = `<i class="ph ${icon}"></i>${esc(msg)}`;
  t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('rp-admin-theme', next); } catch { /* storage blocked */ }
}
function addDomain() {
  const v = document.getElementById('newDomain').value.trim().replace(/^@/, '').toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(v)) return toast('Masukkan domain yang valid', 'ph-warning');
  if (!state.domains.includes(v)) state.domains.push(v);
  render(); toast(`@${v} ditambahkan ke SSO`, 'ph-check-circle');
}
function removeDomain(d) { state.domains = state.domains.filter(x => x !== d); render(); toast(`@${d} dihapus`, 'ph-trash'); }
function newCode() {
  const code = 'BINUS-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  state.codes.unshift([code, 100, 0, '31 Des 2026']);
  render(); copyCode(code);
}
function markCared(i) {
  const name = i === 'app' ? appCareRow()?.name : state.care[i].name;
  if (i === 'app') state.appCareDone = true; else state.care[i].done = true;
  render(); toast(`${name} ditandai sudah disapa`, 'ph-check-circle');
}
function sendCare(i) {
  const msg = document.getElementById('careMsg').value.trim();
  const name = i === 'app' ? appCareRow()?.name : state.care[i].name;
  if (i === 'app') writeApp(a => {
    a.chats ||= {};
    const ch = a.chats.sac ||= { unread: true, messages: [{ from: 'sys', text: `Program Pendampingan ${a.org} · izin diberikan ${a.campusShare?.at ? new Date(a.campusShare.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : ''}` }] };
    ch.messages.push({ from: 'them', text: msg, t: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') });
    ch.unread = true;
  });
  closeDrawer(); markCared(i);
  toast(`Pesan terkirim ke ${name}`, 'ph-paper-plane-tilt');
}
function openCareContact(i) {
  const c = i === 'app' ? appCareRow() : state.care[i];
  openDrawer(`Sapa ${esc(c.name)}`, `
    <p class="muted" style="font-size:14px">Pesan dikirim lewat Ruang Pulih atas nama konselor ${'BINUS'}. Mahasiswa bisa membalas atau menolak dengan sopan.</p>
    <label class="tiny" style="display:block;margin:16px 0 6px">Pesan</label>
    <textarea class="field" id="careMsg" rows="5" style="height:auto;padding:12px 14px">Hai ${esc(c.name.split(' ')[0])}, aku dari tim konseling kampus. Kami melihat minggu ini mungkin terasa berat. Kalau mau, kita bisa ngobrol sebentar — kapan pun kamu siap.</textarea>
    <label class="tiny" style="display:block;margin:16px 0 6px">Tawarkan jadwal</label>
    <div class="seg"><button class="on" onclick="this.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">Hari ini</button><button onclick="this.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">Besok</button><button onclick="this.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">Biar mahasiswa pilih</button></div>`,
    `<div class="drawer-f"><button class="btn btn-ghost" onclick="closeDrawer()">Batal</button><button class="btn btn-primary" style="flex:1;justify-content:center" onclick="sendCare(${i === 'app' ? "'app'" : i})">Kirim</button></div>`);
}
function copyCode(c) { navigator.clipboard?.writeText(c).catch(() => {}); toast(`Kode ${c} disalin`, 'ph-copy'); }
function decideApp(ok) {
  writeApp(a => {
    a.verification.status = ok ? 'approved' : 'rejected';
    a.verification.seen = false;
    a.verification.reason = ok ? undefined : 'Kode tidak cocok dengan data mahasiswa aktif BINUS. Coba masuk dengan email kampus.';
    if (ok) { a.org = a.verification.org; a.campusShare = null; }
  });
  render(); toast(ok ? 'Akses disetujui · mahasiswa diberi tahu di aplikasi' : 'Permintaan ditolak · mahasiswa diberi tahu', ok ? 'ph-check-circle' : 'ph-x-circle');
}
function decide(i, ok) {
  state.pending.splice(i, 1); state.pendingTotal--;
  render(); toast(ok ? 'Akses disetujui' : 'Permintaan ditolak', ok ? 'ph-check-circle' : 'ph-x-circle');
}
function downloadCsv() {
  const rows = [['minggu_mulai', 'indeks_mood', 'sesi_psikolog'], ...WEEKS.map((w, i) => [w, MOOD_INDEX[i], SESSIONS_WEEKLY[i]]), [],
    ['fakultas', 'anggota', 'rutin_checkin_persen', 'indeks_mood'], ...FACULTIES.filter(f => f[1] >= K_MIN).map(f => [f[0], f[1], f[2], f[3]])];
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'ruang-pulih-binus-agregat-okt-2026.csv'; a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV agregat diunduh', 'ph-download-simple');
}

// ---------- Drawer (event request, support chat) ----------
function openDrawer(title, body, foot = '') {
  const d = document.getElementById('drawer');
  d.innerHTML = `<div class="drawer-h"><h3 class="page-h" style="font-size:22px">${title}</h3><button class="close" onclick="closeDrawer()" aria-label="Tutup"><i class="ph ph-x"></i></button></div>
    <div class="drawer-b" id="drawerBody">${body}</div>${foot}`;
  d.classList.add('show'); document.getElementById('scrim').classList.add('show');
}
function closeDrawer() { document.getElementById('drawer').classList.remove('show'); document.getElementById('scrim').classList.remove('show'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
function openEventRequest() {
  openDrawer('Ajukan program', `
    <p class="muted" style="font-size:14px">Account manager akan menghubungi tim dalam 1 hari kerja.</p>
    <label class="tiny" style="display:block;margin:16px 0 6px">Jenis program</label>
    <select class="select" id="evType" style="width:100%"><option>Webinar manajemen stres</option><option>Kelas tidur sehat</option><option>Pelatihan Teman Pulih</option><option>Roadshow kampus</option></select>
    <label class="tiny" style="display:block;margin:16px 0 6px">Perkiraan tanggal</label>
    <input class="field" type="date" value="2026-11-26">
    <label class="tiny" style="display:block;margin:16px 0 6px">Format</label>
    <div class="seg" id="evFmt"><button class="on" onclick="this.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">Online</button><button onclick="this.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">Tatap muka</button></div>
    <label class="tiny" style="display:block;margin:16px 0 6px">Catatan</label>
    <textarea class="field" rows="4" style="height:auto;padding:12px 14px" placeholder="Mis. fokus untuk mahasiswa tingkat akhir"></textarea>`,
    `<div class="drawer-f"><button class="btn btn-ghost" onclick="closeDrawer()">Batal</button><button class="btn btn-primary" style="flex:1;justify-content:center" onclick="closeDrawer();toast('Pengajuan terkirim ke account manager','ph-paper-plane-tilt')">Kirim pengajuan</button></div>`);
}
const supportLog = [['them', 'Halo Tim Konseling BINUS! Ada yang bisa saya bantu soal kuota atau program bulan ini?']];
function openSupport() {
  const log = () => supportLog.map(([w, t]) => `<div class="msg ${w}">${esc(t)}</div>`).join('');
  openDrawer('Maura · account manager', `<div id="supLog">${log()}</div>`,
    `<div class="drawer-f"><input class="field" id="supIn" placeholder="Tulis pesan…" onkeydown="if(event.key==='Enter')sendSupport()"><button class="btn btn-primary" onclick="sendSupport()" aria-label="Kirim"><i class="ph-fill ph-paper-plane-right"></i></button></div>`);
  window.sendSupport = () => {
    const i = document.getElementById('supIn'); const t = i.value.trim(); if (!t) return;
    supportLog.push(['me', t]); i.value = ''; document.getElementById('supLog').innerHTML = log();
    setTimeout(() => { supportLog.push(['them', 'Siap, saya cek dan kabari hari ini. Tagihan prorata (jika ada) dikirim ke email finance.']); const el = document.getElementById('supLog'); if (el) el.innerHTML = log(); }, 1100);
  };
}

// ---------- Charts (SVG drawn to the container's real width) ----------
const SVGNS = 'http://www.w3.org/2000/svg';
const roundTopBar = (x, y, w, h, r = 4) => { r = Math.min(r, h, w / 2); return `M${x} ${y + h}V${y + r}q0-${r} ${r}-${r}h${w - 2 * r}q${r} 0 ${r} ${r}V${y + h}z`; };
const roundEndBar = (x, y, w, h, r = 4) => { r = Math.min(r, w, h / 2); return `M${x} ${y}h${w - r}q${r} 0 ${r} ${r}v${h - 2 * r}q0 ${r}-${r} ${r}H${x}z`; };

function lineChart(el, { labels, values, min, max, ticks, band, fmt, tipLabel, height = 240 }) {
  const W = el.clientWidth, H = height, L = 34, R = 44, T = 16, B = 30;
  const x = i => L + i * (W - L - R) / (values.length - 1);
  const y = v => T + (max - v) / (max - min) * (H - T - B);
  const pts = values.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const area = `${line}L${x(values.length - 1)} ${H - B}L${L} ${H - B}Z`;
  const last = pts[pts.length - 1];
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${tipLabel}">
    ${band ? `<rect x="${x(band[0]) - 8}" y="${T}" width="${x(band[1]) - x(band[0]) + 16}" height="${H - T - B}" rx="8" fill="var(--amber-tint)"/><text x="${(x(band[0]) + x(band[1])) / 2}" y="${T + 14}" text-anchor="middle" class="lbl">${band[2]}</text>` : ''}
    ${ticks.map(t => `<line class="gridline" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 8}" y="${y(t) + 4}" text-anchor="end">${fmt(t)}</text>`).join('')}
    ${labels.map((l, i) => i % 2 === 0 || i === labels.length - 1 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${l}</text>` : '').join('')}
    <path d="${area}" fill="var(--series-wash)"/>
    <path d="${line}" fill="none" stroke="var(--series)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="5" fill="var(--series)" stroke="var(--surface)" stroke-width="2"/>
    <text x="${last[0] + 9}" y="${last[1] + 4}" class="val">${fmt(values[values.length - 1])}</text>
    <line id="xh-${el.dataset.chart}" y1="${T}" y2="${H - B}" stroke="var(--ink-3)" stroke-width="1" opacity="0"/>
    <circle id="xd-${el.dataset.chart}" r="5" fill="var(--series)" stroke="var(--surface)" stroke-width="2" opacity="0"/>
    <rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/>
  </svg>`;
  const hit = el.querySelector('.hit'), xh = el.querySelector(`#xh-${el.dataset.chart}`), xd = el.querySelector(`#xd-${el.dataset.chart}`);
  hit.addEventListener('mousemove', e => {
    const r = el.querySelector('svg').getBoundingClientRect();
    const px = (e.clientX - r.left) * W / r.width;
    const i = Math.max(0, Math.min(values.length - 1, Math.round((px - L) / ((W - L - R) / (values.length - 1)))));
    xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('opacity', 1);
    xd.setAttribute('cx', x(i)); xd.setAttribute('cy', y(values[i])); xd.setAttribute('opacity', 1);
    showTip(e, `<b>Minggu ${labels[i]}</b><br>${tipLabel}: ${fmt(values[i])}${band && i >= band[0] && i <= band[1] ? `<br>${band[2]}` : ''}`);
  });
  hit.addEventListener('mouseleave', () => { xh.setAttribute('opacity', 0); xd.setAttribute('opacity', 0); hideTip(); });
}

function columnChart(el, { labels, values, band, unit }) {
  const W = el.clientWidth, H = 240, L = 30, R = 8, T = 22, B = 30;
  const max = Math.ceil(Math.max(...values) / 25) * 25;
  const step = (W - L - R) / values.length, bw = Math.min(24, step * .55);
  const y = v => T + (1 - v / max) * (H - T - B);
  const peak = values.indexOf(Math.max(...values));
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="Sesi per minggu">
    ${[0, max / 2, max].map(t => `<line class="gridline" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}
    ${values.map((v, i) => {
      const cx = L + step * i + step / 2;
      const inBand = band && i >= band[0] && i <= band[1];
      return `<g data-tip="<b>Minggu ${labels[i]}</b><br>${v} ${unit}${inBand ? '<br>Minggu UTS' : ''}">
        <rect class="hit" x="${L + step * i}" y="${T}" width="${step}" height="${H - T - B}"/>
        <path d="${roundTopBar(cx - bw / 2, y(v), bw, H - B - y(v))}" fill="var(--series)" opacity="${inBand ? 1 : .55}"/>
        ${i === peak || i === values.length - 1 ? `<text x="${cx}" y="${y(v) - 6}" text-anchor="middle" class="val">${v}</text>` : ''}
        ${i % 2 === 0 ? `<text x="${cx}" y="${H - 8}" text-anchor="middle">${labels[i]}</text>` : ''}</g>`;
    }).join('')}
  </svg>`;
}

function hbarChart(el, items, { suffix = '%', labelW = 92, thick = 14, gap = 16 } = {}) {
  const W = el.clientWidth, rowH = thick + gap, H = items.length * rowH;
  const max = Math.max(...items.map(i => i[1]));
  const bw = v => (W - labelW - 48) * v / max;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="Diagram batang">
    ${items.map(([l, v], i) => { const yy = i * rowH; return `<g data-tip="<b>${l}</b><br>${String(v).replace('.', ',')}${suffix}">
      <rect class="hit" x="0" y="${yy}" width="${W}" height="${rowH}"/>
      <text x="0" y="${yy + thick / 2 + 4}" class="lbl">${l}</text>
      <path d="${roundEndBar(labelW, yy, Math.max(bw(v), 2), thick)}" fill="var(--series)"/>
      <text x="${labelW + bw(v) + 8}" y="${yy + thick / 2 + 4}" class="val">${String(v).replace('.', ',')}${suffix}</text></g>`; }).join('')}
  </svg>`;
}

function stackedBar(el, items) {
  const W = el.clientWidth, H = 34, gap = 2;
  const total = items.reduce((s, i) => s + i.v, 0);
  const usable = W - gap * (items.length - 1);
  let x = 0;
  const segs = items.map((m, i) => {
    const w = usable * m.v / total;
    const first = i === 0, last = i === items.length - 1, r = 6;
    const d = `M${x + (first ? r : 0)} 0H${x + w - (last ? r : 0)}${last ? `q${r} 0 ${r} ${r}V${H - r}q0 ${r}-${r} ${r}` : `V${H}`}H${x + (first ? r : 0)}${first ? `q-${r} 0-${r}-${r}V${r}q0-${r} ${r}-${r}` : 'V0'}z`;
    const dark = i === 0 || i === items.length - 1;
    const label = w > 44 ? `<text x="${x + w / 2}" y="${H / 2 + 4}" text-anchor="middle" style="fill:${dark ? '#FFFDF8' : '#1D2620'};font-weight:700;font-size:12px">${pct(m.v)}</text>` : '';
    const out = `<g data-tip="<b>${m.label}</b><br>${pct(m.v)} check-in"><path d="${d}" fill="${m.color}"/>${label}</g>`;
    x += w + gap;
    return out;
  });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="Sebaran suasana hati">${segs.join('')}</svg>`;
}

function heatmap(el) {
  const W = el.clientWidth, labelW = 34, top = 20, gap = 2, ch = 28;
  const cw = (W - labelW - gap * (BLOCKS.length - 1)) / BLOCKS.length;
  const all = HEAT.flat(), max = Math.max(...all);
  const bucket = v => Math.min(5, Math.floor(v / max * 6));
  const H = top + DAYS.length * (ch + gap);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="Peta panas penggunaan">
    ${BLOCKS.map((b, j) => `<text x="${labelW + j * (cw + gap) + cw / 2}" y="12" text-anchor="middle">${b}</text>`).join('')}
    ${DAYS.map((d, i) => `<text x="0" y="${top + i * (ch + gap) + ch / 2 + 4}" class="lbl">${d}</text>
      ${HEAT[i].map((v, j) => `<rect class="cell" x="${labelW + j * (cw + gap)}" y="${top + i * (ch + gap)}" width="${cw}" height="${ch}" rx="4" fill="var(--seq-${bucket(v)})" data-tip="<b>${d}, ${BLOCKS[j]}</b><br>${nf(v)} sesi aktif"/>`).join('')}`).join('')}
  </svg>`;
}

function funnelChart(el, values) {
  hbarChart(el, FUNNEL_STEPS.map((s, i) => [s, values[i]]), { suffix: '', labelW: Math.min(200, el.clientWidth * .46), thick: 18, gap: 18 });
  el.querySelectorAll('.val').forEach((t, i) => { t.textContent = nf(values[i]); });
}

function sparkline(svg, values) {
  const W = 96, H = 30, min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => [i * W / (values.length - 1), 3 + (1 - (v - min) / (max - min || 1)) * (H - 6)]);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')}" fill="none" stroke="var(--series)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="3" fill="var(--series)"/>`;
}

function drawCharts() {
  const p = PERIODS[state.period];
  const draw = {
    mood: el => lineChart(el, { labels: WEEKS, values: MOOD_INDEX, min: 2.5, max: 4, ticks: [2.5, 3, 3.5, 4], band: [7, 8, 'UTS'], fmt: dec, tipLabel: 'Indeks mood', height: innerWidth > 1180 ? 330 : 240 }),
    dist: el => stackedBar(el, MOOD_DIST),
    stress: el => hbarChart(el, STRESSORS),
    heat: el => heatmap(el),
    funnel: el => funnelChart(el, p.funnel),
    weekly: el => columnChart(el, { labels: WEEKS, values: SESSIONS_WEEKLY, band: [7, 8], unit: 'sesi' }),
    topics: el => hbarChart(el, TOPICS),
    csat: el => hbarChart(el, CSAT, { labelW: 76 }),
  };
  document.querySelectorAll('[data-chart]').forEach(el => draw[el.dataset.chart]?.(el));
  document.querySelectorAll('[data-spark]').forEach(svg => sparkline(svg, SPARKS[svg.dataset.spark]));
}
let resizeT;
window.addEventListener('scroll', () => hideTip(), { passive: true });
window.addEventListener('resize', () => { hideTip(); clearTimeout(resizeT); resizeT = setTimeout(drawCharts, 120); });

// ---------- Tooltip ----------
const tip = document.getElementById('tip');
function showTip(e, html) {
  tip.innerHTML = html; tip.classList.add('show');
  const r = tip.getBoundingClientRect();
  let x = e.clientX + 14, y = e.clientY - r.height - 12;
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
  if (y < 8) y = e.clientY + 16;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function hideTip() { tip.classList.remove('show'); }
document.addEventListener('mousemove', e => {
  const t = e.target.closest?.('[data-tip]');
  if (t) showTip(e, t.dataset.tip); else if (!e.target.classList?.contains('hit') || !e.target.closest('[data-chart="mood"]')) hideTip();
});

// ---------- Boot ----------
window.addEventListener('hashchange', () => go(location.hash.slice(1)));
go(state.page);
