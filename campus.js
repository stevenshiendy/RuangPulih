// ===== RUANG PULIH — CAMPUS (student side of the Portal Mitra) =====
// Verification status, invite codes, campus events, counsellor outreach and session ratings.
// The dashboard (admin.html) writes decisions into the same localStorage key, so a
// "Setujui" or "Sapa" there shows up here — live in another tab, or on next load.

state.verification ||= null;          // { status: 'pending'|'approved'|'rejected', org, via, at, reason, seen }
state.eventsJoined ||= [];
state.ratings ||= {};
state.watched ||= {};
state.worksheets ||= [];

// ---------- Invite codes & verification ----------
const INVITE_ORGS = { BINUS: 'BINUS University', ITB: 'ITB', UNPAD: 'UNPAD', UPI: 'UPI', TELU: 'Telkom University' };
function orgForCode(code) {
  const m = /^([A-Z]+)-[A-Z0-9]{4,10}$/.exec(code);
  return m ? INVITE_ORGS[m[1]] : null;
}
function submitInviteCode() {
  const code = document.getElementById('inviteCode').value.trim().toUpperCase();
  const msg = document.getElementById('codeMsg');
  const org = orgForCode(code);
  if (!org) { msg.textContent = 'Kode tidak dikenali. Contoh: BINUS-UAS26.'; msg.style.color = 'var(--clay)'; return; }
  state.verification = { status: 'pending', org, via: `Kode ${code}`, at: Date.now(), seen: false };
  persist(); closeSheet(); rerender();
  notify(`Permintaan verifikasi ${org} terkirim. Biasanya diproses < 1 hari.`, 'ph-hourglass-medium', 'amber', "closeSheet();go('home')");
  toast(`Permintaan terkirim ke admin ${org}`, 'ph-paper-plane-tilt');
}
function cancelVerification() {
  state.verification = null; persist(); rerender();
  toast('Permintaan verifikasi dibatalkan', 'ph-x-circle');
}
function dismissVerification() {
  if (state.verification) state.verification.seen = true;
  persist(); rerender();
}
const sinceText = ts => {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  return m < 60 ? `${m} menit lalu` : m < 1440 ? `${Math.round(m / 60)} jam lalu` : `${Math.round(m / 1440)} hari lalu`;
};
// Status card shown on Beranda and Dukungan while a request is open (and once after a decision).
function verificationCard() {
  const v = state.verification;
  if (!v || (v.status !== 'pending' && v.seen)) return '';
  if (v.status === 'pending') {
    return `
      <div class="card verif" role="status">
        <div class="row"><span class="verif-ic"><i class="ph-fill ph-hourglass-medium"></i></span>
          <div class="grow"><p class="h3" style="font-size:15px">Menunggu verifikasi ${esc(v.org)}</p>
          <p class="tiny">Dikirim ${sinceText(v.at)} · ${esc(v.via)} · biasanya &lt; 1 hari</p></div></div>
        <ol class="verif-steps" aria-label="Status verifikasi">
          <li class="done"><span><i class="ph ph-check"></i></span>Dikirim</li>
          <li class="current" aria-current="step"><span></span>Ditinjau admin</li>
          <li><span></span>Aktif</li>
        </ol>
        <p class="tiny">Sambil menunggu, semua fitur gratis tetap bisa kamu pakai. Konsultasi gratis aktif setelah disetujui.</p>
        <div class="row mt-8" style="justify-content:space-between">
          <button class="link" style="color:var(--ink-2)" onclick="cancelVerification()">Batalkan permintaan</button>
          <a class="link" href="admin.html#anggota" target="_blank" rel="noopener">Buka portal admin (demo) <i class="ph ph-arrow-up-right"></i></a>
        </div>
      </div>`;
  }
  if (v.status === 'approved') {
    return `
      <div class="card verif ok" role="status">
        <div class="row"><span class="verif-ic"><i class="ph-fill ph-seal-check"></i></span>
          <div class="grow"><p class="h3" style="font-size:15px">Akses ${esc(v.org)} aktif</p><p class="tiny">Konsultasi psikolog dan Teman Pulih kini gratis untukmu.</p></div>
          <button class="close-btn" onclick="dismissVerification()" aria-label="Tutup"><i class="ph ph-x"></i></button></div>
        <ol class="verif-steps"><li class="done"><span><i class="ph ph-check"></i></span>Dikirim</li><li class="done"><span><i class="ph ph-check"></i></span>Ditinjau admin</li><li class="done"><span><i class="ph ph-check"></i></span>Aktif</li></ol>
        <button class="btn btn-primary btn-sm mt-8" onclick="dismissVerification();openCampusConsent('onboard')">Atur data untuk kampus</button>
      </div>`;
  }
  return `
    <div class="card verif no" role="status">
      <div class="row"><span class="verif-ic"><i class="ph-fill ph-x-circle"></i></span>
        <div class="grow"><p class="h3" style="font-size:15px">Verifikasi ${esc(v.org)} belum disetujui</p><p class="tiny">${esc(v.reason || 'Data tidak cocok dengan daftar mahasiswa aktif.')}</p></div>
        <button class="close-btn" onclick="dismissVerification()" aria-label="Tutup"><i class="ph ph-x"></i></button></div>
      <div class="row mt-12" style="gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="dismissVerification();openAffiliation()">Pakai email kampus</button>
        <button class="btn btn-ghost btn-sm" onclick="dismissVerification();go('support')">Hubungi admin lewat Dukungan</button>
      </div>
    </div>`;
}
// Called when the dashboard decides (storage event or fresh load).
function onVerificationDecided(prev) {
  const v = state.verification;
  if (!v || prev === v.status) return;
  if (v.status === 'approved') {
    state.org = v.org; state.campusShare = null; persist();
    toast(`Selamat! Akses ${v.org} disetujui`, 'ph-seal-check');
    notify(`Akses ${v.org} disetujui. Konsultasi gratis sudah aktif.`, 'ph-seal-check', 'forest', "closeSheet();go('home')");
  } else if (v.status === 'rejected') {
    toast(`Verifikasi ${v.org} belum disetujui`, 'ph-x-circle');
    notify(`Verifikasi ${v.org} belum disetujui. Coba masuk dengan email kampus.`, 'ph-x-circle', 'clay', 'openAffiliation()');
  }
}

// Live sync with the dashboard open in another tab.
window.addEventListener('storage', e => {
  if (e.key !== KEY || !e.newValue) return;
  let fresh; try { fresh = JSON.parse(e.newValue); } catch { return; }
  const prev = state.verification?.status;
  const before = Object.fromEntries(Object.entries(state.chats || {}).map(([k, c]) => [k, c.messages.length]));
  const hwBefore = (state.homework || []).length;
  ['verification', 'org', 'chats', 'campusShare', 'homework', 'homeworkDue', 'bookings', 'hiddenPosts'].forEach(k => { if (k in fresh) state[k] = fresh[k]; });
  onVerificationDecided(prev);
  Object.entries(state.chats || {}).forEach(([k, c]) => {
    const last = c.messages[c.messages.length - 1];
    if (c.messages.length > (before[k] || 0) && last && last.from !== 'me' && !(last.from === 'sys' && /tugas/i.test(last.text))) {
      const p = provider(k);
      const who = k === 'sac' ? `Konselor ${state.org || 'kampus'}` : (p?.type === 'psy' ? p.name.split(',')[0] : p?.name || 'Pendamping');
      notify(last.from === 'sys' ? `${last.text} · ${who}` : `${who} mengirim pesan untukmu.`, 'ph-chat-circle-dots', 'forest', `openChat('${k}')`);
    }
  });
  if ((state.homework || []).length > hwBefore) notify('Psikologmu memberi tugas baru · lihat di Beranda', 'ph-list-checks', 'forest', "closeSheet();go('home')");
  const log = document.getElementById('chatLog'); if (log && ui.chatOpen) renderChatLog(ui.chatOpen);
  rerender();
});

// ---------- Campus plan card (Dukungan) ----------
function campusPlanCard() {
  if (state.org) return `
    <div class="card card-forest plan-card">
      <div class="row"><i class="ph-fill ph-buildings" style="font-size:24px"></i><div class="grow"><p class="h3">Gratis lewat ${esc(state.org)}</p><p class="muted" style="font-size:13px">Paket kampus aktif</p></div></div>
      <div class="plan-perks">
        <span><i class="ph ph-chats-circle"></i>Sesi psikolog gratis</span>
        <span><i class="ph ph-hand-heart"></i>Teman Pulih tanpa batas</span>
        <span><i class="ph ph-calendar-blank"></i>Acara kampus</span>
      </div>
      <button class="plan-data" onclick="openCampusConsent()"><i class="ph ph-shield-check"></i>Data untuk kampus: <b>${esc(campusSummary())}</b><i class="ph ph-caret-right"></i></button>
    </div>`;
  if (state.verification?.status === 'pending') return verificationCard();
  return `<button class="card row" style="width:100%;text-align:left" onclick="openAffiliation()">
      <span class="li-ic" style="width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:var(--amber-tint);color:#8A5B0E;font-size:20px"><i class="ph ph-buildings"></i></span>
      <div class="grow"><p class="h3" style="font-size:15px">Kampus atau kantormu mitra?</p><p class="tiny">Tautkan dengan email kampus atau kode undangan.</p></div>
      <i class="ph ph-caret-right" style="color:var(--ink-3)"></i>
    </button>`;
}

// ---------- Campus events (mirrors the dashboard's Program page) ----------
const CAMPUS_EVENTS = [
  { id: 'ev-uas', d: '12', m: 'NOV', title: 'Webinar: Mengelola stres jelang UAS', where: 'Online · 14.00–15.30 WIB', count: 312, art: 'breath', c: 'var(--m2)' },
  { id: 'ev-tp', d: '18', m: 'NOV', title: 'Pelatihan Teman Pulih batch 4', where: 'Kampus Anggrek · 3 hari (20 jam)', count: 42, art: 'meditate', c: 'var(--m4)', note: 'Untuk mahasiswa psikologi' },
  { id: 'ev-road', d: '05', m: 'DES', title: 'Roadshow #SehatMentalBukanAib', where: 'Auditorium Kampus Anggrek', count: 0, art: 'gratitude', c: 'var(--m5)', opens: 'Pendaftaran buka 15 Nov' },
];
function toggleEvent(id) {
  const ev = CAMPUS_EVENTS.find(e => e.id === id);
  if (!state.org) return toast('Acara kampus tersedia setelah akunmu terverifikasi', 'ph-lock-simple');
  if (ev.opens) return toast(ev.opens, 'ph-calendar');
  const i = state.eventsJoined.indexOf(id);
  i >= 0 ? state.eventsJoined.splice(i, 1) : state.eventsJoined.push(id);
  persist();
  // Update the card in place — re-rendering Belajar made the page jump back to the top.
  const joined = i < 0;
  document.querySelectorAll(`[data-ev="${id}"]`).forEach(b => {
    b.classList.toggle('btn-soft', joined); b.classList.toggle('btn-primary', !joined);
    b.innerHTML = joined ? '<i class="ph ph-check"></i>Terdaftar' : (b.dataset.idle || 'Daftar');
  });
  document.querySelectorAll(`[data-ev-count="${id}"]`).forEach(el => { el.textContent = `${nf(ev.count + (joined ? 1 : 0))} terdaftar`; });
  toast(joined ? 'Terdaftar · pengingat dikirim H-1' : 'Pendaftaran dibatalkan', joined ? 'ph-calendar-check' : 'ph-x-circle');
}
function campusEventsSection() {
  const org = state.org || state.verification?.org;
  if (!org) return '';
  const locked = !state.org;
  return `
    <div class="section">
      <div class="section-head"><h3 class="h2">Acara ${esc(org.split(' ')[0])}</h3>${locked ? '<span class="tag tag-plain"><i class="ph ph-lock-simple"></i>Setelah verifikasi</span>' : ''}</div>
      <p class="tiny" style="margin:-4px 0 10px"><i class="ph ph-shield-check"></i> Kampus hanya melihat jumlah pendaftar. Tautan & pengingat dikirim oleh Ruang Pulih, bukan oleh kampus.</p>
      <div class="stack-8">${CAMPUS_EVENTS.map(e => {
        const joined = state.eventsJoined.includes(e.id);
        return `<div class="card event-card ${locked ? 'locked' : ''}">
          <span class="event-date"><b>${e.d}</b><span>${e.m}</span></span>
          <div class="grow"><p class="h3" style="font-size:15px">${e.title}</p><p class="tiny">${e.where}${e.note ? ` · ${e.note}` : ''}</p>
            <p class="tiny mt-8" ${e.opens ? '' : `data-ev-count="${e.id}"`}>${e.opens ? e.opens : `${nf(e.count + (joined ? 1 : 0))} terdaftar`}</p></div>
          <button class="btn ${joined ? 'btn-soft' : 'btn-primary'} btn-sm" data-ev="${e.id}" data-idle="${e.opens ? 'Ingatkan' : 'Daftar'}" onclick="toggleEvent('${e.id}')" ${locked ? 'aria-disabled="true"' : ''}>${joined ? '<i class="ph ph-check"></i>Terdaftar' : e.opens ? 'Ingatkan' : 'Daftar'}</button>
        </div>`;
      }).join('')}</div>
    </div>`;
}
const nf = n => n.toLocaleString('id-ID');

// ---------- Session rating (feeds the dashboard's CSAT) ----------
const RATE_TAGS = ['Merasa didengarkan', 'Saran jelas', 'Nyaman', 'Tepat waktu'];
function ratingCard(pid) {
  const p = provider(pid);
  if (!p || p.type !== 'psy') return '';
  const chat = state.chats[pid];
  // Each finished session asks for its own rating.
  const lastIdx = chat ? chat.messages.map(m => m.from === 'sys' && /selesai/i.test(m.text)).lastIndexOf(true) : -1;
  if (lastIdx < 0) return '';
  const r = state.ratings[pid];
  if (r?.done && (r.idx ?? lastIdx) >= lastIdx) return `<div class="bubble sys">Kamu memberi ${'★'.repeat(r.stars)} untuk sesi ini · terima kasih!</div>`;
  const d = ui.rateDraft?.[pid] || { stars: 0, tags: [] };
  return `
    <div class="rate-card">
      <p class="h3" style="font-size:14.5px">Bagaimana sesimu dengan ${esc(p.short || p.name)}?</p>
      <div class="stars" role="radiogroup" aria-label="Nilai sesi">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= d.stars ? 'on' : ''}" role="radio" aria-checked="${n === d.stars}" aria-label="${n} bintang" onclick="rateDraft('${pid}',${n})"><i class="${n <= d.stars ? 'ph-fill' : 'ph'} ph-star"></i></button>`).join('')}</div>
      ${d.stars ? `<div class="chips wrap mt-8">${RATE_TAGS.map(t => `<button class="chip ${d.tags.includes(t) ? 'on' : ''}" onclick="rateTag('${pid}','${t}')">${t}</button>`).join('')}</div>
        <button class="btn btn-primary btn-sm mt-12" onclick="submitRating('${pid}')">Kirim penilaian</button>` : '<p class="tiny mt-8">Penilaianmu anonim untuk kampus dan membantu kualitas layanan.</p>'}
    </div>`;
}
function rateDraft(pid, stars) { ui.rateDraft ||= {}; ui.rateDraft[pid] = { tags: [], ...(ui.rateDraft[pid] || {}), stars }; renderChatLog(pid); }
function rateTag(pid, t) {
  const d = ui.rateDraft[pid]; const i = d.tags.indexOf(t);
  i >= 0 ? d.tags.splice(i, 1) : d.tags.push(t); renderChatLog(pid);
}
function submitRating(pid) {
  const idx = state.chats[pid].messages.map(m => m.from === 'sys' && /selesai/i.test(m.text)).lastIndexOf(true);
  state.ratings[pid] = { ...ui.rateDraft[pid], done: true, at: dayKey(), idx };
  delete ui.rateDraft[pid]; persist(); renderChatLog(pid);
  toast('Terima kasih atas penilaianmu', 'ph-star');
}
