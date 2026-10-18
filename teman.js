// ===== RUANG PULIH — TEMAN PULIH (Nadia, demo) =====
// Peer supporters see only what a student writes in the chat: no names, no mood data, no Cek Diri.
// Guardrails flag crisis language and route to the on-duty psychologist.

const ME = 'tp-nadia';
const SUGGEST = [
  ['Validasi', 'Wajar banget kamu merasa begitu.'],
  ['Pertanyaan terbuka', 'Boleh ceritakan lebih banyak tentang itu?'],
  ['Refleksi', 'Kedengarannya kamu sedang memikul banyak hal sendirian.'],
  ['Batas peran', 'Aku bukan psikolog, tapi aku di sini untuk mendengarkan.'],
  ['Langkah kecil', 'Kalau mau, kita coba satu hal kecil untuk hari ini?'],
];
const DEMO_CHATS = {
  d1: { name: 'Anonim · Kuliah', wait: 3, msgs: [{ from: 'me', text: 'Aku capek banget sama tugas akhir, rasanya pengen nyerah aja.', t: '20.41' }] },
  d2: { name: 'Anonim · Keluarga', wait: 9, msgs: [{ from: 'me', text: 'Orang tuaku terus membandingkan aku dengan kakakku. Aku merasa tidak pernah cukup.', t: '20.33' }] },
  d3: { name: 'Anonim · Kecemasan', wait: 1, msgs: [{ from: 'me', text: 'Kadang aku merasa semua orang lebih baik tanpa aku. Pernah kepikiran mengakhiri hidup.', t: '20.45' }] },
};
const FLAGGED = [
  { id: 'f1', topic: 'Kecemasan', body: 'Malam ini rasanya berat banget, aku nggak tahu harus cerita ke siapa lagi.', why: 'Kata kunci: "nggak tahu harus cerita ke siapa"' },
  { id: 'f2', topic: 'Kuliah', body: 'Jual jasa joki tugas murah, DM aja.', why: 'Dilaporkan 3 pengguna · spam' },
];
const state = { tab: 'antrean', live: readJSON('rp-tp-live', true), chat: null, wellbeing: null, modDone: {} };

// ---------- Data from the student app ----------
function appChat() {
  const a = readApp();
  const c = a?.chats?.[ME];
  if (!c) return null;
  const last = c.messages[c.messages.length - 1];
  return { id: 'app', name: 'Anonim · akun demo', msgs: c.messages, waiting: last?.from === 'me', a };
}
function chatById(id) {
  if (id === 'app') return appChat();
  const d = DEMO_CHATS[id]; return d && { id, name: d.name, msgs: d.msgs, waiting: d.msgs.at(-1).from === 'me', demo: true };
}
const queue = () => [appChat(), ...Object.keys(DEMO_CHATS).map(chatById)].filter(Boolean);
const isRisky = c => c.msgs.some(m => m.from === 'me' && RISK_RX.test(m.text));

// ---------- Shell ----------
const TABS = [['antrean', 'Antrean', 'chats-circle'], ['moderasi', 'Moderasi', 'shield-check'], ['supervisi', 'Supervisi', 'graduation-cap'], ['saya', 'Saya', 'user-circle']];
function render() {
  document.getElementById('screen').innerHTML = VIEWS[state.tab]();
  const waiting = queue().filter(c => c.waiting).length;
  document.getElementById('nav').innerHTML = TABS.map(([id, label, icon]) => `
    <button class="nav-btn ${state.tab === id ? 'active' : ''}" onclick="state.tab='${id}';render();document.getElementById('scroll').scrollTop=0">
      <span class="nav-ic"><i class="${state.tab === id ? 'ph-fill' : 'ph'} ph-${icon}"></i>${id === 'antrean' && waiting ? `<span class="badge">${waiting}</span>` : ''}</span>
      <span class="nav-label">${label}</span></button>`).join('');
  const b = document.getElementById('liveBtn');
  b.className = `live-toggle ${state.live ? 'on' : ''}`;
  b.innerHTML = `<span class="live-dot"></span>${state.live ? 'Siap' : 'Jeda'}`;
}
function toggleLive() {
  state.live = !state.live; writeJSON('rp-tp-live', state.live); setLive(ME, state.live); render();
  toast(state.live ? 'Kamu siap menerima percakapan' : 'Jeda · percakapan baru dialihkan ke Teman Pulih lain', state.live ? 'ph-broadcast' : 'ph-moon');
}
const pageTitle = t => `<h1 class="page-title">${t}</h1>`;

// ---------- Views ----------
const VIEWS = {
  antrean() {
    const q = queue();
    return `
      ${pageTitle('Antrean')}
      <div class="safe-note"><i class="ph-fill ph-mask-happy"></i>Kamu hanya melihat isi chat. Nama, mood, dan Cek Diri mahasiswa tidak pernah ditampilkan.</div>
      ${!state.live ? '<div class="card card-sunken mt-12"><p class="h3" style="font-size:15px">Sedang jeda</p><p class="tiny">Nyalakan "Siap" di atas untuk menerima percakapan baru.</p></div>' : ''}
      <div class="stats">
        <div class="stat"><b>${q.filter(c => c.waiting).length}</b><span>menunggu</span></div>
        <div class="stat"><b>1m 48d</b><span>median balas</span></div>
        <div class="stat"><b>18</b><span>minggu ini</span></div>
      </div>
      <div class="section"><div class="section-head"><h3 class="h2">Percakapan</h3></div>
        <div class="stack-8">${q.sort((x, y) => isRisky(y) - isRisky(x) || y.waiting - x.waiting).map(c => {
          const last = c.msgs.filter(m => m.from !== 'sys').at(-1);
          return `<button class="card tp-queue-item" onclick="openChatTP('${c.id}')">
            <span class="avatar sm" style="--c:${isRisky(c) ? 'var(--clay-tint)' : 'var(--forest-tint)'}"><span class="avatar-face"><i class="ph${isRisky(c) ? '-fill ph-warning' : ' ph-user'}" style="font-size:18px;color:${isRisky(c) ? 'var(--clay)' : 'var(--forest)'}"></i></span></span>
            <div class="grow"><p class="h3" style="font-size:14.5px">${esc(c.name)}</p><p class="tiny" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(last?.text || '')}</p>
              ${isRisky(c) ? '<span class="tag" style="background:var(--clay-tint);color:var(--clay);margin-top:6px"><i class="ph-fill ph-warning"></i>Tanda risiko · prioritas</span>' : ''}</div>
            ${c.waiting ? `<span class="tp-wait">${c.demo ? DEMO_CHATS[c.id].wait + ' mnt' : 'baru'}</span>` : '<span class="tiny">dibalas</span>'}
          </button>`; }).join('')}</div></div>`;
  },

  moderasi() {
    const a = readApp();
    const appPosts = (a?.posts || []).filter(p => p.mine && !(a.hiddenPosts || []).includes(p.id)).slice(0, 2)
      .map(p => ({ id: p.id, topic: p.topic, body: p.body, why: RISK_RX.test(p.body) ? 'Kalimat berisiko terdeteksi' : 'Postingan baru dari akun demo', app: true, risky: RISK_RX.test(p.body) }));
    const items = [...appPosts, ...FLAGGED].filter(i => !state.modDone[i.id]);
    return `
      ${pageTitle('Moderasi Lingkar')}
      <p class="muted" style="font-size:14px">Tinjau postingan yang ditandai otomatis atau dilaporkan. Postingan berisiko disembunyikan dulu dan penulisnya ditawari dukungan.</p>
      <div class="stack-8 mt-16">${items.length ? items.map(i => `
        <div class="card">
          <div class="row"><span class="tag ${i.risky ? '' : 'tag-plain'}" ${i.risky ? 'style="background:var(--clay-tint);color:var(--clay)"' : ''}>${i.topic}</span><span class="tiny grow" style="text-align:right">${esc(i.why)}</span></div>
          <p class="post-body">${esc(i.body)}</p>
          <div class="row mt-12" style="gap:8px;justify-content:flex-end">
            <button class="btn btn-ghost btn-sm" onclick="moderate('${i.id}',false,${!!i.app})">Sembunyikan</button>
            <button class="btn btn-primary btn-sm" onclick="moderate('${i.id}',true,${!!i.app})">Setujui</button>
          </div>
        </div>`).join('') : `<div class="card card-sunken empty">Antrean moderasi kosong. Terima kasih sudah menjaga Lingkar Pulih tetap aman.</div>`}</div>`;
  },

  supervisi() {
    const wb = state.wellbeing;
    return `
      ${pageTitle('Supervisi')}
      <div class="card">
        <p class="tiny">Jam pendampingan menuju sertifikasi HIMPSI</p>
        <div class="hours"><b>14,5</b><span class="muted">/ 20 jam</span></div>
        <div class="hw-bar mt-8"><span style="width:72.5%"></span></div>
        <p class="tiny mt-8">5,5 jam lagi · sertifikat diterbitkan setelah supervisi akhir</p>
      </div>
      <div class="card mt-12">
        <div class="row"><span class="avatar" style="--c:var(--m3)"><span class="avatar-face">${pebbleSvg(4, 34, '#D8C6A0')}</span></span>
          <div class="grow"><p class="h3" style="font-size:15px">Siti Aminah, M.Psi.</p><p class="tiny">Supervisor · sesi berikutnya Kamis, 19.00</p></div></div>
        <p class="set-group-title mt-16">Catatan debrief</p>
        <textarea class="field" id="debrief" rows="3" placeholder="Percakapan apa yang paling menantang minggu ini? Apa yang membantu?"></textarea>
        <button class="btn btn-primary btn-sm mt-12" onclick="document.getElementById('debrief').value.trim() ? (document.getElementById('debrief').value='', toast('Catatan dikirim ke supervisor','ph-paper-plane-tilt')) : toast('Tulis catatan dulu','ph-pencil-simple')">Kirim ke supervisor</button>
      </div>
      <div class="card mt-12">
        <p class="h3" style="font-size:15px">Bagaimana kabarmu sebagai pendamping?</p>
        <p class="tiny">Mendampingi orang lain juga melelahkan. Ini hanya untuk supervisormu.</p>
        <div class="mood-picker">${[1, 2, 3, 4, 5].map(v => `<button class="mood-opt ${wb === v ? 'on' : ''}" onclick="setWellbeing(${v})">${pebbleSvg(v, 44)}<span>${MOOD_LBL[v]}</span></button>`).join('')}</div>
        ${wb && wb <= 2 ? `<div class="notice mt-12" style="display:flex;gap:10px;padding:12px;border-radius:14px;background:var(--amber-tint)"><i class="ph ph-heart"></i><span style="font-size:13px">Terima kasih sudah jujur. Ambil jeda dulu — supervisormu akan menghubungimu hari ini.</span></div>
          <button class="btn btn-soft btn-sm mt-8" onclick="if(state.live)toggleLive()">Jeda dari antrean</button>` : ''}
      </div>`;
  },

  saya() {
    return `
      ${pageTitle('Saya')}
      <div class="me"><span class="avatar" style="--c:var(--m4);width:68px;height:68px;border-radius:24px"><span class="avatar-face">${nadia()}</span></span>
        <div class="grow"><h2 class="display" style="font-size:24px">Nadia</h2><div class="row mt-8" style="gap:6px"><span class="tag"><i class="ph-fill ph-seal-check"></i>Teman Pulih</span><span class="tag tag-plain">Psikologi · UNPAD</span></div></div></div>
      <div class="stats">
        <div class="stat"><b>18</b><span>percakapan</span></div>
        <div class="stat"><b>4,8</b><span>penilaian</span></div>
        <div class="stat"><b>${readJSON('rp-referrals', []).length + 3}</b><span>rujukan</span></div>
      </div>
      <div class="section"><div class="section-head"><h3 class="h2">Aturan peran</h3></div>
        <div class="list">${[['ph-ear', 'Dengarkan, jangan mendiagnosis', 'Kamu pendamping sebaya, bukan psikolog.'],
          ['ph-lock-key', 'Jaga kerahasiaan', 'Kecuali ada risiko keselamatan — saat itu, eskalasi.'],
          ['ph-arrow-bend-up-right', 'Rujuk bila perlu', 'Selalu dengan izin mahasiswa, kecuali darurat.'],
          ['ph-battery-charging', 'Jaga dirimu juga', 'Ambil jeda saat lelah; laporkan ke supervisor.']].map(([i, t, d]) => `
          <div class="list-item"><span class="li-ic"><i class="ph ${i}"></i></span><div class="grow"><p style="font-size:14.5px;font-weight:600">${t}</p><p class="tiny">${d}</p></div></div>`).join('')}</div></div>`;
  },
};
function nadia() {
  return `<svg viewBox="0 0 48 48" aria-hidden="true" style="width:100%;height:100%"><path d="M11 50l3-16c-2-3-3-7-3-11 0-9 6-16 13-16s13 7 13 16c0 4-1 8-3 11l3 16z" fill="#E9A73C"/><ellipse cx="24" cy="21.5" rx="7.4" ry="8.6" fill="#E2B48E"/><path d="M16.4 17c1.6-4.4 4.4-6.4 7.6-6.4s6 2 7.6 6.4c-2.4-1.6-5-2.2-7.6-2.2s-5.2.6-7.6 2.2z" fill="#E9A73C"/><circle cx="20.6" cy="20.5" r="1.15" fill="#1D2620"/><circle cx="27.4" cy="20.5" r="1.15" fill="#1D2620"/><path d="M21.6 25q2.4 1.8 4.8 0" stroke="#1D2620" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`;
}

// ---------- Chat with guardrails ----------
function openChatTP(id) {
  state.chat = id;
  const c = chatById(id);
  const risky = isRisky(c);
  const sheet = document.getElementById('sheet');
  sheet.className = 'sheet full show';
  document.getElementById('scrim').classList.add('show');
  sheet.innerHTML = `
    <div class="chat">
      <div class="sheet-head" style="border-bottom:1px solid var(--line);padding-bottom:12px">
        <button class="close-btn" onclick="closeSheet()" aria-label="Kembali"><i class="ph ph-caret-left"></i></button>
        <div class="grow"><p class="h3" style="font-size:15px">${esc(c.name)}</p><p class="tiny">Anonim · terenkripsi${c.demo ? ' · percakapan demo' : ''}</p></div>
        <button class="btn btn-ghost btn-sm" onclick="openReferral('${id}')"><i class="ph ph-arrow-bend-up-right"></i>Rujuk</button>
      </div>
      <div class="chat-log" id="tpLog">
        ${risky ? `<div class="risk-flag" role="alert"><p class="h3"><i class="ph-fill ph-warning"></i>Tanda risiko terdeteksi</p>
          <ul><li>Tanyakan langsung dan tenang: "Apakah kamu sedang berpikir untuk menyakiti dirimu?"</li><li>Tetap bersama mereka, jangan janji merahasiakan.</li><li>Eskalasi sekarang — psikolog jaga akan bergabung.</li></ul>
          <div class="row mt-8" style="gap:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" style="background:var(--clay)" onclick="escalate('${id}')"><i class="ph-fill ph-first-aid"></i>Eskalasi ke psikolog jaga</button>
          <button class="btn btn-ghost btn-sm" onclick="sendTP('${id}','Kalau kamu dalam bahaya sekarang, hubungi 119 ext. 8 (24 jam) atau 112. Aku tetap di sini bersamamu.')"><i class="ph ph-phone"></i>Kirim kontak darurat</button></div></div>` : ''}
        ${c.msgs.map(m => m.from === 'sys' ? `<div class="bubble sys">${esc(m.text)}</div>`
          : `<div class="bubble ${m.from === 'me' ? 'them' : 'me'}">${esc(m.text)}${m.t ? `<time>${m.t}</time>` : ''}</div>`).join('')}
      </div>
      <div class="suggest-row">${SUGGEST.map(([l, t]) => `<button class="chip" title="${t}" onclick="document.getElementById('tpIn').value='${t}';document.getElementById('tpIn').focus()">${l}</button>`).join('')}</div>
      <div class="chat-input">
        <input id="tpIn" placeholder="${state.live ? 'Tulis balasan yang suportif…' : 'Kamu sedang jeda'}" maxlength="500" onkeydown="if(event.key==='Enter')sendTP('${id}')">
        <button class="send" onclick="sendTP('${id}')" aria-label="Kirim"><i class="ph-fill ph-paper-plane-right"></i></button>
      </div>
    </div>`;
  const log = document.getElementById('tpLog'); log.scrollTop = log.scrollHeight;
}
function closeSheet() {
  state.chat = null;
  document.getElementById('sheet').classList.remove('show');
  document.getElementById('scrim').classList.remove('show');
  render();
}
function sendTP(id, preset) {
  const input = document.getElementById('tpIn');
  const text = (preset || input?.value || '').trim(); if (!text) return;
  if (id === 'app') writeApp(a => { const c = a.chats[ME]; c.messages.push({ from: 'them', text, t: nowT() }); c.unread = true; });
  else DEMO_CHATS[id].msgs.push({ from: 'them', text, t: nowT() });
  if (input) input.value = '';
  openChatTP(id);
  if (id === 'app') toast('Terkirim ke aplikasi mahasiswa', 'ph-paper-plane-tilt');
}
function escalate(id) {
  const refs = readJSON('rp-referrals', []);
  refs.unshift({ id: 'r' + Date.now(), from: 'Nadia (Teman Pulih)', who: id === 'app' ? 'Mahasiswa (akun demo)' : 'Mahasiswa anonim', reason: 'Eskalasi krisis: kalimat berisiko dalam chat', urgency: 'tinggi', status: 'baru', at: Date.now(), app: id === 'app' });
  writeJSON('rp-referrals', refs);
  sendTP(id, 'Terima kasih sudah jujur padaku. Aku menghubungkanmu dengan psikolog jaga sekarang — dia akan menyapamu di sini. Aku tetap menemani sampai dia bergabung.');
  toast('Psikolog jaga diberi tahu · prioritas tinggi', 'ph-first-aid');
}
function openReferral(id) {
  const sheet = document.getElementById('sheet');
  sheet.className = 'sheet show';
  sheet.innerHTML = `
    <div class="sheet-grab"></div>
    <div class="sheet-head"><h2 class="h2">Rujuk ke psikolog</h2><button class="close-btn" onclick="openChatTP('${id}')" aria-label="Kembali"><i class="ph ph-x"></i></button></div>
    <div class="sheet-body">
      <p class="muted" style="font-size:14px">Ringkas alasannya. Psikolog hanya menerima ringkasan ini, bukan seluruh percakapan.</p>
      <textarea class="field mt-12" id="refWhy" rows="3" placeholder="Mis. cemas berkepanjangan sejak UTS, sulit tidur 2 minggu"></textarea>
      <p class="set-group-title mt-16">Tingkat</p>
      <div class="segmented" id="refUrg"><button class="on" onclick="this.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">Rutin</button><button onclick="this.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===this))">Prioritas</button></div>
      <label class="check mt-16" style="display:flex;gap:10px;font-size:13.5px"><input type="checkbox" id="refOk" onchange="document.getElementById('refBtn').disabled=!this.checked"> Mahasiswa sudah setuju dirujuk</label>
      <button class="btn btn-primary btn-block mt-16" id="refBtn" disabled onclick="sendReferral('${id}')">Kirim rujukan</button>
    </div>`;
}
function sendReferral(id) {
  const why = document.getElementById('refWhy').value.trim() || 'Butuh pendampingan psikolog';
  const urgent = document.querySelector('#refUrg button.on').textContent === 'Prioritas';
  const refs = readJSON('rp-referrals', []);
  refs.unshift({ id: 'r' + Date.now(), from: 'Nadia (Teman Pulih)', who: id === 'app' ? 'Mahasiswa (akun demo)' : 'Mahasiswa anonim', reason: why, urgency: urgent ? 'tinggi' : 'sedang', status: 'baru', at: Date.now(), app: id === 'app' });
  writeJSON('rp-referrals', refs);
  if (id === 'app') writeApp(a => { const c = a.chats[ME]; c.messages.push({ from: 'sys', text: 'Nadia merujukmu ke psikolog · tunggu pesan dari Dr. Dian' }); c.unread = true; });
  toast('Rujukan terkirim ke Portal Psikolog', 'ph-arrow-bend-up-right');
  openChatTP(id);
}
function moderate(id, ok, isApp) {
  state.modDone[id] = true;
  if (!ok && isApp) writeApp(a => { (a.hiddenPosts ||= []).push(id); });
  render(); toast(ok ? 'Postingan disetujui' : 'Postingan disembunyikan · penulis ditawari dukungan', ok ? 'ph-check-circle' : 'ph-eye-slash');
}
function setWellbeing(v) { state.wellbeing = v; render(); if (v <= 2) toast('Supervisormu akan menghubungimu', 'ph-heart'); }

// ---------- Boot ----------
window.addEventListener('storage', e => { if (e.key === APP_KEY) { if (state.chat) openChatTP(state.chat); else render(); } });
document.getElementById('clock').textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
setLive(ME, state.live); heartbeat(ME, () => state.live);
render();
