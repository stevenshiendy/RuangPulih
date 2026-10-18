with open("index.html", "r") as f:
    content = f.read()

target = "    </div><!-- /#app -->"
idx = content.find(target)

if idx != -1:
    new_html = """
  <!-- ===== ADMIN IFRAME OVERLAY ===== -->
  <div class="modal-overlay" id="adminIframeOverlay" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; z-index:9999; background:white; flex-direction:column;">
    <div style="height:54px; display:flex; align-items:center; padding:0 20px; border-bottom:1px solid #eee; background:var(--bg-card); flex-shrink:0;">
      <button onclick="closeAdminIframe()" style="background:none; border:none; font-size:1rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; color:var(--text-primary);"><i class="ti ti-chevron-left" style="font-size:1.4rem;"></i> Kembali ke App</button>
    </div>
    <iframe src="admin.html" style="width:100%; flex:1; border:none;"></iframe>
  </div>

"""
    with open("index.html", "w") as f:
        f.write(content[:idx] + new_html + content[idx:])
