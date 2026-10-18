// ===== RUANG PULIH — PORTAL PSIKOLOG (Dr. Dian Sasmita, demo) =====
// Clients only appear here after booking; their mood data only if they chose to share it.

const ME = 'dian';
const ME_ART = { skin: '#E2B48E', hair: '#2B211C', top: '#2F5A3C', glasses: true };
const SLOTS = ['09.00', '11.00', '13.00', '15.00', '19.00', '20.00'];
const HW_TEMPLATES = [
  { key: 'thought', title: 'Isi Thought Record', note: 'Saat pikiran cemas muncul, tulis lalu tantang.', target: 3, act: 'openThoughtRecord()' },
  { key: 'breath', title: 'Napas kotak setiap pagi', note: 'Empat putaran sebelum mulai kuliah.', target: 5, act: 'openBreathing()' },
  { key: 'gratitude', title: 'Jurnal syukur malam', note: 'Tiga hal baik sebelum tidur.', target: 3, act: 'openGratitude()' },
  { key: 'meditation', title: 'Body scan 10 menit', note: 'Saat sulit tidur.', target: 3, act: "openMeditation('body-scan')" },
];
const DEMO_CLIENTS = [
  { id: 'sari', name: 'Sari', since: 'Agu 2026', sessions: 5, topic: 'Kecemasan akademik', share: true, mood: [2, 3, 3, 4, 3, 4, 4], slot: { date: dk(0), time: '09.00', done: true }, hw: [['Thought Record', 2, 3]], c: '#9DC08B' },
  { id: 'bima', name: 'Bima', since: 'Sep 2026', sessions: 2, topic: 'Burnout & tidur', share: false, slot: { date: dk(0), time: '13.00', done: true }, hw: [['Body scan', 1, 3]], c: '#A3B5BD' },
  { id: 'tasya', name: 'Tasya', since: 'Okt 2026', sessions: 1, topic: 'Relasi keluarga', share: true, mood: [3, 2, 2, 3, 2, 3, 3], slot: { date: dk(1), time: '10.00' }, hw: [], c: '#EFB34A' },
];
const state = {
  page: (location.hash || '#jadwal').slice(1),
  live: readJSON('rp-psy-live', true),
  thread: 'app',
  hwFor: 'app',
  room: null,
};

// ---------- Student from the prototype app ----------
function appClient() {
  const a = readApp();
  if (!a || !a.chats?.[ME]) return null;
  const msgs = a.chats[ME].messages;
  const bookings = (a.bookings || []).filter(b => b.pid === ME).map(b => ({ ...b, date: b.date || dk(b.day === 'Hari ini' ? 0 : 1) })).filter(b => b.date >= dk());
  const moods = (a.moods || []).slice(-7);
  return {
    id: 'app', name: `${a.name} (akun demo)`, since: a.account?.since ? `${MON_ID[k2d(a.account.since).getMonth()]} ${k2d(a.account.since).getFullYear()}` : 'Okt 2026',
    sessions: Math.max(1, msgs.filter(m => m.from === 'sys' && /selesai/i.test(m.text)).length), topic: 'Kecemasan & trauma',
    share: !!a.prefs?.shareWithPsy, mood: moods.map(m => m.v), screening: a.screening, homework: (a.homework || []).filter(h => h.from === ME),
    bookings, unread: msgs.length && msgs[msgs.length - 1].from === 'me', avatar: a.avatar, c: '#DDE7D8', a,
  };
}
const clients = () => [appClient(), ...DEMO_CLIENTS].filter(Boolean);
const clientById = id => clients().find(c => c.id === id);

// ---------- Shell ----------
const PAGES = [
  { id: 'jadwal', label: 'Jadwal', icon: 'calendar-blank', title: 'Jadwal & ketersediaan' },
  { id: 'klien', label: 'Klien', icon: 'users', title: 'Klien' },
  { id: 'pesan', label: 'Pesan', icon: 'chats-circle', title: 'Pesan' },
  { id: 'tugas', label: 'Tugas', icon: 'list-checks', title: 'Tugas untuk klien' },
  { id: 'rujukan', label: 'Rujukan & krisis', icon: 'first-aid', title: 'Rujukan & krisis' },
  { id: 'profil', label: 'Profil & kinerja', icon: 'identification-card', title: 'Profil & kinerja' },
];
function renderNav() {
  const ac = appClient();
  const refs = readJSON('rp-referrals', []).filter(r => r.status === 'baru').length;
  document.getElementById('sideNav').innerHTML = PAGES.map(p => `
    <button class="${state.page === p.id ? 'on' : ''}" onclick="go('${p.id}')" aria-current="${state.page === p.id ? 'page' : 'false'}">
      <i class="${state.page === p.id ? 'ph-fill' : 'ph'} ph-${p.icon}"></i>${p.label}
      ${p.id === 'pesan' && ac?.unread ? '<span class="count">1</span>' : ''}${p.id === 'rujukan' && refs ? `<span class="count">${refs}</span>` : ''}
    </button>`).join('');
  const b = document.getElementById('liveBtn');
  b.className = `live-toggle ${state.live ? 'on' : ''}`;
  b.innerHTML = `<span class="live-dot"></span>${state.live ? 'Online' : 'Offline'}`;
  b.setAttribute('aria-pressed', state.live);
}
function go(id) {
  if (!PAGES.some(p => p.id === id)) id = 'jadwal';
  state.page = id; history.replaceState(null, '', '#' + id); render(); window.scrollTo({ top: 0 });
}
function render() {
  const p = PAGES.find(x => x.id === state.page);
  document.getElementById('pageTitle').textContent = p.title;
  document.getElementById('page').innerHTML = VIEWS[p.id]();
  renderNav();
  if (state.page === 'pesan') { const log = document.getElementById('psyLog'); if (log) log.scrollTop = log.scrollHeight; }
}
function toggleLive() {
  state.live = !state.live; writeJSON('rp-psy-live', state.live); setLive(ME, state.live); renderNav();
  toast(state.live ? 'Online · pesan mahasiswa kamu jawab langsung' : 'Offline · balasan otomatis aktif kembali', state.live ? 'ph-broadcast' : 'ph-moon');
}
document.getElementById('greet').textContent = `${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} · Dr. Dian Sasmita, M.Psi.`;

// ---------- Views ----------
const avatarFor = c => c.id === 'app'
  ? `<span class="av" style="background:${c.c}">${pebbleSvg((c.a.moods?.at(-1)?.v) || 4, 30)}</span>`
  : `<span class="av" style="background:${c.c};font-weight:700;color:#1D2620">${c.name[0]}</span>`;
function sessionsList() {
  const list = DEMO_CLIENTS.map(c => ({ ...c.slot, client: c }));
  const ac = appClient();
  ac?.bookings.forEach(b => list.push({ date: b.date, time: b.time, client: ac }));
  return list.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
}
const VIEWS = {
  jadwal() {
    const all = sessionsList();
    const today = all.filter(s => s.date === dk());
    const later = all.filter(s => s.date > dk());
    const blocked = readJSON('rp-psy-blocked', {})[ME] || {};
    const days = [0, 1, 2, 3, 4].map(dk);
    const row = s => `
      <div class="row list-row">
        <span class="event-date"><b>${s.time.slice(0, 2)}</b><span>${s.time.slice(3)}</span></span>
        ${avatarFor(s.client)}
        <div class="grow"><b>${esc(s.client.name)}</b><p class="tiny">${dayName(s.date)} · ${s.client.topic} · sesi ke-${s.client.sessions + (s.done ? 0 : 1)}</p></div>
        ${s.done ? '<span class="tag">Selesai</span>' : `<button class="btn btn-primary btn-sm" onclick="openRoom('${s.client.id}')"><i class="ph ph-video-camera"></i>Mulai sesi</button>`}
      </div>`;
    return `
      <div class="grid g-3">
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-calendar-check"></i>Sesi hari ini</span><span class="kpi-value">${today.length}</span><span class="tiny">${today.filter(s => !s.done).length} belum dimulai</span></div>
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-users"></i>Klien aktif</span><span class="kpi-value">${clients().length}</span><span class="tiny">dari Ruang Pulih</span></div>
        <div class="card kpi"><span class="kpi-label"><i class="ph ph-star"></i>Penilaian</span><span class="kpi-value">4,9</span><span class="tiny">${124 + (readApp()?.ratings?.[ME]?.done ? 1 : 0)} ulasan anonim</span></div>
      </div>
      <div class="grid g-21 mt">
        <section class="card"><div class="card-h"><div><h3>Hari ini</h3><p>Mahasiswa masuk ruang tunggu 5 menit sebelum sesi</p></div></div>
          ${today.length ? today.map(row).join('') : '<p class="tiny">Tidak ada sesi hari ini.</p>'}
          <div class="card-h" style="margin-top:18px"><div><h3>Berikutnya</h3></div></div>
          ${later.length ? later.map(row).join('') : '<p class="tiny">Belum ada sesi terjadwal.</p>'}
        </section>
        <section class="card"><div class="card-h"><div><h3>Ketersediaan</h3><p>Ketuk slot untuk menutup/membuka · langsung berlaku di aplikasi</p></div></div>
          <div class="avail" role="grid">
            <span></span>${days.map(d => `<b>${dayName(d).replace('Hari ini', 'Hari ini').split(',')[0]}</b>`).join('')}
            ${SLOTS.map(t => `<span class="tiny">${t}</span>${days.map(d => {
              const booked = all.find(s => s.date === d && s.time === t);
              const off = (blocked[d] || []).includes(t);
              return booked ? `<span class="slot booked" title="${esc(booked.client.name)}">${esc(booked.client.name.split(' ')[0])}</span>`
                : `<button class="slot ${off ? 'off' : 'free'}" onclick="toggleSlot('${d}','${t}')" aria-label="${dayName(d)} ${t} ${off ? 'ditutup' : 'tersedia'}">${off ? '<i class="ph ph-x"></i>' : ''}</button>`;
            }).join('')}`).join('')}
          </div>
          <div class="legend"><span><i class="slot-key free"></i>Tersedia</span><span><i class="slot-key off"></i>Ditutup</span><span><i class="slot-key booked"></i>Terisi</span></div>
        </section>
      </div>`;
  },

  klien() {
    return `
      <div class="privacy"><i class="ph-fill ph-lock-key"></i><span><b>Rahasia klinis.</b> Data mood dan Cek Diri hanya muncul bila klien mengizinkan berbagi dengan psikolognya. Catatan sesi hanya terlihat olehmu.</span></div>
      <div class="grid g-3">${clients().map(c => `
        <section class="card client">
          <div class="row">${avatarFor(c)}<div class="grow"><b>${esc(c.name)}</b><p class="tiny">Sejak ${c.since} · ${c.sessions} sesi</p></div></div>
          <p class="tiny mt" style="margin-top:10px">${c.topic}</p>
          <div class="client-mood">${c.share && c.mood?.length ? c.mood.map(v => pebbleSvg(v, 24)).join('') + '<span class="tiny">7 check-in terakhir</span>' : '<span class="tiny"><i class="ph ph-lock-simple"></i> Klien belum membagikan rekap mood</span>'}</div>
          ${c.id === 'app' && c.share && c.screening ? `<p class="tiny">Cek Diri terakhir: <b>${c.screening.score}/12</b></p>` : ''}
          <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="state.thread='${c.id}';go('pesan')"><i class="ph ph-chat-circle"></i>Pesan</button>
            <button class="btn btn-ghost btn-sm" onclick="state.hwFor='${c.id}';go('tugas')"><i class="ph ph-list-checks"></i>Tugas</button>
            <button class="btn btn-ghost btn-sm" onclick="openNotes('${c.id}')"><i class="ph ph-notepad"></i>Catatan</button>
          </div>
        </section>`).join('')}</div>`;
  },

  pesan() {
    const ac = appClient();
    const threads = [
      ...(ac ? [{ id: 'app', name: ac.name, last: ac.a.chats[ME].messages.at(-1)?.text || '', unread: ac.unread }] : []),
      { id: 'sari', name: 'Sari', last: 'Terima kasih dok, minggu ini lebih baik.', unread: false },
      { id: 'tasya', name: 'Tasya', last: 'Boleh tanya soal jadwal besok?', unread: false },
    ];
    const cur = threads.find(t => t.id === state.thread) || threads[0];
    const msgs = cur.id === 'app' ? ac.a.chats[ME].messages : [{ from: 'me', text: cur.last, t: '08.12' }];
    return `
      <div class="chat-split">
        <section class="card" style="padding:8px">${threads.map(t => `
          <button class="thread ${t.id === cur.id ? 'on' : ''}" onclick="state.thread='${t.id}';render()">
            <b>${esc(t.name)}</b><span class="tiny">${esc(t.last.slice(0, 48))}</span>${t.unread ? '<span class="dot"></span>' : ''}</button>`).join('')}
        </section>
        <section class="card chat-pane">
          <div class="card-h"><div><h3>${esc(cur.name)}</h3><p>${state.live ? 'Kamu online · balasan terkirim langsung ke aplikasi' : 'Kamu offline · nyalakan Online agar balasanmu yang dipakai'}</p></div></div>
          <div class="psy-log" id="psyLog">${msgs.map(m => m.from === 'sys' ? `<div class="msg-sys">${esc(m.text)}</div>`
            : `<div class="msg ${m.from === 'me' ? 'them' : 'me'}">${esc(m.text)}${m.t ? `<span class="tiny" style="display:block;opacity:.7">${m.t}</span>` : ''}</div>`).join('')}</div>
          <div class="chips-row">${['Terima kasih sudah bercerita.', 'Apa yang paling berat minggu ini?', 'Mari kita bahas di sesi berikutnya.'].map(q => `<button class="view-toggle" onclick="document.getElementById('psyIn').value='${q}'">${q}</button>`).join('')}</div>
          <div class="drawer-f" style="padding:12px 0 0;border:0"><input class="field" id="psyIn" placeholder="Tulis balasan…" onkeydown="if(event.key==='Enter')sendPsy('${cur.id}')"><button class="btn btn-primary" onclick="sendPsy('${cur.id}')" aria-label="Kirim"><i class="ph-fill ph-paper-plane-right"></i></button></div>
        </section>
      </div>`;
  },

  tugas() {
    const cl = clients();
    const c = cl.find(x => x.id === state.hwFor) || cl[0];
    const hw = c.id === 'app' ? c.homework.map(h => [h.title, Math.min(h.done, h.target), h.target]) : c.hw;
    return `
      <div class="filters"><span class="tiny">Untuk klien:</span>
        <div class="seg">${cl.map(x => `<button class="${x.id === c.id ? 'on' : ''}" onclick="state.hwFor='${x.id}';render()">${esc(x.name.split(' (')[0])}</button>`).join('')}</div></div>
      <div class="grid g-2">
        <section class="card"><div class="card-h"><div><h3>Beri tugas</h3><p>Muncul di Beranda klien dengan progres</p></div></div>
          ${HW_TEMPLATES.map((t, i) => `<div class="row list-row"><span class="av" style="background:var(--forest-tint);color:var(--forest)"><i class="ph ph-list-checks" style="font-size:18px"></i></span>
            <div class="grow"><b>${t.title}</b><p class="tiny">${t.note} · ${t.target}× dalam 7 hari</p></div>
            <button class="btn btn-primary btn-sm" onclick="assignHw('${c.id}',${i})">Beri</button></div>`).join('')}
        </section>
        <section class="card"><div class="card-h"><div><h3>Progres ${esc(c.name.split(' (')[0])}</h3><p>${c.id === 'app' ? 'Langsung dari aplikasi klien' : 'Data demo'}</p></div></div>
          ${hw.length ? hw.map(([t, d, n]) => `<div class="list-row"><div class="row"><b class="grow">${t}</b><span class="tiny">${d} dari ${n}</span></div><div class="quota" style="margin-top:8px;height:10px"><span style="width:${d / n * 100}%"></span></div></div>`).join('') : '<p class="tiny">Belum ada tugas.</p>'}
        </section>
      </div>`;
  },

  rujukan() {
    const refs = readJSON('rp-referrals', []);
    return `
      <div class="grid g-21">
        <section class="card"><div class="card-h"><div><h3>Rujukan masuk</h3><p>Dari Teman Pulih, dengan izin mahasiswa</p></div></div>
          ${[...refs, { id: 'demo', from: 'Raka (Teman Pulih)', who: 'Mahasiswa · School of Design', reason: 'Cemas berkepanjangan sejak UTS, sulit tidur 2 minggu', urgency: 'sedang', status: 'baru', at: Date.now() - 3 * 3600e3 }].map(r => `
            <div class="row list-row">
              <span class="av" style="background:${r.urgency === 'tinggi' ? 'var(--serious-tint)' : 'var(--warn-tint)'};color:${r.urgency === 'tinggi' ? 'var(--serious)' : 'var(--warn)'}"><i class="ph-fill ph-${r.urgency === 'tinggi' ? 'warning-octagon' : 'arrow-bend-down-right'}" style="font-size:18px"></i></span>
              <div class="grow"><b>${esc(r.who)}</b> <span class="tag">${r.urgency === 'tinggi' ? 'Prioritas' : 'Rutin'}</span><p class="tiny">${esc(r.reason)} · dari ${esc(r.from)}</p></div>
              ${r.status === 'baru' ? `<button class="btn btn-primary btn-sm" onclick="acceptRef('${r.id}')">Terima</button>` : `<span class="tag tag-forest">${r.status}</span>`}
            </div>`).join('')}
        </section>
        <section class="card"><div class="card-h"><div><h3>Protokol krisis</h3><p>Saat klien menunjukkan risiko segera</p></div></div>
          <ol class="protocol">
            <li><b>Tetap bersama klien.</b> Jangan akhiri percakapan; tanyakan langsung soal keselamatan.</li>
            <li><b>Nilai risiko.</b> Rencana, alat, waktu. Catat di catatan sesi.</li>
            <li><b>Rencana keselamatan.</b> Buat bersama; hubungi kontak tepercaya bila klien setuju.</li>
            <li><b>Eskalasi.</b> Risiko tinggi: 119 ext. 8 atau 112. Kampus tidak diberi tahu tanpa izin klien.</li>
            <li><b>Tindak lanjut 24 jam.</b> Jadwalkan kontak berikutnya.</li>
          </ol>
          <a class="btn btn-ghost btn-sm" href="tel:119"><i class="ph ph-phone"></i>119 ext. 8</a>
        </section>
      </div>`;
  },

  profil() {
    const rated = readApp()?.ratings?.[ME]?.done ? 1 : 0;
    return `
      <div class="grid g-2">
        <section class="card"><div class="row"><span class="av" style="width:64px;height:64px;border-radius:20px">${psyPortrait()}</span>
          <div class="grow"><h3 class="page-h" style="font-size:24px">Dr. Dian Sasmita, M.Psi.</h3><p class="tiny">Psikolog klinis · 9 tahun praktik · CBT</p></div></div>
          <div class="row list-row" style="margin-top:12px"><span class="grow muted">STR / SIPP</span><span class="tag tag-forest"><i class="ph-fill ph-seal-check"></i>Terverifikasi HIMPSI · s.d. Mar 2028</span></div>
          <div class="row list-row"><span class="grow muted">Spesialisasi</span><b>Kecemasan, trauma</b></div>
          <div class="row list-row"><span class="grow muted">Tarif</span><b>Rp150.000 / sesi</b></div>
        </section>
        <section class="card"><div class="card-h"><div><h3>Oktober 2026</h3><p>Ringkasan kinerja</p></div></div>
          <div class="grid g-2">
            <div class="kpi"><span class="kpi-label">Sesi selesai</span><span class="kpi-value">38</span></div>
            <div class="kpi"><span class="kpi-label">Penilaian</span><span class="kpi-value">4,9<small>/ 5 · ${124 + rated}</small></span></div>
            <div class="kpi"><span class="kpi-label">Pendapatan</span><span class="kpi-value" style="font-size:26px">Rp3,99 jt</span><span class="tiny">70% dari tarif · dibayar tiap tanggal 5</span></div>
            <div class="kpi"><span class="kpi-label">Klien kembali</span><span class="kpi-value">71%</span></div>
          </div>
        </section>
      </div>`;
  },
};
function psyPortrait() {
  const p = ME_ART, ink = '#1D2620';
  return `<svg viewBox="0 0 48 48" aria-hidden="true" style="width:100%;height:100%"><rect width="48" height="48" fill="#DDE7D8"/><path d="M13 21c0-9 5-14 11-14s11 5 11 14v13c-4 2-18 2-22 0z" fill="${p.hair}"/><path d="M7 50c0-11 7-18 17-18s17 7 17 18z" fill="${p.top}"/><rect x="21" y="27" width="6" height="7" rx="2" fill="${p.skin}"/><ellipse cx="24" cy="21" rx="8.4" ry="9.6" fill="${p.skin}"/><path d="M15 19c1.2-6 4.8-9.4 9-9.4s7.8 3.4 9 9.4c-2.6-3.2-5.6-4.6-9-4.6s-6.4 1.4-9 4.6z" fill="${p.hair}"/><circle cx="20.6" cy="20.5" r="1.15" fill="${ink}"/><circle cx="27.4" cy="20.5" r="1.15" fill="${ink}"/><path d="M21.6 25q2.4 1.8 4.8 0" stroke="${ink}" stroke-width="1.2" fill="none" stroke-linecap="round"/><g stroke="${ink}" stroke-width=".9" fill="none" opacity=".8"><circle cx="20.6" cy="20.6" r="2.7"/><circle cx="27.4" cy="20.6" r="2.7"/><path d="M23.3 20.6h1.4"/></g></svg>`;
}
document.getElementById('meAv').innerHTML = psyPortrait();

// ---------- Actions ----------
// Re-assigning a task the client already has restarts it instead of adding a duplicate.
function upsertHw(a, t, i = '') {
  a.homework ||= [];
  const cur = a.homework.find(h => h.from === ME && h.key === t.key);
  if (cur) Object.assign(cur, { done: 0, target: t.target, title: t.title, note: t.note });
  else a.homework.push({ id: 'hw-' + Date.now() + i, key: t.key, from: ME, title: t.title, note: t.note, target: t.target, done: 0, act: t.act });
}
function toggleSlot(d, t) {
  const all = readJSON('rp-psy-blocked', {}); const mine = all[ME] ||= {}; const day = mine[d] ||= [];
  const i = day.indexOf(t); i >= 0 ? day.splice(i, 1) : day.push(t);
  writeJSON('rp-psy-blocked', all); render();
  toast(i >= 0 ? `${dayName(d)} ${t} dibuka` : `${dayName(d)} ${t} ditutup`, i >= 0 ? 'ph-check' : 'ph-prohibit');
}
function sendPsy(id) {
  const input = document.getElementById('psyIn'); const text = input.value.trim(); if (!text) return;
  if (id !== 'app') { input.value = ''; return toast('Klien demo · pesan tidak dikirim', 'ph-info'); }
  writeApp(a => { const c = a.chats[ME]; c.messages.push({ from: 'them', text, t: nowT() }); c.unread = true; });
  render(); toast('Terkirim ke aplikasi klien', 'ph-paper-plane-tilt');
}
function assignHw(cid, i) {
  const t = HW_TEMPLATES[i];
  if (cid !== 'app') return toast(`Tugas "${t.title}" diberikan (klien demo)`, 'ph-check');
  writeApp(a => {
    upsertHw(a, t);
    a.homeworkDue = dk(7);
    a.chats[ME].messages.push({ from: 'sys', text: `Dr. Dian memberi tugas baru: ${t.title}` });
  });
  render(); toast(`Tugas "${t.title}" muncul di Beranda klien`, 'ph-list-checks');
}
function acceptRef(id) {
  if (id === 'demo') return toast('Rujukan demo diterima', 'ph-check');
  const refs = readJSON('rp-referrals', []); const r = refs.find(x => x.id === id); if (!r) return;
  r.status = 'diterima'; writeJSON('rp-referrals', refs);
  if (r.app) writeApp(a => {
    a.chats[ME] ||= { unread: true, messages: [] };
    a.chats[ME].messages.push({ from: 'sys', text: 'Rujukan dari Teman Pulih diterima' }, { from: 'them', text: `Halo ${a.name}, saya Dr. Dian. ${r.from.split(' ')[0]} dari Teman Pulih bercerita sedikit tentang yang kamu alami, dengan izinmu. Mau kita jadwalkan sesi perkenalan?`, t: nowT() });
    a.chats[ME].unread = true;
  });
  render(); toast('Rujukan diterima · klien diberi tahu', 'ph-check-circle');
}
function openNotes(cid) {
  const c = clientById(cid); const notes = readJSON('rp-psy-notes', {})[cid] || [];
  openDrawer(`Catatan · ${esc(c.name.split(' (')[0])}`, `
    <p class="tiny"><i class="ph ph-lock-key"></i> Hanya terlihat olehmu. Tidak dibagikan ke klien, kampus, atau Teman Pulih.</p>
    ${notes.length ? notes.slice().reverse().map(n => `<div class="card" style="margin-top:12px;box-shadow:none;background:var(--surface)"><p class="tiny">${n.date}</p>${['S', 'O', 'A', 'P'].map(k => n[k] ? `<p style="font-size:13.5px;margin-top:4px"><b>${k}:</b> ${esc(n[k])}</p>` : '').join('')}</div>`).join('')
      : `<p class="tiny" style="margin-top:12px">${cid === 'sari' ? 'S: Cemas menjelang presentasi berkurang. A: Kemajuan baik. P: Lanjut exposure bertahap.' : 'Belum ada catatan.'}</p>`}`);
}

// ---------- Session room ----------
let roomTimer = null;
function openRoom(cid) {
  const c = clientById(cid);
  state.room = { cid, start: Date.now(), mic: true, cam: true, hw: [] };
  const el = document.getElementById('room');
  el.innerHTML = `
    <div class="room-main">
      <div class="room-top"><span class="tag" style="background:rgba(255,255,255,.12);color:#fff"><span class="live-dot"></span>Sesi berlangsung · <span id="roomTime">00:00</span></span><span class="tiny" style="color:#cfd8cf">Terenkripsi end-to-end</span></div>
      <div class="room-video">
        <div class="room-client">${c.id === 'app' ? pebbleSvg(c.a.moods?.at(-1)?.v || 4, 120) : `<span class="room-initial" style="background:${c.c}">${c.name[0]}</span>`}<p>${esc(c.name.split(' (')[0])}</p><span class="tiny" style="color:#cfd8cf">Kamera mati · audio aktif</span></div>
        <div class="room-self" id="roomSelf">${psyPortrait()}</div>
      </div>
      <div class="room-controls">
        <button id="rMic" onclick="roomToggle('mic')" aria-label="Mikrofon"><i class="ph-fill ph-microphone"></i></button>
        <button id="rCam" onclick="roomToggle('cam')" aria-label="Kamera"><i class="ph-fill ph-video-camera"></i></button>
        <button onclick="toast('Berbagi layar (simulasi)','ph-screencast')" aria-label="Bagikan layar"><i class="ph ph-screencast"></i></button>
        <button class="end" onclick="endRoom()" aria-label="Akhiri sesi"><i class="ph-fill ph-phone-x"></i>Akhiri</button>
      </div>
    </div>
    <aside class="room-side">
      <h3 class="page-h" style="font-size:20px">${esc(c.name.split(' (')[0])}</h3>
      <p class="tiny">${c.topic} · sesi ke-${c.sessions + 1}</p>
      ${c.id === 'app' ? `<div class="notice-room"><i class="ph ph-note"></i><span>Catatan ruang tunggu dari klien: "${esc(c.a.chats[ME].messages.filter(m => m.from === 'me').at(-1)?.text || 'Belum ada catatan.')}"</span></div>` : ''}
      <p class="set-label">Catatan sesi (pribadi)</p>
      ${['S · Subjektif', 'O · Objektif', 'A · Asesmen', 'P · Rencana'].map((l, i) => `<label class="tiny">${l}</label><textarea class="field soap" data-k="${'SOAP'[i]}" rows="2"></textarea>`).join('')}
      <p class="set-label">Ringkasan untuk klien</p>
      <textarea class="field soap" id="roomSummary" rows="3">Terima kasih untuk sesi hari ini. Kita membahas pemicu cemasmu dan mencoba napas kotak bersama. Sampai sesi berikutnya, coba tugas kecil di bawah ini.</textarea>
      <p class="set-label">Tugas setelah sesi</p>
      <div class="chips-row">${HW_TEMPLATES.map((t, i) => `<button class="view-toggle" id="rHw${i}" onclick="roomHw(${i})">${t.title}</button>`).join('')}</div>
    </aside>`;
  el.classList.add('show');
  clearInterval(roomTimer);
  roomTimer = setInterval(() => { const s = Math.floor((Date.now() - state.room.start) / 1000); const t = document.getElementById('roomTime'); if (t) t.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
}
function roomToggle(k) {
  state.room[k] = !state.room[k];
  const b = document.getElementById(k === 'mic' ? 'rMic' : 'rCam');
  b.classList.toggle('off', !state.room[k]);
  b.innerHTML = `<i class="ph-fill ph-${k === 'mic' ? (state.room.mic ? 'microphone' : 'microphone-slash') : (state.room.cam ? 'video-camera' : 'video-camera-slash')}"></i>`;
  if (k === 'cam') document.getElementById('roomSelf').style.opacity = state.room.cam ? 1 : .25;
}
function roomHw(i) {
  const h = state.room.hw; const j = h.indexOf(i); j >= 0 ? h.splice(j, 1) : h.push(i);
  document.getElementById('rHw' + i).classList.toggle('on', j < 0);
}
function endRoom() {
  const { cid, hw } = state.room;
  const notes = {}; document.querySelectorAll('.soap[data-k]').forEach(t => { notes[t.dataset.k] = t.value.trim(); });
  const all = readJSON('rp-psy-notes', {}); (all[cid] ||= []).push({ date: dayName(dk()), ...notes }); writeJSON('rp-psy-notes', all);
  const summary = document.getElementById('roomSummary').value.trim();
  if (cid === 'app') writeApp(a => {
    const c = a.chats[ME];
    c.messages.push({ from: 'sys', text: `Sesi selesai · ${dayName(dk())}` });
    if (summary) c.messages.push({ from: 'them', text: summary, t: nowT() });
    hw.forEach(i => upsertHw(a, HW_TEMPLATES[i], i));
    if (hw.length) a.homeworkDue = dk(7);
    const bi = (a.bookings || []).findIndex(b => b.pid === ME);
    if (bi >= 0) a.bookings.splice(bi, 1);
    c.unread = true;
  });
  clearInterval(roomTimer);
  document.getElementById('room').classList.remove('show');
  state.room = null; render();
  toast(cid === 'app' ? 'Sesi selesai · ringkasan & tugas terkirim ke klien' : 'Sesi selesai (klien demo)', 'ph-check-circle');
}

// ---------- Drawer ----------
function openDrawer(title, body) {
  const d = document.getElementById('drawer');
  d.innerHTML = `<div class="drawer-h"><h3 class="page-h" style="font-size:22px">${title}</h3><button class="close" onclick="closeDrawer()" aria-label="Tutup"><i class="ph ph-x"></i></button></div><div class="drawer-b">${body}</div>`;
  d.classList.add('show'); document.getElementById('scrim').classList.add('show');
}
function closeDrawer() { document.getElementById('drawer').classList.remove('show'); document.getElementById('scrim').classList.remove('show'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

// ---------- Boot ----------
window.addEventListener('storage', e => { if ((e.key === APP_KEY || e.key === 'rp-referrals') && !state.room) render(); });
window.addEventListener('hashchange', () => go(location.hash.slice(1)));
setLive(ME, state.live); heartbeat(ME, () => state.live);
go(state.page);
