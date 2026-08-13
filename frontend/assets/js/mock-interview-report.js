(function () {
  'use strict';

  const API = typeof AUTH_API_BASE_URL !== 'undefined' ? AUTH_API_BASE_URL : (window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api'));


  const getToken = () => localStorage.getItem('authToken') || '';
  const getUser  = () => JSON.parse(localStorage.getItem('currentUser') || 'null');

  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = 'login.html?next=' + encodeURIComponent(window.location.href);
    return;
  }

  const navBadge = document.getElementById('navUserBadge');
  if (navBadge) {
    navBadge.textContent = ((user.firstname || user.name || user.email || 'U')[0]).toUpperCase();
    navBadge.classList.remove('hidden');
  }

  const params    = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');
  if (!sessionId) {
    window.location.href = 'mock-interview-history.html';
    return;
  }

  const loadingEl     = document.getElementById('loadingState');
  const errorEl       = document.getElementById('errorState');
  const reportContent = document.getElementById('reportContent');

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  const PRACTICE_MAP = {
    'Java':             'programming-languages.html',
    'Python':           'programming-languages.html',
    'JavaScript':       'programming-languages.html',
    'C++':              'programming-languages.html',
    'OOP':              'programming-languages.html',
    'DBMS':             'core-subjects.html',
    'SQL':              'core-subjects.html',
    'Operating Systems':'core-subjects.html',
    'Computer Networks':'core-subjects.html',
    'Data Structures':  'coding-questions.html',
    'Algorithms / DSA': 'coding-questions.html',
    'DSA':              'coding-questions.html',
    'System Design':    'core-subjects.html',
    'Node.js':          'programming-languages.html',
    'React':            'programming-languages.html',
  };

  const CODING_PRACTICE_TOPICS = ['Data Structures', 'Algorithms / DSA', 'DSA', 'Java', 'Python', 'C++', 'JavaScript'];

  async function loadReport() {
    try {
      // First try to end the session (idempotent if already ended)
      await fetch(`${API}/interviews/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });

      // Fetch full report (includes conversation + scores)
      const res = await fetch(`${API}/interviews/${sessionId}/report`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load report');

      renderReport(data.data);
    } catch (err) {
      if (loadingEl) loadingEl.classList.add('hidden');
      if (errorEl) {
        const errorMsgEl = document.getElementById('errorMsg');
        if (errorMsgEl) errorMsgEl.textContent = err.message || 'Failed to load report.';
        errorEl.classList.remove('hidden');
      }
    }
  }

  function getScoreColor(score) {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  }

  function getVerdict(score) {
    if (score >= 85) return 'Excellent Performance! 🎉';
    if (score >= 70) return 'Good Performance! 👍';
    if (score >= 55) return 'Satisfactory — Needs Practice 📈';
    return 'Needs Improvement 💡';
  }

  function renderReport(data) {
    const r = data.report || {};
    const overallScore = data.overallScore || r.overallScore || 0;
    const techScore = r.technicalScore || 0;
    const commScore = r.communicationScore || 0;

    // Score Circle animation
    const circleEl = document.getElementById('scoreCircle');
    if (circleEl) {
      const circumference = 264; // 2 * pi * 42
      const offset = circumference - (overallScore / 100) * circumference;
      circleEl.style.strokeDasharray = `${circumference}`;
      circleEl.style.strokeDashoffset = `${offset}`;
      circleEl.style.stroke = getScoreColor(overallScore);
    }

    const overallScoreVal = document.getElementById('overallScoreVal');
    if (overallScoreVal) overallScoreVal.textContent = overallScore;

    const verdictText = document.getElementById('verdictText');
    if (verdictText) verdictText.textContent = getVerdict(overallScore);

    const repSub = document.getElementById('repSub');
    if (repSub) {
      repSub.textContent = `${data.interviewType} Interview · ${data.difficulty} · ${new Date(data.endedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }

    const summaryText = document.getElementById('summaryText');
    if (summaryText) summaryText.textContent = r.summary || 'No summary available.';

    // Top Summary Score Cards (Technical + Communication)
    const dimGrid = document.getElementById('dimGrid');
    if (dimGrid) {
      const scoreCardsContainer = document.createElement('div');
      scoreCardsContainer.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;grid-column:1/-1;';
      scoreCardsContainer.innerHTML = `
        <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;box-shadow:0 2px 10px rgba(15,23,42,0.05);">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:8px;"><i class="fa-solid fa-code"></i> Technical Score</div>
          <div style="font-size:2.2rem;font-weight:800;color:${getScoreColor(techScore)};line-height:1;">${techScore}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">/ 100</div>
        </div>
        <div style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;box-shadow:0 2px 10px rgba(15,23,42,0.05);">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:8px;"><i class="fa-solid fa-comments"></i> Communication Score</div>
          <div style="font-size:2.2rem;font-weight:800;color:${getScoreColor(commScore)};line-height:1;">${commScore}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">/ 100</div>
        </div>
      `;
      dimGrid.parentNode.insertBefore(scoreCardsContainer, dimGrid);

      // Render Dimensions
      const dims = r.dimensions || {};
      const dimLabels = {
        technicalAccuracy:    'Technical Accuracy',
        completeness:         'Completeness',
        communication:        'Communication',
        problemSolving:       'Problem Solving',
        projectUnderstanding: 'Project Understanding',
        behavioralReasoning:  'Behavioral Reasoning',
        clarity:              'Clarity',
      };
      const dimEntries = Object.entries(dims).filter(([, v]) => Number(v) > 0);
      if (dimEntries.length > 0) {
        dimGrid.innerHTML = dimEntries.map(([key, val]) => `
          <div class="dim-card">
            <div class="dim-label">${dimLabels[key] || key}</div>
            <div class="dim-score" style="color:${getScoreColor(val)};">${val || 0}<span style="font-size:14px;color:var(--text-muted);font-weight:400;">/100</span></div>
          </div>
        `).join('');
      } else {
        dimGrid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;grid-column:1/-1;text-align:center;">No dimension data available.</p>';
      }
    }

    // AI Communication Assessment
    const commDims = r.communicationDimensions || {};
    const commEntries = Object.entries(commDims).filter(([, v]) => Number(v) > 0);
    if (commEntries.length > 0 && dimGrid) {
      const commLabels = {
        clarity: 'Clarity', structure: 'Structure', conciseness: 'Conciseness',
        technicalVocabulary: 'Technical Vocabulary', completeness: 'Completeness',
      };
      const commSection = document.createElement('div');
      commSection.className = 'card';
      commSection.style.marginTop = '20px';
      commSection.innerHTML = `
        <div class="card-title"><i class="fa-solid fa-comment-dots"></i> AI Communication Assessment</div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">
          <i class="fa-solid fa-info-circle"></i> Based on <strong>written text analysis</strong> — clarity, structure, vocabulary, and completeness of your written answers. Not voice, pronunciation, or facial expressions.
        </p>
        <div id="commBars">
          ${commEntries.map(([key, val]) => `
            <div class="topic-bar-row" style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
              <span class="topic-bar-name" style="min-width:140px;font-size:13px;font-weight:600;">${commLabels[key] || key}</span>
              <div class="topic-bar-track" style="flex:1;height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
                <div class="topic-bar-fill" style="width:${val || 0}%;height:100%;background:linear-gradient(90deg,#7c3aed,#c026d3);border-radius:999px;"></div>
              </div>
              <span class="topic-bar-pct" style="min-width:40px;text-align:right;font-size:13px;font-weight:700;color:#7c3aed;">${val || 0}%</span>
            </div>
          `).join('')}
        </div>
      `;
      dimGrid.parentNode.insertBefore(commSection, dimGrid.nextSibling);
    }

    // Topic Performance
    const topicPerf = r.topicPerformance || [];
    if (topicPerf.length > 0 && dimGrid) {
      const topicSection = document.createElement('div');
      topicSection.className = 'card';
      topicSection.style.marginTop = '20px';
      topicSection.innerHTML = `
        <div class="card-title"><i class="fa-solid fa-layer-group"></i> Topic Performance</div>
        ${topicPerf.map(tp => `
          <div class="topic-bar-row" style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <span class="topic-bar-name" style="min-width:140px;font-size:13px;font-weight:600;">${escapeHtml(tp.topic)}</span>
            <div class="topic-bar-track" style="flex:1;height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
              <div class="topic-bar-fill" style="width:${tp.score || 0}%;height:100%;background:${getScoreColor(tp.score || 0)};border-radius:999px;"></div>
            </div>
            <span class="topic-bar-pct" style="min-width:40px;text-align:right;font-size:13px;font-weight:700;color:${getScoreColor(tp.score || 0)};">${tp.score || 0}%</span>
          </div>
        `).join('')}
      `;
      dimGrid.parentNode.insertBefore(topicSection, dimGrid.nextSibling);
    }

    // Strengths
    const strengths = r.strengths || [];
    const strengthsList = document.getElementById('strengthsList');
    if (strengthsList) {
      strengthsList.innerHTML = strengths.length
        ? strengths.map(s => `
            <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:13px;">
              <i class="fa-solid fa-check" style="color:var(--success);margin-top:3px;"></i>
              <span>${escapeHtml(s)}</span>
            </li>`).join('')
        : '<p style="color:var(--text-muted);font-size:13px;">No specific strengths identified.</p>';
    }

    // Weaknesses / Improvements
    const weaknesses = r.weaknesses || r.improvements || [];
    const weaknessesList = document.getElementById('weaknessesList');
    if (weaknessesList) {
      weaknessesList.innerHTML = weaknesses.length
        ? weaknesses.map(w => `
            <li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:13px;">
              <i class="fa-solid fa-triangle-exclamation" style="color:var(--danger);margin-top:3px;"></i>
              <span>${escapeHtml(w)}</span>
            </li>`).join('')
        : '<p style="color:var(--text-muted);font-size:13px;">Keep practicing to identify improvement areas.</p>';
    }

    // Recommendations
    const recs = r.recommendedTopics || [];
    const recsList = document.getElementById('recsList');
    if (recsList) {
      if (recs.length > 0) {
        const topicsChips = recs.map(t => `<span class="topic-chip selected" style="display:inline-block;padding:4px 10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:999px;font-size:12px;font-weight:600;color:var(--primary);margin:2px 4px 6px 0;">${escapeHtml(t)}</span>`).join('');
        const links = recs
          .filter(t => PRACTICE_MAP[t])
          .map(t => {
            const isCoding = CODING_PRACTICE_TOPICS.includes(t);
            return `<a href="${PRACTICE_MAP[t]}" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0;font-size:12px;padding:6px 12px;"><i class="fa-solid fa-arrow-right"></i> ${isCoding ? 'Practice' : 'Study'} ${escapeHtml(t)}</a>`;
          }).join('');
        recsList.innerHTML = `
          <div style="margin-bottom:12px;">${topicsChips}</div>
          <div>${links}</div>
        `;
      } else {
        document.getElementById('recsCard')?.classList.add('hidden');
      }
    }

    // Conversation Log
    const messages = data.messages || [];
    const convLog = document.getElementById('convLog');
    if (convLog) {
      convLog.innerHTML = messages.map(m => `
        <div class="conv-msg" style="padding:12px 14px;border-bottom:1px solid var(--border);font-size:13px;">
          <div class="conv-msg-role" style="font-weight:700;margin-bottom:4px;color:${m.role === 'interviewer' ? 'var(--primary)' : 'var(--text)'};">
            ${m.role === 'interviewer' ? '🤖 AI Interviewer' : '👤 You'}
            ${m.questionNumber ? ` · Q${m.questionNumber}` : ''}
            ${m.topic ? ` · <em>${escapeHtml(m.topic)}</em>` : ''}
          </div>
          <div class="conv-msg-content" style="line-height:1.5;">${escapeHtml(m.content)}</div>
          ${m.evaluation && m.role === 'candidate' && m.evaluation.score > 0 ? `
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
              Answer score: <strong style="color:${getScoreColor(m.evaluation.score)};">${m.evaluation.score}/100</strong>
            </div>` : ''}
        </div>
      `).join('');
    }

    // Conversation Toggle Button
    const convToggleBtn = document.getElementById('convToggleBtn');
    if (convToggleBtn && convLog) {
      convToggleBtn.addEventListener('click', () => {
        convLog.classList.toggle('hidden');
      });
      convLog.classList.add('hidden'); // hidden by default
    }

    if (loadingEl) loadingEl.classList.add('hidden');
    if (reportContent) reportContent.classList.remove('hidden');
  }

  loadReport();
})();
