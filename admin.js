function switchAdminTab(tabId) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    }
  });

  // Update title
  const titles = {
    'dashboard': 'Dashboard Analytics',
    'users': 'User Roster Management',
    'events': 'Organization Events',
    'support': 'Priority B2B Support',
    'settings': 'Organization Settings'
  };
  document.getElementById('pageTitle').textContent = titles[tabId];

  // Show correct tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

function generateInvite() {
  const code = 'BINUS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  alert(`Generated Invite Code: ${code}\nShare this with your members.`);
}

function sendSupportMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const chatContainer = document.getElementById('chatMessages');
  
  // Add sent message
  const sentDiv = document.createElement('div');
  sentDiv.className = 'msg sent';
  sentDiv.innerHTML = `<div class="msg-bubble">${text}</div>`;
  chatContainer.appendChild(sentDiv);

  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Simulate reply
  setTimeout(() => {
    const recvDiv = document.createElement('div');
    recvDiv.className = 'msg received';
    recvDiv.innerHTML = `<div class="msg-bubble">Terima kasih atas pesannya. Tim B2B kami akan segera menindaklanjuti.</div>`;
    chatContainer.appendChild(recvDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 1000);
}

// Allow enter to send
document.getElementById('chatInput')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendSupportMessage();
});

function filterRoster() {
  const input = document.getElementById('rosterSearch');
  if (!input) return;
  const filter = input.value.toLowerCase();
  const table = document.getElementById('rosterTable');
  if (!table) return;
  const trs = table.getElementsByTagName('tr');

  // Loop through all table rows, starting from index 1 (skipping the header)
  for (let i = 1; i < trs.length; i++) {
    const tdName = trs[i].getElementsByTagName('td')[0]; // Name column
    if (tdName) {
      const txtValue = tdName.textContent || tdName.innerText;
      if (txtValue.toLowerCase().indexOf(filter) > -1) {
        trs[i].style.display = "";
      } else {
        trs[i].style.display = "none";
      }
    }       
  }
}

function openUserKpiModal(name, threads, replies, consults, wait, returning, csat) {
  const modal = document.getElementById('userKpiModal');
  if (!modal) return;
  
  document.getElementById('kpiModalName').textContent = name + ' - KPIs';
  document.getElementById('kpiThreads').textContent = threads;
  document.getElementById('kpiReplies').textContent = replies;
  document.getElementById('kpiConsults').textContent = consults;
  document.getElementById('kpiWait').textContent = wait;
  document.getElementById('kpiReturn').textContent = returning;
  const donut = document.getElementById('kpiReturnDonut');
  if (donut) {
    const percentVal = parseInt(returning.replace('%', '')) || 0;
    donut.style.setProperty('--percent', percentVal);
    const inner = donut.querySelector('.kpi-donut-inner');
    if (inner) inner.textContent = returning;
  }
  
  const csatEl = document.getElementById('kpiCsat');
  if (csat === '-') {
    csatEl.innerHTML = '-';
  } else {
    csatEl.innerHTML = csat + ' <span style="font-size:1rem; color:#F1C40F"><i class="ti ti-star-filled"></i></span>';
  }
  
  modal.style.display = 'flex';
}

function closeUserKpiModal() {
  const modal = document.getElementById('userKpiModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
