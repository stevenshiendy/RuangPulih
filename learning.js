// ===== RUANG PULIH — LEARNING (mock videos + interactive articles) =====
// Videos are animated illustrated scenes with timed captions, chapters and a transcript —
// a stand-in for real produced videos that keeps the brand look and works offline.

// ---------- Video scenes (320×180, animated with the shared .tool-svg motion classes) ----------
const SCENES = {
  stage: () => svg('0 0 320 180', `
    <rect width="320" height="180" fill="var(--m2)"/>
    <path class="a-line" d="M20 40h40l8-14 10 26 8-12h30" stroke="${CLAY}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
    <g class="a-breathe" ${origin(160, 96)}><circle cx="160" cy="96" r="58" fill="#fff" opacity=".16"/><circle cx="160" cy="96" r="40" fill="#fff" opacity=".22"/></g>
    <rect x="190" y="98" width="56" height="58" rx="8" fill="${FOREST}"/><rect x="184" y="92" width="68" height="12" rx="6" fill="#24472F"/>
    <g class="a-bob"><path d="M128 132c0-24 14-40 32-40s32 16 32 40c0 6-14 9-32 9s-32-3-32-9z" fill="${PAPER}"/>${face(160, 112, 'smile', 14)}</g>
    <g fill="${PAPER}" opacity=".9"><circle cx="40" cy="168" r="14"/><circle cx="76" cy="172" r="13"/><circle cx="270" cy="170" r="14"/><circle cx="300" cy="174" r="12"/></g>
    <g class="a-twinkle">${sparkle(270, 40, 1, PAPER)}</g><g class="a-twinkle d2">${sparkle(290, 74, .7, PAPER)}</g>`, 'illo tool-svg scene'),

  night: () => svg('0 0 320 180', `
    <rect width="320" height="180" fill="#2E3A52"/>
    <circle cx="250" cy="44" r="20" fill="#F3E3B5"/><circle cx="259" cy="37" r="17" fill="#2E3A52"/>
    <g class="a-twinkle">${sparkle(60, 30, .8)}</g><g class="a-twinkle d2">${sparkle(120, 52, .55)}</g><g class="a-twinkle d3">${sparkle(190, 26, .6)}</g><g class="a-twinkle">${sparkle(292, 92, .5)}</g>
    <rect x="70" y="118" width="180" height="40" rx="12" fill="#55688A"/><rect x="60" y="104" width="20" height="58" rx="8" fill="#6E81A3"/>
    <g class="a-bob"><path d="M92 120c0-14 10-24 24-24s24 10 24 24z" fill="var(--m4)"/>${face(116, 110, 'calm', 10)}</g>
    <path d="M100 120h146a10 10 0 0 1 10 10v8H100z" fill="#A3B5BD"/>
    <path class="a-rise" d="M150 86h9l-9 10h9" stroke="${PAPER}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="a-rise d2" d="M168 72h7l-7 8h7" stroke="${PAPER}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 'illo tool-svg scene'),

  chairs: () => svg('0 0 320 180', `
    <rect width="320" height="180" fill="var(--m4)"/>
    <rect x="0" y="146" width="320" height="34" fill="#fff" opacity=".22"/>
    <g fill="${PAPER}"><rect x="62" y="110" width="66" height="14" rx="7"/><rect x="66" y="124" width="6" height="26" rx="3"/><rect x="118" y="124" width="6" height="26" rx="3"/>
      <rect x="192" y="110" width="66" height="14" rx="7"/><rect x="196" y="124" width="6" height="26" rx="3"/><rect x="248" y="124" width="6" height="26" rx="3"/></g>
    <g class="a-bob"><path d="M70 112c0-20 11-34 25-34s25 14 25 34z" fill="var(--m2)"/>${face(95, 96, 'smile', 11)}</g>
    <g class="a-bob d2"><path d="M200 112c0-22 12-36 26-36s26 14 26 36z" fill="var(--m5)"/>${face(226, 94, 'calm', 11)}</g>
    <g class="a-twinkle"><rect x="104" y="40" width="54" height="26" rx="13" fill="${PAPER}"/><path d="M114 66l-4 8 12-8z" fill="${PAPER}"/><g fill="${INK}" opacity=".45"><circle cx="120" cy="53" r="2.4"/><circle cx="131" cy="53" r="2.4"/><circle cx="142" cy="53" r="2.4"/></g></g>
    <g class="a-twinkle d3"><rect x="176" y="30" width="44" height="24" rx="12" fill="${PAPER}"/><path d="M206 54l6 8-14-8z" fill="${PAPER}"/><path d="M188 42c-2.6-1.7-4.2-3.3-4.2-5.2 0-1.5 1.1-2.5 2.4-2.5 1.1 0 1.9.6 2.3 1.4.4-.8 1.2-1.4 2.3-1.4 1.3 0 2.4 1 2.4 2.5 0 1.9-1.6 3.5-5.2 5.2z" fill="${CLAY}" transform="translate(10 5)"/></g>
    <g class="a-sway" ${origin(288, 150)}><path d="M288 150v-30" stroke="${FOREST}" stroke-width="3" stroke-linecap="round"/><path d="M288 132c-10-2-16-8-16-16 10 0 16 6 16 16zM288 126c10-2 16-8 16-16-10 0-16 6-16 16z" fill="${FOREST}"/></g>`, 'illo tool-svg scene'),
};

const VIDEOS = [
  { id: 'v-present', title: 'Deg-degan sebelum presentasi', by: 'Dr. Dian Sasmita, M.Psi.', dur: 90, scene: 'stage',
    cta: ['Coba napas kotak', 'openBreathing()'],
    chapters: [[0, 'Kenapa jantung berdebar'], [35, 'Napas kotak 4-4-4-4'], [65, 'Latihan bertahap']],
    captions: [[0, 'Pernah deg-degan hebat sebelum presentasi? Kamu tidak sendirian.'],
      [8, 'Saat cemas, tubuh bersiap seperti menghadapi bahaya: jantung berdetak cepat, napas jadi pendek.'],
      [20, 'Itu bukan tanda kamu lemah. Itu tanda tubuhmu peduli pada hal yang penting buatmu.'],
      [35, 'Coba napas kotak: tarik empat hitungan, tahan empat, hembuskan empat, tahan empat.'],
      [50, 'Ulangi empat putaran. Detak jantung biasanya mulai melambat.'],
      [65, 'Lalu latih bertahap: di depan cermin, di depan satu teman, lalu kelompok kecil.'],
      [78, 'Setiap latihan kecil mengajari otakmu bahwa situasi ini aman.'],
      [86, 'Kamu bisa mulai napas kotak sekarang dari Alat bantu.']] },
  { id: 'v-sleep', title: 'Tidur nyenyak di musim ujian', by: 'Fajar Nugraha, M.Psi.', dur: 120, scene: 'night',
    cta: ['Mulai body scan', "openMeditation('body-scan')"],
    chapters: [[0, 'Kenapa tidur terganggu'], [26, 'Ritual sebelum tidur'], [60, 'Saat tidak bisa tidur'], [96, 'Kapan mencari bantuan']],
    captions: [[0, 'Musim ujian sering bikin tidur berantakan. Yuk, rapikan pelan-pelan.'],
      [12, 'Otak butuh sinyal bahwa hari sudah selesai. Buat ritual kecil 30 menit sebelum tidur.'],
      [26, 'Redupkan lampu, letakkan HP di luar jangkauan, dan hindari kafein setelah jam tiga sore.'],
      [42, 'Kalau pikiran terus berputar, tulis tiga hal yang mengganggu dan satu langkah kecil untuk besok.'],
      [60, 'Masih terjaga setelah 20 menit? Bangun sebentar, lakukan hal tenang, lalu kembali saat mengantuk.'],
      [78, 'Bangun di jam yang sama setiap hari, bahkan di akhir pekan.'],
      [96, 'Jika susah tidur berlangsung lebih dari dua minggu, bicarakan dengan psikolog.'],
      [110, 'Malam ini, coba body scan 10 menit di Alat bantu.']] },
  { id: 'v-first', title: 'Seperti apa sesi konseling pertama?', by: 'Siti Aminah, M.Psi.', dur: 105, scene: 'chairs',
    cta: ['Cari psikolog', "closeSheet();go('support',{supportTab:'psy'})"],
    chapters: [[0, 'Sebelum sesi'], [24, 'Saat sesi berlangsung'], [70, 'Setelah sesi']],
    captions: [[0, 'Mau mulai konseling tapi belum tahu gambarannya? Ini sesi pertama.'],
      [12, 'Sesi berlangsung sekitar 50 menit lewat video, dari tempat yang nyaman untukmu.'],
      [24, 'Psikolog akan bertanya apa yang membuatmu datang. Kamu boleh cerita sedikit atau banyak.'],
      [40, 'Tidak ada jawaban yang salah. Kamu juga boleh bilang kalau belum siap membahas sesuatu.'],
      [56, 'Isi sesi dijaga kerahasiaannya, termasuk dari kampusmu.'],
      [70, 'Di akhir sesi, kalian menyepakati tujuan kecil dan apakah perlu sesi berikutnya.'],
      [86, 'Setelah sesi, kamu bisa memberi penilaian untuk membantu layanan jadi lebih baik.'],
      [98, 'Siap? Pilih psikolog di tab Dukungan.']] },
];
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function learnVideosSection() {
  return `
    <div class="section">
      <div class="section-head"><h3 class="h2">Video singkat</h3><span class="tiny">dari psikolog Ruang Pulih</span></div>
      <div class="video-rail">${VIDEOS.map(v => `
        <button class="video-card" onclick="openVideo('${v.id}')" aria-label="Putar video ${v.title}, ${mmss(v.dur)}">
          <span class="video-poster paused">${SCENES[v.scene]()}<span class="v-play-badge"><i class="ph-fill ph-play"></i></span><span class="v-dur">${mmss(v.dur)}</span>
            ${state.watched?.[v.id] ? '<span class="v-watched"><i class="ph ph-check"></i>Ditonton</span>' : ''}</span>
          <span class="video-meta"><b>${v.title}</b><span class="tiny">${v.by}</span></span>
        </button>`).join('')}</div>
    </div>`;
}

// ---------- Video player ----------
const player = { v: null, t: 0, playing: false, speed: 1, cc: true, timer: null };
function openVideo(id) {
  const v = VIDEOS.find(x => x.id === id);
  Object.assign(player, { v, t: 0, playing: false, speed: 1 });
  openSheet({
    full: true,
    title: '<h2 class="h2">Video</h2>',
    onClose: () => { clearInterval(player.timer); player.playing = false; },
    body: `
      <div class="video-stage paused" id="vStage">
        ${SCENES[v.scene]()}
        <p class="v-caption" id="vCap"></p>
        <button class="v-bigplay" id="vBig" onclick="vToggle()" aria-label="Putar"><i class="ph-fill ph-play"></i></button>
        <span class="v-badge">Mock video</span>
      </div>
      <div class="v-controls">
        <button class="v-btn" id="vPlay" onclick="vToggle()" aria-label="Putar"><i class="ph-fill ph-play"></i></button>
        <span class="v-time" id="vTime">0:00</span>
        <input class="v-seek" id="vSeek" type="range" min="0" max="${v.dur}" step="0.25" value="0" oninput="vSeek(+this.value)" aria-label="Posisi video">
        <span class="v-time">${mmss(v.dur)}</span>
        <button class="v-btn txt" id="vSpeed" onclick="vSpeed()" aria-label="Kecepatan">1×</button>
        <button class="v-btn on" id="vCC" onclick="vCC()" aria-pressed="true" aria-label="Teks"><i class="ph ph-closed-captioning"></i></button>
      </div>
      <h2 class="h2 mt-16" style="font-size:22px">${v.title}</h2>
      <p class="tiny">${v.by} · ${mmss(v.dur)}</p>
      <p class="set-group-title mt-20">Bab</p>
      <div class="v-chapters">${v.chapters.map(([t, c]) => `<button class="v-chap" data-t="${t}" onclick="vSeek(${t}, true)"><span class="tiny">${mmss(t)}</span><b>${c}</b></button>`).join('')}</div>
      <p class="set-group-title mt-20">Transkrip</p>
      <div class="v-transcript">${v.captions.map(([t, c]) => `<button class="v-line" data-t="${t}" onclick="vSeek(${t}, true)"><span class="tiny">${mmss(t)}</span>${c}</button>`).join('')}</div>
      <button class="btn btn-primary btn-block mt-20" onclick="${v.cta[1]}">${v.cta[0]}</button>`,
  });
  vPaint();
}
function vToggle() {
  player.playing = !player.playing;
  if (player.playing && player.t >= player.v.dur) player.t = 0;
  clearInterval(player.timer);
  if (player.playing) player.timer = setInterval(() => {
    player.t = Math.min(player.v.dur, player.t + .25 * player.speed);
    if (player.t >= player.v.dur) { player.playing = false; clearInterval(player.timer); state.watched[player.v.id] = true; persist(); toast('Video selesai', 'ph-check-circle'); vDone(); progEvent('video:' + player.v.id); }
    vPaint();
  }, 250);
  vPaint();
}
function vSeek(t, play) {
  player.t = Math.max(0, Math.min(player.v.dur, t));
  if (play && !player.playing) vToggle(); else vPaint();
}
// End screen over the stage once the video finishes.
function vDone() {
  const stage = document.getElementById('vStage'); if (!stage || stage.querySelector('.v-end')) return;
  stage.insertAdjacentHTML('beforeend', `<div class="v-end"><span><i class="ph-fill ph-check-circle"></i></span><b>Video selesai</b><button class="btn btn-light btn-sm" onclick="this.closest('.v-end').remove();vSeek(0,true)"><i class="ph ph-arrow-counter-clockwise"></i>Tonton ulang</button></div>`);
}
function vSpeed() { player.speed = player.speed === 1 ? 1.25 : player.speed === 1.25 ? 1.5 : 1; vPaint(); }
function vCC() { player.cc = !player.cc; vPaint(); }
function vPaint() {
  const { v, t, playing } = player;
  const stage = document.getElementById('vStage'); if (!stage) return;
  stage.classList.toggle('paused', !playing);
  const icon = `<i class="ph-fill ph-${playing ? 'pause' : 'play'}"></i>`;
  document.getElementById('vPlay').innerHTML = icon;
  document.getElementById('vBig').style.opacity = playing ? 0 : 1;
  document.getElementById('vTime').textContent = mmss(t);
  const seek = document.getElementById('vSeek'); seek.value = t;
  seek.style.setProperty('--p', `${t / v.dur * 100}%`);
  document.getElementById('vSpeed').textContent = `${player.speed}×`.replace('.', ',');
  const ccBtn = document.getElementById('vCC'); ccBtn.classList.toggle('on', player.cc); ccBtn.setAttribute('aria-pressed', player.cc);
  const cap = [...v.captions].reverse().find(([s]) => s <= t);
  const capEl = document.getElementById('vCap');
  capEl.textContent = cap ? cap[1] : '';
  capEl.style.display = player.cc && (playing || t > 0) && cap ? '' : 'none';
  const chap = [...v.chapters].reverse().find(([s]) => s <= t)?.[0];
  document.querySelectorAll('.v-chap').forEach(b => b.classList.toggle('on', +b.dataset.t === chap));
  document.querySelectorAll('.v-line').forEach(b => b.classList.toggle('on', cap && +b.dataset.t === cap[0]));
}

// ---------- Interactive articles ----------
const INTERACTIVES = [
  { id: 'quiz', kind: 'Kuis', icon: 'ph-cards', title: 'Mitos atau fakta? Seputar terapi', sub: '5 kartu · 2 mnt', c: 'var(--m2)', art: 'therapy-myths', open: 'openQuiz()' },
  { id: 'thought', kind: 'Lembar kerja', icon: 'ph-notepad', title: 'Thought Record interaktif', sub: '6 langkah · 8 mnt', c: 'var(--m4)', art: 'thought-record', open: 'openThoughtRecord()' },
  { id: 'boundary', kind: 'Latihan', icon: 'ph-hand-palm', title: 'Susun kalimat batasanmu', sub: 'Pilih & salin · 3 mnt', c: 'var(--m3)', art: 'boundary', open: 'openBoundary()' },
];
function learnInteractiveSection() {
  return `
    <div class="section">
      <div class="section-head"><h3 class="h2">Interaktif</h3><span class="tiny">belajar sambil mencoba</span></div>
      <div class="stack-8">${INTERACTIVES.map(x => `
        <button class="card read-card interactive" style="width:100%;text-align:left;padding:12px" onclick="${x.open}">
          <span class="cover" style="--c:${x.c}">${coverArt(x.art)}</span>
          <div class="grow"><span class="tag tag-amber"><i class="ph ${x.icon}"></i>${x.kind}</span>
            <p class="h3" style="font-size:15px;margin-top:6px">${x.title}</p><p class="tiny">${x.sub}</p></div>
          <i class="ph ph-caret-right" style="color:var(--ink-3)"></i>
        </button>`).join('')}</div>
    </div>`;
}

// Quiz — myth or fact
const QUIZ = [
  ['Terapi hanya untuk orang dengan gangguan jiwa berat.', false, 'Terapi membantu siapa saja: stres kuliah, relasi, duka, sampai mengenal diri sendiri.'],
  ['Mencari bantuan profesional adalah tanda keberanian.', true, 'Mengakui butuh bantuan lalu mengambil langkah adalah bentuk kekuatan, bukan kelemahan.'],
  ['Psikolog akan memberi tahu kampus apa yang kamu ceritakan.', false, 'Isi sesi bersifat rahasia. Kampus hanya menerima data yang kamu izinkan sendiri.'],
  ['Teknik napas lambat bisa membantu meredakan cemas.', true, 'Napas yang diperlambat mengaktifkan sistem saraf yang menurunkan detak jantung.'],
  ['Sekali konseling, masalah pasti langsung selesai.', false, 'Pemulihan biasanya bertahap. Beberapa sesi membantu membangun kebiasaan baru.'],
];
const quiz = { i: 0, score: 0, answered: null };
function openQuiz(reset = true) {
  if (reset) Object.assign(quiz, { i: 0, score: 0, answered: null });
  if (quiz.i >= QUIZ.length) {
    const s = quiz.score;
    progEvent('quiz');
    return openSheet({ kind: 'quiz', title: '<h2 class="h2">Hasil kuis</h2>', body: `
      <div class="quiz-result">${pebble(s >= 4 ? 5 : s >= 3 ? 4 : 3).replace('class="pebble"', 'class="pebble" style="width:88px;height:88px"')}
        <p class="display" style="font-size:32px;margin-top:8px">${s} / ${QUIZ.length}</p>
        <p class="muted">${s >= 4 ? 'Keren! Kamu sudah paham banyak hal tentang terapi.' : s >= 3 ? 'Bagus! Beberapa mitos memang masih sering kita dengar.' : 'Tidak apa-apa — sekarang kamu tahu faktanya.'}</p></div>
      <button class="btn btn-primary btn-block mt-20" onclick="openArticle('therapy-myths')">Baca artikel lengkapnya</button>
      <button class="btn btn-ghost btn-block mt-8" onclick="openQuiz()">Ulangi kuis</button>` });
  }
  const [q, isFact, why] = QUIZ[quiz.i];
  const a = quiz.answered;
  openSheet({
    kind: 'quiz',
    title: `<h2 class="h2">Mitos atau fakta?</h2><span class="tiny">${quiz.i + 1}/${QUIZ.length}</span>`,
    body: `
      <div class="progress"><span style="width:${quiz.i / QUIZ.length * 100}%"></span></div>
      <div class="quiz-card ${a === null ? '' : a === isFact ? 'right' : 'wrong'}">
        <p class="quiz-q">“${q}”</p>
        ${a === null ? '' : `<p class="quiz-verdict"><i class="ph-fill ph-${a === isFact ? 'check-circle' : 'x-circle'}"></i>${a === isFact ? 'Tepat!' : 'Belum tepat.'} Ini ${isFact ? 'fakta' : 'mitos'}.</p><p class="quiz-why">${why}</p>`}
      </div>
      ${a === null ? `<div class="consent-actions"><button class="btn btn-ghost" onclick="answerQuiz(false)"><i class="ph ph-x"></i>Mitos</button><button class="btn btn-primary" onclick="answerQuiz(true)"><i class="ph ph-check"></i>Fakta</button></div>`
        : `<button class="btn btn-primary btn-block mt-20" onclick="quiz.i++;quiz.answered=null;openQuiz(false)">${quiz.i + 1 < QUIZ.length ? 'Kartu berikutnya' : 'Lihat hasil'}</button>`}`,
  });
}
function answerQuiz(v) { quiz.answered = v; if (v === QUIZ[quiz.i][1]) quiz.score++; openQuiz(false); }

// Thought record — guided worksheet
const TR_STEPS = [
  ['Situasi', 'Apa yang terjadi? Siapa, di mana, kapan.', 'text', 'Mis. Dosen mengembalikan tugasku dengan banyak coretan.'],
  ['Emosi', 'Apa yang kamu rasakan, dan seberapa kuat?', 'emotion'],
  ['Pikiran otomatis', 'Kalimat apa yang langsung muncul di kepalamu?', 'text', 'Mis. "Aku memang tidak bisa apa-apa."'],
  ['Bukti yang mendukung', 'Apa fakta yang membuat pikiran itu terasa benar?', 'text', 'Mis. Ada tiga bagian yang harus diperbaiki.'],
  ['Bukti yang menentang', 'Apa fakta yang menunjukkan pikiran itu tidak sepenuhnya benar?', 'text', 'Mis. Nilai tugas sebelumnya bagus; dosen juga memberi pujian.'],
  ['Pikiran alternatif', 'Tulis sudut pandang yang lebih seimbang.', 'text', 'Mis. "Tugas ini perlu perbaikan, bukan berarti aku gagal."'],
  ['Emosi sekarang', 'Setelah menulis semua ini, seberapa kuat perasaan tadi?', 'after'],
];
const EMOTIONS = ['Cemas', 'Sedih', 'Marah', 'Malu', 'Kecewa', 'Takut'];
const tr = { step: 0, data: {} };
function openThoughtRecord(reset = true) {
  if (reset) Object.assign(tr, { step: 0, data: { emotion: 'Cemas', before: 70, after: 70 } });
  const [title, help, type, ph] = TR_STEPS[tr.step];
  const d = tr.data;
  let input = '';
  if (type === 'text') input = `<textarea class="field mt-12" id="trIn" rows="4" placeholder="${ph}" oninput="tr.data['s${tr.step}']=this.value">${esc(d['s' + tr.step] || '')}</textarea>`;
  if (type === 'emotion') input = `
    <div class="chips wrap mt-12">${EMOTIONS.map(e => `<button class="chip ${d.emotion === e ? 'on' : ''}" onclick="tr.data.emotion='${e}';openThoughtRecord(false)">${e}</button>`).join('')}</div>
    <label class="tiny mt-16" style="display:block">Intensitas: <b id="trB">${d.before}%</b></label>
    <input type="range" min="0" max="100" step="5" value="${d.before}" class="tr-range" oninput="tr.data.before=+this.value;document.getElementById('trB').textContent=this.value+'%'">`;
  if (type === 'after') input = `
    <label class="tiny mt-12" style="display:block">${esc(d.emotion)} sekarang: <b id="trA">${d.after}%</b></label>
    <input type="range" min="0" max="100" step="5" value="${d.after}" class="tr-range" oninput="tr.data.after=+this.value;document.getElementById('trA').textContent=this.value+'%'">
    <p class="tiny mt-8">Tadi: ${d.before}%</p>`;
  const last = tr.step === TR_STEPS.length - 1;
  openSheet({
    kind: 'thought',
    title: `<h2 class="h2">Thought Record</h2><span class="tiny">${tr.step + 1}/${TR_STEPS.length}</span>`,
    body: `
      <div class="progress"><span style="width:${tr.step / TR_STEPS.length * 100}%"></span></div>
      <p class="tiny mt-16">Langkah ${tr.step + 1}</p>
      <p class="h2 mt-8" style="font-size:22px">${title}</p>
      <p class="muted mt-8" style="font-size:14px">${help}</p>
      ${input}
      <div class="consent-actions">
        <button class="btn btn-ghost" onclick="${tr.step ? 'tr.step--;openThoughtRecord(false)' : 'closeSheet()'}">${tr.step ? 'Kembali' : 'Batal'}</button>
        <button class="btn btn-primary" onclick="${last ? 'finishThoughtRecord()' : 'tr.step++;openThoughtRecord(false)'}">${last ? 'Selesai' : 'Lanjut'}</button>
      </div>`,
  });
}
function finishThoughtRecord() {
  const d = tr.data, drop = d.before - d.after;
  state.worksheets.push({ date: dayKey(), icon: 'ph-notepad', text: `Thought record · ${d.emotion} ${d.before}% → ${d.after}%${d.s5 ? ` · "${d.s5.slice(0, 60)}"` : ''}` });
  persist();
  onToolLogged('thought');
  openSheet({ kind: 'thought', title: '<h2 class="h2">Kerja bagus</h2>', body: `
    <div class="card card-sunken">
      <p class="tiny">${esc(d.emotion)}</p>
      <div class="tr-bars"><span>Sebelum</span><i style="width:${d.before}%"></i><b>${d.before}%</b></div>
      <div class="tr-bars after"><span>Sesudah</span><i style="width:${d.after}%"></i><b>${d.after}%</b></div>
    </div>
    <p class="mt-16" style="font-size:15px">${drop > 0 ? `Intensitas turun ${drop} poin. Itulah gunanya menantang pikiran otomatis.` : 'Tidak apa-apa kalau perasaannya belum berubah. Latihan ini makin terasa manfaatnya bila diulang.'}</p>
    <p class="tiny mt-8">Tersimpan di Catatanmu.</p>
    <button class="btn btn-primary btn-block mt-20" onclick="closeSheet();go('me')">Lihat Catatanmu</button>
    ${drop <= 0 ? `<button class="btn btn-ghost btn-block mt-8" onclick="closeSheet();go('support',{supportTab:'peer'})">Ngobrol dengan Teman Pulih</button>` : ''}` });
}

// Boundary builder
const BD = {
  situasi: ['diminta lembur di akhir pekan', 'chat kerja masuk lewat jam 9 malam', 'teman meminjam uang lagi', 'keluarga menanyakan nilaiku terus'],
  rasa: ['lelah', 'tertekan', 'tidak dihargai', 'cemas'],
  butuh: ['waktu istirahat yang jelas', 'membalas besok pagi', 'menolak kali ini', 'ruang untuk bercerita sendiri'],
};
const bd = { situasi: 0, rasa: 0, butuh: 0 };
function boundarySentence() { return `Aku merasa ${BD.rasa[bd.rasa]} ketika ${BD.situasi[bd.situasi]}. Aku butuh ${BD.butuh[bd.butuh]}. Semoga kamu bisa mengerti.`; }
function openBoundary() {
  const row = (k, label) => `<p class="set-group-title mt-16">${label}</p><div class="chips wrap">${BD[k].map((t, i) => `<button class="chip ${bd[k] === i ? 'on' : ''}" onclick="bd.${k}=${i};openBoundary()">${t}</button>`).join('')}</div>`;
  openSheet({
    kind: 'boundary',
    title: '<h2 class="h2">Susun kalimat batasan</h2>',
    body: `
      <p class="muted" style="font-size:14px">Gunakan pola "Aku merasa… ketika… Aku butuh…" agar tegas tanpa menyerang.</p>
      ${row('situasi', 'Ketika')}${row('rasa', 'Aku merasa')}${row('butuh', 'Aku butuh')}
      <div class="bd-preview mt-20"><i class="ph-fill ph-quotes"></i><p id="bdText">${boundarySentence()}</p></div>
      <div class="consent-actions">
        <button class="btn btn-ghost" onclick="navigator.clipboard?.writeText(boundarySentence()).catch(()=>{});toast('Kalimat disalin','ph-copy');progEvent('boundary')"><i class="ph ph-copy"></i>Salin</button>
        <button class="btn btn-primary" onclick="state.worksheets.push({date:dayKey(),icon:'ph-hand-palm',text:boundarySentence()});persist();toast('Tersimpan di Catatanmu','ph-check-circle');progEvent('boundary')">Simpan</button>
      </div>
      <button class="btn btn-soft btn-block mt-8" onclick="closeSheet();go('support',{supportTab:'peer'})"><i class="ph ph-chats-circle"></i>Latih bersama Teman Pulih</button>`,
  });
}

// ---------- Article check (finish indicator for reading) ----------
const ARTICLE_CHECKS = {
  'thought-record': ['Langkah mana yang membantu menantang pikiran negatif?', ['Menulis bukti yang mendukung dan menentang', 'Menghindari situasi pemicunya', 'Menunggu perasaannya hilang sendiri'], 0, 'Membandingkan bukti membantu kita melihat situasi dengan lebih seimbang.'],
  'therapy-myths': ['Siapa yang bisa terbantu oleh terapi?', ['Hanya orang dengan gangguan berat', 'Siapa saja, termasuk saat stres kuliah', 'Hanya yang sudah didiagnosis'], 1, 'Terapi bermanfaat untuk siapa saja yang ingin memahami dan merawat dirinya.'],
  boundary: ['Kalimat mana yang paling asertif?', ['"Kamu selalu bikin aku capek!"', '"Aku butuh membalas pesan kerja besok pagi."', '"Terserah kamu saja."'], 1, 'Pernyataan "aku" menyampaikan kebutuhan tanpa menyerang orang lain.'],
  burnout: ['Langkah kecil pertama saat burnout?', ['Menambah jam belajar', 'Mengurangi satu kewajiban minggu ini', 'Mengabaikannya sampai libur'], 1, 'Mengurangi beban memberi ruang untuk pulih.'],
};
function articleCheckHTML(id) {
  const c = ARTICLE_CHECKS[id]; if (!c) return '';
  return `
    <div class="card art-check mt-20" id="artCheck">
      <p class="tiny"><i class="ph ph-check-square"></i> Cek pemahaman${ui.programCtx?.key === 'article:' + id ? ' · menyelesaikan langkah program' : ''}</p>
      <p class="h3 mt-8" style="font-size:16px">${c[0]}</p>
      <div class="q-opts">${c[1].map((o, i) => `<button class="q-opt" onclick="answerArticle('${id}',${i})">${o}</button>`).join('')}</div>
    </div>`;
}
function answerArticle(id, i) {
  const c = ARTICLE_CHECKS[id]; const ok = i === c[2];
  const box = document.getElementById('artCheck');
  box.querySelectorAll('.q-opt').forEach((b, j) => { b.disabled = true; b.classList.toggle('on', j === c[2]); if (j === i && !ok) b.classList.add('wrong'); });
  box.insertAdjacentHTML('beforeend', `<p class="mt-12" style="font-size:14px"><b>${ok ? 'Tepat!' : 'Hampir.'}</b> ${c[3]}</p>`);
  state.watched['article:' + id] = true; persist();
  progEvent('article:' + id);
}
