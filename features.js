// ===== RUANG PULIH — FEATURES v6 =====
// Notification centre · early care nudge · homework · 7-day program · weekly recap ·
// reflection journal · badges · reschedule & calendar · referral / ambassador codes · English UI.

state.toolLog.journal ||= [];
state.program ||= null;            // { id, started, done: [dayIndex], tasks: { [day]: { lesson, practice } }, finished }
state.badges ||= [];
state.referredBy ||= null;
state.referrals ??= 2;             // demo: friends who joined with your code
state.recapViewed ||= false;
state.nudgeSnooze ||= null;

// ---------- Notification centre ----------
const TONES = { clay: ['var(--clay-tint)', 'var(--clay)'], forest: ['var(--forest-tint)', 'var(--forest)'], amber: ['var(--amber-tint)', '#8A5B0E'], dusk: ['var(--sunken)', 'var(--ink-2)'] };
if (!state.notifs) {
  const h = 3600e3, now = Date.now();
  state.notifs = [
    { id: 'n-recap', icon: 'ph-chart-line', tone: 'forest', text: 'Rekap mingguanmu sudah siap. Lihat pola minggu ini.', at: now - .5 * h, read: false, act: 'openRecap()' },
    { id: 'n-hug', icon: 'ph-hand-heart', tone: 'clay', text: '12 orang memeluk cerita di Lingkar Pulih yang kamu ikuti.', at: now - 2 * h, read: false, act: "go('community')" },
    { id: 'n-dian', icon: 'ph-chat-circle', tone: 'forest', text: 'Dr. Dian mengirim pesan untukmu.', at: now - 5 * h, read: true, act: "openChat('dian')" },
    { id: 'n-checkin', icon: 'ph-sun', tone: 'amber', text: 'Sudah check-in hari ini? Cukup 10 detik.', at: now - 8 * h, read: true, act: "closeSheet();go('home')" },
  ];
}
const unreadNotifs = () => state.notifs.filter(n => !n.read).length;
function notify(text, icon = 'ph-bell-simple', tone = 'forest', act = '') {
  state.notifs.unshift({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), icon, tone, text, at: Date.now(), read: false, act });
  state.notifs = state.notifs.slice(0, 30);
  persist(); renderTopbar();
}
const agoText = ts => { const m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? `${m} mnt lalu` : m < 1440 ? `${Math.round(m / 60)} j lalu` : `${Math.round(m / 1440)} h lalu`; };
function openNotifications() {
  const item = n => { const [bg, fg] = TONES[n.tone] || TONES.dusk; return `
    <button class="list-item notif ${n.read ? '' : 'unread'}" onclick="openNotif('${n.id}')">
      <span class="li-ic" style="background:${bg};color:${fg}"><i class="ph ${n.icon}"></i></span>
      <div class="grow"><p style="font-size:14px">${esc(n.text)}</p><p class="tiny">${agoText(n.at)}</p></div>
      ${n.read ? '' : '<span class="unread-dot" aria-label="Belum dibaca"></span>'}
    </button>`; };
  const fresh = state.notifs.filter(n => !n.read), old = state.notifs.filter(n => n.read);
  openSheet({
    kind: 'notifs',
    title: `<h2 class="h2">Notifikasi</h2>${fresh.length ? '<button class="link" onclick="readAllNotifs()">Tandai semua dibaca</button>' : ''}`,
    body: `
      ${fresh.length ? `<p class="set-group-title">Baru</p><div class="list">${fresh.map(item).join('')}</div>` : ''}
      ${old.length ? `<p class="set-group-title ${fresh.length ? 'mt-20' : ''}">Sebelumnya</p><div class="list">${old.map(item).join('')}</div>` : ''}
      ${state.notifs.length ? '' : `<div class="card card-sunken empty">${ILLO.notes()}Belum ada notifikasi.</div>`}`,
  });
}
function openNotif(id) {
  const n = state.notifs.find(x => x.id === id); if (!n) return;
  n.read = true; persist(); renderTopbar();
  if (n.act) { closeSheet(); setTimeout(() => new Function(n.act)(), 60); } else openNotifications();
}
function readAllNotifs() { state.notifs.forEach(n => { n.read = true; }); persist(); renderTopbar(); openNotifications(); }

// ---------- Early care nudge ----------
function careNudgeReason() {
  if (state.nudgeSnooze && state.nudgeSnooze > dayKey()) return null;
  const start = todayMood() ? 0 : -1;
  const low = [0, 1, 2].every(k => (moodOn(dayKey(start - k))?.v || 5) <= 2);
  if (low) return { kind: 'mood', text: 'Tiga hari terakhir terasa berat.' };
  const sc = state.screening;
  if (sc && sc.score >= 6 && (Date.now() - keyToDate(sc.date)) / 864e5 <= 7) return { kind: 'check', text: `Hasil Cek Diri-mu ${sc.score >= 9 ? 'berat' : 'sedang'} minggu ini.` };
  return null;
}
function careNudgeCard() {
  const r = careNudgeReason();
  if (!r) return '';
  const veryLow = todayMood()?.v === 1 || state.screening?.score >= 9;
  return `
    <div class="card nudge mt-16" role="status">
      <div class="row" style="align-items:flex-start">
        <span class="nudge-ic">${pebble(2).replace('class="pebble"', 'class="pebble" style="width:40px;height:40px"')}</span>
        <div class="grow"><p class="h3" style="font-size:15.5px">${r.text} Kamu tidak harus melewatinya sendiri.</p>
          <p class="tiny mt-8">Mau ditemani? Pilih yang paling nyaman — semuanya rahasia.</p></div>
      </div>
      <div class="nudge-actions">
        <button class="btn btn-primary btn-sm" onclick="go('support',{supportTab:'peer'})"><i class="ph ph-chats-circle"></i>Teman Pulih</button>
        <button class="btn btn-light btn-sm" onclick="go('support',{supportTab:'psy'})"><i class="ph ph-user-circle"></i>Psikolog</button>
        <button class="btn btn-light btn-sm" onclick="openBreathing()"><i class="ph ph-wind"></i>Napas dulu</button>
      </div>
      <div class="row mt-12" style="justify-content:space-between">
        ${veryLow ? '<button class="link" style="color:var(--clay)" onclick="openSOS()"><i class="ph-fill ph-lifebuoy"></i> Merasa tidak aman? Buka SOS</button>' : '<span></span>'}
        <button class="link" style="color:var(--ink-2)" onclick="snoozeNudge()">Nanti saja</button>
      </div>
    </div>`;
}
function snoozeNudge() { state.nudgeSnooze = dayKey(3); persist(); renderHome(); toast('Kami tanya lagi dalam 3 hari. Kamu bisa cari dukungan kapan saja.', 'ph-heart'); }

// ---------- Homework from sessions ----------
if (!state.homework && state.chats.dian) {
  state.homework = [
    { id: 'hw-thought', key: 'thought', from: 'dian', title: 'Isi Thought Record', note: 'Saat pikiran cemas muncul, tulis lalu tantang.', target: 3, done: 0, act: 'openThoughtRecord()' },
    { id: 'hw-breath', key: 'breath', from: 'dian', title: 'Napas kotak setiap pagi', note: 'Empat putaran sebelum mulai kuliah.', target: 5, done: 0, act: 'openBreathing()' },
  ];
  state.homeworkDue = dayKey(7);
  state.chats.dian.messages.push({ from: 'sys', text: 'Dr. Dian memberi 2 tugas kecil · lihat di Beranda' });
}
state.homework ||= [];
function homeworkCard() {
  const open = state.homework.filter(h => h.done < h.target);
  if (!state.homework.length) return '';
  const p = provider(state.homework[0].from);
  const due = state.homeworkDue ? (() => { const d = keyToDate(state.homeworkDue); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; })() : '';
  return `
    <div class="section">
      <div class="section-head"><h3 class="h2">Tugas dari sesi</h3><span class="tiny">sampai ${due}</span></div>
      <div class="card hw-card">
        <div class="row">${avatarHTML(p, 'sm')}<div class="grow"><p class="h3" style="font-size:14.5px">${esc(p.name)}</p><p class="tiny">${open.length ? `${open.length} tugas berjalan · progres terlihat oleh psikologmu` : 'Semua tugas selesai — hebat!'}</p></div></div>
        ${state.homework.map(h => `
          <div class="hw-item ${h.done >= h.target ? 'done' : ''}">
            <div class="grow"><p style="font-size:14.5px;font-weight:600">${h.title}</p><p class="tiny">${h.note}</p>
              <div class="hw-bar"><span style="width:${Math.min(100, h.done / h.target * 100)}%"></span></div>
              <p class="tiny mt-8">${Math.min(h.done, h.target)} dari ${h.target}</p></div>
            ${h.done >= h.target ? '<span class="hw-check"><i class="ph ph-check"></i></span>' : `<button class="btn btn-soft btn-sm" onclick="${h.act}">Kerjakan</button>`}
          </div>`).join('')}
      </div>
    </div>`;
}
function progressHomework(key) {
  const h = state.homework.find(x => x.key === key && x.done < x.target);
  if (!h) return;
  h.done++;
  if (h.done === h.target) {
    notify(`Tugas "${h.title}" selesai. ${provider(h.from).short} akan melihat progresmu di sesi berikutnya.`, 'ph-check-circle', 'forest', "closeSheet();go('home')");
    toast(`Tugas selesai: ${h.title}`, 'ph-check-circle');
  }
  persist();
}

// ---------- Hook for anything that completes a tool ----------
function onToolLogged(key) {
  progEvent(key);
  progressHomework(key);
  checkBadges();
}

// ---------- 7-day program ----------
const PROGRAM = {
  id: 'cemas', title: 'Kenali cemasmu', sub: '7 hari · 10–15 menit per hari',
  days: [
    // [label, how to open it, what counts as finished]
    { title: 'Kenapa tubuh terasa cemas', lesson: ['Video: Deg-degan sebelum presentasi', "openVideo('v-present')", 'video:v-present', 'Tonton sampai selesai'], practice: ['Napas kotak 4 menit', 'openBreathing()', 'breath', 'Selesaikan 4 putaran'] },
    { title: 'Kenali pikiran otomatis', lesson: ['Bacaan: Mengisi Thought Record', "openArticle('thought-record')", 'article:thought-record', 'Baca lalu jawab cek pemahaman'], practice: ['Check-in suasana hati', "closeSheet();go('home')", 'checkin', 'Simpan check-in hari ini'] },
    { title: 'Tantang pikiranmu', lesson: ['Thought Record interaktif', 'openThoughtRecord()', 'thought', 'Isi sampai langkah terakhir'], practice: ['Body scan 10 menit', "openMeditation('body-scan')", 'meditation', 'Selesaikan timer'] },
    { title: 'Mitos & fakta', lesson: ['Kuis: mitos atau fakta?', 'openQuiz()', 'quiz', 'Jawab kelima kartu'], practice: ['Loving-kindness 8 menit', "openMeditation('kindness')", 'meditation', 'Selesaikan timer'] },
    { title: 'Batasan yang sehat', lesson: ['Bacaan: Batasan tanpa rasa bersalah', "openArticle('boundary')", 'article:boundary', 'Baca lalu jawab cek pemahaman'], practice: ['Susun kalimat batasanmu', 'openBoundary()', 'boundary', 'Simpan atau salin kalimatmu'] },
    { title: 'Tidur & pemulihan', lesson: ['Video: Tidur nyenyak di musim ujian', "openVideo('v-sleep')", 'video:v-sleep', 'Tonton sampai selesai'], practice: ['Jurnal syukur', 'openGratitude()', 'gratitude', 'Simpan jurnalmu'] },
    { title: 'Lihat kemajuanmu', lesson: ['Cek Diri', 'openSelfCheck()', 'check', 'Sampai muncul hasil'], practice: ['Rekap mingguan', 'openRecap()', 'recap', 'Tekan "Selesai melihat rekap"'] },
  ],
};
const progDone = () => state.program?.done.length || 0;
function programCard(compact = false) {
  const p = state.program;
  const n = progDone();
  if (compact) {
    if (!p || p.finished) return '';
    return `
      <div class="section">
        <button class="card prog-mini" onclick="openProgram()">
          <span class="prog-ring" style="--p:${n / 7 * 100}"><b>${n}/7</b></span>
          <div class="grow"><p class="tiny">Program 7 hari</p><p class="h3" style="font-size:15px">${PROGRAM.title} · Hari ${Math.min(n + 1, 7)}</p><p class="tiny">${PROGRAM.days[Math.min(n, 6)].title}</p></div>
          <span class="play"><i class="ph-fill ph-play"></i></span>
        </button>
      </div>`;
  }
  return `
    <div class="section">
      <div class="card prog-card">
        <div class="prog-art">${TOOL_ART.meditate()}</div>
        <span class="tag" style="background:rgba(255,255,255,.65);color:#1F3D29"><i class="ph-fill ph-path"></i>Program 7 hari</span>
        <h3 class="h2 mt-12" style="color:#1D2620">${PROGRAM.title}</h3>
        <p style="font-size:13.5px;color:#1D2620;opacity:.75;margin-top:4px">${PROGRAM.sub}</p>
        <div class="prog-dots" aria-label="${n} dari 7 hari selesai">${PROGRAM.days.map((_, i) => `<span class="${i < n ? 'on' : i === n ? 'now' : ''}"></span>`).join('')}</div>
        <button class="btn btn-primary btn-sm mt-12" onclick="${p ? 'openProgram()' : 'startProgram()'}">${!p ? 'Mulai program' : p.finished ? 'Lihat sertifikat' : `Lanjutkan · Hari ${n + 1}`}</button>
      </div>
    </div>`;
}
function startProgram() {
  state.program = { id: PROGRAM.id, started: dayKey(), done: [], tasks: {}, finished: false };
  persist(); notify(`Program "${PROGRAM.title}" dimulai. Hari 1 sudah terbuka.`, 'ph-path', 'forest', 'openProgram()');
  openProgram(); if (ui.tab === 'learn') renderLearn();
}
function openProgram() {
  const p = state.program; if (!p) return startProgram();
  if (p.finished) return openCertificate();
  const n = progDone();
  openSheet({
    kind: 'program', full: true,
    title: `<h2 class="h2">${PROGRAM.title}</h2>`,
    body: `
      <div class="tool-cover" style="--tc:var(--m4)">${TOOL_ART.meditate()}</div>
      <div class="row mt-16"><div class="grow"><p class="h3">${n} dari 7 hari selesai</p><p class="tiny">Satu hari terbuka setelah hari sebelumnya selesai. Di aplikasi asli, hari berikutnya terbuka keesokan harinya.</p></div></div>
      <div class="hw-bar mt-12"><span style="width:${n / 7 * 100}%"></span></div>
      <div class="list mt-16">${PROGRAM.days.map((d, i) => {
        const st = i < n ? 'done' : i === n ? 'now' : 'lock';
        return `<button class="list-item prog-day ${st}" ${st === 'lock' ? 'disabled' : ''} onclick="openProgramDay(${i})">
          <span class="li-ic">${st === 'done' ? '<i class="ph ph-check"></i>' : st === 'lock' ? '<i class="ph ph-lock-simple"></i>' : `<b>${i + 1}</b>`}</span>
          <div class="grow"><p class="tiny">Hari ${i + 1}</p><p style="font-size:15px;font-weight:600">${d.title}</p></div>
          ${st === 'now' ? '<span class="tag tag-amber">Hari ini</span>' : ''}<i class="ph ph-caret-right chev"></i></button>`;
      }).join('')}</div>`,
  });
}
function openProgramDay(i) {
  if (ui.programCtx) { ui.programCtx = null; showProgReturn(); }
  const d = PROGRAM.days[i], p = state.program;
  const t = p.tasks[i] ||= { lesson: false, practice: false };
  const done = p.done.includes(i);
  const task = (k, label, [name, , , how]) => `
    <div class="prog-task ${t[k] ? 'done' : ''}">
      <span class="prog-check" aria-label="${t[k] ? 'Selesai' : 'Belum selesai'}">${t[k] ? '<i class="ph ph-check"></i>' : ''}</span>
      <div class="grow"><p class="tiny">${label}</p><p style="font-size:15px;font-weight:600">${name}</p><p class="tiny">${t[k] ? 'Selesai ✓' : `Selesai bila: ${how.toLowerCase()}`}</p></div>
      <button class="btn ${t[k] ? 'btn-ghost' : 'btn-soft'} btn-sm" onclick="startProgTask(${i},'${k}')">${t[k] ? 'Ulangi' : 'Mulai'}</button>
    </div>`;
  openSheet({
    kind: 'program-day',
    title: `<h2 class="h2">Hari ${i + 1}</h2>`,
    body: `
      <p class="h2" style="font-size:22px">${d.title}</p>
      <p class="tiny mt-8">Selesaikan dua langkah ini. Tanda centang muncul otomatis saat langkahnya benar-benar selesai, lalu kamu kembali ke sini.</p>
      <div class="mt-16 stack-8">${task('lesson', 'Pelajari', d.lesson)}${task('practice', 'Praktikkan', d.practice)}</div>
      ${done ? '<p class="tiny mt-16" style="text-align:center">Hari ini sudah selesai ✓</p>'
        : `<button class="btn btn-primary btn-block mt-20" ${t.lesson && t.practice ? '' : 'disabled'} onclick="completeProgDay(${i})">Selesaikan hari ${i + 1}</button>`}
      <button class="btn btn-ghost btn-block mt-8" onclick="openProgram()">Kembali ke program</button>`,
  });
}
function toggleProgTask(i, k) { const t = state.program.tasks[i] ||= { lesson: false, practice: false }; t[k] = !t[k]; persist(); openProgramDay(i); }
// ---------- Program step in progress: completion + way back ----------
ui.programCtx = null;
function startProgTask(i, k) {
  state.program.tasks[i] ||= { lesson: false, practice: false };
  ui.programCtx = { day: i, task: k, key: PROGRAM.days[i][k][2] };
  closeSheet();
  setTimeout(() => { new Function(PROGRAM.days[i][k][1])(); showProgReturn(); }, 60);
}
// Called by videos, quizzes, article checks and tools when something is finished.
function progEvent(key) {
  const c = ui.programCtx;
  if (!c || c.key !== key || !state.program) return;
  state.program.tasks[c.day] ||= { lesson: false, practice: false };
  state.program.tasks[c.day][c.task] = true;
  persist();
  ui.programCtx = null; showProgReturn();
  setTimeout(() => { toast('Langkah selesai ✓ Kembali ke program', 'ph-check-circle'); openProgramDay(c.day); }, 1600);
}
function backToProgram() {
  const c = ui.programCtx; if (!c) return;
  ui.programCtx = null; showProgReturn();
  openProgramDay(c.day);
}
function showProgReturn() {
  let el = document.getElementById('progReturn');
  if (!el) { el = document.createElement('button'); el.id = 'progReturn'; el.className = 'prog-return'; el.onclick = backToProgram; document.getElementById('app').appendChild(el); }
  const c = ui.programCtx;
  el.classList.toggle('show', !!c);
  if (c) el.innerHTML = `<i class="ph ph-arrow-left"></i>Kembali ke Hari ${c.day + 1}<span>${PROGRAM.days[c.day][c.task][3]}</span>`;
}
function completeProgDay(i) {
  const p = state.program;
  if (!p.done.includes(i)) p.done.push(i);
  if (p.done.length === 7) { p.finished = true; persist(); checkBadges(); notify(`Kamu menyelesaikan program "${PROGRAM.title}". Lihat sertifikatmu.`, 'ph-medal', 'amber', 'openCertificate()'); return openCertificate(); }
  persist(); renderHome();
  toast(`Hari ${i + 1} selesai. Sampai jumpa di hari ${i + 2}!`, 'ph-check-circle');
  openProgram();
}
function openCertificate() {
  openSheet({ kind: 'cert', title: '<h2 class="h2">Sertifikat</h2>', body: `
    <div class="cert">
      ${ILLO.cairn()}
      <p class="tiny" style="letter-spacing:.08em;text-transform:uppercase">Ruang Pulih · Program 7 hari</p>
      <p class="display" style="font-size:26px">${PROGRAM.title}</p>
      <p class="mt-8">Diselesaikan oleh <b>${esc(state.name)}</b></p>
      <p class="tiny mt-8">7 hari · ${state.program?.started ? (() => { const d = keyToDate(state.program.started); return `mulai ${d.getDate()} ${MONTHS[d.getMonth()]}`; })() : ''}</p>
    </div>
    <p class="muted mt-16" style="font-size:14px;text-align:center">Kamu sudah belajar mengenali tubuh, pikiran, dan batasanmu. Teruskan latihan yang paling cocok untukmu.</p>
    <button class="btn btn-primary btn-block mt-16" onclick="closeSheet();go('me')">Lihat pencapaianmu</button>` });
}

// ---------- Weekly recap ----------
function recapData() {
  const days = Array.from({ length: 7 }, (_, i) => dayKey(i - 6));
  const moods = days.map(moodOn);
  const logged = moods.filter(Boolean);
  const avg = logged.length ? logged.reduce((s, m) => s + m.v, 0) / logged.length : 0;
  const tags = {}; logged.forEach(m => m.tags.forEach(t => { tags[t] = (tags[t] || 0) + 1; }));
  const topTags = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const since = days[0];
  const tools = Object.entries(state.toolLog).map(([k, v]) => [k, v.filter(d => d >= since).length]).filter(([, n]) => n);
  const best = logged.length ? logged.reduce((a, b) => (b.v > a.v ? b : a)) : null;
  return { days, moods, logged, avg, topTags, tools, best };
}
const TOOL_NAMES = { breath: 'Napas kotak', meditation: 'Meditasi', gratitude: 'Jurnal syukur', check: 'Cek Diri', journal: 'Jurnal refleksi' };
function recapCard() {
  const r = recapData();
  return `
    <button class="card recap-mini mt-12" onclick="openRecap()">
      <div class="row"><div class="grow"><p class="tiny">Rekap mingguan</p><p class="h3" style="font-size:15px">${r.logged.length} check-in · rata-rata ${r.avg ? MOODS[Math.round(r.avg)].label.toLowerCase() : '–'}</p></div><i class="ph ph-caret-right" style="color:var(--ink-3)"></i></div>
      <div class="recap-pebbles">${r.moods.map((m, i) => `<span>${m ? pebble(m.v) : '<i></i>'}<em>${DAYS[keyToDate(r.days[i]).getDay()]}</em></span>`).join('')}</div>
    </button>`;
}
function openRecap() {
  state.recapViewed = true; persist(); checkBadges();
  const r = recapData();
  const fmt = k => { const d = keyToDate(k); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
  const psy = Object.keys(state.chats).map(provider).find(p => p?.type === 'psy');
  const insight = r.best ? `Hari terbaikmu: ${DAYS[keyToDate(r.best.date).getDay()]} (${MOODS[r.best.v].label.toLowerCase()})${r.best.tags.length ? `, saat kamu menandai ${r.best.tags[0].toLowerCase()}` : ''}.` : 'Check-in beberapa hari agar polanya terlihat.';
  openSheet({
    kind: 'recap', full: true,
    title: '<h2 class="h2">Rekap mingguan</h2>',
    body: `
      <p class="tiny">${fmt(r.days[0])} – ${fmt(r.days[6])}</p>
      <div class="card mt-12"><div class="recap-pebbles big">${r.moods.map((m, i) => `<span>${m ? pebble(m.v) : '<i></i>'}<em>${DAYS[keyToDate(r.days[i]).getDay()]}</em></span>`).join('')}</div></div>
      <div class="stats">
        <div class="stat"><b>${r.logged.length}</b><span>check-in</span></div>
        <div class="stat"><b>${r.avg ? MOODS[Math.round(r.avg)].label : '–'}</b><span>rata-rata</span></div>
        <div class="stat"><b>${r.tools.reduce((s, [, n]) => s + n, 0)}</b><span>latihan</span></div>
      </div>
      <div class="safe-note mt-12" style="background:var(--amber-tint)"><i class="ph ph-lightbulb" style="color:#8A5B0E"></i><span>${insight}</span></div>
      <p class="set-group-title mt-20">Pemicu terbanyak</p>
      ${r.topTags.length ? `<div class="list">${r.topTags.map(([t, n]) => `<div class="list-item"><span class="grow" style="font-size:14.5px">${t}</span><span class="tiny">${n}× ditandai</span></div>`).join('')}</div>` : '<p class="tiny">Belum ada tag minggu ini.</p>'}
      <p class="set-group-title mt-20">Latihan yang kamu lakukan</p>
      ${r.tools.length ? `<div class="chips wrap">${r.tools.map(([k, n]) => `<span class="chip">${TOOL_NAMES[k] || k} · ${n}×</span>`).join('')}</div>` : '<p class="tiny">Belum ada. Coba satu Alat bantu minggu depan.</p>'}
      ${ui.programCtx?.key === 'recap' ? `<button class="btn btn-primary btn-block mt-20" onclick="progEvent('recap')"><i class="ph ph-check"></i>Selesai melihat rekap</button>` : ''}
      ${psy ? (state.prefs.shareWithPsy
        ? `<button class="btn btn-primary btn-block mt-20" onclick="shareRecap('${psy.id}')"><i class="ph ph-share-network"></i>Kirim ke ${esc(psy.short)}</button>`
        : `<div class="card card-sunken mt-20"><p style="font-size:14px">Mau psikologmu melihat rekap ini sebelum sesi?</p><button class="btn btn-soft btn-sm mt-8" onclick="state.prefs.shareWithPsy=true;persist();openRecap()">Izinkan berbagi rekap ke psikolog</button><p class="tiny mt-8">Bisa dicabut kapan saja di Pengaturan.</p></div>`) : ''}`,
  });
}
function shareRecap(pid) {
  const chat = state.chats[pid];
  chat.messages.push({ from: 'sys', text: 'Rekap mingguan dibagikan' }, { from: 'them', text: 'Terima kasih sudah berbagi rekapmu. Saya akan pelajari polanya sebelum sesi kita.', t: nowTime() });
  chat.unread = true; persist(); renderNav();
  toast(`Rekap terkirim ke ${provider(pid).short}`, 'ph-paper-plane-tilt');
}

// ---------- Reflection journal (Premium) ----------
TOOLS.push({ key: 'journal', art: 'journal', title: 'Jurnal refleksi', sub: 'Premium · 5 mnt', c: 'var(--m1)', open: 'openJournal()', premium: true });
function journalPrompt() {
  const recent = state.moods.slice(-5);
  const tags = {}; recent.forEach(m => m.tags.forEach(t => { tags[t] = (tags[t] || 0) + 1; }));
  const top = Object.entries(tags).sort((a, b) => b[1] - a[1])[0];
  const last = recent[recent.length - 1];
  if (top && top[1] >= 2) return `Kamu menandai "${top[0]}" beberapa kali minggu ini. Apa yang paling berat dari hal itu?`;
  if (last?.note) return `Kemarin kamu menulis: "${last.note.slice(0, 60)}". Bagaimana perasaanmu soal itu sekarang?`;
  return 'Apa satu hal yang paling sering muncul di pikiranmu hari ini?';
}
function openJournal() {
  if (!state.premium) return openPremium('Jurnal refleksi termasuk Premium.');
  openSheet({
    kind: 'journal',
    title: '<h2 class="h2">Jurnal refleksi</h2>',
    body: `
      <div class="tool-cover" style="--tc:var(--m1)">${TOOL_ART.journal()}</div>
      <p class="tiny mt-16">Pertanyaan untukmu hari ini</p>
      <p class="h2 mt-8" style="font-size:20px">${esc(journalPrompt())}</p>
      <textarea class="field mt-12" id="jIn" rows="5" placeholder="Tulis dengan bebas. Tidak ada jawaban yang salah."></textarea>
      <button class="btn btn-primary btn-block mt-12" onclick="reflectJournal()"><i class="ph ph-sparkle"></i>Bantu aku merenung</button>
      <div id="jOut"></div>`,
  });
}
function reflectJournal() {
  const text = document.getElementById('jIn').value.trim();
  if (text.length < 10) return toast('Tulis sedikit lebih banyak dulu, ya', 'ph-pencil-simple');
  const t = text.toLowerCase();
  const theme = /tugas|kuliah|ujian|uts|uas|dosen|skripsi|nilai/.test(t) ? ['beban akademik', 'Bagian mana yang paling bisa kamu kendalikan minggu ini?', ['Susun 3 langkah kecil', "openThoughtRecord()"]]
    : /keluarga|orang tua|ibu|ayah|kakak|adik/.test(t) ? ['harapan keluarga', 'Apa yang sebenarnya ingin kamu sampaikan ke mereka?', ['Susun kalimat batasan', 'openBoundary()']]
    : /tidur|capek|lelah|ngantuk|insomnia/.test(t) ? ['rasa lelah', 'Kapan terakhir kali kamu benar-benar beristirahat?', ['Body scan 10 menit', "openMeditation('body-scan')"]]
    : /teman|pacar|sendiri|kesepian|relasi/.test(t) ? ['hubungan dengan orang lain', 'Siapa satu orang yang membuatmu merasa aman?', ['Ngobrol dengan Teman Pulih', "closeSheet();go('support',{supportTab:'peer'})"]]
    : ['perasaan yang sedang kamu bawa', 'Kalau sahabatmu merasakan hal yang sama, apa yang akan kamu katakan padanya?', ['Napas kotak', 'openBreathing()']];
  document.getElementById('jOut').innerHTML = `
    <div class="card reflect mt-16">
      <p class="tiny"><i class="ph-fill ph-sparkle"></i> Refleksi otomatis · bukan diagnosis</p>
      <p class="mt-8" style="font-size:15px">Yang kutangkap: kamu sedang memikirkan <b>${theme[0]}</b>, dan itu menguras tenagamu. Perasaan itu masuk akal.</p>
      <p class="mt-8" style="font-size:15px"><b>Pertanyaan lanjutan:</b> ${theme[1]}</p>
      <button class="btn btn-soft btn-sm mt-12" onclick="${theme[2][1]}">${theme[2][0]}</button>
    </div>
    <button class="btn btn-ghost btn-block mt-12" onclick="saveJournal()">Simpan ke Catatanmu</button>`;
}
function saveJournal() {
  const text = document.getElementById('jIn').value.trim();
  state.worksheets.push({ date: dayKey(), icon: 'ph-sparkle', text: `Refleksi · ${text.slice(0, 80)}` });
  logTool('journal'); closeSheet(); toast('Refleksi tersimpan', 'ph-check-circle');
}

// ---------- Badges & streak rest days ----------
const BADGES = [
  { id: 'first', label: 'Check-in pertama', icon: 'ph-smiley', c: 'var(--m4)', test: () => state.moods.length > 0 },
  { id: 's3', label: '3 hari beruntun', icon: 'ph-flame', c: 'var(--m5)', test: () => streak() >= 3 },
  { id: 's7', label: '7 hari beruntun', icon: 'ph-fire', c: 'var(--m5)', test: () => streak() >= 7 },
  { id: 'breath', label: 'Napas pertama', icon: 'ph-wind', c: 'var(--m2)', test: () => toolUses('breath').length > 0 },
  { id: 'thinker', label: 'Penantang pikiran', icon: 'ph-brain', c: 'var(--m3)', test: () => state.worksheets.some(w => w.text.startsWith('Thought record')) },
  { id: 'kind', label: 'Pemberi peluk', icon: 'ph-hand-heart', c: 'var(--m5)', test: () => state.hugged.length >= 5 },
  { id: 'recap', label: 'Refleksi mingguan', icon: 'ph-chart-line', c: 'var(--m2)', test: () => state.recapViewed },
  { id: 'program', label: 'Lulus 7 hari', icon: 'ph-medal', c: 'var(--m4)', test: () => state.program?.finished },
];
// Badges already earned before this feature existed are granted quietly, without notifications.
if (!state.badgesInit) { state.badges = BADGES.filter(b => b.test()).map(b => b.id); state.badgesInit = true; }
function checkBadges() {
  BADGES.forEach(b => {
    if (!state.badges.includes(b.id) && b.test()) {
      state.badges.push(b.id);
      notify(`Lencana baru: ${b.label}`, 'ph-medal', 'amber', "closeSheet();go('me')");
      if (document.readyState === 'complete') toast(`Lencana baru: ${b.label}`, 'ph-medal');
    }
  });
  persist();
}
function badgesSection() {
  const earned = state.badges.length;
  return `
    <div class="section">
      <div class="section-head"><h3 class="h2">Pencapaian</h3><span class="tiny">${earned} dari ${BADGES.length}</span></div>
      <div class="badge-grid">${BADGES.map(b => { const on = state.badges.includes(b.id); return `
        <div class="badge ${on ? 'on' : ''}" title="${b.label}">
          <span class="badge-ic" style="--c:${b.c}"><i class="${on ? 'ph-fill' : 'ph'} ${b.icon}"></i></span><span>${b.label}</span></div>`; }).join('')}</div>
      <p class="tiny mt-12"><i class="ph ph-leaf" style="color:var(--forest)"></i> Satu hari istirahat per minggu tidak memutus streak-mu${ui.restDays ? ` · ${ui.restDays} terpakai` : ''}. Tanpa papan peringkat.</p>
    </div>`;
}

// ---------- Session: reschedule, cancel, calendar ----------
const bookingDate = b => b.date || dayKey(b.day === 'Hari ini' ? 0 : 1);
const dayLabel = k => k === dayKey() ? 'Hari ini' : k === dayKey(1) ? 'Besok' : (() => { const d = keyToDate(k); return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`; })();
function sessionCard() {
  const b = state.bookings.filter(x => bookingDate(x) >= dayKey()).slice(-1)[0];
  if (!b) return '';
  const p = provider(b.pid);
  const i = state.bookings.indexOf(b);
  return `
    <div class="section">
      <div class="section-head"><h3 class="h2">Sesi berikutnya</h3></div>
      <div class="card session-card">
        <button class="provider" onclick="openChat('${p.id}')">
          ${avatarHTML(p)}
          <div class="grow"><p class="h3">${esc(p.name)}</p><p class="tiny">${dayLabel(bookingDate(b))}, ${b.time} · Video 50 menit</p></div>
          <span class="play"><i class="ph ph-chat-circle"></i></span>
        </button>
        <p class="tiny mt-12"><i class="ph ph-bell-ringing"></i> ${state.prefs.notifSession ? 'Pengingat 1 jam & 10 menit sebelum sesi' : 'Pengingat sesi mati'}</p>
        <div class="session-actions">
          <button class="btn btn-ghost btn-sm" onclick="openReschedule(${i})"><i class="ph ph-calendar-dots"></i>Ubah jadwal</button>
          <button class="btn btn-ghost btn-sm" onclick="downloadIcs(${i})"><i class="ph ph-calendar-plus"></i>Kalender</button>
          <button class="btn btn-ghost btn-sm" onclick="openCancel(${i})"><i class="ph ph-x"></i>Batalkan</button>
        </div>
      </div>
    </div>`;
}
function openReschedule(i, date = null, time = null) {
  const b = state.bookings[i];
  date ||= bookingDate(b);
  const dates = [0, 1, 2, 3, 4].map(dayKey);
  const slots = ['09.00', '11.00', '13.00', '15.00', '19.00', '20.00'];
  openSheet({
    kind: 'reschedule',
    title: '<h2 class="h2">Ubah jadwal</h2>',
    body: `
      <p class="muted" style="font-size:14px">Sekarang: ${dayLabel(bookingDate(b))}, ${b.time}. Gratis diubah hingga 2 jam sebelum sesi.</p>
      <div class="chips mt-16">${dates.map(d => `<button class="chip ${d === date ? 'on' : ''}" onclick="openReschedule(${i},'${d}',${time ? `'${time}'` : 'null'})">${dayLabel(d)}</button>`).join('')}</div>
      <div class="slots mt-12">${slots.map(s => `<button class="slot-btn ${s === time ? 'on' : ''}" ${date === bookingDate(b) && s === b.time ? 'disabled' : ''} onclick="openReschedule(${i},'${date}','${s}')">${s}</button>`).join('')}</div>
      <button class="btn btn-primary btn-block mt-20" ${time ? '' : 'disabled'} onclick="confirmReschedule(${i},'${date}','${time}')">Simpan jadwal baru</button>`,
  });
}
function confirmReschedule(i, date, time) {
  const b = state.bookings[i];
  Object.assign(b, { date, day: dayLabel(date), time });
  state.chats[b.pid]?.messages.push({ from: 'sys', text: `Jadwal diubah · ${dayLabel(date)}, ${time}` });
  persist(); closeSheet(); rerender();
  notify(`Sesi dengan ${provider(b.pid).short} dipindah ke ${dayLabel(date)}, ${time}.`, 'ph-calendar-check', 'forest', "closeSheet();go('home')");
  toast('Jadwal baru tersimpan', 'ph-calendar-check');
}
function openCancel(i) {
  const b = state.bookings[i];
  openSheet({
    kind: 'cancel',
    title: '<h2 class="h2">Batalkan sesi?</h2>',
    body: `
      <p class="muted" style="font-size:14px">Sesi ${dayLabel(bookingDate(b))}, ${b.time} dengan ${esc(provider(b.pid).name)}. Pembatalan gratis hingga 2 jam sebelum sesi${state.org ? '; kuota kampusmu dikembalikan' : '; dana dikembalikan dalam 3 hari kerja'}.</p>
      <p class="set-group-title mt-16">Alasan (opsional)</p>
      <div class="chips wrap" id="cancelWhy">${['Jadwal bentrok', 'Sudah merasa lebih baik', 'Ingin psikolog lain', 'Lainnya'].map(r => `<button class="chip" onclick="this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===this))">${r}</button>`).join('')}</div>
      <div class="consent-actions"><button class="btn btn-ghost" onclick="closeSheet()">Tetap ikut</button><button class="btn btn-primary" style="background:var(--clay)" onclick="confirmCancel(${i})">Batalkan sesi</button></div>
      <button class="link mt-16" onclick="openReschedule(${i})">Ubah jadwal saja</button>`,
  });
}
function confirmCancel(i) {
  const [b] = state.bookings.splice(i, 1);
  state.chats[b.pid]?.messages.push({ from: 'sys', text: `Sesi ${dayLabel(bookingDate(b))}, ${b.time} dibatalkan` });
  persist(); closeSheet(); rerender();
  toast('Sesi dibatalkan', 'ph-x-circle');
}
function downloadIcs(i) {
  const b = state.bookings[i], p = provider(b.pid);
  const [y, m, d] = bookingDate(b).split('-');
  const [hh, mm] = b.time.split('.');
  const start = `${y}${m}${d}T${hh}${mm}00`;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ruang Pulih//ID', 'BEGIN:VEVENT', `UID:${b.pid}-${start}@ruangpulih`, `DTSTART:${start}`, 'DURATION:PT50M',
    `SUMMARY:Sesi Ruang Pulih dengan ${p.name}`, 'DESCRIPTION:Buka aplikasi Ruang Pulih 5 menit sebelum sesi untuk masuk ruang tunggu.',
    'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Sesi 1 jam lagi', 'END:VALARM',
    'BEGIN:VALARM', 'TRIGGER:-PT10M', 'ACTION:DISPLAY', 'DESCRIPTION:Sesi 10 menit lagi', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `sesi-ruang-pulih-${bookingDate(b)}.ics`; a.click();
  URL.revokeObjectURL(a.href);
  toast('File kalender diunduh · buka untuk menambahkan', 'ph-calendar-plus');
}

// ---------- Referral & ambassador codes ----------
const myCode = () => `${(state.name || 'TEMAN').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 5) || 'TEMAN'}-${(state.account?.since || '2026').replace(/\D/g, '').slice(-3)}`;
function referralCard() {
  return `
    <div class="section">
      <div class="card referral">
        <div class="ref-art">${ILLO.together()}</div>
        <p class="h3">Ajak teman ke Ruang Pulih</p>
        <p class="tiny mt-8" style="max-width:220px">Temanmu dapat Premium 7 hari gratis. Kami tidak memberitahu siapa pun siapa yang kamu ajak.</p>
        <div class="ref-code mt-12"><span class="code-field" style="font-weight:700">${myCode()}</span>
          <button class="btn btn-primary btn-sm" onclick="shareReferral()"><i class="ph ph-share-network"></i>Bagikan</button></div>
        <p class="tiny mt-8">${state.referrals} teman sudah bergabung lewat kodemu</p>
      </div>
    </div>`;
}
function shareReferral() {
  const text = `Aku pakai Ruang Pulih untuk jaga kesehatan mental. Pakai kode ${myCode()} untuk Premium 7 hari gratis.`;
  if (navigator.share) navigator.share({ title: 'Ruang Pulih', text }).catch(() => {});
  else navigator.clipboard?.writeText(text).then(() => toast('Ajakan disalin', 'ph-copy'));
}
function openReferralCode() {
  openSheet({
    kind: 'refcode',
    title: '<h2 class="h2">Kode ajakan</h2>',
    body: `
      ${state.referredBy ? `<div class="notice"><i class="ph ph-check-circle"></i><span>Kode <b>${esc(state.referredBy)}</b> sudah dipakai.</span></div>` : ''}
      <p class="muted mt-12" style="font-size:14px">Diajak teman atau Campus Ambassador? Masukkan kodenya.</p>
      <input class="field mt-12 code-field" id="refIn" placeholder="AMB-RAKA atau RANI-018" onkeydown="if(event.key==='Enter')applyReferral()">
      <p class="tiny mt-8" id="refMsg">Kode ambassador hanya dihitung sebagai jumlah oleh kampus — identitasmu tidak dibagikan.</p>
      <button class="btn btn-primary btn-block mt-12" onclick="applyReferral()">Pakai kode</button>`,
  });
}
function applyReferral(fromSignup) {
  const el = document.getElementById(fromSignup ? 'profRef' : 'refIn');
  const code = (el?.value || '').trim().toUpperCase();
  if (!code) return;
  if (!/^[A-Z]{2,8}-[A-Z0-9]{2,6}$/.test(code) || code === myCode()) {
    if (!fromSignup) { const m = document.getElementById('refMsg'); m.textContent = 'Kode tidak dikenali.'; m.style.color = 'var(--clay)'; }
    return;
  }
  state.referredBy = code;
  if (!code.startsWith('AMB-') && !state.premium) { state.premium = true; state.trial = true; }
  persist();
  if (!fromSignup) { closeSheet(); rerender(); }
  toast(code.startsWith('AMB-') ? 'Kode ambassador tersimpan. Terima kasih!' : 'Premium 7 hari aktif dari ajakan temanmu', 'ph-gift');
}

// ---------- English UI (beta) ----------
// The interface chrome switches language; articles, posts and chats stay in Indonesian.
const EN = {
  'Beranda': 'Home', 'Dukungan': 'Support', 'Belajar': 'Learn', 'Kamu': 'You', 'Coba Premium': 'Try Premium', 'Coba ': 'Try ',
  'Bagaimana perasaanmu hari ini?': 'How are you feeling today?', 'Berat': 'Heavy', 'Kurang': 'Low', 'Biasa': 'Okay', 'Baik': 'Good', 'Lega': 'Relieved',
  'Alat bantu': 'Self-care tools', 'Butuh jeda? Pilih satu — cukup beberapa menit.': 'Need a pause? Pick one — it only takes a few minutes.',
  'Napas kotak': 'Box breathing', 'Meditasi': 'Meditation', 'Jurnal syukur': 'Gratitude journal', 'Cek Diri': 'Self-check', 'Jurnal refleksi': 'Reflection journal',
  'Untukmu': 'For you', 'Belum dicoba': 'Not tried yet', 'Bacaan hari ini': "Today's read", 'Semua': 'All', 'Sesi berikutnya': 'Next session',
  'Tugas dari sesi': 'Homework from sessions', 'Kerjakan': 'Do it', 'Ubah jadwal': 'Reschedule', 'Kalender': 'Calendar', 'Batalkan': 'Cancel',
  'Video singkat': 'Short videos', 'Interaktif': 'Interactive', 'Latihan': 'Practices', 'Bacaan': 'Reading', 'Mulai program': 'Start program',
  'Percakapan': 'Conversations', 'Psikolog': 'Psychologists', 'Ngobrol': 'Chat', 'Titip pesan': 'Leave a message',
  'Butuh bantuan segera?': 'Need help right now?', 'Kontak darurat 24 jam': '24-hour emergency contacts', 'Tekan SOS, kapan saja.': 'Tap SOS, any time.',
  'Perjalananmu': 'Your journey', 'Catatanmu': 'Your notes', 'Pencapaian': 'Achievements', 'Pengaturan': 'Settings', 'check-in': 'check-ins', 'beruntun': 'streak', 'rata-rata': 'average',
  'Apa yang ingin kamu bagikan?': 'What would you like to share?', 'Semua cerita di sini anonim. Saling jaga, tanpa menghakimi.': 'Every story here is anonymous. Look out for each other, without judgement.',
  'Cerita': 'Stories', 'Kuliah': 'College', 'Keluarga': 'Family', 'Karir': 'Career', 'Kecemasan': 'Anxiety', 'Anonim': 'Anonymous',
  'Notifikasi': 'Notifications', 'Baru': 'New', 'Sebelumnya': 'Earlier', 'Tandai semua dibaca': 'Mark all as read',
  'Akun': 'Account', 'Keselamatan': 'Safety', 'Privasi & keamanan': 'Privacy & security', 'Tampilan': 'Display', 'Lainnya': 'Other',
  'Foto profil': 'Profile picture', 'Nama panggilan': 'Nickname', 'Metode masuk': 'Sign-in method', 'Institusi mitra': 'Partner institution', 'Data untuk kampus': 'Data for your campus', 'Langganan': 'Subscription',
  'Kontak darurat (SOS)': 'Emergency contacts (SOS)', 'Kontak tepercaya': 'Trusted contact', 'Pengingat check-in': 'Check-in reminder', 'Jam pengingat': 'Reminder time', 'Pengingat sesi': 'Session reminders', 'Balasan di Lingkar': 'Replies in Lingkar',
  'Kunci aplikasi': 'App lock', 'Sembunyikan isi notifikasi': 'Hide notification content', 'Bagikan rekap mood ke psikolog': 'Share mood recap with your psychologist', 'Anonim di komunitas': 'Anonymous in community',
  'Kebijakan privasi': 'Privacy policy', 'Unduh data saya': 'Download my data', 'Mode gelap': 'Dark mode', 'Ukuran teks': 'Text size', 'Bahasa': 'Language', 'Keluar': 'Sign out', 'Hapus akun & data': 'Delete account & data', 'Kode ajakan': 'Referral code',
  'Ajak teman ke Ruang Pulih': 'Invite a friend to Ruang Pulih', 'Bagikan': 'Share', 'Rekap mingguan': 'Weekly recap', 'Pemicu terbanyak': 'Top triggers', 'Latihan yang kamu lakukan': 'Practices you did',
  'Simpan': 'Save', 'Tutup': 'Close', 'Kembali': 'Back', 'Lanjut': 'Next', 'Selesai': 'Done', 'Mulai': 'Start', 'Daftar': 'Register', 'Terdaftar': 'Registered',
  'Teman Pulih & psikolog tanpa biaya.': 'Teman Pulih & psychologists at no cost.', 'Sesi psikolog gratis': 'Free psychologist sessions', 'Teman Pulih tanpa batas': 'Unlimited Teman Pulih', 'Acara kampus': 'Campus events',
  'Kamu tidak sendirian': "You're not alone", 'Darurat nasional': 'National emergency', 'Teman Pulih adalah': 'Teman Pulih are',
  'Simpan check-in': 'Save check-in', 'Check-in hari ini': "Today's check-in", 'Ubah': 'Edit', 'Nanti saja': 'Maybe later', 'Napas dulu': 'Breathe first',
};
const EN_RX = [
  [/^Selamat pagi,$/, 'Good morning,'], [/^Selamat siang,$/, 'Good afternoon,'], [/^Selamat sore,$/, 'Good afternoon,'], [/^Selamat malam,$/, 'Good evening,'],
  [/^Hai, (.+)$/, 'Hi, $1'], [/^(\d+) hari beruntun$/, '$1-day streak'], [/^(\d+)× minggu ini$/, '$1× this week'], [/^(\d+) sesi minggu ini$/, '$1 sessions this week'],
  [/^(\d+) peluk$/, '$1 hugs'], [/^(\d+) balasan$/, '$1 replies'], [/^(\d+) dari (\d+)$/, '$1 of $2'], [/^Lanjutkan · Hari (\d+)$/, 'Continue · Day $1'], [/^Hari (\d+)$/, 'Day $1'],
];
const EN_ATTR = { 'Tulis pesan…': 'Write a message…', 'Balas secara anonim…': 'Reply anonymously…', 'Mau cerita sedikit? Hanya kamu yang bisa membaca ini.': 'Want to share a little? Only you can read this.' };
function trText(s) {
  const t = s.trim(); if (!t) return s;
  if (EN[t]) return s.replace(t, EN[t]);
  for (const [rx, rep] of EN_RX) if (rx.test(t)) return s.replace(t, t.replace(rx, rep));
  return s;
}
function translateTree(root) {
  if (state.prefs.lang !== 'en' || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => { const out = trText(n.nodeValue); if (out !== n.nodeValue) n.nodeValue = out; });
  root.querySelectorAll?.('[placeholder]').forEach(el => { const p = EN_ATTR[el.placeholder]; if (p) el.placeholder = p; });
}
let i18nObserver = null;
function applyLang() {
  document.documentElement.lang = state.prefs.lang === 'en' ? 'en' : 'id';
  if (state.prefs.lang !== 'en') return;
  translateTree(document.body);
  i18nObserver ||= new MutationObserver(muts => {
    i18nObserver.disconnect();
    muts.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 ? translateTree(n) : n.nodeType === 3 && (n.nodeValue = trText(n.nodeValue))));
    i18nObserver.observe(document.body, { childList: true, subtree: true, characterData: false });
  });
  i18nObserver.observe(document.body, { childList: true, subtree: true });
}
window.addEventListener('DOMContentLoaded', () => setTimeout(applyLang, 0));
