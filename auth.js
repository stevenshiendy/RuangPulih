// ===== RUANG PULIH — SIGN UP / LOG IN =====
// Prototype flow only: no credentials leave the device and passwords are never stored.
// Real build: Google / Microsoft / Apple via OAuth 2.0 + OpenID Connect,
// institution email via the campus IdP (OIDC or SAML), email & phone via one-time codes.

// Official brand marks (Google "G", Apple, WhatsApp) as inline SVG so they render crisp at any size.
const LOGO = {
  google: `<svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`,
  apple: `<svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>`,
  whatsapp: `<svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,
};
const AUTH_PROVIDERS = {
  apple: { name: 'Apple', logo: LOGO.apple, email: 'kamu@icloud.com' },
  google: { name: 'Google', logo: LOGO.google, email: 'kamu@gmail.com' },
};
const CHANNEL = { wa: 'WhatsApp', sms: 'SMS', email: 'email' };
const FOCUS = ['Kecemasan', 'Kuliah', 'Karir', 'Relasi', 'Keluarga', 'Tidur'];

const auth = { mode: 'register', stack: [], current: null, pending: null, focus: [], channel: 'wa' };

const maskEmail = e => { const [u, d] = e.split('@'); return `${u.slice(0, 2)}${'•'.repeat(Math.max(2, u.length - 2))}@${d}`; };
const maskPhone = p => `+62 ${p.slice(0, 3)}-••••-${p.slice(-3)}`;
const orgForEmail = email => {
  const domain = (email.split('@')[1] || '').toLowerCase();
  const hit = Object.entries(ORGS).find(([d]) => domain === d || domain.endsWith('.' + d));
  return hit ? hit[1] : null;
};

function startAuth(mode) { auth.mode = mode; auth.stack = []; authGo('methods'); }
function authGo(step, data = {}) {
  if (auth.current) auth.stack.push(auth.current);
  renderAuth(step, data);
}
function authBack() {
  const prev = auth.stack.pop();
  prev ? renderAuth(prev.step, prev.data) : renderAuth('intro');
}

function renderAuth(step, data = {}) {
  auth.current = step === 'intro' ? null : { step, data };
  if (step === 'intro') auth.stack = [];
  const w = document.getElementById('welcome');
  w.className = 'welcome' + (step === 'intro' ? '' : ' auth');
  w.innerHTML = step === 'intro' ? introHTML() : `
    <button class="auth-back" onclick="authBack()" aria-label="Kembali"><i class="ph ph-arrow-left"></i></button>
    ${AUTH_STEPS[step](data)}`;
  w.scrollTop = 0;
  const first = w.querySelector('[data-autofocus]');
  if (first) setTimeout(() => first.focus(), 250);
  if (step === 'otp') wireOtp();
}

function introHTML() {
  return `
    <div>
      <span class="wordmark" role="img" aria-label="Ruang Pulih"></span>
      <h1 class="display">Karena kamu<br><em>tidak berjuang<br>sendirian.</em></h1>
      <p class="mt-12" style="opacity:.85;max-width:260px">Satu ruang, tempat kamu didengar dan dituntun untuk pulih.</p>
    </div>
    ${ILLO.cairn()}
    <div>
      <div class="welcome-points">
        <div><i class="ph-fill ph-shield-check"></i>100% anonim & terenkripsi</div>
        <div><i class="ph-fill ph-users-three"></i>Komunitas, Teman Pulih, dan psikolog</div>
        <div><i class="ph-fill ph-lifebuoy"></i>SOS muncul setiap kamu membuka aplikasi</div>
      </div>
      <button class="btn btn-amber btn-block" onclick="startAuth('register')">Buat akun</button>
      <button class="btn btn-outline-light btn-block mt-8" onclick="startAuth('login')">Saya sudah punya akun</button>
    </div>`;
}

const AUTH_STEPS = {
  methods() {
    const reg = auth.mode === 'register';
    const social = ['apple', 'google'].map(k => `
      <button class="social-btn ${k}" onclick="authGo('consent',{provider:'${k}'})">${AUTH_PROVIDERS[k].logo}Lanjutkan dengan ${AUTH_PROVIDERS[k].name}</button>`).join('');
    return `
      <h1 class="auth-title">${reg ? 'Buat akun' : 'Selamat datang kembali'}</h1>
      <p class="auth-sub">${reg ? 'Pilih cara yang paling nyaman. Di komunitas, kamu tetap anonim.' : 'Masuk dengan cara yang kamu pakai saat mendaftar.'}</p>
      <div class="social">${social}</div>
      <div class="or">atau</div>
      <button class="method" onclick="authGo('sso')">
        <span class="li-ic"><i class="ph ph-buildings"></i></span>
        <div class="grow"><p class="h3" style="font-size:15px">Email kampus / kantor</p><p class="tiny">Masuk lewat SSO institusi mitra · akses gratis</p></div>
        <i class="ph ph-caret-right" style="color:var(--ink-3)"></i>
      </button>
      <button class="method" onclick="authGo('email')">
        <span class="li-ic"><i class="ph ph-envelope-simple"></i></span>
        <div class="grow"><p class="h3" style="font-size:15px">Email</p><p class="tiny">${reg ? 'Daftar dengan email & kata sandi' : 'Email & kata sandi'}</p></div>
        <i class="ph ph-caret-right" style="color:var(--ink-3)"></i>
      </button>
      <button class="method" onclick="authGo('phone')">
        <span class="li-ic"><i class="ph ph-device-mobile"></i></span>
        <div class="grow"><p class="h3" style="font-size:15px">Nomor HP</p><p class="tiny">Kode verifikasi lewat WhatsApp atau SMS</p></div>
        <i class="ph ph-caret-right" style="color:var(--ink-3)"></i>
      </button>
      <p class="auth-foot">${reg ? 'Sudah punya akun?' : 'Belum punya akun?'} <button class="link" onclick="auth.mode='${reg ? 'login' : 'register'}';renderAuth('methods')">${reg ? 'Masuk' : 'Buat akun'}</button></p>
      <p class="legal">Dengan melanjutkan, kamu menyetujui Ketentuan Layanan dan Kebijakan Privasi Ruang Pulih.</p>`;
  },

  sso() {
    return `
      <h1 class="auth-title">Email kampus atau kantor</h1>
      <p class="auth-sub">Kami akan mengarahkanmu ke halaman masuk institusimu. Ruang Pulih tidak pernah melihat kata sandimu.</p>
      <label class="label" for="ssoEmail">Email institusi</label>
      <input class="field" id="ssoEmail" type="email" inputmode="email" autocomplete="email" placeholder="nama@binus.ac.id" data-autofocus onkeydown="if(event.key==='Enter')submitSso()">
      <p class="err" id="ssoErr"></p>
      <div class="notice"><i class="ph ph-info"></i><span>Mitra saat ini: BINUS, ITB, UNPAD, UPI, Telkom University. Institusi hanya melihat data agregat anonim.</span></div>
      <div class="auth-bottom"><button class="btn btn-primary btn-block" onclick="submitSso()">Lanjutkan</button></div>`;
  },

  email() {
    const reg = auth.mode === 'register';
    return `
      <h1 class="auth-title">${reg ? 'Daftar dengan email' : 'Masuk dengan email'}</h1>
      <p class="auth-sub">${reg ? 'Kami akan mengirim kode verifikasi ke email ini.' : 'Gunakan email yang kamu daftarkan.'}</p>
      <label class="label" for="authEmail">Email</label>
      <input class="field" id="authEmail" type="email" inputmode="email" autocomplete="email" placeholder="nama@email.com" data-autofocus oninput="emailSsoHint(this.value)">
      <div id="ssoHint"></div>
      <label class="label" for="authPass">Kata sandi</label>
      <div style="position:relative">
        <input class="field" id="authPass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="${reg ? 'Minimal 8 karakter' : 'Kata sandi'}" style="padding-right:52px" onkeydown="if(event.key==='Enter')submitEmail()">
        <button onclick="const i=document.getElementById('authPass');i.type=i.type==='password'?'text':'password'" aria-label="Tampilkan kata sandi" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:40px;height:40px;font-size:18px;color:var(--ink-3)"><i class="ph ph-eye"></i></button>
      </div>
      <p class="err" id="emailErr"></p>
      ${reg ? '' : `<button class="link" onclick="toast('Tautan reset dikirim ke emailmu (simulasi)','ph-envelope-simple')">Lupa kata sandi?</button>`}
      <div class="auth-bottom"><button class="btn btn-primary btn-block" onclick="submitEmail()">${reg ? 'Kirim kode verifikasi' : 'Masuk'}</button></div>`;
  },

  phone() {
    return `
      <h1 class="auth-title">${auth.mode === 'register' ? 'Daftar dengan nomor HP' : 'Masuk dengan nomor HP'}</h1>
      <p class="auth-sub">Kami akan mengirim kode 6 digit ke nomor ini.</p>
      <label class="label" for="authPhone">Nomor HP</label>
      <div class="phone-field">
        <input class="field cc" value="+62" readonly aria-label="Kode negara">
        <input class="field" id="authPhone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="812 3456 7890" maxlength="15" data-autofocus onkeydown="if(event.key==='Enter')submitPhone()">
      </div>
      <p class="err" id="phoneErr"></p>
      <p class="label" style="margin-top:4px">Kirim kode lewat</p>
      <div class="channels" role="radiogroup" aria-label="Saluran kode verifikasi">
        <button class="channel ${auth.channel === 'wa' ? 'on' : ''}" role="radio" aria-checked="${auth.channel === 'wa'}" onclick="pickChannel('wa')">
          ${LOGO.whatsapp}<span class="grow"><b>WhatsApp</b><span class="tiny">Lebih cepat & gratis</span></span><span class="tag">Utama</span>
        </button>
        <button class="channel ${auth.channel === 'sms' ? 'on' : ''}" role="radio" aria-checked="${auth.channel === 'sms'}" onclick="pickChannel('sms')">
          <span class="sms-ic"><i class="ph-fill ph-chat-text"></i></span><span class="grow"><b>SMS</b><span class="tiny">Jika tidak memakai WhatsApp</span></span>
        </button>
      </div>
      <div class="auth-bottom"><button class="btn btn-primary btn-block" onclick="submitPhone()">Kirim kode</button></div>`;
  },

  otp({ channel, to }) {
    return `
      <h1 class="auth-title">Masukkan kode</h1>
      <p class="auth-sub">Kode 6 digit sudah dikirim ke <b>${esc(to)}</b> lewat ${channel === 'wa' ? `${LOGO.whatsapp.replace('class="logo"', 'class="logo inline"')} WhatsApp` : CHANNEL[channel]}.</p>
      <div class="otp" id="otp">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" ${i === 0 ? 'data-autofocus' : ''}>`).join('')}</div>
      <p class="err" id="otpErr"></p>
      <p class="tiny mt-8">Mode demo: 6 angka apa saja diterima.</p>
      <p class="auth-foot" id="resend">Kirim ulang dalam <span id="resendT">30</span> detik</p>
      ${channel === 'email' ? '' : `<p class="auth-foot" style="margin-top:8px">${channel === 'wa' ? 'Tidak ada WhatsApp?' : 'Punya WhatsApp?'} <button class="link" onclick="switchOtpChannel('${channel === 'wa' ? 'sms' : 'wa'}','${esc(to)}')">Kirim lewat ${channel === 'wa' ? 'SMS' : 'WhatsApp'}</button></p>`}
      <div class="auth-bottom"><button class="btn btn-primary btn-block" onclick="verifyOtp()">Verifikasi</button></div>`;
  },

  consent({ provider, org, email }) {
    const sso = provider === 'sso';
    const p = sso ? { name: org, icon: 'ph-fill ph-buildings', color: 'var(--forest)', email } : AUTH_PROVIDERS[provider];
    return `
      <p class="tiny" style="text-align:center">Halaman ${esc(p.name)} · simulasi</p>
      <div class="consent mt-8">
        <div class="consent-logos"><span>${p.logo || `<i class="${p.icon}" style="color:${p.color}"></i>`}</span><i class="ph ph-arrows-left-right" style="color:var(--ink-3)"></i><span class="rp">${ILLO.appMark()}</span></div>
        <h2 class="h2" style="text-align:center">${sso ? `Masuk lewat SSO ${esc(org)}` : `Lanjutkan ke Ruang Pulih dengan ${p.name}`}</h2>
        <p class="tiny" style="text-align:center;margin:6px 0 16px">${esc(p.email)}</p>
        <p class="tiny" style="margin-bottom:4px">Ruang Pulih akan menerima:</p>
        <div class="scope"><i class="ph ph-user"></i>Nama (hanya untukmu, tidak tampil di komunitas)</div>
        <div class="scope"><i class="ph ph-envelope-simple"></i>Alamat email</div>
        ${sso ? `<div class="scope"><i class="ph ph-identification-badge"></i>Status aktif di ${esc(org)}</div>` : ''}
        ${provider === 'apple' ? `<label class="check"><input type="checkbox" id="hideEmail" checked> Sembunyikan email saya (Apple meneruskan email lewat alamat samaran)</label>` : ''}
        <button class="btn btn-primary btn-block mt-20" onclick="acceptConsent('${provider}')">Izinkan & lanjutkan</button>
        <button class="btn btn-ghost btn-block mt-8" onclick="authBack()">Batal</button>
      </div>
      <p class="legal">${sso ? 'Otorisasi lewat identity provider institusi (OAuth 2.0 / OpenID Connect atau SAML).' : 'Otorisasi lewat OAuth 2.0 / OpenID Connect.'} Ruang Pulih tidak pernah menerima kata sandimu.</p>`;
  },

  profile({ name = '' }) {
    auth.focus = [];
    return `
      <h1 class="auth-title">Satu langkah lagi</h1>
      <p class="auth-sub">Ini membantu kami menyesuaikan rekomendasi. Semuanya bisa diubah nanti.</p>
      <label class="label" for="profName">Mau dipanggil apa?</label>
      <input class="field" id="profName" maxlength="24" placeholder="Boleh nama samaran" value="${esc(name)}" data-autofocus>
      <label class="label">Apa yang ingin kamu fokuskan? <span class="tiny">(opsional)</span></label>
      <div class="chips wrap" id="focusChips">${FOCUS.map(f => `<button class="chip" onclick="this.classList.toggle('on')">${f}</button>`).join('')}</div>
      <label class="label" for="profRef">Kode ajakan <span class="tiny">(opsional)</span></label>
      <input class="field code-field" id="profRef" placeholder="Dari teman atau Campus Ambassador">
            <label class="check"><input type="checkbox" id="profRemind" checked> Ingatkan aku check-in setiap hari pukul 20.00</label>
      <label class="check"><input type="checkbox" id="profConsent" onchange="document.getElementById('profBtn').disabled=!this.checked"> Aku berusia 17 tahun ke atas dan setuju dengan Ketentuan Layanan & Kebijakan Privasi.</label>
      <div class="auth-bottom"><button class="btn btn-primary btn-block" id="profBtn" disabled onclick="finishProfile()">Mulai</button></div>`;
  },
};

// ---------- Step handlers ----------
function submitSso() {
  const email = document.getElementById('ssoEmail').value.trim().toLowerCase();
  const err = document.getElementById('ssoErr');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Masukkan email yang valid.'; return; }
  const org = orgForEmail(email);
  if (!org) { err.textContent = 'Institusi ini belum bermitra. Gunakan email biasa atau akun Google/Outlook.'; return; }
  authGo('consent', { provider: 'sso', org, email });
}

function emailSsoHint(v) {
  const org = orgForEmail(v.trim());
  document.getElementById('ssoHint').innerHTML = org ? `
    <div class="notice"><i class="ph ph-buildings"></i><span>Email ini terhubung dengan <b>${org}</b>. <button class="link" onclick="authGo('consent',{provider:'sso',org:'${org}',email:document.getElementById('authEmail').value.trim()})">Masuk lewat SSO</button> untuk akses gratis.</span></div>` : '';
}

function submitEmail() {
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  const pass = document.getElementById('authPass').value;
  const err = document.getElementById('emailErr');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Masukkan email yang valid.'; return; }
  if (auth.mode === 'register' && pass.length < 8) { err.textContent = 'Kata sandi minimal 8 karakter.'; return; }
  if (!pass) { err.textContent = 'Masukkan kata sandi.'; return; }
  auth.pending = { method: 'email', id: maskEmail(email) };
  if (auth.mode === 'register') authGo('otp', { channel: 'email', to: maskEmail(email) });
  else finishAuth();
}

function submitPhone() {
  const raw = document.getElementById('authPhone').value.replace(/\D/g, '').replace(/^0/, '');
  const err = document.getElementById('phoneErr');
  if (!/^8\d{8,11}$/.test(raw)) { err.textContent = 'Nomor HP Indonesia diawali 8, misalnya 812 3456 7890.'; return; }
  auth.pending = { method: 'phone', id: maskPhone(raw) };
  authGo('otp', { channel: auth.channel, to: maskPhone(raw) });
}

function pickChannel(ch) {
  auth.channel = ch;
  document.querySelectorAll('.channel').forEach(b => {
    const on = b.getAttribute('onclick').includes(`'${ch}'`);
    b.classList.toggle('on', on); b.setAttribute('aria-checked', on);
  });
}
function switchOtpChannel(ch, to) {
  auth.channel = ch;
  renderAuth('otp', { channel: ch, to });
  toast(`Kode baru dikirim lewat ${CHANNEL[ch]}`, ch === 'wa' ? 'ph-whatsapp-logo' : 'ph-chat-text');
}

let resendTimer = null;
function wireOtp() {
  const boxes = [...document.querySelectorAll('#otp input')];
  boxes.forEach((b, i) => {
    b.addEventListener('input', () => {
      b.value = b.value.replace(/\D/g, '').slice(-1);
      if (b.value && boxes[i + 1]) boxes[i + 1].focus();
      if (boxes.every(x => x.value)) verifyOtp();
    });
    b.addEventListener('keydown', e => { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
    b.addEventListener('paste', e => {
      const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
      if (!digits) return;
      e.preventDefault();
      digits.split('').forEach((d, j) => { if (boxes[j]) boxes[j].value = d; });
      if (digits.length === 6) verifyOtp();
    });
  });
  let t = 30;
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    const el = document.getElementById('resendT');
    if (!el) return clearInterval(resendTimer);
    if (--t <= 0) {
      clearInterval(resendTimer);
      document.getElementById('resend').innerHTML = `<button class="link" onclick="toast('Kode baru dikirim','ph-paper-plane-tilt');wireOtp()">Kirim ulang kode</button>`;
    } else el.textContent = t;
  }, 1000);
}
function verifyOtp() {
  const code = [...document.querySelectorAll('#otp input')].map(b => b.value).join('');
  if (code.length < 6) { document.getElementById('otpErr').textContent = 'Lengkapi 6 digit kode.'; return; }
  clearInterval(resendTimer);
  if (auth.mode === 'register') authGo('profile');
  else finishAuth();
}

function acceptConsent(provider) {
  const { org, email } = auth.current.data;
  if (provider === 'sso') {
    auth.pending = { method: 'sso', id: maskEmail(email), org };
  } else {
    const hide = provider === 'apple' && document.getElementById('hideEmail')?.checked;
    auth.pending = { method: provider, id: hide ? 'email samaran Apple' : maskEmail(AUTH_PROVIDERS[provider].email) };
  }
  if (auth.mode === 'register') authGo('profile');
  else finishAuth();
}

function finishProfile() {
  const name = document.getElementById('profName').value.trim();
  if (name) state.name = name;
  state.prefs.reminders = document.getElementById('profRemind').checked;
  applyReferral(true);
  state.focus = [...document.querySelectorAll('#focusChips .chip.on')].map(c => c.textContent);
  finishAuth();
}

function finishAuth() {
  const p = auth.pending;
  state.account = { method: p.method, id: p.id, since: dayKey() };
  if (p.org) state.org = p.org;
  persist();
  auth.current = null; auth.stack = [];
  document.getElementById('welcome').classList.add('hide');
  go('home');
  showSosFab();
  toast(p.org ? `Terhubung dengan ${p.org} · konsultasi gratis` : `Selamat datang, ${state.name}`, 'ph-hand-waving');
  // Campus members choose what their institution may see before anything beyond anonymous totals is shared.
  if (state.org && !state.campusShare?.decided) setTimeout(() => openCampusConsent('onboard'), 900);
}
