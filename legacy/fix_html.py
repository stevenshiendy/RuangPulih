with open("index.html", "r") as f:
    content = f.read()

# Find the end of the share sheet
marker = "<!-- ===== TOAST ===== -->"
start_idx = content.find(marker)

if start_idx != -1:
    good_content = content[:start_idx]
    new_tail = """  <!-- ===== TOAST ===== -->
  <div class="toast" id="toast"></div>

  <!-- ===== NOTIF OVERLAY ===== -->
  <div class="notif-overlay" id="notifOverlay">
    <div class="notif-panel">
      <div class="notif-header">
        <h2>Notifikasi</h2>
        <button class="notif-close-btn" onclick="toggleNotif()"><i class="ti ti-x"></i></button>
      </div>
      <div class="notif-list">
        <div class="notif-item">
          <div class="notif-icon" style="background: rgba(166,123,91,0.15); color:var(--coral);"><i class="ti ti-heart"></i></div>
          <div class="notif-content">
            <p>Seseorang menyukai ceritamu di Lingkar Pulih.</p>
            <span class="notif-time">2j lalu</span>
          </div>
        </div>
        <div class="notif-item">
          <div class="notif-icon" style="background: rgba(95,122,97,0.15); color:var(--sage);"><i class="ti ti-calendar-event"></i></div>
          <div class="notif-content">
            <p>Pengingat: Konsultasi dengan Psikolog besok pukul 10:00.</p>
            <span class="notif-time">5j lalu</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== AFFILIATION MODAL ===== -->
  <div class="modal-overlay" id="affiliationModal">
    <div class="modal-sheet">
      <div class="modal-sheet-handle"></div>
      <div class="gratitude-header">
        <span class="gratitude-icon"><i class="ti ti-building" style="color:var(--sage-dark);"></i></span>
        <h3>Afiliasi Institusi</h3>
        <p>Buka akses event eksklusif dan Private Hub komunitas lembagamu.</p>
      </div>
      
      <div id="affUnlinkedState">
        <div class="gratitude-entries" style="margin-top:20px;">
          <input type="email" class="journal-input" id="affEmailInput" placeholder="Email Institusi (misal: @binus.edu)" style="min-height:50px;">
          <p style="text-align:center; margin:10px 0; color:var(--text-muted); font-size:0.8rem;">ATAU</p>
          <input type="text" class="journal-input" id="affCodeInput" placeholder="Kode Invite (misal: BINUS-XYZ)" style="min-height:50px; text-transform:uppercase;">
        </div>
        <button class="modal-primary-btn" style="margin-top:24px;" onclick="verifyAffiliation()">Verifikasi Afiliasi</button>
      </div>

      <div id="affLinkedState" style="display:none; text-align:center; padding: 20px 0;">
        <div style="font-size:3rem; color:var(--sage);"><i class="ti ti-circle-check-filled"></i></div>
        <h4 style="margin: 12px 0 4px;">Akun Tertaut!</h4>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom: 24px;">Kamu tergabung dalam <strong id="affLinkedName">Bina Nusantara</strong>.</p>
        
        <div style="background:var(--bg); border-radius:var(--radius); padding:16px; text-align:left; margin-bottom: 24px;">
          <h4 style="font-size:0.9rem; margin-bottom: 8px;">Privasi & Anomimitas</h4>
          <label class="toggle-switch" style="display:flex; justify-content:space-between; width:100%;">
            <span style="font-size:0.85rem; color:var(--text-secondary);">Sembunyikan profil dari rekan kerja di Hub</span>
            <div>
              <input type="checkbox" id="anonToggle" checked>
              <span class="toggle-slider"></span>
            </div>
          </label>
        </div>

        <button class="btn-outline" style="width:100%; padding:12px; border-radius:50px; border:1px solid var(--coral); color:var(--coral); font-weight:600; background:transparent;" onclick="unlinkAffiliation()">Putuskan Tautan</button>
      </div>

      <button class="modal-secondary-btn" style="margin-top:12px;" onclick="closeAffiliationModal()">Tutup</button>
    </div>
  </div>

    </div><!-- /#app -->
    <div class="simulated-home-indicator"></div>
  </div><!-- /.device-frame -->
</div><!-- /#simulator-container -->

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="app.js"></script>
</body>
</html>
"""
    with open("index.html", "w") as f:
        f.write(good_content + new_tail)
