(function () {
  'use strict';

  const API = typeof AUTH_API_BASE_URL !== 'undefined' ? AUTH_API_BASE_URL : (window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api'));


  const getToken = () => localStorage.getItem('authToken') || '';
  const getUser  = () => JSON.parse(localStorage.getItem('currentUser') || 'null');

  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = `login.html?next=${encodeURIComponent('mock-interview-history.html')}`;
    return;
  }

  const navBadge = document.getElementById('navUserBadge');
  if (navBadge) {
    navBadge.textContent = ((user.firstname || user.email || 'U')[0]).toUpperCase();
    navBadge.classList.remove('hidden');
  }

  const loadingEl  = document.getElementById('loadingState');
  const historyGrid= document.getElementById('historyGrid');
  const emptyState = document.getElementById('emptyState');
  const errorBanner= document.getElementById('errorBanner');

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function statusLabel(status) {
    const map = { completed: 'Completed', in_progress: 'In Progress', abandoned: 'Abandoned' };
    return map[status] || status;
  }

  async function loadHistory() {
    try {
      const res = await fetch(`${API}/interviews`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load interviews');

      const sessions = data.data || [];
      loadingEl.classList.add('hidden');

      if (sessions.length === 0) {
        emptyState.classList.remove('hidden');
        return;
      }

      historyGrid.innerHTML = sessions.map(s => {
        const score = s.overallScore != null ? `${s.overallScore}%` : '—';
        const topics = (s.selectedTopics || []).slice(0, 4).join(' · ') + (s.selectedTopics?.length > 4 ? ' ...' : '');
        const canViewReport = s.status === 'completed';
        const modeBadge = s.mode === 'voice' ? '🎙️ Voice' : '⌨️ Text';

        return `
          <div class="history-card">
            <div class="history-info">
              <div class="history-type">
                ${escapeHtml(s.interviewType)} Interview
                <span class="badge" style="font-size:10px;padding:2px 8px;margin-left:6px;font-weight:600;">${modeBadge}</span>
              </div>
              <div class="history-topics">${topics || 'No topics selected'}</div>
              <div class="history-meta">
                <span class="history-score">${score}</span>
                <span class="status-chip ${s.status}">${statusLabel(s.status)}</span>
                <span class="history-date">${formatDate(s.createdAt)}</span>
              </div>
            </div>
            <div class="history-actions">
              ${canViewReport
                ? `<a href="mock-interview-report.html?session=${s.sessionId}" class="btn btn-primary btn-sm">
                     <i class="fa-solid fa-chart-line"></i> View Report
                   </a>`
                : s.status === 'in_progress'
                  ? `<a href="mock-interview-session.html?session=${s.sessionId}" class="btn btn-secondary btn-sm">
                       <i class="fa-solid fa-play"></i> Continue
                     </a>`
                  : `<span class="btn btn-secondary btn-sm" style="opacity:0.5;cursor:default;">No Report</span>`
              }
            </div>
          </div>
        `;
      }).join('');

      historyGrid.classList.remove('hidden');
    } catch (err) {
      loadingEl.classList.add('hidden');
      errorBanner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(err.message)}`;
      errorBanner.classList.add('show');
    }
  }

  loadHistory();
})();
