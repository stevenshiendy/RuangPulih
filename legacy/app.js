// ===== RUANG PULIH — APP LOGIC =====

// --- State ---
const state = {
  currentScreen: 'home',
  moodHistory: JSON.parse(localStorage.getItem('rp_moods') || '[]'),
  journals: JSON.parse(localStorage.getItem('rp_journals') || '[]'),
  todayMood: null,
  userName: localStorage.getItem('rp_username') || 'Sahabat',
  isPremium: localStorage.getItem('rp_subscription') === 'premium',
};

// --- Apply saved username ---
document.getElementById('userName').textContent = state.userName;
const profileInput = document.getElementById('profileNameInput');
if (profileInput) profileInput.value = state.userName;

// --- Developer Settings ---
const devDefaults = { masterUnlock: true, kycVerified: true, threadInteract: true, storyPost: true, backendSim: true, premiumUser: false };
const devSettings = JSON.parse(localStorage.getItem('rp_dev_settings') || JSON.stringify(devDefaults));

function isFeatureEnabled(feature) {
  if (devSettings.masterUnlock) return true;
  return !!devSettings[feature];
}

function toggleDevSetting(key) {
  const checkbox = document.getElementById('dev' + key.charAt(0).toUpperCase() + key.slice(1));
  if (checkbox) {
    devSettings[key] = checkbox.checked;
  } else {
    devSettings[key] = !devSettings[key];
  }
  localStorage.setItem('rp_dev_settings', JSON.stringify(devSettings));
  syncDevToggles();
  showToast(devSettings[key] ? `✅ ${key} enabled` : `❌ ${key} disabled`);
}

function syncDevToggles() {
  Object.keys(devSettings).forEach(key => {
    const id = 'dev' + key.charAt(0).toUpperCase() + key.slice(1);
    const el = document.getElementById(id);
    if (el) el.checked = devSettings[key];
  });
}

// Sync on load
setTimeout(syncDevToggles, 100);

// --- Splash Screen ---
function dismissSplash() {
  const splash = document.getElementById('splashScreen');
  splash.classList.add('hidden');
  setTimeout(() => {
    splash.style.display = 'none';
    // Show SOS welcome popup on first visit
    if (!localStorage.getItem('rp_sos_welcomed')) {
      setTimeout(() => {
        document.getElementById('sosWelcome').classList.add('show');
      }, 400);
    }
  }, 700);
}

function dismissSosWelcome() {
  document.getElementById('sosWelcome').classList.remove('show');
  localStorage.setItem('rp_sos_welcomed', 'true');
}

// Auto-dismiss if user has visited before
if (localStorage.getItem('rp_visited')) {
  const splash = document.getElementById('splashScreen');
  splash.style.transition = 'none';
  splash.classList.add('hidden');
  splash.style.display = 'none';
} else {
  localStorage.setItem('rp_visited', 'true');
  setTimeout(dismissSplash, 2500);
}

// --- Time-based Greeting ---
(function setGreeting() {
  const hour = new Date().getHours();
  const el = document.querySelector('.greeting-hello');
  if (hour < 11) el.textContent = 'Selamat pagi';
  else if (hour < 15) el.textContent = 'Selamat siang';
  else if (hour < 18) el.textContent = 'Selamat sore';
  else el.textContent = 'Selamat malam';
})();

// --- Navigation ---
const screenMap = {
  home: 'screenHome',
  mood: 'screenMood',
  learn: 'screenLearn',
  consult: 'screenConsult',
  threads: 'screenThreads',
  inbox: 'screenInbox',
};

function switchTab(tab) {
  state.currentScreen = tab;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenMap[tab]);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`[data-screen="${screenMap[tab]}"]`);
  if (navBtn) navBtn.classList.add('active');
  const appScroll = document.getElementById('appScroll');
  if (appScroll) appScroll.scrollTo({ top: 0, behavior: 'smooth' });
  if (tab === 'mood') renderMoodChart();
  if (tab === 'consult') renderPsychologists();
  if (tab === 'inbox') renderInboxScreen();
}

// --- Mood Selection ---
const moodSlider = document.getElementById('moodSliderInput');
const moodDynamicEmoji = document.getElementById('moodDynamicEmoji');
const moodDynamicValue = document.getElementById('moodDynamicValue');

function getMoodInfo(value) {
  if (value <= 2) return { emoji: '😢', color: '#E74C3C' };
  if (value <= 4) return { emoji: '🙁', color: '#E67E22' };
  if (value <= 6) return { emoji: '😐', color: '#F1C40F' };
  if (value <= 8) return { emoji: '🙂', color: '#8BA888' };
  return { emoji: '😊', color: '#27AE60' };
}

if (moodSlider) {
  const displayContainer = document.querySelector('.mood-slider-display');
  
  const updateSliderBackground = (val) => {
    moodSlider.style.background = `linear-gradient(to right, var(--sage) ${val * 10}%, var(--bg) ${val * 10}%)`;
  };

  moodSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    
    // Show emoji container when sliding starts
    if (displayContainer && !displayContainer.classList.contains('show-emoji')) {
      displayContainer.classList.add('show-emoji');
    }

    if (moodDynamicValue) moodDynamicValue.textContent = `${val}/10`;
    
    if (moodDynamicEmoji) {
      const newEmoji = getMoodInfo(val).emoji;
      if (moodDynamicEmoji.textContent !== newEmoji) {
        moodDynamicEmoji.textContent = newEmoji;
        moodDynamicEmoji.classList.remove('pop');
        void moodDynamicEmoji.offsetWidth; // trigger reflow to restart animation
        moodDynamicEmoji.classList.add('pop');
      }
    }
    
    updateSliderBackground(val);
  });
}

function saveMood() {
  if (!moodSlider) return;
  const moodValue = parseInt(moodSlider.value);
  state.todayMood = moodValue;

  const today = new Date().toISOString().split('T')[0];
  const existing = state.moodHistory.findIndex(m => m.date === today);
  const info = getMoodInfo(moodValue);
  const entry = { date: today, mood: moodValue, emoji: info.emoji, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };

  if (existing >= 0) state.moodHistory[existing] = entry;
  else state.moodHistory.push(entry);

  localStorage.setItem('rp_moods', JSON.stringify(state.moodHistory));
  updateStreak();
  showToast('✅ Mood hari ini tersimpan!');
  triggerDynamicIsland('save-mood');
}

// --- Journal ---
function saveJournal() {
  const input = document.getElementById('journalInput');
  const text = input.value.trim();
  if (!text) { showToast('📝 Tulis sesuatu dulu ya...'); return; }

  state.journals.push({
    text,
    date: new Date().toISOString(),
    mood: state.todayMood
  });
  localStorage.setItem('rp_journals', JSON.stringify(state.journals));
  input.value = '';
  showToast('💚 Jurnal tersimpan. Terima kasih sudah berbagi.');
  triggerDynamicIsland('save-journal');
}

// --- Mood Chart ---
function renderMoodChart() {
  const container = document.getElementById('moodBars');
  const historyContainer = document.getElementById('moodHistory');
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  container.innerHTML = '';

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = state.moodHistory.find(m => m.date === dateStr);
    
    // Scale old 1-5 data if present
    let rawMood = entry ? entry.mood : null;
    if (rawMood !== null && rawMood <= 5 && (!entry.emoji || entry.emoji.includes('<i'))) {
       rawMood = rawMood * 2; 
    }

    const height = rawMood !== null ? (rawMood / 10) * 100 : 10;
    const info = rawMood !== null ? getMoodInfo(rawMood) : null;

    const col = document.createElement('div');
    col.className = 'mood-bar-col';
    col.innerHTML = `
      <span class="mood-bar-emoji">${info ? info.emoji : '·'}</span>
      <div class="mood-bar" style="height: ${height}%; background: ${info ? info.color : '#E0E0E0'};"></div>
      <span class="mood-bar-label">${days[d.getDay()]}</span>
    `;
    container.appendChild(col);
  }

  // Render mood history list
  if (historyContainer) {
    const recent = [...state.moodHistory].reverse().slice(0, 7);
    if (recent.length === 0) {
      historyContainer.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:20px;">Belum ada data mood. Mulai catat perasaanmu di Ruangku!</p>';
    } else {
      historyContainer.innerHTML = recent.map(m => {
        const date = new Date(m.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
        return `<div class="insight-item">
          <div class="insight-icon" style="font-size:1.3rem;">${m.emoji}</div>
          <div class="insight-text"><h4>${date}</h4><p>Dicatat pukul ${m.time || '-'}</p></div>
        </div>`;
      }).join('');
    }
  }
}

// Toolkit filter logic removed for Masterclass UI update

// --- Thread Category Filter ---
document.querySelector('.thread-categories')?.addEventListener('click', (e) => {
  const cat = e.target.closest('.thread-cat');
  if (!cat) return;
  document.querySelectorAll('.thread-cat').forEach(c => c.classList.remove('active'));
  cat.classList.add('active');
});

// --- SOS Modal ---
function openSOS() { document.getElementById('sosModal').classList.add('show'); }
function closeSOS() { document.getElementById('sosModal').classList.remove('show'); }

// --- Breathing Exercise ---
let breathingInterval = null;
let breathingRunning = false;

function openBreathing() { document.getElementById('breathingModal').classList.add('show'); }
function closeBreathing() {
  document.getElementById('breathingModal').classList.remove('show');
  stopBreathing();
}

document.getElementById('breathCircle')?.addEventListener('click', () => {
  if (breathingRunning) { stopBreathing(); return; }
  startBreathing();
});

function startBreathing() {
  breathingRunning = true;
  const circle = document.getElementById('breathCircle');
  const instruction = document.getElementById('breathInstruction');
  const phases = [
    { text: 'Tarik Napas', class: 'inhale', instruction: 'Hirup pelan... 4 detik' },
    { text: 'Tahan', class: 'hold', instruction: 'Tahan napas... 4 detik' },
    { text: 'Hembuskan', class: 'exhale', instruction: 'Hembuskan pelan... 4 detik' },
    { text: 'Tahan', class: 'hold', instruction: 'Istirahat... 4 detik' },
  ];
  let i = 0;

  function nextPhase() {
    const phase = phases[i % phases.length];
    circle.textContent = phase.text;
    circle.className = 'breathing-circle ' + phase.class;
    instruction.textContent = phase.instruction;
    triggerDynamicIsland('breathing', { text: phase.text });
    i++;
  }

  nextPhase();
  breathingInterval = setInterval(nextPhase, 4000);
}

function stopBreathing() {
  breathingRunning = false;
  clearInterval(breathingInterval);
  const circle = document.getElementById('breathCircle');
  circle.textContent = 'Mulai';
  circle.className = 'breathing-circle';
  document.getElementById('breathInstruction').textContent = 'Ketuk lingkaran untuk memulai';
  resetDynamicIsland();
}

// --- Toast ---
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// --- Dark Mode ---
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  const toggle = document.getElementById('darkModeToggle');
  if (toggle) toggle.checked = isDark;
  localStorage.setItem('rp_darkmode', isDark ? 'true' : 'false');

  // Update theme icon in top bar
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.innerHTML = isDark ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
  }

  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = isDark ? '#1A1D21' : '#5F7A61';

  // Update logo images
  const splashLogo = document.querySelector('.splash-logo');
  const topBarLogoImg = document.getElementById('topBarLogo');
  if (splashLogo) splashLogo.src = isDark ? 'assets/RuangPulihNight.svg' : 'assets/RuangPulih.svg';
  if (topBarLogoImg) topBarLogoImg.src = isDark ? 'assets/RuangPulihNight.svg' : 'assets/RuangPulih.svg';
}

// Apply saved dark mode preference on load
(function initDarkMode() {
  const saved = localStorage.getItem('rp_darkmode');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = true;
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.innerHTML = '<i class="ti ti-sun"></i>';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = '#1A1D21';

    // Update logo images on load
    const splashLogo = document.querySelector('.splash-logo');
    const topBarLogoImg = document.getElementById('topBarLogo');
    if (splashLogo) splashLogo.src = 'assets/RuangPulihNight.svg';
    if (topBarLogoImg) topBarLogoImg.src = 'assets/RuangPulihNight.svg';
  }
})();

// --- Settings Panel ---
function toggleProfile() {
  const overlay = document.getElementById('profileOverlay');
  overlay.classList.toggle('show');
  if (overlay.classList.contains('show')) {
    document.getElementById('profileNameInput').value = state.userName;
    const bio = localStorage.getItem('rp_bio') || '';
    const bioInput = document.getElementById('profileBioInput');
    if (bioInput) bioInput.value = bio;
    snapshotProfile();
    document.getElementById('profileEditActions')?.classList.remove('show');
    document.getElementById('statMoods').textContent = state.moodHistory.length;
    document.getElementById('statJournals').textContent = state.journals.length;
    document.getElementById('statStreak').textContent = calculateStreak();
    syncDevToggles();
  } else {
    saveProfile();
  }
}

function saveProfile() {
  const nameInput = document.getElementById('profileNameInput');
  const bioInput = document.getElementById('profileBioInput');
  const name = nameInput ? nameInput.value.trim() || 'Sahabat' : 'Sahabat';
  const bio = bioInput ? bioInput.value.trim() : '';
  
  state.userName = name;
  localStorage.setItem('rp_username', name);
  localStorage.setItem('rp_bio', bio);
  document.getElementById('userName').textContent = name;
}

// --- Profile Edit Actions ---
let _profileSnapshot = { name: '', bio: '' };

function snapshotProfile() {
  _profileSnapshot.name = document.getElementById('profileNameInput')?.value || '';
  _profileSnapshot.bio = document.getElementById('profileBioInput')?.value || '';
}

function showProfileEditActions() {
  const actions = document.getElementById('profileEditActions');
  if (actions) actions.classList.add('show');
}

function cancelProfileEdit() {
  document.getElementById('profileNameInput').value = _profileSnapshot.name;
  document.getElementById('profileBioInput').value = _profileSnapshot.bio;
  document.getElementById('profileEditActions').classList.remove('show');
  showToast('↩️ Perubahan dibatalkan');
}

function confirmProfileEdit() {
  saveProfile();
  snapshotProfile();
  document.getElementById('profileEditActions').classList.remove('show');
  showToast('✅ Profil berhasil diperbarui!');
}

function changeProfilePicture() {
  if (!isFeatureEnabled('backendSim')) {
    showToast('📷 Fitur unggah foto memerlukan backend.');
    return;
  }
  showToast('📷 Foto profil berhasil diubah! (simulasi)');
}

function openSettingsSection(section) {
  const backendSections = ['kyc', 'email', 'phone', 'privacy', 'delete-account'];
  
  if (backendSections.includes(section) && isFeatureEnabled('backendSim')) {
    const simLabels = {
      'kyc': '🪪 Identitas berhasil diverifikasi! (simulasi)',
      'email': '📧 Email settings dibuka (simulasi)',
      'phone': '📱 Pengaturan nomor telepon dibuka (simulasi)',
      'privacy': '🔒 Privasi settings dibuka (simulasi)',
      'delete-account': '⚠️ Konfirmasi hapus akun akan dikirim ke email (simulasi)',
    };
    showToast(simLabels[section]);
    return;
  }
  
  const sectionLabels = {
    'kyc': '🪪 Verifikasi Identitas — Fitur ini memerlukan integrasi backend.',
    'email': '📧 Pengaturan Email — Fitur ini memerlukan integrasi backend.',
    'phone': '📱 Nomor Telepon — Fitur ini memerlukan integrasi backend.',
    'saved': '🔖 Konten Tersimpan — Belum ada konten yang disimpan.',
    'liked': '❤️ Konten Disukai — Belum ada konten yang disukai.',
    'archive': '📦 Arsip — Belum ada konten yang diarsipkan.',
    'thread-insights': '📊 Performa Threads — Analytics akan segera hadir!',
    'teman-pulih-kpi': '📈 Teman Pulih KPI — Dashboard monitoring akan segera hadir!',
    'privacy': '🔒 Pengaturan Privasi — Fitur ini memerlukan integrasi backend.',
    'help': '💬 Pusat Bantuan — Hubungi support@ruangpulih.id',
    'about': '📋 Ruang Pulih v1.0.0\n\nPrivacy Policy & Terms of Use tersedia di ruangpulih.id/legal',
    'delete-account': '⚠️ Hapus Akun — Fitur ini memerlukan konfirmasi & integrasi backend.',
  };
  showToast(sectionLabels[section] || 'Fitur segera hadir!');
}

function handleLogout() {
  if (confirm('Apakah kamu yakin ingin keluar?')) {
    showToast('👋 Sampai jumpa lagi!');
    document.getElementById('profileOverlay').classList.remove('show');
  }
}

// --- Notification Panel ---
function toggleNotif() {
  document.getElementById('notifOverlay').classList.toggle('show');
}

// Close overlays on backdrop click
document.getElementById('profileOverlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) toggleProfile();
});
document.getElementById('notifOverlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) toggleNotif();
});

// --- Streak Calculation ---
function calculateStreak() {
  return 32;
}

function updateStreak() {
  const streak = calculateStreak();
  const el = document.getElementById('streakCount');
  if (el) el.textContent = streak;
}

// --- Ambient Particles ---
function createParticles() {
  const container = document.getElementById('ambientParticles');
  if (!container) return;
  const colors = ['rgba(139,168,136,0.3)', 'rgba(165,199,217,0.25)', 'rgba(212,197,169,0.2)', 'rgba(212,144,122,0.15)'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 8 + 4;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 12 + 10}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

// --- Initialize ---
renderMoodChart();
updateStreak();
// createParticles();

// --- Gratitude Journal Modal ---
function openGratitude() {
  document.getElementById('gratitude1').value = '';
  document.getElementById('gratitude2').value = '';
  document.getElementById('gratitude3').value = '';
  document.getElementById('gratitudeModal').classList.add('show');
}

function closeGratitude() {
  document.getElementById('gratitudeModal').classList.remove('show');
}

function saveGratitude() {
  const g1 = document.getElementById('gratitude1').value.trim();
  const g2 = document.getElementById('gratitude2').value.trim();
  const g3 = document.getElementById('gratitude3').value.trim();
  
  if (!g1 && !g2 && !g3) {
    showToast('🙏 Tuliskan setidaknya satu hal yang kamu syukuri...');
    return;
  }
  
  const textContent = `Gratitude Journal:\n1. ${g1 || '-'}\n2. ${g2 || '-'}\n3. ${g3 || '-'}`;
  
  state.journals.push({
    text: textContent,
    date: new Date().toISOString(),
    type: 'gratitude'
  });
  
  localStorage.setItem('rp_journals', JSON.stringify(state.journals));
  closeGratitude();
  showToast('✨ Rasa syukurmu telah tersimpan.');
  triggerDynamicIsland('save-gratitude');
}

// --- Article Reader ---
const articlesData = {
  'thought-record': {
    title: 'Mengisi Jurnal Thought Record CBT',
    meta: '⏱ 15 menit · Lembar Kerja CBT',
    body: `
      <h4 class="article-section-title">Apa itu Thought Record?</h4>
      <p>Thought Record (Catatan Pikiran) adalah salah satu teknik Cognitive Behavioral Therapy (CBT) yang paling efektif untuk mengidentifikasi dan menantang pikiran negatif otomatis (Negative Automatic Thoughts/NATs) yang memicu emosi buruk.</p>
      
      <h4>Langkah-Langkah Mengisi Thought Record:</h4>
      <p><strong>1. Situasi:</strong> Deskripsikan apa yang terjadi. Siapa, apa, kapan, dan di mana.</p>
      <p><strong>2. Emosi:</strong> Identifikasi emosi yang Anda rasakan (misalnya cemas, sedih, marah) dan beri rating intensitasnya dari 0% hingga 100%.</p>
      <p><strong>3. Pikiran Otomatis:</strong> Tuliskan pikiran persis yang muncul di kepala Anda saat situasi tersebut terjadi.</p>
      <p><strong>4. Bukti yang Mendukung:</strong> Apa bukti nyata bahwa pikiran negatif tersebut benar?</p>
      <p><strong>5. Bukti yang Menentang:</strong> Apa bukti nyata bahwa pikiran negatif tersebut <em>tidak sepenuhnya benar</em>?</p>
      <p><strong>6. Pikiran Alternatif:</strong> Tuliskan sudut pandang baru yang lebih seimbang dan rasional berdasarkan bukti-bukti yang ada.</p>
      <p><strong>7. Evaluasi Emosi:</strong> Nilai kembali intensitas emosi awal Anda sekarang. Apakah sudah berkurang?</p>
      
      <h4>Mari Mulai Praktik</h4>
      <p>Cobalah menuliskan catatan pikiran pertama Anda menggunakan panduan di atas di selembar kertas atau di jurnal digital Anda. Latihan teratur akan membantu melatih otak Anda untuk berpikir secara lebih seimbang.</p>
    `
  },
  'boundary': {
    title: 'Mengenal Boundary Setting yang Sehat',
    meta: '⏱ 5 menit baca · Hubungan',
    body: `
      <h4 class="article-section-title">Mengapa Batasan (Boundaries) itu Penting?</h4>
      <p>Menetapkan batasan atau <em>boundary setting</em> bukan tentang egois atau menjauhkan diri dari orang lain. Batasan adalah panduan yang kita buat agar orang lain tahu bagaimana cara memperlakukan kita dengan aman dan penuh rasa hormat.</p>
      
      <h4>Tanda Anda Memerlukan Batasan yang Lebih Kuat:</h4>
      <p>• Sering merasa lelah atau kesal karena selalu berkata "Ya" saat ingin berkata "Tidak".</p>
      <p>• Merasa bertanggung jawab atas kebahagiaan dan emosi orang lain.</p>
      <p>• Merasa dimanfaatkan oleh teman atau rekan kerja.</p>
      <p>• Takut ditolak jika mengekspresikan pendapat atau kebutuhan pribadi.</p>
      
      <h4>Cara Menetapkan Batasan Tanpa Rasa Bersalah:</h4>
      <p><strong>1. Kenali Kebutuhan Anda:</strong> Anda tidak bisa menetapkan batasan jika Anda sendiri tidak tahu apa yang membuat Anda merasa nyaman atau tidak nyaman.</p>
      <p><strong>2. Berkomunikasi secara Tegas (Asertif):</strong> Sampaikan batasan Anda dengan jelas, tenang, dan jujur tanpa perlu bersikap defensif atau marah.</p>
      <p><strong>3. Gunakan Pernyataan "Saya":</strong> Fokus pada perasaan dan kebutuhan Anda sendiri. Contoh: <em>"Saya merasa lelah jika harus membalas pesan kerja di atas jam 8 malam, jadi saya akan membalasnya besok pagi."</em></p>
      <p><strong>4. Latihan Konsistensi:</strong> Menetapkan batasan adalah sebuah proses berkelanjutan. Latihlah secara konsisten agar orang lain terbiasa menghormatinya.</p>
    `
  },
  'therapy-myths': {
    title: 'Debunking Mitos-Mitos Terapi',
    meta: '⏱ 7 menit baca · Psikoedukasi',
    body: `
      <h4 class="article-section-title">Menghapus Stigma Kesehatan Mental</h4>
      <p>Meskipun kesadaran kesehatan mental terus meningkat, masih banyak mitos keliru seputar terapi psikologis yang beredar di masyarakat. Mari kita luruskan mitos-mitos tersebut agar lebih banyak orang berani mencari bantuan.</p>
      
      <h4>Mitos 1: "Terapi hanya untuk orang yang mengalami gangguan jiwa berat."</h4>
      <p><strong>Fakta:</strong> Terapi bermanfaat bagi siapa saja! Anda tidak perlu berada di titik terendah atau memiliki diagnosis klinis untuk berkonsultasi dengan psikolog. Terapi sangat berguna untuk mengatasi stres kerja, masalah hubungan, duka, transisi hidup, hingga eksplorasi diri.</p>
      
      <h4>Mitos 2: "Datang ke psikolog berarti saya lemah dan tidak bisa menyelesaikan masalah sendiri."</h4>
      <p><strong>Fakta:</strong> Mengakui bahwa Anda butuh bantuan dan mengambil langkah aktif untuk menemui profesional adalah tanda keberanian dan kekuatan yang luar biasa, bukan kelemahan.</p>
      
      <h4>Mitos 3: "Psikolog hanya akan mendengarkan saya mengeluh dan memberi saran klise."</h4>
      <p><strong>Fakta:</strong> Proses terapi adalah kolaborasi aktif. Psikolog menggunakan metode ilmiah yang terstruktur untuk membantu Anda memahami pola pikir, meregulasi emosi, dan merumuskan solusi nyata yang cocok untuk diri Anda sendiri.</p>
      
      <h4>Mitos 4: "Terapi itu mahal dan hanya untuk kalangan tertentu."</h4>
      <p><strong>Fakta:</strong> Saat ini ada banyak pilihan konseling terjangkau, termasuk layanan gratis di Puskesmas tertentu, konsultasi menggunakan BPJS Kesehatan, hingga platform konseling online dengan tarif yang ramah di kantong.</p>
    `
  }
};

function openArticle(articleId) {
  const art = articlesData[articleId];
  if (!art) {
    showToast('📖 Konten tidak ditemukan');
    return;
  }
  
  const body = document.getElementById('articleBody');
  body.innerHTML = `
    <h1 class="article-title">${art.title}</h1>
    <div class="article-meta">
      <span>${art.meta}</span>
      <span>•</span>
      <span>Oleh Ruang Pulih</span>
    </div>
    <div class="article-content">
      ${art.body}
    </div>
  `;
  
  document.getElementById('articleModal').classList.add('show');
}

function closeArticle() {
  document.getElementById('articleModal').classList.remove('show');
}

// --- Meditation Timer Modal ---
let meditationInterval = null;
let meditationSecondsLeft = 600;
let meditationTotalSeconds = 600;
let meditationRunning = false;

const meditationsData = {
  'body-scan': {
    title: 'Body Scan Meditation 🧘',
    duration: 600,
    guide: 'Pejamkan mata, tarik napas dalam-dalam, dan rasakan sensasi di setiap bagian tubuh Anda...'
  },
  'loving-kindness': {
    title: 'Loving-Kindness Meditation 🌊',
    duration: 480,
    guide: 'Salurkan energi kasih sayang dan kedamaian untuk diri Anda, orang terdekat, dan dunia...'
  }
};

function openMeditation(medId) {
  const med = meditationsData[medId] || meditationsData['body-scan'];
  document.getElementById('medTitle').textContent = med.title;
  document.getElementById('medGuide').textContent = med.guide;
  
  meditationSecondsLeft = med.duration;
  meditationTotalSeconds = med.duration;
  meditationRunning = false;
  
  updateMeditationDisplay();
  
  const playBtn = document.getElementById('medPlayBtn');
  playBtn.textContent = '▶ Mulai';
  playBtn.classList.remove('playing');
  
  document.getElementById('meditationModal').classList.add('show');
}

function closeMeditation() {
  stopMeditationTimer();
  document.getElementById('meditationModal').classList.remove('show');
}

function updateMeditationDisplay() {
  const mins = Math.floor(meditationSecondsLeft / 60);
  const secs = meditationSecondsLeft % 60;
  document.getElementById('medTimer').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const progressPercent = ((meditationTotalSeconds - meditationSecondsLeft) / meditationTotalSeconds) * 100;
  document.getElementById('medProgressBar').style.width = `${progressPercent}%`;
}

function toggleMeditation() {
  if (meditationRunning) {
    pauseMeditationTimer();
  } else {
    startMeditationTimer();
  }
}

function startMeditationTimer() {
  meditationRunning = true;
  const playBtn = document.getElementById('medPlayBtn');
  playBtn.textContent = '⏸ Jeda';
  playBtn.classList.add('playing');
  
  // Initial dynamic island update
  const initMins = Math.floor(meditationSecondsLeft / 60);
  const initSecs = meditationSecondsLeft % 60;
  triggerDynamicIsland('meditation', { time: `${initMins.toString().padStart(2, '0')}:${initSecs.toString().padStart(2, '0')}` });
  
  meditationInterval = setInterval(() => {
    if (meditationSecondsLeft > 0) {
      meditationSecondsLeft--;
      updateMeditationDisplay();
      
      // Update dynamic island
      if (currentIslandState === 'meditation' || currentIslandState === 'normal') {
        const mins = Math.floor(meditationSecondsLeft / 60);
        const secs = meditationSecondsLeft % 60;
        triggerDynamicIsland('meditation', { time: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` });
      }
      
      const medGuide = document.getElementById('medGuide');
      if (meditationSecondsLeft % 20 === 0) {
        const guides = [
          'Bernapaslah dengan tenang dan teratur...',
          'Lepaskan segala ketegangan di bahu Anda...',
          'Fokuskan pikiran Anda sepenuhnya pada momen ini...',
          'Biarkan pikiran negatif berlalu begitu saja...',
          'Rasakan detak jantung Anda yang tenang...',
          'Tarik ketenangan, hembuskan kekhawatiran...'
        ];
        medGuide.textContent = guides[Math.floor(Math.random() * guides.length)];
      }
    } else {
      stopMeditationTimer();
      showToast('🎉 Meditasi selesai. Semoga harimu damai!');
      closeMeditation();
    }
  }, 1000);
}

function pauseMeditationTimer() {
  meditationRunning = false;
  clearInterval(meditationInterval);
  const playBtn = document.getElementById('medPlayBtn');
  playBtn.textContent = '▶ Lanjutkan';
  playBtn.classList.remove('playing');
  resetDynamicIsland();
}

function stopMeditationTimer() {
  meditationRunning = false;
  clearInterval(meditationInterval);
  resetDynamicIsland();
}

// Close modal overlays on backdrop click
document.getElementById('gratitudeModal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeGratitude();
});

// Restore today's mood selection
const today = new Date().toISOString().split('T')[0];
const todayEntry = state.moodHistory.find(m => m.date === today);
if (todayEntry && moodSlider) {
  let val = todayEntry.mood;
  if (val <= 5 && (!todayEntry.emoji || todayEntry.emoji.includes('<i'))) val = val * 2;
  if (moodSlider) moodSlider.value = val;
  
  const displayContainer = document.querySelector('.mood-slider-display');
  if (displayContainer) displayContainer.classList.add('show-emoji');
  
  if (moodDynamicValue) moodDynamicValue.textContent = `${val}/10`;
  if (moodDynamicEmoji) moodDynamicEmoji.textContent = getMoodInfo(val).emoji;
  if (moodSlider) moodSlider.style.background = `linear-gradient(to right, var(--sage) ${val * 10}%, var(--bg) ${val * 10}%)`;
}

// ==========================================
// ===== KONSULTASI & KOTAK MASUK (INBOX) =====
// ==========================================

const psychologists = [
  {
    id: 'dian',
    name: 'Dr. Dian Sasmita, M.Psi.',
    specialty: 'Kecemasan & Trauma',
    category: 'anxiety',
    rating: '4.9',
    reviews: 124,
    price: 'Rp 120.000/jam',
    status: 'online',
    initials: 'DS',
    bio: 'Fokus pada Cognitive Behavioral Therapy (CBT) untuk mengatasi kecemasan berlebih dan trauma masa lalu.'
  },
  {
    id: 'fajar',
    name: 'Fajar Nugraha, M.Psi.',
    specialty: 'Hubungan & Depresi',
    category: 'relationship',
    rating: '4.8',
    reviews: 95,
    price: 'Rp 100.000/jam',
    status: 'online',
    initials: 'FN',
    bio: 'Membantu penyelarasan emosi dalam hubungan interpersonal dan pemulihan gejala depresi klinis.'
  },
  {
    id: 'siti',
    name: 'Siti Aminah, M.Psi.',
    specialty: 'Keluarga & Anak',
    category: 'relationship',
    rating: '5.0',
    reviews: 62,
    price: 'Rp 130.000/jam',
    status: 'offline',
    initials: 'SA',
    bio: 'Spesialis konsultasi pola asuh anak, dinamika keluarga, dan bimbingan emosi anak remaja.'
  },
  {
    id: 'rudi',
    name: 'Rudi Hermawan, M.Psi.',
    specialty: 'Pengembangan Diri & Karir',
    category: 'self',
    rating: '4.7',
    reviews: 80,
    price: 'Rp 95.000/jam',
    status: 'online',
    initials: 'RH',
    bio: 'Membimbing pencarian jati diri, mengatasi burnout kerja, serta perencanaan karir berbasis wellness.'
  }
];

const initialInbox = [
  {
    psychologistId: 'dian',
    name: 'Dr. Dian Sasmita, M.Psi.',
    specialty: 'Kecemasan & Trauma',
    lastMessage: 'Bagaimana perkembangan latihan napasmu hari ini?',
    time: '10m lalu',
    unread: true,
    initials: 'DS',
    messages: [
      { sender: 'psychologist', text: 'Halo Sahabat Ruang Pulih, selamat sore.', time: '10:30' },
      { sender: 'psychologist', text: 'Bagaimana perkembangan latihan napasmu hari ini?', time: '10:31' }
    ]
  },
  {
    psychologistId: 'fajar',
    name: 'Fajar Nugraha, M.Psi.',
    specialty: 'Hubungan & Depresi',
    lastMessage: 'Halo! Ada yang bisa saya bantu terkait keluhanmu?',
    time: '2 jam lalu',
    unread: false,
    initials: 'FN',
    messages: [
      { sender: 'psychologist', text: 'Halo! Ada yang bisa saya bantu terkait keluhanmu?', time: '08:15' }
    ]
  }
];

let inbox = JSON.parse(localStorage.getItem('rp_inbox') || '[]');
if (inbox.length === 0) {
  inbox = initialInbox;
  localStorage.setItem('rp_inbox', JSON.stringify(inbox));
}

let activeChatId = null;
let currentConsultCat = 'all';

function renderPsychologists() {
  const container = document.getElementById('psychologistsList');
  if (!container) return;
  
  container.innerHTML = '';
  const search = document.getElementById('consultSearch')?.value || '';
  
  const filtered = psychologists.filter(p => {
    const matchesCat = currentConsultCat === 'all' || p.category === currentConsultCat;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.specialty.toLowerCase().includes(search.toLowerCase()) ||
                          p.bio.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 20px; color: var(--text-secondary); width: 100%;">
        <i class="ti ti-search-off" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.7; color: var(--sage);"></i>
        <p>Psikolog tidak ditemukan</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(p => {
    const isOnline = p.status === 'online';
    const card = document.createElement('div');
    card.className = 'psychologist-card';
    card.innerHTML = `
      <div class="psychologist-card-top">
        <div class="psychologist-avatar-wrapper">
          <div class="psychologist-avatar">${p.initials}</div>
          <span class="chat-status-dot ${p.status}"></span>
        </div>
        <div class="psychologist-info">
          <h3>${p.name}</h3>
          <p class="psychologist-spec">${p.specialty}</p>
          <div class="psychologist-meta">
            <span class="psychologist-rating"><i class="ti ti-star-filled" style="color:#F1C40F;"></i> ${p.rating} (${p.reviews})</span>
            <span class="psychologist-price">${p.price}</span>
          </div>
        </div>
      </div>
      <p class="psychologist-bio">${p.bio}</p>
      <div class="psychologist-card-actions">
        <button class="psychologist-btn ${isOnline ? 'active' : 'offline'}" onclick="startConsultation('${p.id}')">
          <i class="ti ti-brand-telegram"></i> ${isOnline ? 'Konsultasi Sekarang' : 'Tinggalkan Pesan'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterPsychologists() {
  renderPsychologists();
}

function filterConsultCat(cat) {
  currentConsultCat = cat;
  document.querySelectorAll('.consult-cat').forEach(btn => {
    if (btn.getAttribute('data-cat') === cat) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderPsychologists();
}

function toggleInbox() {
  // Redirect to inbox tab instead of old overlay
  switchTab('inbox');
}

function renderInboxScreen() {
  const container = document.getElementById('inboxDmList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (inbox.length === 0) {
    container.innerHTML = `
      <div class="inbox-dm-empty">
        <i class="ti ti-mail-opened"></i>
        <p>Belum ada pesan. Mulai konsultasi untuk terhubung dengan psikolog.</p>
      </div>
    `;
    return;
  }
  
  inbox.forEach(chat => {
    const psych = psychologists.find(p => p.id === chat.psychologistId) || chat;
    const item = document.createElement('div');
    item.className = `inbox-dm-item ${chat.unread ? 'unread' : ''}`;
    item.onclick = () => {
      chat.unread = false;
      localStorage.setItem('rp_inbox', JSON.stringify(inbox));
      updateInboxBadge();
      renderInboxScreen();
      openChat(chat.psychologistId);
    };
    
    item.innerHTML = `
      <div class="inbox-dm-left">
        <div class="inbox-dm-avatar-wrap">
          <div class="inbox-dm-avatar">${chat.initials}</div>
          <span class="chat-status-dot ${psych.status}"></span>
        </div>
        <div class="inbox-dm-info">
          <h4>${chat.name}</h4>
          <p class="inbox-dm-msg">${chat.lastMessage}</p>
        </div>
      </div>
      <div class="inbox-dm-meta">
        <span class="inbox-dm-time">${chat.time}</span>
        ${chat.unread ? '<span class="inbox-dm-unread-dot"></span>' : ''}
      </div>
    `;
    container.appendChild(item);
  });
}

function updateInboxBadge() {
  const badge = document.getElementById('navInboxBadge');
  if (!badge) return;
  const unreadCount = inbox.filter(c => c.unread).length;
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function startConsultation(psychologistId) {
  let chat = inbox.find(c => c.psychologistId === psychologistId);
  if (!chat) {
    const psych = psychologists.find(p => p.id === psychologistId);
    chat = {
      psychologistId: psychologistId,
      name: psych.name,
      specialty: psych.specialty,
      lastMessage: 'Halo! Ada yang bisa saya bantu?',
      time: 'Baru saja',
      unread: false,
      initials: psych.initials,
      messages: [
        { sender: 'psychologist', text: `Halo! Saya ${psych.name}. Ada yang bisa saya bantu hari ini terkait kesehatan emosional Anda?`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ]
    };
    inbox.unshift(chat);
    localStorage.setItem('rp_inbox', JSON.stringify(inbox));
  }
  
  openChat(psychologistId);
}

function openChat(psychologistId) {
  activeChatId = psychologistId;
  const chat = inbox.find(c => c.psychologistId === psychologistId);
  const psych = psychologists.find(p => p.id === psychologistId) || chat;
  
  document.getElementById('chatPsychAvatar').textContent = chat.initials;
  document.getElementById('chatPsychName').textContent = chat.name;
  document.getElementById('chatPsychSpecialty').textContent = chat.specialty;
  
  const statusDot = document.getElementById('chatPsychStatus');
  statusDot.className = `chat-status-dot ${psych.status}`;
  
  const overlay = document.getElementById('chatOverlay');
  overlay.classList.add('show');
  
  renderChatMessages();
}

function closeChat() {
  document.getElementById('chatOverlay').classList.remove('show');
  activeChatId = null;
}

function renderChatMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  container.innerHTML = '';
  const chat = inbox.find(c => c.psychologistId === activeChatId);
  if (!chat) return;
  
  chat.messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `chat-msg ${msg.sender === 'user' ? 'outgoing' : 'incoming'}`;
    div.innerHTML = `
      <div class="chat-msg-bubble">
        <p>${msg.text}</p>
        <span class="chat-msg-time">${msg.time}</span>
      </div>
    `;
    container.appendChild(div);
  });
  
  container.scrollTop = container.scrollHeight;
}

const psychologistAutoReplies = {
  'dian': [
    "Terima kasih sudah berbagi, Sahabat. Tarik napas perlahan... ketahuilah bahwa kecemasan adalah reaksi emosional yang wajar. Apakah Anda ingin mencoba teknik grounding 5-4-3-2-1 bersama saya?",
    "Saya di sini menemani Anda. Ceritakan lebih detail tentang apa yang sedang memicu kecemasan Anda saat ini.",
    "Bagus sekali Anda bisa menyadari kecemasan ini. Mari kita selaraskan kembali fokus kita ke masa kini secara perlahan."
  ],
  'fajar': [
    "Saya sangat mengerti perasaan Anda. Menjaga batas emosional dalam hubungan bisa jadi menantang. Bagaimana pola komunikasi Anda dengan pasangan saat ini?",
    "Menghadapi masa-masa sulit dalam hubungan memang tidak mudah, namun Anda tidak sendirian. Mari kita uraikan benang kusutnya satu per satu.",
    "Terima kasih atas keterbukaan Anda. Mari kita fokus mencari celah kecil yang bisa kita perbaiki hari ini."
  ],
  'siti': [
    "Menghadapi dinamika keluarga memerlukan kesabaran yang luar biasa. Berikan ruang bagi diri Anda untuk memprosesnya terlebih dahulu.",
    "Pola komunikasi yang asertif adalah kunci utama. Mari kita diskusikan bagaimana cara terbaik menyampaikan perasaan Anda ke anggota keluarga.",
    "Saya sangat menghargai niat baik Anda untuk memperbaiki keadaan keluarga ini. Mari kita rumuskan solusinya."
  ],
  'rudi': [
    "Burnout adalah alarm dari tubuh Anda yang meminta istirahat. Kapan terakhir kali Anda mengambil waktu jeda penuh untuk diri sendiri?",
    "Mengembangkan karir memang penting, namun keseimbangan mental Anda jauh lebih bernilai. Mari buat rencana aksi mingguan yang lebih sehat.",
    "Bagus sekali! Kesadaran untuk tumbuh adalah langkah awal yang luar biasa. Apa target kecil yang ingin Anda capai minggu ini?"
  ]
};

function sendChatMessage() {
  const input = document.getElementById('chatInputText');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  
  const chat = inbox.find(c => c.psychologistId === activeChatId);
  if (!chat) return;
  
  const nowStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  chat.messages.push({ sender: 'user', text: text, time: nowStr });
  chat.lastMessage = text;
  chat.time = 'Baru saja';
  
  input.value = '';
  renderChatMessages();
  localStorage.setItem('rp_inbox', JSON.stringify(inbox));
  
  simulatePsychologistReply(chat.psychologistId);
}

function simulatePsychologistReply(psychId) {
  const chat = inbox.find(c => c.psychologistId === psychId);
  if (!chat) return;
  
  const container = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-msg incoming typing';
  typingDiv.id = 'typingBubble';
  typingDiv.innerHTML = `
    <div class="chat-msg-bubble">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  
  setTimeout(() => {
    const bubble = document.getElementById('typingBubble');
    if (bubble) bubble.remove();
    
    const replies = psychologistAutoReplies[psychId] || [
      "Terima kasih sudah bercerita. Saya sangat memahami kondisi Anda saat ini. Mari kita cari solusinya bersama.",
      "Saya mendengarkan Anda. Luapkan saja semua perasaan Anda di sini, ini adalah ruang aman Anda."
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    const nowStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    chat.messages.push({ sender: 'psychologist', text: replyText, time: nowStr });
    chat.lastMessage = replyText;
    chat.time = 'Baru saja';
    chat.unread = (activeChatId !== psychId);
    
    localStorage.setItem('rp_inbox', JSON.stringify(inbox));
    
    if (activeChatId === psychId) {
      renderChatMessages();
    } else {
      updateInboxBadge();
      renderInbox();
    }
  }, 2000);
}

function handleChatKey(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

// Register close events on overlays click backdrop
document.getElementById('chatOverlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeChat();
});
document.getElementById('sosWelcome')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) dismissSosWelcome();
});

// --- Story Viewer ---
function viewStory(storyId) {
  const storyData = {
    'healing': '🌱 "Hari ini aku memilih untuk tidak menyalahkan diriku. Satu langkah kecil menuju pemulihan."',
    'gratitude': '🙏 "Bersyukur untuk secangkir kopi hangat dan langit cerah pagi ini."',
    'tips': '🍃 Tip dari Teman Pulih: Cobalah teknik 5-4-3-2-1 saat merasa cemas. Sebutkan 5 hal yang kamu lihat, 4 yang kamu dengar, 3 yang kamu sentuh, 2 yang kamu cium, dan 1 yang kamu rasakan.',
    'milestone': '💪 "30 hari berturut-turut journaling! Tidak selalu mudah, tapi selalu worth it."',
    'quote': '✨ "Kamu tidak harus sempurna untuk layak dicintai. Kamu sudah cukup, apa adanya."'
  };
  showToast(storyData[storyId] || '📖 Status tidak ditemukan');
}

// Load Inbox
updateInboxBadge();
renderInboxScreen();

// --- Feature Handlers (gated by dev settings) ---

function handleThreadLike(btn) {
  if (!isFeatureEnabled('threadInteract')) {
    showToast('🔒 Verifikasi identitas diperlukan');
    return;
  }
  btn.classList.toggle('liked');
  if (btn.classList.contains('liked')) {
    btn.querySelector('i').className = 'ti ti-heart-filled';
    showToast('❤️ Disukai');
  } else {
    btn.querySelector('i').className = 'ti ti-heart';
  }
}

function handleThreadComment(btn) {
  if (!isFeatureEnabled('threadInteract')) {
    showToast('🔒 Verifikasi identitas diperlukan');
    return;
  }
  // Find the parent thread-post
  const post = btn ? btn.closest('.thread-post') : null;
  openThreadDetail(post);
}

// --- Thread Detail Overlay ---
function openThreadDetail(postEl) {
  const overlay = document.getElementById('threadDetailOverlay');
  if (!overlay) return;

  // Populate detail from clicked post data
  if (postEl) {
    const avatarEl = postEl.querySelector('.thread-avatar');
    const nameEl = postEl.querySelector('.thread-post-header h4');
    const bodyEl = postEl.querySelector('.thread-body');
    const timeEl = postEl.querySelector('.thread-meta span');
    const footerEl = postEl.querySelector('.thread-footer');

    // Update original post in detail view
    const tdOpAvatar = document.getElementById('tdOpAvatar');
    const tdOpName = document.getElementById('tdOpName');
    const tdOpBody = document.getElementById('tdOpBody');
    const tdOpTime = document.getElementById('tdOpTime');

    if (avatarEl && tdOpAvatar) {
      tdOpAvatar.style.cssText = avatarEl.style.cssText;
      tdOpAvatar.innerHTML = avatarEl.innerHTML;
    }
    if (nameEl && tdOpName) {
      const nameText = nameEl.textContent.trim().split('·')[0].trim();
      const hasBadge = nameEl.querySelector('.ti-check');
      tdOpName.innerHTML = nameText + (hasBadge ? ' <span class="td-badge"><i class="ti ti-check"></i> Teman Pulih</span>' : '');
    }
    if (bodyEl && tdOpBody) {
      tdOpBody.textContent = bodyEl.textContent;
    }
    if (timeEl && tdOpTime) {
      tdOpTime.textContent = timeEl.textContent + ' lalu';
    }
    if (footerEl) {
      const footerText = footerEl.textContent;
      const likesMatch = footerText.match(/(\d+)\s*suka/);
      const repliesMatch = footerText.match(/(\d+)\s*balasan/);
      const tdLikeCount = document.getElementById('tdLikeCount');
      const tdCommentCount = document.getElementById('tdCommentCount');
      if (likesMatch && tdLikeCount) tdLikeCount.textContent = likesMatch[1];
      if (repliesMatch && tdCommentCount) tdCommentCount.textContent = repliesMatch[1];
    }
    
    renderThreadComments(bodyEl ? bodyEl.textContent : '');
  }

  // Reset scroll position
  const tdScroll = document.getElementById('tdScroll');
  if (tdScroll) tdScroll.scrollTop = 0;

  // Reset input
  const input = document.getElementById('tdReplyInput');
  if (input) input.value = '';
  toggleTdSendBtn();

  // Show overlay with slide-in animation
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeThreadDetail() {
  const overlay = document.getElementById('threadDetailOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderThreadComments(threadBody) {
  const container = document.getElementById('tdCommentsList');
  if (!container) return;

  const bodyLower = threadBody.toLowerCase();
  let commentsHtml = '';

  const generateCommentHtml = (c) => `
    <div class="td-comment">
      <div class="td-comment-avatar" style="${c.avatarStyle}">
        <i class="ti ${c.avatarIcon}"></i>
      </div>
      <div class="td-comment-content">
        <div class="td-comment-header">
          <span class="td-comment-name">${c.name}</span>
          ${c.authorBadge ? '<span class="td-comment-author-badge">Author</span>' : ''}
          <span class="td-comment-time">${c.time}</span>
          <button class="td-comment-more"><i class="ti ti-dots"></i></button>
        </div>
        <p class="td-comment-body">${c.text}</p>
        <div class="td-comment-actions">
          <button class="td-comment-action" onclick="handleTdCommentLike(this)">
            <i class="ti ti-heart"></i> <span>${c.likes}</span>
          </button>
          <button class="td-comment-action" onclick="document.getElementById('tdReplyInput').focus()">
            <i class="ti ti-message-circle"></i> <span>${c.replies}</span>
          </button>
          <button class="td-comment-action">
            <i class="ti ti-repeat"></i>
          </button>
          <button class="td-comment-action" onclick="openShareSheet()">
            <i class="ti ti-send"></i>
          </button>
        </div>
        ${c.nestedReply ? `
        <div class="td-comment" style="padding: 10px 0 0 0;">
          <div class="td-comment-avatar" style="${c.nestedReply.avatarStyle}">
            <i class="ti ${c.nestedReply.avatarIcon}"></i>
          </div>
          <div class="td-comment-content">
            <div class="td-comment-header">
              <span class="td-comment-name">${c.nestedReply.name}</span>
              ${c.nestedReply.authorBadge ? '<span class="td-comment-author-badge">Author</span>' : ''}
              <span class="td-comment-time">${c.nestedReply.time}</span>
              <button class="td-comment-more"><i class="ti ti-dots"></i></button>
            </div>
            <p class="td-comment-body">${c.nestedReply.text}</p>
            <div class="td-comment-actions">
              <button class="td-comment-action" onclick="handleTdCommentLike(this)">
                <i class="ti ti-heart"></i> <span>${c.nestedReply.likes}</span>
              </button>
              <button class="td-comment-action" onclick="document.getElementById('tdReplyInput').focus()">
                <i class="ti ti-message-circle"></i> <span>${c.nestedReply.replies}</span>
              </button>
              <button class="td-comment-action">
                <i class="ti ti-repeat"></i>
              </button>
              <button class="td-comment-action" onclick="openShareSheet()">
                <i class="ti ti-send"></i>
              </button>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  if (bodyLower.includes('keras pada diriku')) {
    commentsHtml = [
      { name: 'mindful.ina', time: '12j', text: 'Terima kasih sudah mengingatkan. Hari ini aku berhasil bangun pagi dan itu sudah cukup. 💜', likes: 12, replies: 0, avatarIcon: 'ti-flower', avatarStyle: 'background: linear-gradient(135deg,#D4B8E8,#9B59B6); color:white;' },
      { name: 'yana_vix', time: '10j', text: 'Setuju banget! Kadang kita terlalu fokus sama hal yang belum tercapai, padahal langkah kecil juga penting. 🌿', likes: 7, replies: 1, avatarIcon: 'ti-star', avatarStyle: 'background: linear-gradient(135deg,#E8D5B7,#C4A265); color:white;', nestedReply: { name: 'Anonim', authorBadge: true, time: '8j', text: 'Betul kak! Pelan-pelan aja kita jalani hari ini.', likes: 3, replies: 0, avatarIcon: 'ti-leaf', avatarStyle: 'background: linear-gradient(135deg, var(--sage-light), var(--sage)); color:white;' } }
    ].map(generateCommentHtml).join('');
  } else if (bodyLower.includes('ekspektasi keluarga')) {
    commentsHtml = [
      { name: 'pulih.pelan', time: '5j', text: 'Wah ini relate banget kak. Aku biasanya mulai dari bilang "nanti aku pikirkan dulu ya" tiap diminta sesuatu yang berat.', likes: 24, replies: 0, avatarIcon: 'ti-heart', avatarStyle: 'background: linear-gradient(135deg,#F5D0C5,#E74C3C); color:white;' },
      { name: 'sehat.jiwa', time: '3j', text: 'Batasan itu sehat! Keluarga mungkin kaget awalnya, tapi lama-lama mereka akan terbiasa.', likes: 15, replies: 0, avatarIcon: 'ti-user', avatarStyle: 'background: var(--text-primary); color:var(--bg);' }
    ].map(generateCommentHtml).join('');
  } else if (bodyLower.includes('apresiasi dirimu')) {
    commentsHtml = [
      { name: 'hasyaapp', time: '2j', text: 'Aku berhasil minum air putih 2 liter hari ini! Kelihatan sepele tapi bangga 😆', likes: 45, replies: 0, avatarIcon: 'ti-droplet', avatarStyle: 'background: linear-gradient(135deg,#B8D4E3,#7BA7C2); color:white;' },
      { name: 'self.care.id', time: '1j', text: 'Menyelesaikan 1 modul belajar di Ruang Pulih! ✨', likes: 30, replies: 0, avatarIcon: 'ti-book', avatarStyle: 'background: linear-gradient(135deg, var(--sage-light), var(--sage)); color:white;' }
    ].map(generateCommentHtml).join('');
  } else if (bodyLower.includes('coba terapi')) {
    commentsHtml = [
      { name: 'teman.healing', time: '4j', text: 'Wah selamat kak! Aku masih ragu-ragu nih mau coba...', likes: 8, replies: 1, avatarIcon: 'ti-message-circle', avatarStyle: 'background: linear-gradient(135deg,#D4B8E8,#9B59B6); color:white;', nestedReply: { name: 'Anonim', authorBadge: true, time: '3j', text: 'Nggak apa-apa pelan-pelan aja kumpulin keberaniannya. Semangat! ❤️‍🩹', likes: 5, replies: 0, avatarIcon: 'ti-leaf', avatarStyle: 'background: linear-gradient(135deg, var(--sage-light), var(--sage)); color:white;' } }
    ].map(generateCommentHtml).join('');
  } else {
    commentsHtml = [
      { name: 'teman.pulih', time: '1j', text: 'Sending virtual hugs! 🤗 Kita semua di sini saling mendukung.', likes: 5, replies: 0, avatarIcon: 'ti-heart-handshake', avatarStyle: 'background: linear-gradient(135deg,#F5D0C5,#E74C3C); color:white;' }
    ].map(generateCommentHtml).join('');
  }

  container.innerHTML = commentsHtml;
}

// Like button in thread detail original post
function handleTdLike(btn) {
  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  const count = btn.querySelector('.td-action-count');
  if (btn.classList.contains('liked')) {
    icon.className = 'ti ti-heart-filled';
    if (count) count.textContent = parseInt(count.textContent) + 1;
    showToast('❤️ Disukai');
  } else {
    icon.className = 'ti ti-heart';
    if (count) count.textContent = Math.max(0, parseInt(count.textContent) - 1);
  }
}

// Like button in comments
function handleTdCommentLike(btn) {
  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  const count = btn.querySelector('span');
  if (btn.classList.contains('liked')) {
    icon.className = 'ti ti-heart-filled';
    if (count) count.textContent = parseInt(count.textContent) + 1;
  } else {
    icon.className = 'ti ti-heart';
    if (count) count.textContent = Math.max(0, parseInt(count.textContent) - 1);
  }
}

// Send button active state
function toggleTdSendBtn() {
  const input = document.getElementById('tdReplyInput');
  const sendBtn = document.getElementById('tdSendBtn');
  if (input && sendBtn) {
    sendBtn.classList.toggle('has-text', input.value.trim().length > 0);
  }
}

// Submit a reply
function submitTdReply() {
  const input = document.getElementById('tdReplyInput');
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const commentsList = document.getElementById('tdCommentsList');
  if (!commentsList) return;

  // Build new comment element
  const comment = document.createElement('div');
  comment.className = 'td-comment';
  comment.style.opacity = '0';
  comment.style.transform = 'translateY(12px)';
  comment.innerHTML = `
    <div class="td-comment-avatar" style="background: var(--text-primary); color:var(--bg);">
      <i class="ti ti-user"></i>
    </div>
    <div class="td-comment-content">
      <div class="td-comment-header">
        <span class="td-comment-name">Kamu</span>
        <span class="td-comment-time">baru saja</span>
        <button class="td-comment-more"><i class="ti ti-dots"></i></button>
      </div>
      <p class="td-comment-body">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <div class="td-comment-actions">
        <button class="td-comment-action" onclick="handleTdCommentLike(this)">
          <i class="ti ti-heart"></i> <span>0</span>
        </button>
        <button class="td-comment-action" onclick="document.getElementById('tdReplyInput').focus()">
          <i class="ti ti-message-circle"></i> <span>0</span>
        </button>
        <button class="td-comment-action"><i class="ti ti-repeat"></i></button>
        <button class="td-comment-action" onclick="openShareSheet()"><i class="ti ti-send"></i></button>
      </div>
    </div>
  `;

  commentsList.appendChild(comment);

  // Animate in
  requestAnimationFrame(() => {
    comment.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    comment.style.opacity = '1';
    comment.style.transform = 'translateY(0)';
  });

  // Update comment count
  const countEl = document.getElementById('tdCommentCount');
  if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;

  // Scroll to new comment
  const tdScroll = document.getElementById('tdScroll');
  if (tdScroll) {
    setTimeout(() => tdScroll.scrollTo({ top: tdScroll.scrollHeight, behavior: 'smooth' }), 100);
  }

  // Clear input
  input.value = '';
  toggleTdSendBtn();
  showToast('💬 Komentar terkirim!');
}

function handleThreadCreate() {
  if (!isFeatureEnabled('threadInteract')) {
    showToast('🔒 Fitur membuat thread memerlukan verifikasi');
    return;
  }
  const content = prompt('✍️ Tulis thread baru:\n\nBagikan pikiran, cerita, atau dukunganmu...');
  if (content && content.trim()) {
    showToast('✅ Thread berhasil diposting! (simulasi)');
  }
}

function handleTemanPulih() {
  if (!isFeatureEnabled('kycVerified')) {
    showToast('🔒 Verifikasi KTP diperlukan untuk mengakses sertifikasi');
    return;
  }
  showToast('🎓 Selamat! Kamu memenuhi syarat untuk program Teman Pulih. Proses pendaftaran dimulai... (simulasi)');
}

function handleStoryPost() {
  if (!isFeatureEnabled('storyPost')) {
    showToast('📷 Fitur posting status segera hadir!');
    return;
  }
  const content = prompt('📷 Bagikan statusmu:\n\nCeritakan perasaan atau momenmu hari ini...');
  if (content && content.trim()) {
    showToast('✅ Status berhasil diposting! (simulasi)');
  }
}

// --- Share Bottom Sheet ---
function openShareSheet() {
  const overlay = document.getElementById('shareOverlay');
  if (!overlay) return;
  overlay.classList.add('active');
  // Small delay for the sheet slide-up animation
  requestAnimationFrame(() => {
    const sheet = document.getElementById('shareSheet');
    if (sheet) sheet.classList.add('active');
  });
}

function closeShareSheet(e) {
  // Close only if clicking backdrop or explicitly called
  if (e && e.target !== e.currentTarget) return;
  const overlay = document.getElementById('shareOverlay');
  const sheet = document.getElementById('shareSheet');
  if (sheet) sheet.classList.remove('active');
  setTimeout(() => {
    if (overlay) overlay.classList.remove('active');
  }, 300);
}

function shareToProfile(el) {
  const name = el.querySelector('.share-profile-name');
  showToast('📤 Dibagikan ke ' + (name ? name.textContent : 'pengguna'));
  closeShareSheet({ target: document.getElementById('shareOverlay'), currentTarget: document.getElementById('shareOverlay') });
}

function shareToApp(app) {
  const labels = {
    'share-to': 'Share',
    'copy-link': 'Link disalin!',
    'messages': 'Messages',
    'notes': 'Notes',
    'mail': 'Mail'
  };
  showToast('📤 ' + (labels[app] || 'Dibagikan') + (app === 'copy-link' ? '' : ' (simulasi)'));
  closeShareSheet({ target: document.getElementById('shareOverlay'), currentTarget: document.getElementById('shareOverlay') });
}

// ===== SIMULATOR & DYNAMIC ISLAND LOGIC =====
let dynamicIslandTimeout = null;
let currentIslandState = 'normal';

function changeSimulatedDevice() {
  const select = document.getElementById('deviceSelect');
  const frame = document.getElementById('deviceFrame');
  if (!select || !frame) return;

  const val = select.value;
  
  if (val === 'b2bAdmin') {
    window.location.href = 'admin.html';
    return;
  }
  
  if (val === 'responsive' || val === 'fullscreen') {
    frame.classList.remove('simulated');
    frame.style.width = '';
    frame.style.height = '';
    frame.style.borderRadius = '';
    frame.style.borderWidth = '';
    frame.style.maxWidth = val === 'responsive' ? '480px' : 'none';
    document.documentElement.style.setProperty('--safe-top', val === 'responsive' ? 'env(safe-area-inset-top, 0px)' : '0px');
    document.documentElement.style.setProperty('--safe-bottom', val === 'responsive' ? 'env(safe-area-inset-bottom, 0px)' : '0px');
  } else {
    frame.classList.add('simulated');
    frame.style.maxWidth = '';
    
    if (val === 'iphone17') {
      frame.style.width = '402px';
      frame.style.height = '874px';
      frame.style.borderRadius = '48px';
      frame.style.borderWidth = '12px';
      document.documentElement.style.setProperty('--safe-top', '54px');
      document.documentElement.style.setProperty('--safe-bottom', '34px');
    } else if (val === 'iphone17air') {
      frame.style.width = '420px';
      frame.style.height = '912px';
      frame.style.borderRadius = '50px';
      frame.style.borderWidth = '8px'; // Slim bezel
      document.documentElement.style.setProperty('--safe-top', '56px');
      document.documentElement.style.setProperty('--safe-bottom', '34px');
    } else if (val === 'iphone17promax') {
      frame.style.width = '440px';
      frame.style.height = '956px';
      frame.style.borderRadius = '52px';
      frame.style.borderWidth = '12px';
      document.documentElement.style.setProperty('--safe-top', '59px');
      document.documentElement.style.setProperty('--safe-bottom', '34px');
    }
  }

  const indicator = document.getElementById('simIndicator');
  if (indicator) {
    indicator.style.display = (val === 'responsive' || val === 'fullscreen') ? 'none' : 'inline-block';
  }
}

function updateSimulatedClock() {
  const simTime = document.getElementById('simTime');
  if (simTime) {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    simTime.textContent = `${hh}:${mm}`;
  }
}

function triggerDynamicIsland(type, data) {
  const island = document.getElementById('simDynamicIsland');
  if (!island) return;

  if (dynamicIslandTimeout) {
    clearTimeout(dynamicIslandTimeout);
    dynamicIslandTimeout = null;
  }

  island.classList.remove('expanded', 'large');
  island.innerHTML = '';

  if (type === 'save-mood') {
    currentIslandState = 'mood';
    island.classList.add('large');
    island.innerHTML = `
      <div class="island-content" style="justify-content: center; gap: 8px;">
        <i class="ti ti-circle-check" style="color: #52B788; font-size: 1.1rem;"></i>
        <span style="font-weight: 600; font-family: 'Poppins', sans-serif;">Mood Tersimpan</span>
      </div>
    `;
    dynamicIslandTimeout = setTimeout(resetDynamicIsland, 3000);

  } else if (type === 'save-journal') {
    currentIslandState = 'journal';
    island.classList.add('large');
    island.innerHTML = `
      <div class="island-content" style="justify-content: center; gap: 8px;">
        <i class="ti ti-edit" style="color: #52B788; font-size: 1.1rem;"></i>
        <span style="font-weight: 600; font-family: 'Poppins', sans-serif;">Jurnal Tersimpan</span>
      </div>
    `;
    dynamicIslandTimeout = setTimeout(resetDynamicIsland, 3000);

  } else if (type === 'save-gratitude') {
    currentIslandState = 'gratitude';
    island.classList.add('large');
    island.innerHTML = `
      <div class="island-content" style="justify-content: center; gap: 8px;">
        <i class="ti ti-sparkles" style="color: #ffd166; font-size: 1.1rem;"></i>
        <span style="font-weight: 600; font-family: 'Poppins', sans-serif;">Syukur Tersimpan</span>
      </div>
    `;
    dynamicIslandTimeout = setTimeout(resetDynamicIsland, 3000);

  } else if (type === 'breathing') {
    currentIslandState = 'breathing';
    island.classList.add('expanded');
    const phaseText = (data && data.text) ? data.text : 'Bernapas';
    island.innerHTML = `
      <div class="island-content" style="justify-content: space-between; padding: 0 4px; align-items: center; width: 100%;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <i class="ti ti-wind" style="animation: islandPulse 1.5s infinite; color: #52B788; font-size: 1.1rem;"></i>
          <span style="font-weight: 600; font-family: 'Poppins', sans-serif;">${phaseText}</span>
        </div>
        <span style="opacity: 0.6; font-size: 0.7rem; font-weight: 500;">Breathing</span>
      </div>
    `;

  } else if (type === 'meditation') {
    currentIslandState = 'meditation';
    island.classList.add('expanded');
    const timeText = (data && data.time) ? data.time : '10:00';
    island.innerHTML = `
      <div class="island-content" style="justify-content: space-between; padding: 0 4px; align-items: center; width: 100%;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <i class="ti ti-spa" style="color: #a3b18a; font-size: 1.1rem; animation: islandPulse 2s infinite;"></i>
          <span style="font-weight: 600; font-family: 'Poppins', sans-serif;">Meditasi</span>
        </div>
        <span style="font-family: monospace; font-size: 0.8rem; font-weight: 600; color: #52B788;">${timeText}</span>
      </div>
    `;
  }
}

function resetDynamicIsland() {
  const island = document.getElementById('simDynamicIsland');
  if (!island) return;

  if (breathingRunning) {
    const circle = document.getElementById('breathCircle');
    triggerDynamicIsland('breathing', { text: circle ? circle.textContent : 'Bernapas' });
    return;
  }

  if (meditationRunning) {
    const medTimer = document.getElementById('medTimer');
    triggerDynamicIsland('meditation', { time: medTimer ? medTimer.textContent : '10:00' });
    return;
  }

  currentIslandState = 'normal';
  island.classList.remove('expanded', 'large');
  island.innerHTML = '';
}

// Initialize simulator components on load
setTimeout(() => {
  changeSimulatedDevice();
  updateSimulatedClock();
  setInterval(updateSimulatedClock, 30000);
}, 100);


// --- KPI Dashboard ---
function toggleKpiDashboard() {
  document.getElementById('kpiOverlay').classList.toggle('show');
}

document.getElementById('kpiOverlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) toggleKpiDashboard();
});


// --- Affiliated User Experience ---
function openAffiliationModal() {
  document.getElementById('affiliationModal').classList.add('show');
  
  // Initialize state based on localStorage or default
  const affiliatedOrg = localStorage.getItem('ruangpulih_affiliated_org');
  if (affiliatedOrg) {
    document.getElementById('affUnlinkedState').style.display = 'none';
    document.getElementById('affLinkedState').style.display = 'block';
    document.getElementById('affLinkedName').innerText = affiliatedOrg;
  } else {
    document.getElementById('affUnlinkedState').style.display = 'block';
    document.getElementById('affLinkedState').style.display = 'none';
  }
}

function closeAffiliationModal() {
  document.getElementById('affiliationModal').classList.remove('show');
}

function verifyAffiliation() {
  const email = document.getElementById('affEmailInput').value.trim();
  const code = document.getElementById('affCodeInput').value.trim();
  
  let orgName = '';
  if (email.includes('@binus.edu') || code.toUpperCase().startsWith('BINUS')) {
    orgName = 'Bina Nusantara';
  } else if (email || code) {
    orgName = 'Partner Institution';
  } else {
    showToast('Silakan masukkan email atau kode institusi.');
    return;
  }

  // Save state
  localStorage.setItem('ruangpulih_affiliated_org', orgName);
  
  // Update UI in Modal
  document.getElementById('affUnlinkedState').style.display = 'none';
  document.getElementById('affLinkedState').style.display = 'block';
  document.getElementById('affLinkedName').innerText = orgName;
  
  // Unlock App Features
  unlockAffiliatedFeatures(orgName);
  
  showToast('✅ Berhasil tertaut dengan ' + orgName);
}

function unlinkAffiliation() {
  localStorage.removeItem('ruangpulih_affiliated_org');
  
  // Revert UI in Modal
  document.getElementById('affUnlinkedState').style.display = 'block';
  document.getElementById('affLinkedState').style.display = 'none';
  document.getElementById('affEmailInput').value = '';
  document.getElementById('affCodeInput').value = '';
  
  // Lock App Features
  lockAffiliatedFeatures();
  
  showToast('Tautan institusi dilepas.');
}

function unlockAffiliatedFeatures(orgName) {
  // Update Settings Label
  const statusText = document.getElementById('affStatusText');
  if (statusText) statusText.innerText = 'Tertaut: ' + orgName;
  
  // Show Hub Tab in Threads
  const hubBtn = document.getElementById('hubCatBtn');
  const hubName = document.getElementById('hubCatName');
  if (hubBtn && hubName) {
    hubBtn.style.display = 'inline-flex';
    hubName.innerText = orgName + ' Hub';
  }
  
  // Show Exclusive Events Feed
  const eventsFeed = document.getElementById('affiliatedEvents');
  const affOrgName = document.getElementById('affOrgName');
  if (eventsFeed && affOrgName) {
    eventsFeed.style.display = 'block';
    affOrgName.innerText = orgName;
  }
}

function lockAffiliatedFeatures() {
  const statusText = document.getElementById('affStatusText');
  if (statusText) statusText.innerText = 'Tautkan akun dengan perusahaan/kampus';
  
  const hubBtn = document.getElementById('hubCatBtn');
  if (hubBtn) hubBtn.style.display = 'none';
  
  const eventsFeed = document.getElementById('affiliatedEvents');
  if (eventsFeed) eventsFeed.style.display = 'none';
  
  // If currently on Hub tab, switch to Semua
  if (hubBtn && hubBtn.classList.contains('active')) {
    const semuaBtn = document.querySelector('.thread-cat');
    if (semuaBtn) switchThreadCat(semuaBtn);
  }
}

// Check state on load
document.addEventListener('DOMContentLoaded', () => {
  const affiliatedOrg = localStorage.getItem('ruangpulih_affiliated_org');
  if (affiliatedOrg) {
    unlockAffiliatedFeatures(affiliatedOrg);
  }
});

// Update lock/unlock to toggle banners
const origUnlock = unlockAffiliatedFeatures;
unlockAffiliatedFeatures = function(orgName) {
  origUnlock(orgName);
  const m1 = document.getElementById('consultMarketingBanner');
  const m2 = document.getElementById('threadsMarketingBanner');
  if (m1) m1.style.display = 'none';
  if (m2) m2.style.display = 'none';
};

const origLock = lockAffiliatedFeatures;
lockAffiliatedFeatures = function() {
  origLock();
  const m1 = document.getElementById('consultMarketingBanner');
  const m2 = document.getElementById('threadsMarketingBanner');
  if (m1) m1.style.display = 'flex';
  if (m2) m2.style.display = 'flex';
};

// Re-run check on load
document.addEventListener('DOMContentLoaded', () => {
  const affiliatedOrg = localStorage.getItem('ruangpulih_affiliated_org');
  if (affiliatedOrg) {
    const m1 = document.getElementById('consultMarketingBanner');
    const m2 = document.getElementById('threadsMarketingBanner');
    if (m1) m1.style.display = 'none';
    if (m2) m2.style.display = 'none';
  }
});

function openAdminIframe() {
  const overlay = document.getElementById('adminIframeOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function closeAdminIframe() {
  const overlay = document.getElementById('adminIframeOverlay');
  if (overlay) overlay.style.display = 'none';
}

function takeScreenshot() {
  const element = document.getElementById('simulator-container');
  if (!element) return;
  
  // Temporarily hide the toolbar for the screenshot
  const toolbar = element.querySelector('.simulator-toolbar');
  if (toolbar) toolbar.style.display = 'none';

  html2canvas(element, {
    backgroundColor: null,
    scale: 2 // Higher resolution
  }).then(canvas => {
    // Restore the toolbar
    if (toolbar) toolbar.style.display = 'flex';
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'RuangPulih-Mockup-' + new Date().getTime() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    if (toolbar) toolbar.style.display = 'flex';
    console.error('Error taking screenshot', err);
    alert('Failed to capture screenshot. See console for details.');
  });
}

// ==========================================
// ===== SUBSCRIPTION & MIDTRANS =====
// ==========================================

// --- Subscription Modal ---
function openSubscriptionModal() {
  // Close settings panel if open
  const profileOverlay = document.getElementById('profileOverlay');
  if (profileOverlay && profileOverlay.classList.contains('show')) {
    profileOverlay.classList.remove('show');
  }
  
  syncSubscriptionUI();
  document.getElementById('subscriptionModal').classList.add('show');
}

function closeSubscriptionModal() {
  document.getElementById('subscriptionModal').classList.remove('show');
}

// --- Sync subscription UI state ---
function syncSubscriptionUI() {
  const isPremium = state.isPremium;
  const statusText = document.getElementById('subStatusText');
  
  if (isPremium) {
    if (statusText) statusText.textContent = '💚 Teman Pulih (Premium)';
  } else {
    if (statusText) statusText.textContent = 'Komunitas (Free)';
  }
  
  if (typeof currentSubTab !== 'undefined') {
    switchSubTab(currentSubTab);
  } else {
    switchSubTab('free');
  }
  
  // Update supporter badges
  renderSupporterBadges();
}

let currentSubTab = 'free';
function switchSubTab(tab) {
  currentSubTab = tab;
  
  const tabFree = document.getElementById('subTabFree');
  const tabPremium = document.getElementById('subTabPremium');
  if(tabFree) tabFree.classList.toggle('active', tab === 'free');
  if(tabPremium) tabPremium.classList.toggle('active', tab === 'premium');
  
  const colFree = document.getElementById('colLabelFree');
  const colPremium = document.getElementById('colLabelPremium');
  if(colFree) colFree.classList.toggle('active', tab === 'free');
  if(colPremium) colPremium.classList.toggle('active', tab === 'premium');
  
  const freeVals = document.querySelectorAll('.sub-compare-val[data-col="free"]');
  const premiumVals = document.querySelectorAll('.sub-compare-val[data-col="premium"]');
  
  freeVals.forEach(el => el.classList.toggle('active', tab === 'free'));
  premiumVals.forEach(el => el.classList.toggle('active', tab === 'premium'));
  
  const ctaBtn = document.getElementById('subCtaPremium');
  const ctaNote = document.getElementById('subCtaNote');
  
  if (!ctaBtn) return;

  if (state.isPremium) {
    ctaBtn.textContent = 'Plan Saat Ini';
    ctaBtn.onclick = null;
    ctaBtn.style.pointerEvents = 'none';
    ctaBtn.style.background = 'var(--text-muted)';
    ctaBtn.style.color = 'white';
    ctaBtn.style.border = 'none';
    if(ctaNote) ctaNote.textContent = 'Langganan Premium Aktif';
  } else {
    if (tab === 'free') {
      ctaBtn.textContent = 'Plan Saat Ini';
      ctaBtn.onclick = null;
      ctaBtn.style.pointerEvents = 'none';
      ctaBtn.style.background = 'transparent';
      ctaBtn.style.color = 'var(--text-muted)';
      ctaBtn.style.border = '1px solid rgba(0,0,0,0.1)';
      if(ctaNote) ctaNote.textContent = 'Selamanya gratis';
    } else {
      ctaBtn.textContent = 'Upgrade seharga Rp 49.000';
      ctaBtn.onclick = subscribePremium;
      ctaBtn.style.pointerEvents = 'auto';
      ctaBtn.style.background = 'var(--text-primary)';
      ctaBtn.style.color = 'var(--bg)';
      ctaBtn.style.border = 'none';
      if(ctaNote) ctaNote.textContent = 'Perpanjang otomatis bulanan. Batalkan kapan saja.';
    }
  }
}

// --- Midtrans Snap Integration ---
function subscribePremium() {
  // In production: fetch snap_token from your backend API
  // POST /api/create-subscription -> { snap_token: "..." }
  
  if (typeof snap !== 'undefined' && snap.pay) {
    // Try Midtrans Snap (requires valid server-generated token)
    // For demo, we'll fall back to simulation since we don't have a backend
    try {
      snap.pay('SNAP_TOKEN_FROM_BACKEND', {
        onSuccess: function(result) {
          console.log('Midtrans payment success:', result);
          activatePremium();
        },
        onPending: function(result) {
          console.log('Midtrans payment pending:', result);
          showToast('⏳ Pembayaran sedang diproses...');
        },
        onError: function(result) {
          console.log('Midtrans payment error:', result);
          showToast('❌ Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          console.log('Midtrans popup closed');
          showToast('💳 Pembayaran dibatalkan.');
        }
      });
    } catch (e) {
      // Snap token invalid — fall back to simulation
      console.warn('Midtrans Snap requires a valid server token. Falling back to simulation.', e);
      simulateMidtransPayment();
    }
  } else {
    // Snap not loaded — use simulation
    simulateMidtransPayment();
  }
}

function simulateMidtransPayment() {
  // Create a beautiful simulated payment confirmation
  const confirmed = confirm(
    '💳 Simulasi Pembayaran Midtrans\n\n' +
    '──────────────────────\n' +
    'Ruang Pulih Premium\n' +
    'Rp 49.000 / 7 hari\n' +
    '──────────────────────\n\n' +
    'Metode: GoPay / OVO / QRIS\n\n' +
    'Tekan OK untuk melanjutkan pembayaran (simulasi).\n' +
    'Di production, ini akan membuka popup Midtrans Snap.'
  );
  
  if (confirmed) {
    // Simulate processing delay
    showToast('⏳ Memproses pembayaran...');
    setTimeout(() => {
      activatePremium();
    }, 1500);
  } else {
    showToast('💳 Pembayaran dibatalkan.');
  }
}

// --- Activate/Deactivate Premium ---
function activatePremium() {
  state.isPremium = true;
  localStorage.setItem('rp_subscription', 'premium');
  
  // Sync all UI
  syncSubscriptionUI();
  
  // Close modal
  closeSubscriptionModal();
  
  // Celebration!
  showToast('🎉 Selamat! Kamu sekarang Teman Pulih Supporter! 💚');
  
  // Trigger dynamic island celebration
  triggerDynamicIsland('premium-activated');
}

function deactivatePremium() {
  state.isPremium = false;
  localStorage.removeItem('rp_subscription');
  
  syncSubscriptionUI();
  showToast('💔 Langganan Premium dinonaktifkan.');
}

// --- Supporter Badge Rendering ---
function renderSupporterBadges() {
  const badges = document.querySelectorAll('[data-supporter-badge]');
  badges.forEach(badge => {
    badge.style.display = state.isPremium ? 'inline-flex' : 'none';
  });
  
  // Update thread detail badge if visible
  const tdBadge = document.querySelector('.td-badge');
  if (tdBadge && state.isPremium) {
    // Add supporter badge after Teman Pulih badge if not already there
    if (!tdBadge.parentElement.querySelector('.supporter-badge')) {
      const badge = document.createElement('span');
      badge.className = 'supporter-badge';
      badge.setAttribute('data-supporter-badge', '');
      badge.innerHTML = '<i class="ti ti-heart-filled"></i> Supporter';
      tdBadge.parentElement.appendChild(badge);
    }
  }
  
  // Update settings profile supporter badge
  const settingsProfile = document.querySelector('.settings-profile-info');
  if (settingsProfile) {
    let existingBadge = settingsProfile.querySelector('.settings-supporter-badge');
    if (state.isPremium && !existingBadge) {
      const badge = document.createElement('div');
      badge.className = 'settings-supporter-badge';
      badge.innerHTML = '<i class="ti ti-heart-filled"></i> Supporter';
      settingsProfile.appendChild(badge);
    } else if (!state.isPremium && existingBadge) {
      existingBadge.remove();
    }
  }
}

// --- B2B Contact ---
function contactB2B() {
  showToast('📧 Tim B2B akan menghubungi Anda. Email: b2b@ruangpulih.id');
}

// --- Premium Conversion Nudge ---
let nudgeShown = false;

function checkDistressTrigger() {
  if (state.isPremium || nudgeShown) return;
  if (localStorage.getItem('rp_nudge_dismissed')) return;
  
  // Check last 3 moods
  const recent = [...state.moodHistory]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  
  if (recent.length >= 3) {
    const allDistress = recent.every(m => {
      let mood = m.mood;
      // Scale old 1-5 data
      if (mood <= 5 && (!m.emoji || m.emoji.includes('<i'))) mood = mood * 2;
      return mood <= 3;
    });
    
    if (allDistress) {
      showPremiumNudge();
    }
  }
}

function showPremiumNudge() {
  nudgeShown = true;
  const nudge = document.getElementById('premiumNudge');
  if (nudge) {
    setTimeout(() => nudge.classList.add('show'), 500);
  }
}

function dismissPremiumNudge() {
  const nudge = document.getElementById('premiumNudge');
  if (nudge) nudge.classList.remove('show');
  localStorage.setItem('rp_nudge_dismissed', 'true');
}

// --- Dev Setting: Premium User Toggle ---
const origToggleDevSetting = toggleDevSetting;
toggleDevSetting = function(key) {
  origToggleDevSetting(key);
  
  if (key === 'premiumUser') {
    const checkbox = document.getElementById('devPremiumUser');
    if (checkbox && checkbox.checked) {
      activatePremium();
    } else {
      deactivatePremium();
    }
  }
};

// --- Initialize subscription state on load ---
document.addEventListener('DOMContentLoaded', () => {
  // Sync premium state
  syncSubscriptionUI();
  
  // Sync dev toggle
  const devPremiumToggle = document.getElementById('devPremiumUser');
  if (devPremiumToggle) {
    devPremiumToggle.checked = state.isPremium;
  }
  
  // Check distress trigger after a delay
  setTimeout(checkDistressTrigger, 3000);
});

// Hook into saveMood to check distress after saving
const origSaveMood = saveMood;
saveMood = function() {
  origSaveMood();
  // Check distress after mood save
  setTimeout(checkDistressTrigger, 1000);
};

// Hook into switchTab to refresh badges when navigating to threads
const origSwitchTab = switchTab;
switchTab = function(tab) {
  origSwitchTab(tab);
  if (tab === 'threads') {
    setTimeout(renderSupporterBadges, 100);
  }
};
