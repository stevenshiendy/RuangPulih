// ===== RUANG PULIH — APP LOGIC =====
// Five tabs: Beranda · Lingkar · Dukungan · Belajar · Kamu.
// Everything else opens as a bottom sheet so the user never loses their place.

// ---------- Storage ----------
const KEY = 'rp2';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

// ---------- Date helpers ----------
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const dayKey = (offset = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const keyToDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const nowTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
const greeting = () => {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
};
const rupiah = n => 'Rp' + n.toLocaleString('id-ID');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Data ----------
const MOODS = [
  null,
  { label: 'Berat', line: 'Hari ini terasa berat.' },
  { label: 'Kurang', line: 'Kamu sedang kurang baik.' },
  { label: 'Biasa', line: 'Harimu biasa saja.' },
  { label: 'Baik', line: 'Kamu merasa baik hari ini.' },
  { label: 'Lega', line: 'Kamu merasa lega hari ini.' },
];
const MOOD_TAGS = ['Kuliah', 'Kerja', 'Keluarga', 'Relasi', 'Tidur', 'Kesehatan', 'Uang', 'Diri sendiri'];

const PROVIDERS = [
  { id: 'tp-nadia', type: 'peer', name: 'Nadia', initials: 'NA', c: 'var(--m4)', role: 'Psikologi · UNPAD', tags: ['Kuliah', 'Kecemasan'], online: true },
  { id: 'tp-raka', type: 'peer', name: 'Raka', initials: 'RK', c: 'var(--m2)', role: 'Psikologi · UPI', tags: ['Relasi', 'Keluarga'], online: true },
  { id: 'tp-sekar', type: 'peer', name: 'Sekar', initials: 'SK', c: 'var(--m5)', role: 'Psikologi · BINUS', tags: ['Karir', 'Burnout'], online: false },
  { id: 'dian', type: 'psy', name: 'Dr. Dian Sasmita, M.Psi.', short: 'Dian', initials: 'DS', c: 'var(--m4)', specialty: 'Kecemasan & trauma', cat: 'Kecemasan', rating: 4.9, reviews: 124, years: 9, price: 150000, online: true,
    bio: 'Berfokus pada Cognitive Behavioral Therapy (CBT) untuk kecemasan berlebih, serangan panik, dan pemulihan trauma.' },
  { id: 'fajar', type: 'psy', name: 'Fajar Nugraha, M.Psi.', short: 'Fajar', initials: 'FN', c: 'var(--m2)', specialty: 'Relasi & depresi', cat: 'Relasi', rating: 4.8, reviews: 95, years: 6, price: 150000, online: true,
    bio: 'Mendampingi masalah relasi, komunikasi dengan pasangan, dan pemulihan gejala depresi.' },
  { id: 'siti', type: 'psy', name: 'Siti Aminah, M.Psi.', short: 'Siti', initials: 'SA', c: 'var(--m3)', specialty: 'Keluarga & pola asuh', cat: 'Keluarga', rating: 5.0, reviews: 62, years: 11, price: 175000, online: false,
    bio: 'Spesialis dinamika keluarga, ekspektasi orang tua, dan transisi menuju dewasa.' },
  { id: 'rudi', type: 'psy', name: 'Rudi Hermawan, M.Psi.', short: 'Rudi', initials: 'RH', c: 'var(--m5)', specialty: 'Karir & burnout', cat: 'Karir', rating: 4.7, reviews: 80, years: 7, price: 150000, online: true,
    bio: 'Membantu fresh graduate dan pekerja muda mengatasi burnout, quarter-life crisis, dan perencanaan karir yang sehat.' },
];
const provider = id => PROVIDERS.find(p => p.id === id);

const REPLIES = {
  peer: [
    'Makasih sudah cerita. Aku dengerin kok — pelan-pelan aja.',
    'Wajar banget kalau kamu merasa begitu. Boleh ceritain bagian yang paling berat buatmu?',
    'Kamu sudah berani cerita, itu langkah yang besar. Mau coba kita urai satu per satu?',
  ],
  psy: [
    'Terima kasih sudah berbagi. Apa yang kamu rasakan itu valid. Kapan biasanya perasaan ini paling kuat muncul?',
    'Saya di sini menemani. Kita bisa bahas lebih dalam saat sesi nanti — untuk sekarang, coba tarik napas perlahan.',
    'Bagus sekali kamu bisa menyadarinya. Mari kita catat polanya supaya bisa kita kerjakan bersama.',
  ],
};

const TOPICS = ['Semua', 'Cerita', 'Kuliah', 'Keluarga', 'Karir', 'Kecemasan'];
const SEED_POSTS = [
  { id: 'p1', peer: true, topic: 'Cerita', ago: '2 j', c: 'var(--m4)', hugs: 45, body: 'Hari ini aku mencoba untuk tidak terlalu keras pada diriku sendiri. Kalau kamu juga sedang berjuang, ingat: setiap langkah kecil tetap berarti.' },
  { id: 'p2', topic: 'Keluarga', ago: '3 j', c: 'var(--m2)', hugs: 24, body: 'Ada yang pernah merasa overwhelmed dengan ekspektasi keluarga? Aku butuh perspektif baru soal cara menetapkan batasan tanpa merasa bersalah.' },
  { id: 'p3', topic: 'Kuliah', ago: '5 j', c: 'var(--m3)', hugs: 31, body: 'Minggu UTS bikin aku susah tidur. Ada yang punya ritual kecil sebelum tidur yang beneran ngebantu?' },
  { id: 'p4', topic: 'Kecemasan', ago: '8 j', c: 'var(--m1)', hugs: 19, body: 'Jantungku suka berdebar sebelum presentasi, padahal sudah latihan. Napas kotak 4-4-4-4 lumayan membantu. Ada tips lain?' },
  { id: 'p5', peer: true, topic: 'Cerita', ago: '1 h', c: 'var(--m5)', hugs: 88, body: 'Prompt hari ini: tuliskan satu hal yang sudah kamu lakukan dengan baik minggu ini, sekecil apa pun. Kamu layak mengapresiasi dirimu.' },
  { id: 'p6', topic: 'Karir', ago: '1 h', c: 'var(--m2)', hugs: 52, body: 'Fresh graduate, sudah 4 bulan cari kerja. Kadang merasa tertinggal dari teman-teman. Gimana cara kalian berhenti membandingkan diri?' },
];
// Seeded comment threads (m = minutes ago, used for "Terbaru" sorting).
const SEED_COMMENTS = {
  p1: [
    { id: 'p1c1', peer: true, c: 'var(--m4)', m: 95, hugs: 21, body: 'Pengingat yang aku butuhkan hari ini. Terima kasih sudah berbagi 🤍',
      children: [{ id: 'p1c1a', c: 'var(--m3)', m: 60, hugs: 4, body: 'Sama, kadang lupa kalau istirahat juga bagian dari berjuang.' }] },
    { id: 'p1c2', c: 'var(--m2)', m: 70, hugs: 9, body: 'Aku mulai menulis tiga hal kecil yang berhasil tiap malam. Pelan-pelan jadi lebih ramah sama diri sendiri.' },
  ],
  p2: [
    { id: 'p2c1', peer: true, c: 'var(--m4)', m: 150, hugs: 18, body: 'Batasan bukan berarti tidak sayang keluarga. Coba mulai dari kalimat "aku butuh waktu untuk memikirkannya dulu" — itu sudah batasan kecil.',
      children: [
        { id: 'p2c1a', c: 'var(--m2)', m: 120, hugs: 6, body: 'Ini membantu banget, makasih kak.' },
        { id: 'p2c1b', c: 'var(--m5)', m: 40, hugs: 2, body: 'Aku pakai kalimat ini ke orang tua minggu lalu, ternyata mereka lebih mengerti dari yang kubayangkan.' },
      ] },
    { id: 'p2c2', c: 'var(--m3)', m: 100, hugs: 7, body: 'Relate. Artikel "Batasan sehat tanpa rasa bersalah" di tab Belajar lumayan membuka pikiran.' },
  ],
  p3: [
    { id: 'p3c1', c: 'var(--m5)', m: 260, hugs: 14, body: 'Aku taruh HP di luar kamar 30 menit sebelum tidur. Awalnya susah, tapi sekarang lebih cepat ngantuk.',
      children: [{ id: 'p3c1a', c: 'var(--m1)', m: 200, hugs: 3, body: 'Mau coba malam ini!' }] },
    { id: 'p3c2', peer: true, c: 'var(--m4)', m: 230, hugs: 11, body: 'Body scan 10 menit di tab Belajar bisa dicoba. Semangat UTS-nya, kamu sudah berusaha.' },
    { id: 'p3c3', c: 'var(--m2)', m: 30, hugs: 1, body: 'Teh hangat tanpa kafein + jurnal singkat. Biar pikiran nggak muter terus.' },
  ],
  p4: [
    { id: 'p4c1', c: 'var(--m3)', m: 400, hugs: 8, body: 'Latihan presentasi di depan satu teman dulu sebelum di depan kelas. Bertahap bikin lebih siap.' },
    { id: 'p4c2', peer: true, c: 'var(--m4)', m: 380, hugs: 12, body: 'Debar itu tanda tubuhmu sedang bersiap, bukan tanda kamu gagal. Coba grounding 5-4-3-2-1 sebelum maju.',
      children: [{ id: 'p4c2a', c: 'var(--m1)', m: 300, hugs: 2, body: 'Baru tahu soal grounding, makasih!' }] },
  ],
  p5: [
    { id: 'p5c1', c: 'var(--m5)', m: 1300, hugs: 34, body: 'Aku akhirnya berani bilang "nggak" ke ajakan yang bikin capek. Kecil, tapi berarti.' },
    { id: 'p5c2', c: 'var(--m2)', m: 1250, hugs: 19, body: 'Aku bangun pagi dan sarapan tiga hari berturut-turut 😄',
      children: [{ id: 'p5c2a', peer: true, c: 'var(--m4)', m: 1100, hugs: 7, body: 'Itu pencapaian! Bangga sama kamu.' }] },
    { id: 'p5c3', c: 'var(--m3)', m: 900, hugs: 5, body: 'Aku menyelesaikan tugas yang sudah kutunda dua minggu.' },
  ],
  p6: [
    { id: 'p6c1', c: 'var(--m4)', m: 1200, hugs: 22, body: 'Aku butuh 7 bulan sampai dapat kerja pertama. Linimasa setiap orang beda, kamu nggak tertinggal.',
      children: [{ id: 'p6c1a', c: 'var(--m2)', m: 1000, hugs: 5, body: 'Butuh banget dengar ini hari ini.' }] },
    { id: 'p6c2', peer: true, c: 'var(--m5)', m: 1150, hugs: 13, body: 'Coba batasi waktu buka LinkedIn. Fokus ke satu langkah kecil per hari: satu lamaran, satu skill, satu istirahat.' },
  ],
};
const GENERIC_COMMENTS = [
  { id: 'gc1', peer: true, c: 'var(--m4)', m: 20, hugs: 3, body: 'Terima kasih sudah berbagi. Kamu tidak sendirian di sini.' },
];

const PRACTICES = [
  { id: 'breath', title: 'Napas kotak', sub: 'Menenangkan sistem saraf', mins: 4, icon: 'ph-wind', c: 'var(--m2)', open: () => openBreathing() },
  { id: 'body-scan', title: 'Body scan', sub: 'Rileks dari kepala ke kaki', mins: 10, icon: 'ph-person-simple', c: 'var(--m4)', open: () => openMeditation('body-scan') },
  { id: 'kindness', title: 'Loving-kindness', sub: 'Lembut pada diri sendiri', mins: 8, icon: 'ph-heart', c: 'var(--m5)', open: () => openMeditation('kindness') },
  { id: 'gratitude', title: 'Tiga hal baik', sub: 'Jurnal syukur singkat', mins: 5, icon: 'ph-plant', c: 'var(--m3)', open: () => openGratitude() },
];
const MEDITATIONS = {
  'body-scan': { title: 'Body scan', secs: 600, guide: 'Pejamkan mata. Rasakan berat tubuhmu di tempat duduk, lalu perlahan arahkan perhatian dari ujung kepala sampai ujung kaki.' },
  'kindness': { title: 'Loving-kindness', secs: 480, guide: 'Ulangi pelan-pelan: semoga aku aman, semoga aku tenang, semoga aku bisa menerima diriku hari ini.' },
};

// PHQ-4 (Kroenke et al., 2009) — short screener, not a diagnosis.
const CHECK_QUESTIONS = [
  'Merasa gugup, cemas, atau tegang',
  'Tidak mampu menghentikan atau mengendalikan rasa khawatir',
  'Kurang tertarik atau kurang senang dalam melakukan sesuatu',
  'Merasa sedih, murung, atau putus asa',
];
const CHECK_OPTIONS = ['Tidak sama sekali', 'Beberapa hari', 'Lebih dari separuh hari', 'Hampir setiap hari'];

// ---------- State ----------
function seedMoods() {
  const pattern = [3, 4, null, 2, 3, 3, 4, 5, null, 2, 3, 4, 4];
  const tagSets = [['Kuliah'], ['Relasi'], [], ['Kuliah', 'Tidur'], ['Keluarga'], [], ['Diri sendiri'], ['Relasi'], [], ['Kuliah'], ['Tidur'], [], ['Kerja']];
  return pattern.map((v, i) => v && { date: dayKey(i - 13), v, tags: tagSets[i], note: '' }).filter(Boolean);
}
function freshState() {
  return {
    v: 3,
    account: null,
    name: localStorage.getItem('rp_username') || 'Sahabat',
    theme: 'light',
    premium: false,
    trial: false,
    org: null,
    prefs: { ...DEFAULT_PREFS },
    trustedContact: null,
    moods: seedMoods(),
    gratitude: [],
    posts: [],
    hugged: [],
    replies: {},
    chats: {
      dian: {
        unread: true,
        messages: [
          { from: 'sys', text: 'Sesi perkenalan selesai · 12 Okt' },
          { from: 'them', text: 'Halo, senang bisa ngobrol kemarin. Bagaimana latihan napasmu minggu ini?', t: '10.31' },
        ],
      },
    },
    bookings: [],
    screening: null,
    notifSeen: false,
  };
}
const DEFAULT_PREFS = {
  reminders: true, reminderTime: '20.00', notifReplies: true, notifSession: true, hidePreview: true,
  appLock: false, textSize: 'normal', lang: 'id', shareWithPsy: false,
};
let state = load() || freshState();
state.prefs = { ...DEFAULT_PREFS, ...(state.prefs || {}) };
['saved', 'following', 'hiddenPosts'].forEach(k => { state[k] ||= []; });
state.toolLog ||= { breath: [], meditation: [], gratitude: [], check: [] };

const ui = { tab: 'home', supportTab: 'peer', psyCat: 'Semua', topic: 'Semua', draft: null, editingMood: false, panelTab: 'settings', sheetKind: null };

// ---------- Pebbles (signature mood shapes) ----------
const PEBBLE = [
  null,
  { d: 'M7 31c0-9 7-17 17-17s17 6 17 15c0 9-7 13-17 13S7 39 7 31z', eye: 28, mouth: 'M19 36q5-3.5 10 0' },
  { d: 'M6 27c0-10 8-17 18-17 10 1 18 7 17 17-1 9-8 14-17 14S6 36 6 27z', eye: 25, mouth: 'M19 33q5-1.6 10 0' },
  { d: 'M24 7c10 0 17 7 17 17s-7 17-17 17S7 34 7 24 14 7 24 7z', eye: 22, mouth: 'M19 30h10' },
  { d: 'M23 6c11-1 19 8 18 18-1 11-9 18-19 17C12 40 6 32 7 23 8 13 13 7 23 6z', eye: 21, mouth: 'M18.5 28.5q5.5 4 11 0' },
  { d: 'M25 4c9 0 15 6 16 14 1 9-3 18-12 21-10 3-21-3-22-13C6 15 14 4 25 4z', eye: 19, mouth: 'M17.5 26q6.5 6 13 0' },
];
function pebble(v, opts = {}) {
  const p = PEBBLE[v] || PEBBLE[3];
  const fill = opts.color || `var(--m${v})`;
  const mouth = opts.smile ? `M19.5 ${p.eye + 7}q4.5 3.4 9 0` : p.mouth;
  const face = opts.face === false ? '' :
    `<circle class="eye" cx="19" cy="${p.eye}" r="1.9"/><circle class="eye" cx="29" cy="${p.eye}" r="1.9"/><path class="face" d="${mouth}"/>`;
  return `<svg class="pebble" viewBox="0 0 48 48" aria-hidden="true"><path class="body" d="${p.d}" fill="${fill}"/>${face}</svg>`;
}

const shapeFor = id => 2 + [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 4;

// ---------- Derived ----------
const moodOn = key => state.moods.find(m => m.date === key);
const todayMood = () => moodOn(dayKey());
function streak() {
  let n = 0;
  for (let i = todayMood() ? 0 : -1; moodOn(dayKey(i)); i--) n++;
  return n;
}
const unreadCount = () => Object.values(state.chats).filter(c => c.unread).length;
const priceFor = p => state.org ? 0 : p.price;

// ---------- Shell ----------
const TABS = [
  { id: 'home', label: 'Beranda', icon: 'house' },
  { id: 'community', label: 'Lingkar Pulih', icon: 'users-three' },
  { id: 'support', label: 'Dukungan', icon: 'hand-heart' },
  { id: 'learn', label: 'Belajar', icon: 'book-open-text' },
  { id: 'me', label: 'Kamu', icon: 'user-circle' },
];
const TITLES = { community: 'Lingkar Pulih', support: 'Dukungan', learn: 'Belajar', me: 'Kamu' };

function renderNav() {
  const unread = unreadCount();
  document.getElementById('nav').innerHTML = TABS.map(t => `
    <button class="nav-btn ${ui.tab === t.id ? 'active' : ''}" onclick="go('${t.id}')" aria-current="${ui.tab === t.id ? 'page' : 'false'}">
      <span class="nav-ic"><i class="${ui.tab === t.id ? 'ph-fill' : 'ph'} ph-${t.icon}"></i>${t.id === 'support' && unread ? `<span class="badge" aria-label="${unread} pesan belum dibaca">${unread}</span>` : ''}</span>
      <span class="nav-label">${t.label}</span>
    </button>`).join('');
}

function renderTopbar() {
  // The wordmark is the one constant in the header; tab names live in each page's own heading.
  document.getElementById('topbarTitle').innerHTML =
    `<button class="brand" onclick="go('home')" aria-label="Ruang Pulih, ke Beranda"><span class="wordmark"></span></button>`;
  document.getElementById('notifDot').style.display = state.notifSeen ? 'none' : '';
  const pill = document.getElementById('premiumPill');
  pill.classList.toggle('active', state.premium);
  pill.innerHTML = state.premium
    ? '<i class="ph-fill ph-crown-simple"></i>Premium'
    : '<i class="ph-fill ph-sparkle"></i><span><span class="pill-long">Coba </span>Premium</span>';
  pill.setAttribute('aria-label', state.premium ? 'Kelola Premium' : 'Coba Premium gratis 3 hari');
}

const pageTitle = tab => `<h1 class="page-title">${TITLES[tab]}</h1>`;
const RENDER = { home: renderHome, community: renderCommunity, support: renderSupport, learn: renderLearn, me: renderMe };

function go(tab, opts = {}) {
  ui.tab = tab;
  if (opts.supportTab) ui.supportTab = opts.supportTab;
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === `screen-${tab}`));
  const screen = document.getElementById(`screen-${tab}`);
  screen.classList.add('enter');
  clearTimeout(go.enterTimer);
  go.enterTimer = setTimeout(() => screen.classList.remove('enter'), 700);
  RENDER[tab]();
  renderNav();
  renderTopbar();
  renderStagePanel();
  if (!opts.keepScroll) document.getElementById('scroll').scrollTop = 0;
}
const rerender = () => { RENDER[ui.tab](); renderNav(); renderTopbar(); renderStagePanel(); if (ui.sheetKind === 'settings') openSettings(); };

// ---------- Beranda ----------
function renderHome() {
  const tm = todayMood();
  const s = streak();
  document.getElementById('screen-home').innerHTML = `
    <div class="hello">
      <div class="grow">
        <p class="eyebrow">${greeting()},</p>
        <h2 class="display">Hai, ${esc(state.name)}</h2>
        ${s ? `<span class="tag tag-amber streak"><i class="ph-fill ph-flame"></i>${s} hari beruntun</span>` : ''}
      </div>
      ${ILLO.daytime()}
    </div>

    <div class="card mt-20" id="checkin">${tm && !ui.editingMood ? checkinDone(tm) : checkinPicker()}</div>

    ${tm && !ui.editingMood ? suggestion(tm.v) : ''}

    ${nextSessionCard()}

    <div class="section">
      ${toolsSection()}
    </div>

    <div class="section">
      <div class="section-head"><h3 class="h2">Bacaan hari ini</h3><button class="link" onclick="go('learn')">Semua</button></div>
      ${articleRow(ARTICLES[new Date().getDate() % ARTICLES.length])}
    </div>`;
}

// ---------- Alat bantu (tool cards) ----------
const TOOLS = [
  { key: 'breath', art: 'breath', title: 'Napas kotak', sub: '4 mnt · tenangkan diri', c: 'var(--m2)', open: 'openBreathing()' },
  { key: 'meditation', art: 'meditate', title: 'Meditasi', sub: '8–10 mnt · rileks', c: 'var(--m4)', open: "openMeditation('body-scan')" },
  { key: 'gratitude', art: 'gratitude', title: 'Jurnal syukur', sub: '3 mnt · tiga hal baik', c: 'var(--m5)', open: 'openGratitude()' },
  { key: 'check', art: 'check', title: 'Cek Diri', sub: '1 mnt · 4 pertanyaan', c: 'var(--m3)', open: 'openSelfCheck()' },
];
const mondayKey = () => dayKey(-((new Date().getDay() + 6) % 7));
const toolUses = key => (state.toolLog[key] || []);
const toolWeek = key => toolUses(key).filter(d => d >= mondayKey()).length;
function logTool(key) {
  (state.toolLog[key] ||= []).push(dayKey());
  persist();
  if (ui.tab === 'home') renderHome();
}
function recommendedTool() {
  const tm = todayMood();
  if (tm) return tm.v <= 2 ? 'breath' : tm.v === 3 ? 'meditation' : 'gratitude';
  const lastCheck = state.screening && (Date.now() - keyToDate(state.screening.date)) / 864e5;
  return !state.screening || lastCheck > 14 ? 'check' : 'breath';
}
const REC_REASON = { breath: 'Untuk hari yang berat', meditation: 'Biar kepala lebih jernih', gratitude: 'Simpan rasa baik ini', check: 'Sudah lama tidak cek diri' };
function toolsSection() {
  const rec = recommendedTool();
  const ordered = [...TOOLS].sort((a, b) => (b.key === rec) - (a.key === rec));
  const week = TOOLS.reduce((n, t) => n + toolWeek(t.key), 0);
  return `
    <div class="section-head" style="margin-bottom:4px"><h3 class="h2">Alat bantu</h3>
      <span class="tool-week"><i class="ph-fill ph-leaf"></i>${week} sesi minggu ini</span></div>
    <p class="tiny" style="margin-bottom:12px">Butuh jeda? Pilih satu — cukup beberapa menit.</p>
    <div class="tool-rail">${ordered.map(t => {
      const done = toolUses(t.key).includes(dayKey());
      const n = toolWeek(t.key);
      return `
      <button class="tool-card ${t.key === rec ? 'rec' : ''}" style="--tc:${t.c}" onclick="${t.open}" aria-label="${t.title}, ${t.sub}">
        ${t.key === rec ? `<span class="tool-badge"><i class="ph-fill ph-sparkle"></i>Untukmu</span>` : ''}
        ${done ? '<span class="tool-done" title="Sudah hari ini"><i class="ph ph-check"></i></span>' : ''}
        <span class="tool-art">${TOOL_ART[t.art]()}</span>
        <span class="tool-meta">
          <b>${t.title}</b>
          <span>${t.key === rec ? (rec === 'check' && !state.screening ? 'Kenali kondisimu dulu' : REC_REASON[rec]) : t.sub}</span>
        </span>
        <span class="tool-foot">
          <span class="tool-count">${n ? `${n}× minggu ini` : 'Belum dicoba'}</span>
          <span class="tool-play"><i class="ph-fill ph-play"></i></span>
        </span>
      </button>`;
    }).join('')}</div>`;
}

function checkinPicker() {
  const d = ui.draft || { v: null, tags: [], note: '' };
  ui.draft = d;
  return `
    <h3 class="h3">Bagaimana perasaanmu hari ini?</h3>
    <div class="mood-picker" role="radiogroup" aria-label="Pilih suasana hati">
      ${[1, 2, 3, 4, 5].map(v => `
        <button class="mood-opt ${d.v === v ? 'on' : ''}" role="radio" aria-checked="${d.v === v}" onclick="pickMood(${v})">
          ${pebble(v)}<span>${MOODS[v].label}</span>
        </button>`).join('')}
    </div>
    ${d.v ? `
      <div class="divider"></div>
      <p class="tiny">Apa yang paling memengaruhi? <span class="muted">(opsional)</span></p>
      <div class="chips wrap mt-8">
        ${MOOD_TAGS.map(t => `<button class="chip ${d.tags.includes(t) ? 'on' : ''}" onclick="toggleTag(this, '${t}')">${t}</button>`).join('')}
      </div>
      <textarea class="field mt-12" rows="2" maxlength="400" placeholder="Mau cerita sedikit? Hanya kamu yang bisa membaca ini." oninput="ui.draft.note=this.value">${esc(d.note)}</textarea>
      <div class="row mt-12">
        ${ui.editingMood ? '<button class="btn btn-ghost btn-sm" onclick="cancelMoodEdit()">Batal</button>' : ''}
        <button class="btn btn-primary btn-block" onclick="saveMood()"><i class="ph ph-check"></i>Simpan check-in</button>
      </div>` : ''}`;
}

function checkinDone(m) {
  return `
    <div class="checkin-done">
      ${pebble(m.v)}
      <div class="grow">
        <p class="tiny">Check-in hari ini</p>
        <p class="h3">${MOODS[m.v].line}</p>
        ${m.tags.length ? `<p class="tiny mt-8">${m.tags.map(esc).join(' · ')}</p>` : ''}
      </div>
      <button class="link" onclick="editMood()">Ubah</button>
    </div>
    <div class="divider"></div>
    ${weekStrip()}`;
}

function weekStrip() {
  const today = new Date().getDay();
  const mondayOffset = -((today + 6) % 7);
  return `<div class="week">${Array.from({ length: 7 }, (_, i) => {
    const off = mondayOffset + i;
    const k = dayKey(off);
    const m = moodOn(k);
    return `<div class="week-day ${off === 0 ? 'today' : ''}">
      ${m ? pebble(m.v) : `<span class="slot ${off <= 0 ? 'blank' : ''}"></span>`}
      ${DAYS[keyToDate(k).getDay()]}
    </div>`;
  }).join('')}</div>`;
}

function suggestion(v) {
  if (v <= 2) return `
    <div class="card card-amber mt-12">
      <div class="suggest">
        <span class="suggest-ic"><i class="ph ph-chats-circle"></i></span>
        <div class="grow">
          <p class="h3">Mau cerita ke seseorang?</p>
          <p class="muted" style="font-size:14px">Teman Pulih siap mendengarkan tanpa menghakimi. Atau mulai dengan napas 4 menit.</p>
          <div class="row mt-12" style="flex-wrap:wrap; gap:8px">
            <button class="btn btn-primary btn-sm" onclick="go('support',{supportTab:'peer'})">Ngobrol</button>
            <button class="btn btn-light btn-sm" onclick="openBreathing()">Napas dulu</button>
          </div>
        </div>
      </div>
      ${v === 1 ? '<p class="tiny mt-12" style="color:#7A520F">Kalau kamu merasa tidak aman, <button class="link" style="color:var(--clay)" onclick="openSOS()">buka SOS sekarang</button>.</p>' : ''}
    </div>`;
  const [icon, title, text, cta, fn] = v === 3
    ? ['ph-wind', 'Jeda sebentar, yuk', 'Napas kotak 4 menit bisa bantu kepala lebih jernih.', 'Mulai napas', 'openBreathing()']
    : ['ph-plant', 'Simpan rasa baik ini', 'Catat tiga hal kecil yang bikin harimu lebih ringan.', 'Tulis jurnal syukur', 'openGratitude()'];
  return `
    <div class="card card-forest mt-12">
      <div class="suggest">
        <span class="suggest-ic"><i class="ph ${icon}"></i></span>
        <div class="grow">
          <p class="h3">${title}</p>
          <p class="muted" style="font-size:14px">${text}</p>
          <button class="btn btn-light btn-sm mt-12" onclick="${fn}">${cta}</button>
        </div>
      </div>
    </div>`;
}

function nextSessionCard() {
  const b = state.bookings[state.bookings.length - 1];
  if (!b) return '';
  const p = provider(b.pid);
  return `
    <div class="section">
      <div class="section-head"><h3 class="h2">Sesi berikutnya</h3></div>
      <button class="card provider" onclick="openChat('${p.id}')">
        ${avatarHTML(p)}
        <div class="grow"><p class="h3">${esc(p.name)}</p><p class="tiny">${b.day}, ${b.time} · Video 50 menit</p></div>
        <span class="play"><i class="ph ph-chat-circle"></i></span>
      </button>
    </div>`;
}

function pickMood(v) {
  ui.draft = { ...(ui.draft || { tags: [], note: '' }), v };
  document.getElementById('checkin').innerHTML = checkinPicker();
}
function toggleTag(el, t) {
  const tags = ui.draft.tags;
  const i = tags.indexOf(t);
  i >= 0 ? tags.splice(i, 1) : tags.push(t);
  el.classList.toggle('on');
}
function saveMood() {
  const d = ui.draft;
  if (!d || !d.v) return;
  state.moods = state.moods.filter(m => m.date !== dayKey());
  state.moods.push({ date: dayKey(), v: d.v, tags: [...d.tags], note: d.note.trim() });
  ui.draft = null; ui.editingMood = false;
  persist();
  renderHome();
  toast('Check-in tersimpan', 'ph-check-circle');
}
function editMood() {
  const m = todayMood();
  ui.draft = { v: m.v, tags: [...m.tags], note: m.note || '' };
  ui.editingMood = true;
  renderHome();
}
function cancelMoodEdit() { ui.draft = null; ui.editingMood = false; renderHome(); }

// ---------- Lingkar (community) ----------
function allPosts() {
  return [...state.posts, ...SEED_POSTS];
}
function renderCommunity() {
  const posts = allPosts().filter(p => !state.hiddenPosts.includes(p.id) && (ui.topic === 'Semua' || p.topic === ui.topic));
  document.getElementById('screen-community').innerHTML = `
    ${pageTitle('community')}
    <div class="safe-note"><i class="ph-fill ph-shield-check"></i>Semua cerita di sini anonim. Saling jaga, tanpa menghakimi.</div>

    <button class="card composer mt-12" onclick="openCompose()">
      ${anonAvatar({ mine: true, id: 'me' }, 40)}
      <span class="grow">Apa yang ingin kamu bagikan?</span>
      <i class="ph ph-pencil-simple-line" style="font-size:20px;color:var(--forest)"></i>
    </button>

    <div class="chips mt-16">${TOPICS.map(t => `<button class="chip ${ui.topic === t ? 'on' : ''}" onclick="ui.topic='${t}';renderCommunity()">${t}</button>`).join('')}</div>

    <div class="mt-12">${posts.length ? posts.map(postCard).join('') : `<div class="card card-sunken empty mt-8">${ILLO.notes()}Belum ada cerita di topik ini. Jadilah yang pertama berbagi.</div>`}</div>`;
}

function postName(p) {
  if (p.mine) return 'Kamu <span class="tag tag-plain">anonim</span>';
  return p.peer ? 'Anonim <span class="tag"><i class="ph-fill ph-seal-check"></i>Teman Pulih</span>' : 'Anonim';
}
// ---------- Comment helpers ----------
const minsAgo = m => m < 1 ? 'baru saja' : m < 60 ? `${m} m` : m < 1440 ? `${Math.floor(m / 60)} j` : `${Math.floor(m / 1440)} h`;
function threadComments(postId) {
  const seed = SEED_COMMENTS[postId] || (postId.startsWith('u') ? [] : GENERIC_COMMENTS);
  const mine = (state.replies[postId] || []).map((r, i) => ({
    ...r, id: r.id || `${postId}-r${i}`, mine: true, c: 'var(--m4)', hugs: 0,
    m: r.t ? Math.floor((Date.now() - r.t) / 60000) : 0,
  }));
  const tree = seed.map(c => ({ ...c, children: [...(c.children || []), ...mine.filter(r => r.parent === c.id)] }));
  return [...tree, ...mine.filter(r => !r.parent).map(r => ({ ...r, children: [] }))];
}
const countComments = postId => threadComments(postId).reduce((n, c) => n + 1 + c.children.length, 0);
const hugCount = item => item.hugs + (state.hugged.includes(item.id) ? 1 : 0);

// Anonymous avatar in the same rounded frame as counsellors: a pebble character on a soft tint.
// Teman Pulih get a small seal; your own posts use the pebble of your latest mood.
function anonAvatar(item, size = 44) {
  const mine = item.mine;
  const v = mine ? (state.moods[state.moods.length - 1] || { v: 4 }).v : shapeFor(item.id);
  const color = mine ? `var(--m${v})` : (item.c || 'var(--m4)');
  const art = pebble(v, { smile: !mine, color }).replace('class="pebble"', 'class="pebble" style="width:76%;height:76%"');
  return `<span class="avatar anon-av" style="--c:color-mix(in srgb, ${color} 34%, #FFFDF8);width:${size}px;height:${size}px;border-radius:${Math.round(size * .34)}px">
    <span class="avatar-face">${art}</span>${item.peer ? '<span class="av-seal" title="Teman Pulih terverifikasi"><i class="ph-fill ph-seal-check"></i></span>' : ''}</span>`;
}
// Peluk button that can be updated in place (no re-render, no scroll jump).
function hugBtn(item, { label = '', hideZero = false, stop = false } = {}) {
  const on = state.hugged.includes(item.id);
  const n = hugCount(item);
  return `<button class="act hug-btn ${on ? 'on' : ''}" data-hug="${item.id}" data-base="${item.hugs}" data-hide-zero="${hideZero}" data-label="${label}"
    onclick="${stop ? 'event.stopPropagation();' : ''}hug('${item.id}')" aria-pressed="${on}" aria-label="Peluk">
    <i class="${on ? 'ph-fill' : 'ph'} ph-hand-heart"></i><span class="hug-n">${hideZero && !n ? '' : n}${label}</span></button>`;
}

function postCard(p) {
  return `
    <article class="card post" role="link" tabindex="0" onclick="openPost('${p.id}')" onkeydown="if(event.key==='Enter')openPost('${p.id}')">
      <div class="post-head">
        ${anonAvatar(p, 44)}
        <div class="grow">
          <p class="post-name">${postName(p)}</p>
          <p class="tiny">${p.topic} · ${p.ago}</p>
        </div>
      </div>
      <p class="post-body">${esc(p.body)}</p>
      <div class="post-actions">
        ${hugBtn(p, { label: ' peluk', stop: true })}
        <button class="act" onclick="event.stopPropagation();openPost('${p.id}')"><i class="ph ph-chat-circle"></i>${countComments(p.id)} balasan</button>
      </div>
    </article>`;
}
function hug(id) {
  const i = state.hugged.indexOf(id);
  i >= 0 ? state.hugged.splice(i, 1) : state.hugged.push(id);
  persist();
  const on = i < 0;
  // Update every copy of this button (feed card + thread page) without re-rendering the screen.
  document.querySelectorAll(`[data-hug="${id}"]`).forEach(b => {
    const n = +b.dataset.base + (on ? 1 : 0);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
    b.querySelector('i').className = `${on ? 'ph-fill' : 'ph'} ph-hand-heart`;
    b.querySelector('.hug-n').textContent = (b.dataset.hideZero === 'true' && !n ? '' : n) + b.dataset.label;
    if (on) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  });
  document.querySelectorAll(`[data-hug-total="${id}"]`).forEach(el => {
    el.textContent = +el.dataset.base + (on ? 1 : 0);
  });
}

function openCompose() {
  let topic = 'Cerita';
  openSheet({
    title: '<h2 class="h2">Cerita baru</h2>',
    body: `
      <div class="chips wrap" id="composeTopics">${TOPICS.slice(1).map(t => `<button class="chip ${t === topic ? 'on' : ''}" data-t="${t}">${t}</button>`).join('')}</div>
      <textarea class="field mt-12" id="composeText" rows="6" maxlength="500" placeholder="Tulis apa yang kamu rasakan…"></textarea>
      <div class="safe-note mt-12"><i class="ph ph-mask-happy"></i>Identitasmu tidak pernah ditampilkan.</div>
      <button class="btn btn-primary btn-block mt-16" id="composeBtn" disabled>Bagikan secara anonim</button>`,
  });
  const text = document.getElementById('composeText');
  const btn = document.getElementById('composeBtn');
  document.getElementById('composeTopics').onclick = e => {
    const b = e.target.closest('[data-t]'); if (!b) return;
    topic = b.dataset.t;
    document.querySelectorAll('#composeTopics .chip').forEach(c => c.classList.toggle('on', c === b));
  };
  text.oninput = () => { btn.disabled = text.value.trim().length < 3; };
  btn.onclick = () => {
    state.posts.unshift({ id: 'u' + Date.now(), mine: true, topic, ago: 'baru saja', c: 'var(--m4)', hugs: 0, body: text.value.trim() });
    persist(); closeSheet(); ui.topic = 'Semua'; renderCommunity();
    toast('Ceritamu sudah dibagikan', 'ph-paper-plane-tilt');
  };
  setTimeout(() => text.focus(), 350);
}

// ---------- Thread page (full screen) ----------
function openPost(id) {
  ui.thread = { id, sort: 'top', replyTo: null, menu: false };
  openSheet({ full: true, kind: 'thread', raw: '<div class="thread-page" id="threadPage"></div>', onClose: () => { ui.thread = null; renderCommunity(); } });
  renderThread(true);
}
function renderThread(scrollTop = false) {
  const t = ui.thread; if (!t) return;
  const page = document.getElementById('threadPage'); if (!page) return;
  const draft = document.getElementById('replyInput')?.value || '';
  const keep = document.getElementById('tpScroll')?.scrollTop || 0;
  const p = allPosts().find(x => x.id === t.id);
  const hugged = state.hugged.includes(p.id);
  const saved = state.saved.includes(p.id);
  const following = state.following.includes(p.id);
  const comments = threadComments(p.id).sort((a, b) => t.sort === 'top' ? hugCount(b) - hugCount(a) : a.m - b.m);
  const views = (p.hugs * 31 + 140).toLocaleString('id-ID');
  const target = t.replyTo && comments.flatMap(c => [c, ...c.children]).find(c => c.id === t.replyTo);
  const me = (state.moods[state.moods.length - 1] || { v: 4 }).v;

  const comment = (c, child = false) => `
    <div class="cm ${child ? 'child' : ''} ${c.children?.length ? 'has-kids' : ''}">
      <div class="cm-rail">${anonAvatar(c, child ? 30 : 36)}</div>
      <div class="cm-main">
        <p class="cm-name">${c.mine ? 'Kamu <span class="tag tag-plain">anonim</span>' : postName(c)} <span class="tiny">${minsAgo(c.m)}</span></p>
        <p class="cm-body">${esc(c.body)}</p>
        <div class="cm-actions">
          ${hugBtn(c, { hideZero: true })}
          <button class="act" onclick="replyTo('${child ? c.parentId : c.id}')"><i class="ph ph-arrow-bend-up-left"></i>Balas</button>
          ${c.children?.length ? `<span class="tiny">${c.children.length} balasan</span>` : ''}
        </div>
        ${c.children?.length ? `<div class="cm-kids">${c.children.map(k => comment({ ...k, parentId: c.id }, true)).join('')}</div>` : ''}
      </div>
    </div>`;

  page.innerHTML = `
    <header class="tp-head">
      <button class="close-btn" onclick="closeSheet()" aria-label="Kembali"><i class="ph ph-caret-left"></i></button>
      <div class="tp-title"><p class="h3">Cerita</p><p class="tiny">${views} kali dilihat</p></div>
      <button class="icon-btn flat ${following ? 'on' : ''}" onclick="toggleList('following','${p.id}', 'Kamu akan diberi tahu saat ada balasan baru', 'Notifikasi cerita dimatikan')" aria-label="Ikuti cerita"><i class="${following ? 'ph-fill' : 'ph'} ph-bell-simple"></i></button>
      <div class="tp-more">
        <button class="icon-btn flat" onclick="if(ui.thread){ui.thread.menu=!ui.thread.menu;renderThread()}" aria-label="Opsi lain" aria-expanded="${t.menu}"><i class="ph ph-dots-three"></i></button>
        ${t.menu ? `<div class="menu" role="menu">
          <button role="menuitem" onclick="threadAction('copy')"><i class="ph ph-link"></i>Salin tautan</button>
          <button role="menuitem" onclick="threadAction('hide')"><i class="ph ph-eye-slash"></i>Sembunyikan dari feed</button>
          <button role="menuitem" class="danger" onclick="threadAction('report')"><i class="ph ph-flag"></i>Laporkan cerita</button>
        </div>` : ''}
      </div>
    </header>

    <div class="tp-scroll" id="tpScroll">
      <article class="tp-post">
        <div class="post-head">
          ${anonAvatar(p, 48)}
          <div class="grow"><p class="post-name" style="font-size:15px">${postName(p)}</p><p class="tiny">${p.topic} · ${p.ago}</p></div>
        </div>
        <p class="tp-body">${esc(p.body)}</p>
        <div class="post-actions">
          ${hugBtn(p)}
          <button class="act" onclick="document.getElementById('replyInput').focus()"><i class="ph ph-chat-circle"></i>${countComments(p.id)}</button>
          <button class="act" onclick="threadAction('share')"><i class="ph ph-paper-plane-tilt"></i>Bagikan</button>
          <button class="act ${saved ? 'on saved' : ''}" style="margin-left:auto" onclick="toggleList('saved','${p.id}','Disimpan ke koleksimu','Dihapus dari simpanan')" aria-label="Simpan"><i class="${saved ? 'ph-fill' : 'ph'} ph-bookmark-simple"></i></button>
        </div>
      </article>

      <div class="tp-bar">
        <button class="tp-sort" onclick="if(ui.thread){ui.thread.sort=ui.thread.sort==='top'?'new':'top';renderThread()}">${t.sort === 'top' ? 'Teratas' : 'Terbaru'} <i class="ph ph-caret-down"></i></button>
        <span class="tiny"><i class="ph-fill ph-hand-heart" style="color:var(--clay)"></i> <span data-hug-total="${p.id}" data-base="${p.hugs}">${hugCount(p)}</span> orang memeluk cerita ini</span>
      </div>
      <div class="safe-note tp-note"><i class="ph ph-heart"></i>Balas dengan empati. Hindari menghakimi atau memberi saran medis.</div>

      <div class="tp-comments">${comments.length ? comments.map(c => comment(c)).join('') : `<div class="empty">${ILLO.notes()}Belum ada balasan. Jadilah yang pertama memberi dukungan.</div>`}</div>
    </div>

    <div class="tp-compose">
      ${target ? `<div class="replying"><span>Membalas <b>${target.mine ? 'dirimu' : 'Anonim'}</b> · ${esc(target.body.slice(0, 40))}${target.body.length > 40 ? '…' : ''}</span><button onclick="replyTo(null)" aria-label="Batal membalas"><i class="ph ph-x"></i></button></div>` : ''}
      <div class="row">
        ${anonAvatar({ mine: true, id: 'me' }, 36)}
        <input id="replyInput" placeholder="${target ? 'Tulis balasanmu…' : 'Balas secara anonim…'}" maxlength="300" value="${esc(draft)}" onkeydown="if(event.key==='Enter')sendReply()">
        <button class="send" onclick="sendReply()" aria-label="Kirim balasan"><i class="ph-fill ph-paper-plane-right"></i></button>
      </div>
    </div>`;
  document.getElementById('tpScroll').scrollTop = scrollTop === true ? 0 : keep;
  page.onclick = e => { if (ui.thread?.menu && !e.target.closest('.tp-more')) { ui.thread.menu = false; renderThread(); } };
}
function replyTo(cid) {
  if (!ui.thread) return;
  ui.thread.replyTo = cid; renderThread();
  document.getElementById('replyInput').focus();
}
function toggleList(key, id, onMsg, offMsg) {
  if (!ui.thread) return;
  const list = state[key]; const i = list.indexOf(id);
  i >= 0 ? list.splice(i, 1) : list.push(id);
  persist(); renderThread();
  toast(i >= 0 ? offMsg : onMsg, key === 'saved' ? 'ph-bookmark-simple' : 'ph-bell-simple');
}
function threadAction(kind) {
  if (!ui.thread) return;
  const id = ui.thread.id;
  ui.thread.menu = false;
  if (kind === 'share') {
    const text = allPosts().find(x => x.id === id).body;
    if (navigator.share) navigator.share({ title: 'Ruang Pulih', text }).catch(() => {});
    else navigator.clipboard?.writeText(text).then(() => toast('Cerita disalin', 'ph-copy'));
    return renderThread();
  }
  if (kind === 'copy') { navigator.clipboard?.writeText(`ruangpulih.id/lingkar/${id}`); toast('Tautan disalin', 'ph-link'); return renderThread(); }
  if (kind === 'report') { toast('Terima kasih. Tim moderasi akan meninjau dalam 24 jam.', 'ph-flag'); return renderThread(); }
  if (kind === 'hide') { state.hiddenPosts.push(id); persist(); closeSheet(); toast('Cerita disembunyikan dari feed-mu', 'ph-eye-slash'); }
}
function sendReply() {
  if (!ui.thread) return;
  const input = document.getElementById('replyInput');
  const body = input.value.trim(); if (!body) return;
  const t = ui.thread;
  (state.replies[t.id] ||= []).push({ id: `${t.id}-u${Date.now()}`, mine: true, body, parent: t.replyTo, t: Date.now() });
  input.value = ''; t.replyTo = null;
  persist(); renderThread();
  toast('Balasanmu terkirim', 'ph-paper-plane-tilt');
}

// ---------- Dukungan (support) ----------
function renderSupport() {
  const chats = Object.entries(state.chats);
  const list = PROVIDERS.filter(p => p.type === ui.supportTab && (ui.supportTab === 'peer' || ui.psyCat === 'Semua' || p.cat === ui.psyCat));
  document.getElementById('screen-support').innerHTML = `
    ${pageTitle('support')}
    ${state.org
      ? `<div class="card card-forest row"><i class="ph-fill ph-buildings" style="font-size:24px"></i><div class="grow"><p class="h3">Gratis lewat ${esc(state.org)}</p><p class="muted" style="font-size:13px">Teman Pulih & psikolog tanpa biaya.</p></div></div>`
      : `<button class="card row" style="width:100%;text-align:left" onclick="openAffiliation()">
          <span class="li-ic" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:var(--amber-tint);color:#8A5B0E;font-size:20px"><i class="ph ph-buildings"></i></span>
          <div class="grow"><p class="h3" style="font-size:15px">Kampus atau kantormu mitra?</p><p class="tiny">Tautkan akun untuk konsultasi gratis.</p></div>
          <i class="ph ph-caret-right" style="color:var(--ink-3)"></i>
        </button>`}

    ${chats.length ? `
      <div class="section">
        <div class="section-head"><h3 class="h2">Percakapan</h3></div>
        <div class="card" style="padding:4px 18px">${chats.map(([pid, c]) => {
          const p = provider(pid); const last = c.messages[c.messages.length - 1];
          return `<button class="thread-row" onclick="openChat('${pid}')">
            ${avatarHTML(p, 'sm')}
            <div class="grow"><p class="h3" style="font-size:14px">${esc(p.type === 'peer' ? p.name + ' · Teman Pulih' : p.name)}</p><p class="tiny" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(last.text)}</p></div>
            ${c.unread ? '<span class="unread-dot" aria-label="Belum dibaca"></span>' : ''}
          </button>`;
        }).join('')}</div>
      </div>` : ''}

    <div class="section">
      <div class="segmented" role="tablist">
        <button class="${ui.supportTab === 'peer' ? 'on' : ''}" onclick="ui.supportTab='peer';renderSupport()">Teman Pulih</button>
        <button class="${ui.supportTab === 'psy' ? 'on' : ''}" onclick="ui.supportTab='psy';renderSupport()">Psikolog</button>
      </div>

      ${ui.supportTab === 'peer' ? `
        <p class="muted mt-16" style="font-size:14px">Mahasiswa psikologi yang dilatih 20 jam untuk mendengarkan. Cocok untuk cerita sehari-hari — bukan pengganti psikolog.</p>
      ` : `
        <div class="chips mt-16">${['Semua', 'Kecemasan', 'Relasi', 'Keluarga', 'Karir'].map(c => `<button class="chip ${ui.psyCat === c ? 'on' : ''}" onclick="ui.psyCat='${c}';renderSupport()">${c}</button>`).join('')}</div>
      `}
      <div class="mt-12">${list.map(ui.supportTab === 'peer' ? peerCard : psyCard).join('')}</div>
    </div>

    <button class="card row mt-20" style="width:100%;text-align:left;background:var(--clay-tint);box-shadow:none" onclick="openSOS()">
      <span class="li-ic" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:var(--clay);color:#fff;font-size:20px"><i class="ph-fill ph-lifebuoy"></i></span>
      <div class="grow"><p class="h3" style="font-size:15px">Butuh bantuan segera?</p><p class="tiny">Kontak darurat 24 jam</p></div>
      <i class="ph ph-caret-right" style="color:var(--clay)"></i>
    </button>`;
}

function peerCard(p) {
  return `
    <div class="card provider">
      ${avatarHTML(p, `round presence ${p.online ? '' : 'away'}`)}
      <div class="grow">
        <p class="h3">${p.name}</p>
        <p class="tiny">${p.role}</p>
        <div class="row mt-8" style="gap:6px">${p.tags.map(t => `<span class="tag tag-plain">${t}</span>`).join('')}</div>
      </div>
      <button class="btn ${p.online ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="startPeerChat('${p.id}')">${p.online ? 'Ngobrol' : 'Titip pesan'}</button>
    </div>`;
}
function psyCard(p) {
  const price = priceFor(p);
  return `
    <button class="card provider" onclick="openPsychologist('${p.id}')">
      ${avatarHTML(p, `presence ${p.online ? '' : 'away'}`)}
      <div class="grow">
        <p class="h3" style="font-size:15px">${esc(p.name)}</p>
        <p class="tiny">${p.specialty}</p>
        <div class="provider-meta"><span><i class="ph-fill ph-star"></i> ${p.rating.toFixed(1)} (${p.reviews})</span><span>${p.years} th pengalaman</span></div>
      </div>
      <div style="text-align:right">
        <p class="price">${price ? rupiah(price) : `<s>${rupiah(p.price)}</s>Gratis`}</p>
        <p class="tiny">/sesi</p>
      </div>
    </button>`;
}

function startPeerChat(id) {
  if (!state.premium && !state.org) return openPremium('Chat dengan Teman Pulih termasuk dalam Premium.');
  if (!state.chats[id]) {
    const p = provider(id);
    state.chats[id] = { unread: false, messages: [
      { from: 'sys', text: 'Percakapan ini anonim & terenkripsi' },
      { from: 'them', text: `Hai, aku ${p.name}. Aku di sini buat dengerin — cerita aja senyamanmu.`, t: nowTime() },
    ] };
    persist();
  }
  openChat(id);
}

function openPsychologist(id, day = 'Besok', time = null) {
  const p = provider(id);
  const price = priceFor(p);
  const slots = ['09.00', '11.00', '13.00', '15.00', '19.00', '20.00'];
  const taken = day === 'Hari ini' ? ['09.00', '11.00', '13.00'] : ['15.00'];
  openSheet({
    title: '<span></span>',
    body: `
      <div class="row">
        ${avatarHTML(p, '', 'width:64px;height:64px;border-radius:22px')}
        <div class="grow"><h2 class="h2">${esc(p.name)}</h2><p class="tiny">${p.specialty} · Psikolog klinis berlisensi</p></div>
      </div>
      <div class="stats">
        <div class="stat"><b>${p.rating.toFixed(1)}</b><span>${p.reviews} ulasan</span></div>
        <div class="stat"><b>${p.years}</b><span>tahun praktik</span></div>
        <div class="stat"><b>50</b><span>menit/sesi</span></div>
      </div>
      <p class="mt-16" style="font-size:15px">${esc(p.bio)}</p>

      <h3 class="h3 mt-20">Pilih jadwal</h3>
      <div class="segmented mt-8">${['Hari ini', 'Besok'].map(d => `<button class="${d === day ? 'on' : ''}" onclick="openPsychologist('${id}','${d}')">${d}</button>`).join('')}</div>
      <div class="slots mt-12">${slots.map(s => `<button class="slot-btn ${s === time ? 'on' : ''}" ${taken.includes(s) ? 'disabled' : ''} onclick="openPsychologist('${id}','${day}','${s}')">${s}</button>`).join('')}</div>

      <div class="row mt-20">
        <div class="grow"><p class="tiny">Total</p><p class="price" style="font-size:18px">${price ? rupiah(price) : 'Gratis'}</p></div>
        <button class="btn btn-primary" ${time ? '' : 'disabled'} onclick="${price ? `openPayment('${id}','${day}','${time}')` : `confirmBooking('${id}','${day}','${time}')`}">Pesan sesi</button>
      </div>
      ${!state.org ? '<p class="tiny mt-12">Punya akses kampus/kantor mitra? <button class="link" onclick="openAffiliation()">Tautkan untuk gratis</button></p>' : ''}`,
  });
}

function openPayment(id, day, time) {
  const p = provider(id);
  let method = 'QRIS';
  openSheet({
    title: '<h2 class="h2">Pembayaran</h2>',
    body: `
      <div class="card card-sunken">
        <div class="row"><span class="grow">Sesi dengan ${esc(p.short)}</span><b>${rupiah(p.price)}</b></div>
        <p class="tiny mt-8">${day}, ${time} · Video 50 menit</p>
      </div>
      <h3 class="h3 mt-20">Metode</h3>
      <div class="q-opts" id="payMethods">${['QRIS', 'GoPay', 'Transfer bank'].map(m => `<button class="q-opt ${m === method ? 'on' : ''}" data-m="${m}">${m}</button>`).join('')}</div>
      <button class="btn btn-primary btn-block mt-20" onclick="confirmBooking('${id}','${day}','${time}')">Bayar ${rupiah(p.price)}</button>
      <p class="tiny mt-12" style="text-align:center">Mode prototype — tidak ada pembayaran sungguhan.</p>`,
  });
  document.getElementById('payMethods').onclick = e => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    document.querySelectorAll('#payMethods .q-opt').forEach(x => x.classList.toggle('on', x === b));
  };
}

function confirmBooking(id, day, time) {
  const p = provider(id);
  state.bookings.push({ pid: id, day, time });
  const chat = state.chats[id] ||= { unread: false, messages: [] };
  chat.messages.push(
    { from: 'sys', text: `Sesi dijadwalkan · ${day}, ${time}` },
    { from: 'them', text: `Terima kasih sudah memesan, sampai bertemu ${day.toLowerCase()} pukul ${time}. Kalau ada yang ingin kamu ceritakan lebih dulu, tulis saja di sini.`, t: nowTime() },
  );
  chat.unread = true;
  persist();
  closeSheet();
  go('support', { supportTab: 'psy', keepScroll: true });
  toast(`Sesi dengan ${p.short} terjadwal`, 'ph-calendar-check');
}

// ---------- Chat ----------
function openChat(id) {
  const p = provider(id);
  const chat = state.chats[id];
  chat.unread = false; persist(); renderNav();
  if (ui.tab === 'support') renderSupport();
  openSheet({
    full: true,
    raw: `
      <div class="chat">
        <div class="sheet-head" style="border-bottom:1px solid var(--line);padding-bottom:12px">
          <button class="close-btn" onclick="closeSheet()" aria-label="Kembali"><i class="ph ph-caret-left"></i></button>
          ${avatarHTML(p, 'sm')}
          <div class="grow"><p class="h3" style="font-size:15px">${esc(p.type === 'peer' ? p.name : p.name)}</p><p class="tiny">${p.type === 'peer' ? 'Teman Pulih' : 'Psikolog'} · ${p.online ? 'online' : 'membalas dalam beberapa jam'}</p></div>
          <button class="icon-btn" style="box-shadow:none;background:var(--sunken)" onclick="toast('Panggilan video tersedia saat sesi dimulai','ph-video-camera')" aria-label="Video"><i class="ph ph-video-camera"></i></button>
        </div>
        <div class="chat-log" id="chatLog"></div>
        <div class="chat-input">
          <input id="chatInput" placeholder="Tulis pesan…" maxlength="500" onkeydown="if(event.key==='Enter')sendChat('${id}')">
          <button class="send" onclick="sendChat('${id}')" aria-label="Kirim"><i class="ph-fill ph-paper-plane-right"></i></button>
        </div>
      </div>`,
  });
  renderChatLog(id);
}
function renderChatLog(id, typing = false) {
  const log = document.getElementById('chatLog'); if (!log) return;
  log.innerHTML = state.chats[id].messages.map(m => m.from === 'sys'
    ? `<div class="bubble sys">${esc(m.text)}</div>`
    : `<div class="bubble ${m.from}">${esc(m.text)}${m.t ? `<time>${m.t}</time>` : ''}</div>`).join('')
    + (typing ? '<div class="typing">sedang mengetik…</div>' : '');
  log.scrollTop = log.scrollHeight;
}
function sendChat(id) {
  const input = document.getElementById('chatInput');
  const text = input.value.trim(); if (!text) return;
  const chat = state.chats[id];
  chat.messages.push({ from: 'me', text, t: nowTime() });
  input.value = ''; persist(); renderChatLog(id, true);
  const pool = REPLIES[provider(id).type];
  setTimeout(() => {
    chat.messages.push({ from: 'them', text: pool[chat.messages.length % pool.length], t: nowTime() });
    persist();
    if (document.getElementById('chatLog')) renderChatLog(id); else { chat.unread = true; persist(); renderNav(); }
  }, 1600);
}

// ---------- Belajar ----------
function renderLearn() {
  const feat = ARTICLES[0];
  document.getElementById('screen-learn').innerHTML = `
    ${pageTitle('learn')}
    <button class="cover feature" style="--c:var(--m4);width:100%;text-align:left" onclick="openArticle('${feat.id}')">
      <span class="tag" style="background:rgba(255,255,255,.6);width:fit-content">Pilihan minggu ini</span>
      <h2 class="h2 mt-12">Kenali pikiran yang bikin cemas</h2>
      <p style="font-size:14px;margin-top:6px;opacity:.8">${feat.kicker} · ${feat.mins} menit</p>
      ${ILLO.untangle()}
    </button>

    <div class="section">
      <div class="section-head"><h3 class="h2">Latihan</h3></div>
      <div class="card" style="padding:6px 18px">${PRACTICES.map(p => `
        <button class="practice" onclick="PRACTICES.find(x=>x.id==='${p.id}').open()">
          <span class="cover" style="--c:${p.c}">${coverArt(p.id)}</span>
          <div class="grow"><p class="h3" style="font-size:15px">${p.title}</p><p class="tiny">${p.sub} · ${p.mins} mnt</p></div>
          <span class="play"><i class="ph-fill ph-play"></i></span>
        </button>`).join('')}</div>
    </div>

    <div class="section">
      <div class="section-head"><h3 class="h2">Bacaan</h3></div>
      <div class="stack-8">${ARTICLES.map(articleRow).join('')}</div>
    </div>

    <div class="section">
      <div class="card card-forest banner">
        ${ILLO.together()}
        <span class="tag" style="background:rgba(255,255,255,.16);color:inherit"><i class="ph-fill ph-seal-check"></i>Program HIMPSI</span>
        <h3 class="h2 mt-12">Jadi Teman Pulih</h3>
        <p class="muted mt-8" style="font-size:14px">Mahasiswa psikologi? Ikuti pelatihan 20 jam, dapatkan sertifikat, dan dampingi teman sebaya.</p>
        <button class="btn btn-amber btn-sm mt-16" onclick="toast('Pendaftaran batch berikutnya dibuka Januari','ph-calendar')">Daftar minat</button>
      </div>
    </div>`;
}
function articleRow(a) {
  return `
    <button class="card read-card" style="width:100%;text-align:left;padding:12px" onclick="openArticle('${a.id}')">
      <span class="cover" style="--c:${a.c}">${coverArt(a.id)}</span>
      <div class="grow"><p class="tiny">${a.kicker}</p><p class="h3" style="font-size:15px;margin-top:2px">${a.title}</p><p class="tiny mt-8"><i class="ph ph-clock"></i> ${a.mins} menit baca</p></div>
    </button>`;
}
function openArticle(id) {
  const a = ARTICLES.find(x => x.id === id);
  openSheet({
    full: true,
    title: `<button class="close-btn" onclick="closeSheet()" aria-label="Kembali"><i class="ph ph-caret-left"></i></button>`,
    hideClose: true,
    body: `
      <div class="cover" style="--c:${a.c};height:168px">${coverArt(a.id, 'meet')}</div>
      <p class="tiny mt-16">${a.kicker} · ${a.mins} menit</p>
      <h2 class="display" style="font-size:28px;margin-top:6px">${a.title}</h2>
      <div class="article mt-12">${a.body}</div>
      <div class="card card-sunken mt-20 row"><i class="ph ph-chats-circle" style="font-size:22px;color:var(--forest)"></i><p class="grow" style="font-size:14px">Ada yang ingin didiskusikan?</p><button class="btn btn-primary btn-sm" onclick="closeSheet();go('support')">Cari dukungan</button></div>`,
  });
}

// ---------- Kamu (profile) ----------
function renderMe() {
  const recent = Array.from({ length: 14 }, (_, i) => moodOn(dayKey(i - 13)));
  const logged = recent.filter(Boolean);
  const avg = logged.length ? Math.round(logged.reduce((s, m) => s + m.v, 0) / logged.length) : 0;
  const lowTags = {};
  logged.filter(m => m.v <= 2).forEach(m => m.tags.forEach(t => { lowTags[t] = (lowTags[t] || 0) + 1; }));
  const topLow = Object.entries(lowTags).sort((a, b) => b[1] - a[1])[0];
  const notes = [
    ...state.moods.filter(m => m.note).map(m => ({ date: m.date, text: m.note, icon: 'ph-note-pencil' })),
    ...state.gratitude.map(g => ({ date: g.date, text: g.items.join(' · '), icon: 'ph-plant' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const fmt = k => { const d = keyToDate(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };

  document.getElementById('screen-me').innerHTML = `
    ${pageTitle('me')}
    <div class="me">
      <button class="me-avatar" onclick="openAvatarPicker()" aria-label="Ganti foto profil">${userAvatarHTML(72)}<span class="me-edit"><i class="ph ph-pencil-simple"></i></span></button>
      <div class="grow">
        <h2 class="display" style="font-size:26px">${esc(state.name)}</h2>
        <div class="row mt-8" style="gap:6px">
          ${state.premium ? '<span class="tag tag-amber"><i class="ph-fill ph-sparkle"></i>Premium</span>' : '<span class="tag tag-plain">Gratis</span>'}
          ${state.org ? `<span class="tag"><i class="ph-fill ph-buildings"></i>${esc(state.org)}</span>` : ''}
        </div>
      </div>
    </div>

    ${state.premium ? '' : `
      <button class="card card-amber row mt-16" style="width:100%;text-align:left" onclick="openPremium()">
        <span class="suggest-ic" style="background:rgba(255,255,255,.6);color:#8A5B0E;width:46px;height:46px;border-radius:16px;display:grid;place-items:center;font-size:22px"><i class="ph-fill ph-sparkle"></i></span>
        <div class="grow"><p class="h3">Coba Premium gratis 3 hari</p><p class="tiny" style="color:#7A520F">Chat Teman Pulih kapan saja, jurnal refleksi & konten eksklusif</p></div>
        <i class="ph ph-caret-right"></i>
      </button>`}

    <div class="card mt-20">
      <div class="section-head" style="margin:0"><h3 class="h2">Perjalananmu</h3><span class="tiny">14 hari</span></div>
      <div class="trend" aria-label="Grafik suasana hati 14 hari">${recent.map((m, i) => `
        <div class="trend-col" title="${fmt(dayKey(i - 13))}">${m ? pebble(m.v).replace('<svg', `<svg style="bottom:calc((100% - 22px) * ${(m.v - 1) / 4})"`) : ''}</div>`).join('')}</div>
      <div class="trend-axis"><span>${fmt(dayKey(-13))}</span><span>Hari ini</span></div>
      <div class="stats">
        <div class="stat"><b>${logged.length}</b><span>check-in</span></div>
        <div class="stat"><b>${streak()}</b><span>beruntun</span></div>
        <div class="stat"><b>${avg ? MOODS[avg].label : '–'}</b><span>rata-rata</span></div>
      </div>
      ${topLow ? `<p class="safe-note mt-12" style="background:var(--amber-tint)"><i class="ph ph-lightbulb" style="color:#8A5B0E"></i><span>Hari yang berat paling sering terkait <b>${topLow[0]}</b>.</span></p>` : ''}
    </div>

    ${state.screening ? `
      <button class="card row mt-12" style="width:100%;text-align:left" onclick="openSelfCheck()">
        <span class="li-ic" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:var(--forest-tint);color:var(--forest);font-size:20px"><i class="ph ph-clipboard-text"></i></span>
        <div class="grow"><p class="h3" style="font-size:15px">Cek Diri terakhir: ${screeningBand(state.screening.score).label}</p><p class="tiny">${fmt(state.screening.date)} · Skor ${state.screening.score}/12</p></div>
        <span class="link">Ulangi</span>
      </button>` : ''}

    <div class="section">
      <div class="section-head"><h3 class="h2">Catatanmu</h3></div>
      ${notes.length ? `<div class="list">${notes.map(n => `
        <div class="list-item"><span class="li-ic"><i class="ph ${n.icon}"></i></span><div class="grow"><p style="font-size:14px">${esc(n.text)}</p><p class="tiny">${fmt(n.date)}</p></div></div>`).join('')}</div>`
        : `<div class="card card-sunken empty">${ILLO.notes()}Catatan dari check-in dan jurnal syukur akan muncul di sini.</div>`}
    </div>

    <p class="tiny mt-20" style="text-align:center">Ruang Pulih · prototype v3</p>`;
}

function openAvatarPicker() {
  const cur = state.avatar || { id: 'p4', bg: 'var(--m4)' };
  openSheet({
    kind: 'avatar',
    title: '<h2 class="h2">Foto profil</h2>',
    body: `
      <div class="avatar-preview">${userAvatarHTML(96)}<div><p class="h3">${esc(state.name)}</p><p class="tiny">Terlihat olehmu, Teman Pulih, dan psikologmu. Di Lingkar kamu tetap anonim.</p></div></div>
      <p class="set-group-title mt-20">Pilih ilustrasi</p>
      <div class="avatar-grid" role="radiogroup" aria-label="Pilihan foto profil">${USER_AVATARS.map(a => `
        <button class="avatar-opt ${a.id === cur.id ? 'on' : ''}" role="radio" aria-checked="${a.id === cur.id}" aria-label="${a.name}" onclick="setAvatar({id:'${a.id}'})">
          <span class="avatar" style="--c:${cur.bg || 'var(--m4)'}"><span class="avatar-face">${avatarArt(a)}</span></span>
          ${a.id === cur.id ? '<span class="avatar-check"><i class="ph ph-check"></i></span>' : ''}
        </button>`).join('')}</div>
      <p class="set-group-title mt-20">Warna latar</p>
      <div class="bg-row">${AVATAR_BGS.map(c => `<button class="bg-dot ${c === (cur.bg || 'var(--m4)') ? 'on' : ''}" style="--c:${c}" aria-label="Warna latar" onclick="setAvatar({bg:'${c}'})"></button>`).join('')}</div>
      <p class="tiny mt-20" style="text-align:center"><i class="ph ph-lock-key"></i> Demi privasi, Ruang Pulih tidak meminta foto asli.</p>`,
  });
}
function setAvatar(change) {
  state.avatar = { id: 'p4', bg: 'var(--m4)', ...(state.avatar || {}), ...change };
  persist();
  const body = document.querySelector('#sheet .sheet-body'); const keep = body?.scrollTop;
  openAvatarPicker();
  document.querySelector('#sheet .sheet-body').scrollTop = keep || 0;
  if (ui.tab === 'me') renderMe();
  renderStagePanel();
}

function openEditName() {
  openSheet({
    title: '<h2 class="h2">Nama panggilan</h2>',
    body: `
      <p class="muted" style="font-size:14px">Boleh nama samaran. Nama ini hanya terlihat olehmu dan konselormu.</p>
      <input class="field mt-12" id="nameInput" maxlength="24" value="${esc(state.name)}">
      <button class="btn btn-primary btn-block mt-16" onclick="saveName()">Simpan</button>`,
  });
}
function saveName() {
  const v = document.getElementById('nameInput').value.trim();
  if (v) { state.name = v; persist(); }
  closeSheet(); rerender();
}

function openPrivacy() {
  openSheet({
    title: '<h2 class="h2">Privasi & keamanan</h2>',
    body: `<div class="list">${[
      ['ph-mask-happy', 'Anonim di komunitas', 'Nama aslimu tidak pernah tampil di Lingkar Pulih.'],
      ['ph-lock-key', 'Percakapan terenkripsi', 'Chat dengan Teman Pulih & psikolog dienkripsi end-to-end.'],
      ['ph-buildings', 'Kampus hanya melihat yang kamu izinkan', 'Bawaannya hanya statistik anonim. Data personal dibagikan bila kamu memilihnya di Data untuk kampus.'],
      ['ph-trash', 'Kendali penuh', 'Hapus seluruh datamu kapan saja dari halaman ini.'],
    ].map(([i, t, d]) => `<div class="list-item"><span class="li-ic"><i class="ph ${i}"></i></span><div class="grow"><p class="h3" style="font-size:15px">${t}</p><p class="tiny">${d}</p></div></div>`).join('')}</div>`,
  });
}

// ---------- Premium & affiliation ----------
function openPremium(reason) {
  const rows = [
    ['Komunitas Lingkar Pulih', 1, 1], ['Mood tracker & Cek Diri', 1, 1], ['Latihan & bacaan dasar', 1, 1],
    ['Chat dengan Teman Pulih', 0, 1], ['Jurnal refleksi AI', 0, 1], ['Konten eksklusif', 0, 1],
  ];
  const mark = y => y ? '<i class="ph-fill ph-check-circle yes"></i>' : '<span class="no">–</span>';
  openSheet({
    title: '<span></span>',
    body: `
      <div class="card card-forest">
        <span class="tag" style="background:rgba(255,255,255,.16);color:inherit"><i class="ph-fill ph-sparkle"></i>Premium</span>
        <h2 class="display" style="font-size:26px;margin-top:12px">Ditemani setiap hari</h2>
        <p class="muted mt-8" style="font-size:14px">${reason ? esc(reason) + ' ' : ''}Batalkan kapan saja.</p>
        <p class="mt-16"><span class="display" style="font-size:30px">${rupiah(49000)}</span> <span class="muted">/bulan</span></p>
      </div>
      <table class="compare mt-16">
        <tr><th></th><th>Gratis</th><th>Premium</th></tr>
        ${rows.map(([t, f, p]) => `<tr><td>${t}</td><td>${mark(f)}</td><td>${mark(p)}</td></tr>`).join('')}
      </table>
      ${state.premium
        ? `<div class="notice mt-20"><i class="ph-fill ph-check-circle"></i><span>${state.trial ? 'Masa coba gratis aktif. Setelah 3 hari, langganan berlanjut ' + rupiah(49000) + '/bulan.' : 'Premium aktif.'}</span></div>
           <button class="btn btn-ghost btn-block mt-12" onclick="cancelPremium()">Batalkan langganan</button>`
        : `<button class="btn btn-amber btn-block mt-20" onclick="activatePremium()">Mulai coba gratis 3 hari</button>
           <p class="tiny mt-12" style="text-align:center">Lalu ${rupiah(49000)}/bulan · ingatkan sehari sebelum tagihan · mode prototype, tanpa pembayaran sungguhan</p>`}
      <div class="divider"></div>
      <p class="tiny" style="text-align:center">Dari kampus atau kantor mitra? <button class="link" onclick="openAffiliation()">Akses gratis</button></p>`,
  });
}
function activatePremium() {
  state.premium = true; state.trial = true; persist(); closeSheet(); rerender();
  toast('Coba gratis 3 hari dimulai', 'ph-sparkle');
}
function cancelPremium() {
  state.premium = false; state.trial = false; persist(); closeSheet(); rerender();
  toast('Langganan dibatalkan', 'ph-check');
}

const ORGS = { 'binus.ac.id': 'BINUS University', 'itb.ac.id': 'ITB', 'unpad.ac.id': 'UNPAD', 'upi.edu': 'UPI', 'telkomuniversity.ac.id': 'Telkom University' };
function openAffiliation() {
  if (state.org) {
    openSheet({
      title: '<h2 class="h2">Institusi mitra</h2>',
      body: `
        <div class="card card-forest row"><i class="ph-fill ph-buildings" style="font-size:26px"></i><div class="grow"><p class="h3">${esc(state.org)}</p><p class="muted" style="font-size:13px">Konsultasi & Teman Pulih gratis</p></div></div>
        <button class="btn btn-ghost btn-block mt-16" onclick="state.org=null;state.campusShare=null;persist();closeSheet();rerender();toast('Tautan institusi dilepas','ph-link-break')">Lepas tautan</button>`,
    });
    return;
  }
  openSheet({
    title: '<h2 class="h2">Tautkan institusi</h2>',
    body: `
      <p class="muted" style="font-size:14px">Masukkan email kampus atau kantor. Institusimu tidak bisa melihat isi percakapanmu.</p>
      <input class="field mt-12" id="orgEmail" type="email" inputmode="email" placeholder="nama@binus.ac.id">
      <p class="tiny mt-8" id="orgMsg">Kampus mitra: BINUS, ITB, UNPAD, UPI, Telkom University.</p>
      <button class="btn btn-primary btn-block mt-16" onclick="verifyOrg()">Verifikasi</button>`,
  });
}
function verifyOrg() {
  const email = document.getElementById('orgEmail').value.trim().toLowerCase();
  const domain = email.split('@')[1] || '';
  const org = Object.entries(ORGS).find(([d]) => domain === d || domain.endsWith('.' + d));
  if (!org) {
    const msg = document.getElementById('orgMsg');
    msg.textContent = 'Domain ini belum terdaftar sebagai mitra. Coba email kampus mitra.';
    msg.style.color = 'var(--clay)';
    return;
  }
  state.org = org[1]; state.campusShare = null; persist(); rerender();
  toast(`Terhubung dengan ${org[1]}`, 'ph-check-circle');
  openCampusConsent('onboard');
}

// ---------- Tools: breathing ----------
let breathTimer = null;
function openBreathing() {
  openSheet({
    full: true,
    title: '<h2 class="h2">Napas kotak</h2>',
    body: `
      <div class="breath">
        <p class="muted" style="font-size:14px">Tarik · tahan · hembuskan · tahan — masing-masing 4 detik.</p>
        <div class="breath-orb idle" id="orb"><span class="ripple-ring"></span><span class="ripple-ring d2"></span><span class="ring"></span><span class="core"></span><span class="label" id="orbLabel">Siap?</span></div>
        <p class="h3 breath-count" id="orbCount">4 putaran · ±1 menit</p>
        <button class="btn btn-primary mt-20" id="orbBtn" onclick="toggleBreathing()" style="min-width:180px"><i class="ph-fill ph-play"></i>Mulai</button>
      </div>`,
    onClose: stopBreathing,
  });
}
function toggleBreathing() { breathTimer ? stopBreathing(true) : startBreathing(); }
function startBreathing() {
  const phases = [['inhale', 'Tarik'], ['hold-in', 'Tahan'], ['exhale', 'Hembuskan'], ['hold-out', 'Tahan']];
  let tick = 0;
  const orb = document.getElementById('orb');
  const btn = document.getElementById('orbBtn');
  btn.innerHTML = '<i class="ph-fill ph-stop"></i>Berhenti';
  const step = () => {
    const phaseIdx = Math.floor(tick / 4) % 4;
    const round = Math.floor(tick / 16) + 1;
    if (round > 4) { stopBreathing(true); logTool('breath'); document.getElementById('orbLabel').textContent = 'Selesai'; toast('Bagus. Kamu sudah memberi jeda untuk dirimu.', 'ph-leaf'); return; }
    orb.className = 'breath-orb ' + phases[phaseIdx][0];
    document.getElementById('orbLabel').textContent = phases[phaseIdx][1];
    document.getElementById('orbCount').textContent = `Putaran ${round} dari 4 · ${4 - (tick % 4)}`;
    tick++;
  };
  step();
  breathTimer = setInterval(step, 1000);
}
function stopBreathing(keepOpen) {
  clearInterval(breathTimer); breathTimer = null;
  if (keepOpen !== true) return;
  const orb = document.getElementById('orb'); if (!orb) return;
  orb.className = 'breath-orb idle';
  document.getElementById('orbLabel').textContent = 'Siap?';
  document.getElementById('orbCount').textContent = '4 putaran · ±1 menit';
  document.getElementById('orbBtn').innerHTML = '<i class="ph-fill ph-play"></i>Mulai lagi';
}

// ---------- Tools: meditation ----------
let medTimer = null, medLeft = 0, medTotal = 0;
const CIRC = 2 * Math.PI * 108;
function openMeditation(id) {
  const m = MEDITATIONS[id];
  medLeft = medTotal = m.secs;
  openSheet({
    full: true,
    title: '<h2 class="h2">Meditasi</h2>',
    body: `
      <div class="tool-cover" style="--tc:var(--m4)">${TOOL_ART.meditate()}</div>
      <div class="segmented mt-16">${Object.entries(MEDITATIONS).map(([k, x]) => `<button class="${k === id ? 'on' : ''}" onclick="openMeditation('${k}')">${x.title} · ${x.secs / 60} mnt</button>`).join('')}</div>
      <div class="timer">
        <svg viewBox="0 0 240 240"><circle class="track" cx="120" cy="120" r="108" fill="none" stroke-width="10"/>
          <circle class="bar" id="medBar" cx="120" cy="120" r="108" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="${CIRC}" stroke-dashoffset="0"/></svg>
        <div class="time" id="medTime">${fmtSecs(medLeft)}</div>
      </div>
      <p class="article" style="text-align:center;font-size:16px;padding:0 8px">${m.guide}</p>
      <div class="row mt-20" style="justify-content:center">
        <button class="btn btn-ghost" onclick="resetMeditation()" aria-label="Ulang"><i class="ph ph-arrow-counter-clockwise"></i></button>
        <button class="btn btn-primary" id="medBtn" onclick="toggleMeditation()" style="min-width:160px"><i class="ph-fill ph-play"></i>Mulai</button>
      </div>`,
    onClose: () => { clearInterval(medTimer); medTimer = null; },
  });
}
const fmtSecs = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
function paintMeditation() {
  document.getElementById('medTime').textContent = fmtSecs(medLeft);
  document.getElementById('medBar').style.strokeDashoffset = CIRC * (1 - medLeft / medTotal);
}
function toggleMeditation() {
  const btn = document.getElementById('medBtn');
  if (medTimer) { clearInterval(medTimer); medTimer = null; btn.innerHTML = '<i class="ph-fill ph-play"></i>Lanjut'; return; }
  btn.innerHTML = '<i class="ph-fill ph-pause"></i>Jeda';
  document.querySelector('.tool-cover')?.classList.add('playing');
  medTimer = setInterval(() => {
    medLeft--; paintMeditation();
    if (medLeft <= 0) { clearInterval(medTimer); medTimer = null; logTool('meditation'); btn.innerHTML = '<i class="ph ph-check"></i>Selesai'; toast('Sesi selesai. Terima kasih sudah hadir untuk dirimu.', 'ph-leaf'); }
  }, 1000);
}
function resetMeditation() {
  clearInterval(medTimer); medTimer = null; medLeft = medTotal; paintMeditation();
  document.getElementById('medBtn').innerHTML = '<i class="ph-fill ph-play"></i>Mulai';
}

// ---------- Tools: gratitude ----------
function openGratitude() {
  openSheet({
    title: '<h2 class="h2">Tiga hal baik hari ini</h2>',
    body: `
      <div class="tool-cover grow-0" id="gratCover" style="--tc:var(--m5)">${TOOL_ART.gratitude()}<span class="cover-note" id="gratNote">Isi satu, tanamanmu tumbuh 🌱</span></div>
      <p class="muted mt-12" style="font-size:14px">Sekecil apa pun — kopi yang enak, chat dari teman, tugas yang selesai.</p>
      ${[1, 2, 3].map(n => `<input class="field mt-12 grat" maxlength="80" placeholder="${n}." oninput="growGratitude()">`).join('')}
      <button class="btn btn-primary btn-block mt-16" onclick="saveGratitude()">Simpan</button>`,
  });
}
function growGratitude() {
  const n = [...document.querySelectorAll('.grat')].filter(i => i.value.trim()).length;
  document.getElementById('gratCover').className = `tool-cover grow-${n}`;
  document.getElementById('gratNote').textContent = ['Isi satu, tanamanmu tumbuh 🌱', 'Satu daun tumbuh. Lanjut?', 'Dua daun! Satu lagi.', 'Tanamanmu mekar. Simpan, yuk.'][n];
}
function saveGratitude() {
  const items = [...document.querySelectorAll('.grat')].map(i => i.value.trim()).filter(Boolean);
  if (!items.length) return toast('Tulis minimal satu hal ya', 'ph-pencil-simple');
  state.gratitude.push({ date: dayKey(), items }); logTool('gratitude'); closeSheet();
  if (ui.tab === 'me') renderMe();
  toast('Tersimpan di Catatanmu', 'ph-plant');
}

// ---------- Tools: Cek Diri (PHQ-4) ----------
function screeningBand(score) {
  if (score <= 2) return { label: 'Stabil', text: 'Kondisimu tampak cukup stabil. Pertahankan kebiasaan baik dan check-in harian.', cta: ['Lihat latihan', "closeSheet();go('learn')"] };
  if (score <= 5) return { label: 'Ringan', text: 'Ada tanda stres ringan. Cerita ke Teman Pulih dan latihan napas bisa membantu.', cta: ['Ngobrol dengan Teman Pulih', "closeSheet();go('support',{supportTab:'peer'})"] };
  if (score <= 8) return { label: 'Sedang', text: 'Bebanmu cukup terasa. Kami sarankan bicara dengan psikolog.', cta: ['Cari psikolog', "closeSheet();go('support',{supportTab:'psy'})"] };
  return { label: 'Berat', text: 'Kamu sedang memikul banyak hal. Bicara dengan psikolog sangat disarankan — dan SOS selalu tersedia kalau kamu merasa tidak aman.', cta: ['Cari psikolog', "closeSheet();go('support',{supportTab:'psy'})"] };
}
function openSelfCheck(step = -1, answers = []) {
  if (step === -1) {
    openSheet({
      title: '<h2 class="h2">Cek Diri</h2>',
      body: `
        <div class="tool-cover" style="--tc:var(--m3)">${TOOL_ART.check()}</div>
        <h3 class="h2 mt-16" style="font-size:22px">Bagaimana kabarmu dua minggu ini?</h3>
        <p class="muted mt-8" style="font-size:14px">4 pertanyaan singkat untuk memahami tingkat cemas dan sedihmu, lalu kami sarankan langkah yang pas.</p>
        <div class="row mt-16" style="gap:8px;flex-wrap:wrap">
          <span class="tag tag-plain"><i class="ph ph-clock"></i>1 menit</span>
          <span class="tag tag-plain"><i class="ph ph-lock-key"></i>Hanya untukmu</span>
          <span class="tag tag-plain"><i class="ph ph-clipboard-text"></i>PHQ-4</span>
        </div>
        ${state.screening ? `<p class="tiny mt-12">Terakhir: ${screeningBand(state.screening.score).label} · skor ${state.screening.score}/12</p>` : ''}
        <button class="btn btn-primary btn-block mt-20" onclick="openSelfCheck(0)">Mulai Cek Diri</button>
        <p class="tiny mt-12" style="text-align:center">Ini bukan diagnosis.</p>`,
    });
    return;
  }
  if (step === CHECK_QUESTIONS.length) {
    const score = answers.reduce((a, b) => a + b, 0);
    state.screening = { score, date: dayKey() }; logTool('check');
    if (ui.tab === 'me') renderMe();
    const band = screeningBand(score);
    openSheet({
      title: '<h2 class="h2">Hasil Cek Diri</h2>',
      body: `
        <div class="card ${score >= 6 ? 'card-amber' : 'card-sunken'}">
          <p class="tiny">Skor ${score} dari 12</p>
          <p class="display" style="font-size:28px;margin-top:4px">${band.label}</p>
          <p class="mt-8" style="font-size:15px">${band.text}</p>
        </div>
        <button class="btn btn-primary btn-block mt-16" onclick="${band.cta[1]}">${band.cta[0]}</button>
        ${score >= 9 ? '<button class="btn btn-ghost btn-block mt-8" onclick="openSOS()">Buka kontak darurat</button>' : ''}
        <p class="tiny mt-16">Cek Diri memakai kuesioner singkat PHQ-4. Ini bukan diagnosis — hanya titik awal untuk memahami kondisimu.</p>`,
    });
    return;
  }
  openSheet({
    title: `<h2 class="h2">Cek Diri</h2><span class="tiny">${step + 1}/${CHECK_QUESTIONS.length}</span>`,
    body: `
      <div class="progress"><span style="width:${(step / CHECK_QUESTIONS.length) * 100}%"></span></div>
      <p class="tiny mt-16">Dalam 2 minggu terakhir, seberapa sering kamu…</p>
      <p class="h2 mt-8" style="font-size:22px">${CHECK_QUESTIONS[step]}?</p>
      <div class="q-opts">${CHECK_OPTIONS.map((o, i) => `<button class="q-opt" onclick="openSelfCheck(${step + 1}, [${[...answers, i]}])">${o}</button>`).join('')}</div>
      ${step ? `<button class="link mt-16" onclick="openSelfCheck(${step - 1}, [${answers.slice(0, -1)}])"><i class="ph ph-arrow-left"></i> Kembali</button>` : ''}`,
  });
}

// ---------- SOS & notifications ----------
function openSOS() {
  openSheet({
    title: '<span></span>',
    body: `
      <div class="sos-hero">
        <div class="sos-ic"><i class="ph-fill ph-lifebuoy"></i></div>
        <h2 class="display" style="font-size:26px">Kamu tidak sendirian</h2>
        <p class="muted mt-8" style="font-size:15px">Kalau kamu dalam bahaya atau berpikir untuk menyakiti diri, hubungi bantuan sekarang.</p>
      </div>
      <div class="list">
        <a class="hotline" href="tel:119"><span class="li-ic" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center;font-size:20px"><i class="ph ph-phone"></i></span><div class="grow"><p class="h3" style="font-size:15px">Layanan Kesehatan Jiwa Kemenkes</p><p class="tiny">119 ext. 8 · 24 jam</p></div><span class="call"><i class="ph-fill ph-phone"></i></span></a>
        <a class="hotline" href="tel:112" style="border-top:1px solid var(--line)"><span class="li-ic" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center;font-size:20px"><i class="ph ph-siren"></i></span><div class="grow"><p class="h3" style="font-size:15px">Darurat nasional</p><p class="tiny">112 · ambulans, polisi</p></div><span class="call"><i class="ph-fill ph-phone"></i></span></a>
        <a class="hotline" href="https://www.intothelightid.org" target="_blank" rel="noopener" style="border-top:1px solid var(--line)"><span class="li-ic" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center;font-size:20px"><i class="ph ph-sun-horizon"></i></span><div class="grow"><p class="h3" style="font-size:15px">Into The Light Indonesia</p><p class="tiny">Daftar layanan konseling & pendampingan</p></div><span class="call" style="background:var(--sunken);color:var(--ink)"><i class="ph ph-arrow-up-right"></i></span></a>
      </div>
      ${state.trustedContact
        ? `<a class="btn btn-soft btn-block mt-12" href="sms:${esc(state.trustedContact.phone)}?body=${encodeURIComponent('Hai, aku sedang tidak baik-baik saja. Bisa telepon aku sekarang?')}"><i class="ph ph-chat-text"></i>Kabari ${esc(state.trustedContact.name)}</a>`
        : `<button class="btn btn-ghost btn-block mt-12" onclick="openTrustedContact()"><i class="ph ph-user-plus"></i>Tambah kontak tepercaya</button>`}
      <p class="tiny mt-20" style="text-align:center">Belum darurat, tapi butuh tenang dulu?</p>
      <div class="row mt-8">
        <button class="btn btn-soft btn-block" onclick="openBreathing()"><i class="ph ph-wind"></i>Napas</button>
        <button class="btn btn-ghost btn-block" onclick="closeSheet();go('support',{supportTab:'peer'})"><i class="ph ph-chats-circle"></i>Teman Pulih</button>
      </div>`,
  });
}

function openNotifications() {
  state.notifSeen = true; persist(); renderTopbar();
  const items = [
    ['ph-hand-heart', 'var(--clay-tint)', 'var(--clay)', '12 orang memeluk cerita di Lingkar Pulih yang kamu ikuti.', '2 j'],
    ['ph-chat-circle', 'var(--forest-tint)', 'var(--forest)', 'Dr. Dian mengirim pesan untukmu.', '5 j'],
    ['ph-sun', 'var(--amber-tint)', '#8A5B0E', 'Sudah check-in hari ini? Cukup 10 detik.', '8 j'],
  ];
  openSheet({
    title: '<h2 class="h2">Notifikasi</h2>',
    body: `<div class="list">${items.map(([i, bg, fg, t, a]) => `
      <div class="list-item"><span class="li-ic" style="background:${bg};color:${fg}"><i class="ph ${i}"></i></span><div class="grow"><p style="font-size:14px">${t}</p><p class="tiny">${a} lalu</p></div></div>`).join('')}</div>`,
  });
}

// ---------- Sheet system ----------
let sheetOnClose = null;
function openSheet({ title = '', body = '', raw = null, full = false, onClose = null, hideClose = false, kind = null }) {
  if (sheetOnClose) { const fn = sheetOnClose; sheetOnClose = null; fn(); }
  ui.sheetKind = kind;
  const sheet = document.getElementById('sheet');
  sheet.classList.toggle('full', full);
  sheet.innerHTML = raw ?? `
    <div class="sheet-grab"></div>
    <div class="sheet-head">${title}${hideClose ? '' : '<button class="close-btn" onclick="closeSheet()" aria-label="Tutup"><i class="ph ph-x"></i></button>'}</div>
    <div class="sheet-body">${body}</div>`;
  sheetOnClose = onClose;
  requestAnimationFrame(() => {
    sheet.classList.add('show');
    document.getElementById('scrim').classList.add('show');
  });
}
function closeSheet() {
  if (sheetOnClose) { const fn = sheetOnClose; sheetOnClose = null; fn(); }
  ui.sheetKind = null;
  document.getElementById('sheet').classList.remove('show');
  document.getElementById('scrim').classList.remove('show');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

let toastTimer = null;
function toast(msg, icon = 'ph-check') {
  const t = document.getElementById('toast');
  t.innerHTML = `<i class="ph ${icon}"></i>${esc(msg)}`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ---------- Theme, demo, mockup ----------
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.text = state.prefs.textSize;
  document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#131915' : '#2F5A3C';
}
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  persist(); applyTheme(); rerender();
}
function resetDemo() {
  if (!confirm('Hapus semua data demo dan mulai dari awal?')) return;
  localStorage.removeItem(KEY);
  state = freshState(); ui.draft = null; ui.editingMood = false;
  applyTheme(); closeSheet(); hideSosFab(); go('home'); renderAuth('intro');
}
function captureMockup() {
  if (!window.html2canvas) return toast('Fitur mockup belum siap, coba lagi', 'ph-warning');
  toast('Menyiapkan gambar…', 'ph-camera');
  html2canvas(document.getElementById('phone'), { backgroundColor: null, scale: 2, useCORS: true }).then(canvas => {
    const a = document.createElement('a');
    a.download = `RuangPulih-${ui.tab}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
}

function tickClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
}

// ---------- Press ripple ----------
const RIPPLE = '.btn, .social-btn, .method, .chip, .q-opt, .slot-btn, .channel, .premium-pill, button.card, button.list-item, a.list-item, .cover.feature, .send, .play';
document.addEventListener('pointerdown', e => {
  const el = e.target.closest(RIPPLE);
  if (!el || el.disabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect();
  const scale = r.width / el.offsetWidth || 1; // accounts for zoomed text size
  const d = Math.max(el.offsetWidth, el.offsetHeight) * 2.2;
  const dot = document.createElement('span');
  dot.className = 'ripple';
  dot.style.cssText = `width:${d}px;height:${d}px;left:${(e.clientX - r.left) / scale - d / 2}px;top:${(e.clientY - r.top) / scale - d / 2}px`;
  el.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove());
});

// ---------- SOS pop-up ----------
// Shown every time the app opens; the user must tap × to put it away for this session.
function showSosFab() {
  const fab = document.getElementById('sosFab');
  fab.innerHTML = `
    <div class="sos-tip"><b>Butuh bantuan segera?</b>Tekan SOS, kapan saja.</div>
    <div class="sos-wrap">
      <button class="sos-round" onclick="openSOS()" aria-label="Buka bantuan darurat SOS"><i class="ph-fill ph-lifebuoy"></i>SOS</button>
      <button class="sos-x" onclick="dismissSosFab()" aria-label="Tutup tombol SOS"><i class="ph ph-x"></i></button>
    </div>`;
  setTimeout(() => fab.classList.add('show'), 500);
  setTimeout(() => { const tip = fab.querySelector('.sos-tip'); if (tip) tip.style.display = 'none'; }, 6500);
}
function hideSosFab() { document.getElementById('sosFab').classList.remove('show'); }
function dismissSosFab() {
  hideSosFab();
  toast('SOS tetap ada di tab Dukungan & menu', 'ph-lifebuoy');
}

// ---------- Boot ----------
window.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  tickClock(); setInterval(tickClock, 30000);
  go('home');
  if (state.account) showSosFab(); else renderAuth('intro');
});
