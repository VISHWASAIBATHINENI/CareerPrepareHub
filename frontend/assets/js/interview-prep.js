(function () {
  'use strict';

  const API = typeof AUTH_API_BASE_URL !== 'undefined' ? AUTH_API_BASE_URL : (window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api'));

  const getToken = () => localStorage.getItem('authToken') || '';
  const getUser = () => JSON.parse(localStorage.getItem('currentUser') || 'null');

  // ── Auth state ──
  const user = getUser();
  const navBadge   = document.getElementById('navUserBadge');
  const navLoginBtn = document.getElementById('navLoginBtn');

  if (user && getToken()) {
    if (navBadge) {
      navBadge.textContent = ((user.firstname || user.name || user.email || 'U')[0]).toUpperCase();
      navBadge.classList.remove('hidden');
    }
    if (navLoginBtn) navLoginBtn.style.display = 'none';
  }

  // ── Mobile nav toggle ──
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
      }
    });
  }

  // ── Load interview history count ──
  async function loadHistoryCount() {
    const desc = document.getElementById('historyQuickDesc');
    if (!desc) return;

    if (!user || !getToken()) {
      desc.textContent = 'Log in to view your interview history.';
      return;
    }

    try {
      const res = await fetch(`${API}/interviews`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        desc.textContent = 'View and resume past interview sessions.';
        return;
      }
      const data = await res.json();
      const sessions = data.data || [];
      const completed = sessions.filter(s => s.status === 'completed').length;
      const inProgress = sessions.filter(s => s.status === 'in_progress').length;

      if (sessions.length === 0) {
        desc.textContent = 'No interviews yet. Start your first interview above!';
      } else {
        const parts = [];
        if (completed > 0) parts.push(`${completed} completed`);
        if (inProgress > 0) parts.push(`${inProgress} in progress`);
        desc.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''} — ${parts.join(', ')}.`;
      }
    } catch {
      desc.textContent = 'View and resume past interview sessions.';
    }
  }

  // ── Mode button auth gate ──
  // For unauthenticated users, redirect to login before going to setup page
  function setupModeButtons() {
    const modeLinks = document.querySelectorAll('.mode-btn[href^="mock-interview.html"]');
    modeLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (!user || !getToken()) {
          e.preventDefault();
          const next = encodeURIComponent(link.getAttribute('href'));
          window.location.href = `login.html?next=${next}`;
        }
      });
    });
  }

  // ── Init ──
  loadHistoryCount();
  setupModeButtons();
})();
