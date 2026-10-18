// ===== RUANG PULIH — SETTINGS & DESKTOP PANEL =====
// One settings model drives both the in-app sheet (menu ☰ at the top right)
// and the settings table in the desktop right-hand panel, so they stay in sync.

const METHOD_LABEL = { google: 'Google', apple: 'Apple', sso: 'SSO institusi', email: 'Email', phone: 'Nomor HP' };
function accountLabel() {
  const a = state.account;
  return a ? `${METHOD_LABEL[a.method]} · ${a.id}` : 'Belum masuk';
}

const pref = key => ({ get: () => state.prefs[key], set: v => { state.prefs[key] = v; } });

const SETTINGS = [
  { group: 'Akun', items: [
    { id: 'avatar', icon: 'ph-user-circle', label: 'Foto profil', desc: 'Ilustrasi pilihanmu, tanpa foto asli.', type: 'link', value: () => avatarSpec((state.avatar || {}).id).name, action: 'openAvatarPicker()' },
    { id: 'name', icon: 'ph-user', label: 'Nama panggilan', desc: 'Hanya terlihat olehmu dan konselormu.', type: 'link', value: () => state.name, action: 'openEditName()' },
    { id: 'login', icon: 'ph-key', label: 'Metode masuk', desc: 'Akun yang terhubung ke Ruang Pulih.', type: 'info', value: () => accountLabel() },
    { id: 'org', icon: 'ph-buildings', label: 'Institusi mitra', desc: 'Konsultasi & Teman Pulih gratis lewat kampus/kantor.', type: 'link', value: () => state.org || 'Belum ditautkan', action: 'openAffiliation()' },
    { id: 'campus', icon: 'ph-hand-heart', label: 'Data untuk kampus', desc: 'Atur data yang boleh dilihat konselor kampusmu.', type: 'link', value: () => state.org ? campusSummary() : '—', action: 'openCampusConsent()' },
    { id: 'plan', icon: 'ph-sparkle', label: 'Langganan', desc: 'Paket aktif dan masa coba.', type: 'link', value: () => state.premium ? (state.trial ? 'Coba gratis' : 'Premium') : 'Gratis', action: 'openPremium()' },
  ] },
  { group: 'Keselamatan', items: [
    { id: 'sos', icon: 'ph-lifebuoy', label: 'Kontak darurat (SOS)', desc: 'Hotline 24 jam dan langkah menenangkan diri.', type: 'link', value: () => '', action: 'openSOS()' },
    { id: 'trusted', icon: 'ph-user-plus', label: 'Kontak tepercaya', desc: 'Satu orang yang bisa dikabari langsung dari SOS.', type: 'link', value: () => state.trustedContact ? state.trustedContact.name : 'Belum ada', action: 'openTrustedContact()' },
  ] },
  { group: 'Notifikasi', items: [
    { id: 'reminders', icon: 'ph-bell-ringing', label: 'Pengingat check-in', desc: 'Satu pengingat lembut setiap hari.', type: 'toggle', ...pref('reminders') },
    { id: 'reminderTime', icon: 'ph-clock', label: 'Jam pengingat', desc: 'Kapan pengingat dikirim.', type: 'select', options: ['07.00', '12.00', '20.00', '21.30'], ...pref('reminderTime') },
    { id: 'notifSession', icon: 'ph-calendar-check', label: 'Pengingat sesi', desc: '1 jam & 10 menit sebelum konsultasi.', type: 'toggle', ...pref('notifSession') },
    { id: 'notifReplies', icon: 'ph-chat-circle', label: 'Balasan di Lingkar', desc: 'Saat ceritamu dibalas atau dipeluk.', type: 'toggle', ...pref('notifReplies') },
  ] },
  { group: 'Privasi & keamanan', items: [
    { id: 'appLock', icon: 'ph-lock-key', label: 'Kunci aplikasi', desc: 'PIN atau Face ID setiap membuka aplikasi.', type: 'toggle', proto: true, ...pref('appLock') },
    { id: 'hidePreview', icon: 'ph-eye-slash', label: 'Sembunyikan isi notifikasi', desc: 'Isi pesan tidak tampil di layar kunci.', type: 'toggle', ...pref('hidePreview') },
    { id: 'shareWithPsy', icon: 'ph-share-network', label: 'Bagikan rekap mood ke psikolog', desc: 'Hanya ke psikolog yang kamu pesan, bisa dicabut kapan saja.', type: 'toggle', ...pref('shareWithPsy') },
    { id: 'anon', icon: 'ph-mask-happy', label: 'Anonim di komunitas', desc: 'Identitasmu tidak pernah ditampilkan.', type: 'info', value: () => 'Selalu aktif' },
    { id: 'privacy', icon: 'ph-shield-check', label: 'Kebijakan privasi', desc: 'Apa yang kami simpan dan untuk apa.', type: 'link', value: () => '', action: 'openPrivacy()' },
    { id: 'export', icon: 'ph-download-simple', label: 'Unduh data saya', desc: 'Check-in, jurnal, dan chat dalam format JSON.', type: 'link', value: () => '', action: 'exportData()' },
  ] },
  { group: 'Tampilan', items: [
    { id: 'theme', icon: 'ph-moon', label: 'Mode gelap', desc: 'Lebih nyaman di malam hari.', type: 'toggle', get: () => state.theme === 'dark', set: v => { state.theme = v ? 'dark' : 'light'; } },
    { id: 'textSize', icon: 'ph-text-aa', label: 'Ukuran teks', desc: 'Perbesar teks di seluruh aplikasi.', type: 'select', options: [['normal', 'Normal'], ['large', 'Besar']], ...pref('textSize') },
    { id: 'lang', icon: 'ph-translate', label: 'Bahasa', desc: 'Bahasa antarmuka.', type: 'select', proto: true, options: [['id', 'Indonesia'], ['en', 'English']], ...pref('lang') },
  ] },
  { group: 'Lainnya', items: [
    { id: 'b2b', icon: 'ph-chart-bar', label: 'Dashboard B2B (demo)', desc: 'Tampilan untuk kampus & perusahaan mitra.', type: 'link', value: () => '', action: "location.href='admin.html'" },
    { id: 'logout', icon: 'ph-sign-out', label: 'Keluar', desc: 'Data tetap tersimpan di perangkat ini.', type: 'link', value: () => '', action: 'logout()' },
    { id: 'reset', icon: 'ph-trash', label: 'Hapus akun & data', desc: 'Menghapus semua data demo dari perangkat.', type: 'danger', value: () => '', action: 'resetDemo()' },
  ] },
];
const settingById = id => SETTINGS.flatMap(g => g.items).find(i => i.id === id);

function toggleSetting(id) {
  const s = settingById(id);
  s.set(!s.get());
  afterSettingChange();
}
function setSetting(id, value) {
  settingById(id).set(value);
  afterSettingChange();
}
function afterSettingChange() {
  persist(); applyTheme(); rerender();
}

const optList = s => s.options.map(o => Array.isArray(o) ? o : [o, o]);
const protoTag = s => s.proto ? '<span class="proto">UI saja</span>' : '';
function selectHTML(s) {
  return `<select class="select-mini" aria-label="${s.label}" onchange="setSetting('${s.id}', this.value)" onclick="event.stopPropagation()">
    ${optList(s).map(([v, l]) => `<option value="${v}" ${s.get() === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
}

// In-app sheet
function openSettings() {
  const body = SETTINGS.map(g => `
    <div class="set-group">
      <p class="set-group-title">${g.group}</p>
      <div class="list">${g.items.map(s => {
        const head = `<span class="li-ic"><i class="ph ${s.icon}"></i></span><div class="grow"><p style="font-size:15px">${s.label}${protoTag(s)}</p></div>`;
        if (s.type === 'toggle') return `<button class="list-item" role="switch" aria-checked="${!!s.get()}" onclick="toggleSetting('${s.id}')">${head}<span class="switch ${s.get() ? 'on' : ''}"></span></button>`;
        if (s.type === 'select') return `<div class="list-item">${head}${selectHTML(s)}</div>`;
        if (s.type === 'info') return `<div class="list-item">${head}<span class="set-value">${esc(s.value())}</span></div>`;
        return `<button class="list-item ${s.type === 'danger' ? 'danger' : ''}" onclick="${s.action}">${head}<span class="set-value">${esc(s.value())}</span><i class="ph ph-caret-right chev"></i></button>`;
      }).join('')}</div>
    </div>`).join('');
  const sheet = document.getElementById('sheet');
  const keepScroll = ui.sheetKind === 'settings' ? sheet.querySelector('.sheet-body')?.scrollTop : 0;
  openSheet({ full: true, kind: 'settings', title: '<h2 class="h2">Pengaturan</h2>', body });
  sheet.querySelector('.sheet-body').scrollTop = keepScroll || 0;
}

// ---------- Desktop right panel ----------
const FEATURES = [
  { p: 'p0', area: 'Keselamatan', status: 'Prototype awal', title: 'Rencana keselamatan & kontak tepercaya',
    why: 'Saat krisis, orang sulit berpikir jernih. Rencana yang disiapkan saat tenang lebih mungkin dipakai.',
    details: ['Isi pemicu, tanda bahaya, dan 3 langkah menenangkan diri', 'Satu kontak tepercaya bisa dikabari dari SOS (sudah ada versi awal)', 'Bisa dibuat bersama Teman Pulih atau psikolog'] },
  { p: 'p0', area: 'Keselamatan', status: 'Diusulkan', title: 'Deteksi kalimat berisiko + moderasi',
    why: 'Cerita di Lingkar dan jurnal bisa memuat tanda krisis yang tidak terlihat oleh tim.',
    details: ['Deteksi kata kunci/ML di postingan dan check-in, menawarkan SOS dengan lembut', 'Antrian moderasi untuk Teman Pulih senior', 'Postingan berisiko disembunyikan sampai ditinjau'] },
  { p: 'p0', area: 'Privasi', status: 'UI saja', title: 'Kunci aplikasi (PIN / biometrik)',
    why: 'Banyak mahasiswa berbagi perangkat atau tinggal bersama keluarga.',
    details: ['PIN 4 digit atau Face ID / sidik jari', 'Kunci otomatis setelah 1 menit di latar belakang', 'Ikon & nama aplikasi samaran (opsional)'] },
  { p: 'p1', area: 'Konsultasi', status: 'Diusulkan', title: 'Video call in-app & ruang tunggu',
    why: 'Saat ini sesi hanya terjadwal; pengguna perlu tempat aman untuk masuk sesi.',
    details: ['WebRTC terenkripsi, tanpa aplikasi pihak ketiga', 'Ruang tunggu 5 menit dengan latihan napas', 'Masuk ke kalender (Google/Outlook) & pengingat'] },
  { p: 'p1', area: 'Monitoring', status: 'Diusulkan', title: 'Rekap mingguan & ekspor untuk psikolog',
    why: 'Langkah 6 di user journey: perkembangan dipantau agar pemulihan berkelanjutan.',
    details: ['Ringkasan mood, pemicu, dan latihan setiap Minggu malam', 'Bagikan PDF ke psikolog dengan persetujuan (toggle sudah ada di Pengaturan)', 'Bandingkan skor Cek Diri dari waktu ke waktu'] },
  { p: 'p1', area: 'Premium', status: 'Diusulkan', title: 'Jurnal refleksi AI',
    why: 'Fitur Premium di pitch deck yang belum ada di aplikasi.',
    details: ['Pertanyaan lanjutan dari catatan check-in', 'Ringkasan pola, bukan diagnosis — dengan disclaimer jelas', 'Opt-in, data tidak dipakai untuk melatih model'] },
  { p: 'p1', area: 'Kualitas', status: 'Diusulkan', title: 'Rating sesi & NPS',
    why: 'Bagian “Evaluasi & Dampak” di model bisnis butuh data kepuasan.',
    details: ['Rating 1–5 dan catatan singkat setelah sesi', 'NPS bulanan untuk evaluasi churn', 'Data agregat masuk Dashboard B2B'] },
  { p: 'p1', area: 'B2B', status: 'Diusulkan', title: 'Laporan institusi yang benar-benar anonim',
    why: 'Kampus perlu insight, mahasiswa perlu yakin datanya aman.',
    details: ['Hanya agregat dengan minimal 10 orang per kelompok (k-anonymity)', 'Tidak ada isi chat atau jurnal yang dibagikan', 'Halaman transparansi untuk pengguna'] },
  { p: 'p2', area: 'Retensi', status: 'Diusulkan', title: 'Program terstruktur 7 hari',
    why: 'Konten satuan mudah ditinggalkan; seri bertahap membangun kebiasaan.',
    details: ['Seri CBT ringan: pikiran, tubuh, relasi', 'Progres tersimpan dan bisa diulang', 'Pengingat sesuai jam yang dipilih'] },
  { p: 'p2', area: 'Retensi', status: 'Diusulkan', title: 'Gamifikasi yang lembut',
    why: 'Timeline Q3 menyebut gamifikasi — tapi streak yang putus bisa bikin merasa gagal.',
    details: ['“Libur streak” 1x per minggu', 'Lencana tanpa papan peringkat', 'Bahasa apresiatif, bukan menghukum'] },
  { p: 'p2', area: 'Pertumbuhan', status: 'Diusulkan', title: 'Referral & Campus Ambassador',
    why: 'Strategi pemasaran mengandalkan ambassador dan rujukan.',
    details: ['Kode undangan: teman dapat 7 hari Premium', 'Kode ambassador terlacak di Dashboard B2B', 'Tanpa membuka identitas pengguna yang diundang'] },
  { p: 'p2', area: 'Akses', status: 'Diusulkan', title: 'Konten offline & hemat data',
    why: 'Tidak semua mahasiswa punya kuota besar atau sinyal stabil.',
    details: ['Unduh audio meditasi & artikel', 'Mode hemat data untuk gambar dan video', 'Latihan napas tetap jalan tanpa internet'] },
];

function renderStagePanel() {
  const el = document.getElementById('stagePanel');
  if (!el || getComputedStyle(el).display === 'none') return;
  const scroll = el.querySelector('.panel-body')?.scrollTop || 0;
  const settingsTable = `
    <p class="tiny" style="margin-bottom:14px">Tersinkron dengan aplikasi — ubah di sini atau lewat menu ☰ di kanan atas aplikasi. <span class="proto" style="margin:0">UI saja</span> = tampilan prototype, belum berfungsi penuh.</p>
    <table class="set-table">${SETTINGS.map(g => `
      <tr><th colspan="2">${g.group}</th></tr>
      ${g.items.map(s => {
        let ctrl;
        if (s.type === 'toggle') ctrl = `<button class="switch ${s.get() ? 'on' : ''}" role="switch" aria-checked="${!!s.get()}" aria-label="${s.label}" onclick="toggleSetting('${s.id}')"></button>`;
        else if (s.type === 'select') ctrl = selectHTML(s);
        else if (s.type === 'info') ctrl = `<span class="set-value">${esc(s.value())}</span>`;
        else ctrl = `<button class="go" style="${s.type === 'danger' ? 'color:var(--clay)' : ''}" onclick="${s.action}">${esc(s.value()) || 'Buka'} <i class="ph ph-caret-right"></i></button>`;
        return `<tr><td><div class="lbl"><i class="ph ${s.icon}"></i>${s.label}${protoTag(s)}</div><p class="desc">${s.desc}</p></td><td>${ctrl}</td></tr>`;
      }).join('')}`).join('')}
    </table>`;
  const features = `
    <p class="tiny" style="margin-bottom:14px">Fitur yang belum ada, diurutkan dari prioritas tertinggi. P0 = sebelum peluncuran, P1 = 3 bulan pertama, P2 = setelah product-market fit.</p>
    ${FEATURES.map(f => `
      <div class="feat">
        <div class="feat-head"><span class="prio ${f.p}">${f.p.toUpperCase()}</span><span class="tag tag-plain">${f.area}</span><span class="tiny" style="margin-left:auto">${f.status}</span></div>
        <h4>${f.title}</h4>
        <p>${f.why}</p>
        <ul>${f.details.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>`).join('')}`;
  el.innerHTML = `
    <div class="panel-head">
      <div class="row">
        <span class="wordmark" role="img" aria-label="Ruang Pulih" style="width:110px;height:26px"></span>
        <div class="panel-tools">
          <a href="admin.html" title="Dashboard B2B" aria-label="Dashboard B2B"><i class="ph ph-chart-bar"></i></a>
          <button onclick="toggleTheme()" title="Ganti tema" aria-label="Ganti tema"><i class="ph ph-moon"></i></button>
          <button onclick="captureMockup()" title="Simpan mockup" aria-label="Simpan mockup"><i class="ph ph-camera"></i></button>
          <button onclick="resetDemo()" title="Reset demo" aria-label="Reset demo"><i class="ph ph-arrow-counter-clockwise"></i></button>
        </div>
      </div>
      <div class="segmented mt-16">
        <button class="${ui.panelTab === 'settings' ? 'on' : ''}" onclick="ui.panelTab='settings';renderStagePanel()">Pengaturan</button>
        <button class="${ui.panelTab === 'features' ? 'on' : ''}" onclick="ui.panelTab='features';renderStagePanel()">Usulan fitur (${FEATURES.length})</button>
      </div>
    </div>
    <div class="panel-body">${ui.panelTab === 'settings' ? settingsTable : features}</div>`;
  el.querySelector('.panel-body').scrollTop = scroll;
}
window.addEventListener('resize', () => renderStagePanel());

// ---------- Actions used by settings ----------
function openTrustedContact() {
  const c = state.trustedContact || { name: '', phone: '' };
  openSheet({
    title: '<h2 class="h2">Kontak tepercaya</h2>',
    body: `
      <p class="muted" style="font-size:14px">Seseorang yang bisa kamu kabari langsung dari tombol SOS. Mereka tidak menerima notifikasi apa pun dari Ruang Pulih.</p>
      <label class="label" for="tcName">Nama</label>
      <input class="field" id="tcName" maxlength="30" placeholder="Misal: Kak Rani" value="${esc(c.name)}">
      <label class="label" for="tcPhone">Nomor HP</label>
      <input class="field" id="tcPhone" type="tel" inputmode="tel" maxlength="16" placeholder="08xxxxxxxxxx" value="${esc(c.phone)}">
      <p class="err" id="tcErr"></p>
      <button class="btn btn-primary btn-block mt-8" onclick="saveTrustedContact()">Simpan</button>
      ${state.trustedContact ? '<button class="btn btn-ghost btn-block mt-8" onclick="state.trustedContact=null;persist();closeSheet();rerender()">Hapus kontak</button>' : ''}`,
  });
}
function saveTrustedContact() {
  const name = document.getElementById('tcName').value.trim();
  const phone = document.getElementById('tcPhone').value.replace(/[^\d+]/g, '');
  if (!name || phone.length < 9) { document.getElementById('tcErr').textContent = 'Isi nama dan nomor HP yang valid.'; return; }
  state.trustedContact = { name, phone }; persist(); closeSheet(); rerender();
  toast(`${name} tersimpan sebagai kontak tepercaya`, 'ph-user-check');
}
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ruang-pulih-data-${dayKey()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Data diunduh', 'ph-download-simple');
}
function logout() {
  state.account = null; persist();
  closeSheet(); hideSosFab();
  renderAuth('intro');
}

// ---------- Data untuk kampus (consent for the partner institution) ----------
// Default is anonymous statistics only. Anything identifiable is opt-in, per item, revocable,
// visible only to licensed counsellors, and never a condition for free access (UU PDP: explicit consent for health data).
const CARE_ITEMS = [
  { key: 'mood', icon: 'ph-chart-line', label: 'Tren suasana hati mingguan', desc: 'Rata-rata check-in per minggu — bukan isi catatanmu.' },
  { key: 'check', icon: 'ph-clipboard-text', label: 'Hasil Cek Diri', desc: 'Skor dan kategori, agar konselor tahu kapan perlu menyapa.' },
  { key: 'sos', icon: 'ph-lifebuoy', label: 'Pemberitahuan saat kamu menekan SOS', desc: 'Konselor menghubungimu dalam 1×24 jam untuk memastikan kamu aman.' },
];
const emptyShare = () => ({ decided: false, care: false, mood: false, check: false, sos: false, research: false, at: null });
function campusSummary() {
  const c = state.campusShare;
  if (!c || !c.decided) return 'Belum dipilih';
  if (c.care) return `Pendampingan · ${CARE_ITEMS.filter(i => c[i.key]).length} data`;
  return c.research ? 'Anonim + penelitian' : 'Hanya anonim';
}
function openCampusConsent(context = 'settings') {
  if (!state.org) return openAffiliation();
  ui.campusDraft ||= { ...(state.campusShare || emptyShare()) };
  ui.campusContext = context;
  const d = ui.campusDraft;
  const org = esc(state.org);
  const sw = (on, fn, label) => `<button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${on}" aria-label="${label}" onclick="${fn}"></button>`;
  const body = `
    <div class="consent-hero">
      <div class="consent-hero-art">${ILLO.together()}</div>
      <span class="tag" style="background:rgba(255,255,255,.16);color:inherit"><i class="ph-fill ph-buildings"></i>${org}</span>
      <h2 class="display" style="font-size:26px;margin-top:10px">${org} peduli pada kesejahteraanmu</h2>
      <p style="font-size:14px;opacity:.88;margin-top:8px">Dengan izinmu, tim konseling kampus bisa mempelajari pola, menganalisis kebutuhan mahasiswa, dan menyiapkan pendampingan yang sesuai untukmu. Kamu yang memutuskan apa yang dibagikan.</p>
    </div>

    <p class="set-group-title mt-20">Selalu dibagikan · anonim</p>
    <div class="list"><div class="list-item"><span class="li-ic"><i class="ph ph-chart-pie-slice"></i></span>
      <div class="grow"><p style="font-size:15px">Statistik gabungan</p><p class="tiny">Hanya total kelompok minimal 10 orang. Kamu tidak bisa dikenali dari sini.</p></div>
      <span class="tag tag-plain"><i class="ph ph-lock-simple"></i>Anonim</span></div></div>

    <p class="set-group-title mt-20">Pendampingan personal · pilihanmu</p>
    <div class="list">
      <div class="list-item"><span class="li-ic"><i class="ph ph-hand-heart"></i></span>
        <div class="grow"><p style="font-size:15px">Ikut Program Pendampingan ${org}</p><p class="tiny">Konselor berlisensi di kampusmu dapat melihat data di bawah ini dengan namamu, untuk menyapamu lebih awal.</p></div>
        ${sw(d.care, 'toggleCampus(\'care\')', 'Ikut Program Pendampingan')}</div>
      ${d.care ? CARE_ITEMS.map(i => `
        <div class="list-item sub"><span class="li-ic"><i class="ph ${i.icon}"></i></span>
          <div class="grow"><p style="font-size:14.5px">${i.label}</p><p class="tiny">${i.desc}</p></div>
          ${sw(d[i.key], `toggleCampus('${i.key}')`, i.label)}</div>`).join('') : ''}
    </div>

    <p class="set-group-title mt-20">Penelitian · pilihanmu</p>
    <div class="list"><div class="list-item"><span class="li-ic"><i class="ph ph-flask"></i></span>
      <div class="grow"><p style="font-size:15px">Bantu penelitian kesejahteraan mahasiswa</p><p class="tiny">Data tanpa nama dipakai untuk studi ${org} yang disetujui komite etik.</p></div>
      ${sw(d.research, 'toggleCampus(\'research\')', 'Ikut penelitian')}</div></div>

    <div class="never mt-20">
      <p class="h3" style="font-size:14px"><i class="ph-fill ph-shield-check"></i> Tidak pernah dibagikan ke kampus</p>
      <ul>
        <li>Isi chat dengan Teman Pulih atau psikolog</li>
        <li>Jurnal, catatan, dan isi check-in</li>
        <li>Postingan dan identitasmu di Lingkar Pulih</li>
        <li>Data apa pun untuk nilai, beasiswa, atau sanksi</li>
      </ul>
    </div>
    <p class="tiny mt-16">Kamu bisa mengubah atau mencabut izin kapan saja di Pengaturan → Data untuk kampus. Pilihanmu tidak memengaruhi akses gratis dari ${org}.</p>
    <div class="consent-actions">
      <button class="btn btn-ghost" onclick="saveCampus(false)">Hanya data anonim</button>
      <button class="btn btn-primary" onclick="saveCampus(true)">Simpan pilihan</button>
    </div>`;
  // Already open: swap the body in place so the draft (and scroll position) survive each toggle.
  const open = ui.sheetKind === 'campus' && document.querySelector('#sheet .sheet-body');
  if (open) { const keep = open.scrollTop; open.innerHTML = body; open.scrollTop = keep; return; }
  openSheet({ full: true, kind: 'campus', title: '<h2 class="h2">Data untuk kampus</h2>', body,
    onClose: () => { ui.campusDraft = null; } });
}
function toggleCampus(key) {
  const d = ui.campusDraft;
  d[key] = !d[key];
  if (key === 'care') CARE_ITEMS.forEach(i => { d[i.key] = d.care; });
  if (CARE_ITEMS.some(i => i.key === key) && !CARE_ITEMS.some(i => d[i.key])) d.care = false;
  openCampusConsent(ui.campusContext);
}
function saveCampus(keepChoices) {
  const d = keepChoices ? ui.campusDraft : emptyShare();
  state.campusShare = { ...d, decided: true, at: dayKey() };
  persist();
  ui.campusDraft = null;
  closeSheet();
  rerender();
  toast(state.campusShare.care ? `Terima kasih. Konselor ${state.org} kini bisa mendampingimu.` : 'Pilihanmu tersimpan · hanya data anonim', 'ph-check-circle');
}
