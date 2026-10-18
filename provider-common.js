// ===== RUANG PULIH — shared helpers for provider views (Portal Psikolog, Teman Pulih) =====
// Demo bridge: the student prototype keeps its state in localStorage 'rp2'. Provider views read and
// write it so actions show up in the student app. A real build would go through the backend.

const APP_KEY = 'rp2';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nowT = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
const dk = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MON_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const k2d = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const dayName = k => k === dk() ? 'Hari ini' : k === dk(1) ? 'Besok' : `${DAYS_ID[k2d(k).getDay()]}, ${k2d(k).getDate()} ${MON_ID[k2d(k).getMonth()]}`;

function readApp() { try { return JSON.parse(localStorage.getItem(APP_KEY)) || null; } catch { return null; } }
function writeApp(fn) {
  const a = readApp(); if (!a) return false;
  fn(a);
  try { localStorage.setItem(APP_KEY, JSON.stringify(a)); } catch { return false; }
  return true;
}
function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage blocked */ } }

// Live presence: while a provider's view is open and online, the student app lets them answer.
function setLive(id, on) {
  const live = readJSON('rp-live', {});
  if (on) live[id] = Date.now(); else delete live[id];
  writeJSON('rp-live', live);
}
function heartbeat(id, isOn) { setInterval(() => { if (isOn()) setLive(id, true); }, 15000); window.addEventListener('beforeunload', () => setLive(id, false)); }

// Student-side mood pebble (same shapes as the app)
const PEB = [null,
  'M7 31c0-9 7-17 17-17s17 6 17 15c0 9-7 13-17 13S7 39 7 31z', 'M6 27c0-10 8-17 18-17 10 1 18 7 17 17-1 9-8 14-17 14S6 36 6 27z',
  'M24 7c10 0 17 7 17 17s-7 17-17 17S7 34 7 24 14 7 24 7z', 'M23 6c11-1 19 8 18 18-1 11-9 18-19 17C12 40 6 32 7 23 8 13 13 7 23 6z',
  'M25 4c9 0 15 6 16 14 1 9-3 18-12 21-10 3-21-3-22-13C6 15 14 4 25 4z'];
const PEB_FACE = [null, [28, 'M19 36q5-3.5 10 0'], [25, 'M19 33q5-1.6 10 0'], [22, 'M19 30h10'], [21, 'M18.5 28.5q5.5 4 11 0'], [19, 'M17.5 26q6.5 6 13 0']];
const MOOD_COL = [null, '#7A8AA6', '#A3B5BD', '#D8C6A0', '#9DC08B', '#EFB34A'];
const MOOD_LBL = [null, 'Berat', 'Kurang', 'Biasa', 'Baik', 'Lega'];
const pebbleSvg = (v, size = 24, color) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><path d="${PEB[v]}" fill="${color || MOOD_COL[v]}"/><circle cx="19" cy="${PEB_FACE[v][0]}" r="2" fill="#1D2620"/><circle cx="29" cy="${PEB_FACE[v][0]}" r="2" fill="#1D2620"/><path d="${PEB_FACE[v][1]}" stroke="#1D2620" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;

// Crisis phrases that trigger guardrails (Indonesian + common English)
const RISK_RX = /(bunuh diri|ingin mati|pengen mati|mau mati|mengakhiri hidup|akhiri hidup|tidak ingin hidup|gak mau hidup|ga mau hidup|menyakiti diri|melukai diri|self[- ]?harm|suicid)/i;

function toast(msg, icon = 'ph-check') {
  const t = document.getElementById('toast'); if (!t) return;
  t.innerHTML = `<i class="ph ${icon}"></i>${esc(msg)}`;
  t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('rp-admin-theme', next); } catch { /* storage blocked */ }
}
try { document.documentElement.dataset.theme = localStorage.getItem('rp-admin-theme') || 'light'; } catch { /* storage blocked */ }
