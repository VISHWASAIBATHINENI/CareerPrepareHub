(function () {
  'use strict';

  const API = typeof AUTH_API_BASE_URL !== 'undefined' ? AUTH_API_BASE_URL : (window.API_BASE_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000' ? 'http://localhost:5000/api' : '/api'));


  const getToken = () => localStorage.getItem('authToken') || '';
  const getUser  = () => JSON.parse(localStorage.getItem('currentUser') || 'null');

  // ── Redirect if not logged in ──
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = `login.html?next=${encodeURIComponent('mock-interview.html' + window.location.search)}`;
    return;
  }

  // ── Nav badge ──
  const navBadge = document.getElementById('navUserBadge');
  if (navBadge) {
    navBadge.textContent = ((user.firstname || user.name || user.email || 'U')[0]).toUpperCase();
    navBadge.classList.remove('hidden');
  }
  const navLoginLink = document.getElementById('navLoginLink');
  if (navLoginLink) navLoginLink.classList.add('hidden');

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

  // ── Available topics ──
  const TOPICS = [
    'Java', 'Python', 'C++', 'JavaScript', 'OOP', 'Data Structures',
    'Algorithms / DSA', 'DBMS', 'SQL', 'MongoDB', 'Operating Systems',
    'Computer Networks', 'System Design', 'Node.js', 'React', 'Spring Boot',
    'REST APIs', 'Git & Version Control', 'HR / Behavioral',
  ];

  // ── State ──
  let selectedTopics  = new Set(['Java', 'OOP', 'DBMS', 'SQL']);
  let interviewType   = 'Technical';
  let interviewMode   = 'text';
  let difficulty      = 'Intermediate';
  let useResume       = true;
  let selectedPDFFile = null;
  let activeResumeTab = 'pdf';

  // UNLIMITED questions — AI asks until user clicks "End Interview"
  const UNLIMITED = 50;

  // ── DOM refs ──
  const errorBanner     = document.getElementById('errorBanner');
  const startBtn        = document.getElementById('startInterviewBtn');
  const saveResumeBtn   = document.getElementById('saveResumeBtn');
  const resumeStatus    = document.getElementById('resumeSaveStatus');
  const resumeTextarea  = document.getElementById('resumeTextarea');
  const useResumeToggle = document.getElementById('useResumeToggle');
  const resumeCard      = document.getElementById('resumeCard');
  const resumeOptCard   = document.getElementById('resumeOptionalCard');
  const topicsCard      = document.getElementById('topicsCard');
  const uploadZone      = document.getElementById('uploadZone');
  const uploadInput     = document.getElementById('resumePDFInput');
  const uploadSelected  = document.getElementById('uploadSelected');
  const uploadFileName  = document.getElementById('uploadFileName');
  const uploadFileSize  = document.getElementById('uploadFileSize');
  const uploadRemoveBtn = document.getElementById('uploadRemoveBtn');
  const uploadError     = document.getElementById('uploadError');
  const uploadErrorMsg  = document.getElementById('uploadErrorMsg');

  // ── Mode & Type from URL param ──
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  const interviewModeParam = urlParams.get('interviewMode');
  if (interviewModeParam === 'voice' || interviewModeParam === 'text') {
    interviewMode = interviewModeParam;
  }

  const MODE_MAP = {
    'Technical':         'Technical',
    'HR':                'HR',
    'Resume+Based':      'Resume Based',
    'Resume Based':      'Resume Based',
    'Resume+Technical':  'Resume + Technical',
    'Resume + Technical':'Resume + Technical',
    'Technical+HR':      'Technical + HR',
    'Technical + HR':    'Technical + HR',
  };

  // ── Error / clear ──
  function showError(msg) {
    errorBanner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
    errorBanner.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function clearError() { errorBanner.classList.remove('show'); }

  // ── Resume type layout ──
  const RESUME_REQUIRED_TYPES = ['Resume Based', 'Resume + Technical'];

  function updateLayout() {
    const isResumeMode = RESUME_REQUIRED_TYPES.includes(interviewType);
    const isHR         = interviewType === 'HR';

    // Topics: hide for pure HR and Resume Based
    if (isHR || interviewType === 'Resume Based') {
      topicsCard.style.display = 'none';
    } else {
      topicsCard.style.display = '';
    }

    // Resume required vs optional
    if (isResumeMode) {
      resumeCard.style.display = '';
      resumeOptCard.style.display = 'none';
    } else {
      resumeCard.style.display = 'none';
      resumeOptCard.style.display = '';
    }
  }

  // ── Render topic chips ──
  function renderTopics() {
    const grid = document.getElementById('topicsGrid');
    grid.innerHTML = TOPICS.map(t => `
      <span class="topic-chip ${selectedTopics.has(t) ? 'selected' : ''}" data-topic="${t}">${t}</span>
    `).join('');
    grid.querySelectorAll('.topic-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const t = chip.dataset.topic;
        if (selectedTopics.has(t)) {
          selectedTopics.delete(t);
          chip.classList.remove('selected');
        } else {
          selectedTopics.add(t);
          chip.classList.add('selected');
        }
      });
    });
  }

  // ── Add custom topic ──
  function addCustomTopic() {
    const input = document.getElementById('customTopicInput');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;

    const existing = TOPICS.find(t => t.toLowerCase() === val.toLowerCase());
    if (existing) {
      selectedTopics.add(existing);
    } else {
      TOPICS.push(val);
      selectedTopics.add(val);
    }
    input.value = '';
    renderTopics();
  }

  const addCustomTopicBtn = document.getElementById('addCustomTopicBtn');
  const customTopicInput  = document.getElementById('customTopicInput');
  if (addCustomTopicBtn) {
    addCustomTopicBtn.addEventListener('click', addCustomTopic);
  }
  if (customTopicInput) {
    customTopicInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomTopic();
      }
    });
  }

  // ── Pill group selection ──
  function wirePillGroup(containerId, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.option-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.option-pill').forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        onChange(pill.dataset.value);
      });
    });
  }

  wirePillGroup('modeGroup', v => { interviewMode = v; });
  wirePillGroup('typeGroup', v => { interviewType = v; updateLayout(); });
  wirePillGroup('difficultyGroup', v => { difficulty = v; });

  // Sync modeGroup pill from query param
  if (interviewModeParam === 'voice') {
    const voicePill = document.querySelector('#modeGroup .option-pill[data-value="voice"]');
    if (voicePill) {
      document.querySelectorAll('#modeGroup .option-pill').forEach(p => p.classList.remove('selected'));
      voicePill.classList.add('selected');
    }
  }

  // ── Resume tabs ──
  document.querySelectorAll('.resume-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeResumeTab = tab.dataset.tab;
      document.querySelectorAll('.resume-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.resume-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel${activeResumeTab === 'pdf' ? 'PDF' : 'Text'}`).classList.add('active');
    });
  });

  // ── Resume toggle ──
  if (useResumeToggle) {
    useResumeToggle.addEventListener('change', () => { useResume = useResumeToggle.checked; });
  }

  // ── PDF upload ──
  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function showUploadError(msg) {
    uploadErrorMsg.textContent = msg;
    uploadError.classList.add('show');
    uploadSelected.classList.remove('show');
    selectedPDFFile = null;
  }

  function clearUploadError() { uploadError.classList.remove('show'); }

  function handleFileSelected(file) {
    clearUploadError();
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showUploadError('Invalid file type. Please upload a PDF file (.pdf).');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showUploadError(`File too large (${formatFileSize(file.size)}). Maximum allowed size is 4 MB.`);
      return;
    }
    selectedPDFFile = file;
    uploadFileName.textContent = file.name;
    uploadFileSize.textContent = formatFileSize(file.size);
    uploadSelected.classList.add('show');
    clearError();
  }

  if (uploadInput) {
    uploadInput.addEventListener('change', (e) => handleFileSelected(e.target.files[0]));
  }

  if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      handleFileSelected(e.dataTransfer.files[0]);
    });
  }

  if (uploadRemoveBtn) {
    uploadRemoveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedPDFFile = null;
      uploadSelected.classList.remove('show');
      if (uploadInput) uploadInput.value = '';
      clearUploadError();
    });
  }

  // ── Load saved resume text ──
  async function loadResume() {
    try {
      const res = await fetch(`${API}/user/resume`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.data?.resumeData && resumeTextarea) {
        resumeTextarea.value = data.data.resumeData;
      }
    } catch (_) { /* silently ignore */ }
  }

  // ── Save resume text ──
  if (saveResumeBtn) {
    saveResumeBtn.addEventListener('click', async () => {
      saveResumeBtn.disabled = true;
      resumeStatus.textContent = '';
      try {
        const res = await fetch(`${API}/user/resume`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({ resumeData: resumeTextarea.value }),
        });
        if (!res.ok) throw new Error('Save failed');
        resumeStatus.textContent = '✓ Saved';
        setTimeout(() => { resumeStatus.textContent = ''; }, 2500);
      } catch (_) {
        resumeStatus.textContent = '✗ Failed';
        resumeStatus.style.color = 'var(--danger)';
      } finally {
        saveResumeBtn.disabled = false;
      }
    });
  }

  // ── Start interview ──
  startBtn.addEventListener('click', async () => {
    clearError();
    const isResumeMode = RESUME_REQUIRED_TYPES.includes(interviewType);

    // Validate topics
    if (!['HR', 'Resume Based'].includes(interviewType) && selectedTopics.size === 0) {
      showError('Please select at least one topic.');
      return;
    }

    // Validate resume for required modes
    if (isResumeMode && activeResumeTab === 'pdf' && !selectedPDFFile) {
      showError('Please upload your resume PDF to start a Resume-Based interview.');
      return;
    }
    if (isResumeMode && activeResumeTab === 'text' && !resumeTextarea?.value.trim()) {
      showError('Please paste your resume information to start a Resume-Based interview.');
      return;
    }

    startBtn.disabled = true;
    startBtn.innerHTML = '<span class="spinner"></span> Creating Interview...';

    try {
      let res;

      if (isResumeMode && activeResumeTab === 'pdf' && selectedPDFFile) {
        // multipart/form-data for PDF upload
        const formData = new FormData();
        formData.append('resume', selectedPDFFile);
        formData.append('interviewType', interviewType);
        formData.append('mode', interviewMode);
        formData.append('selectedTopics', JSON.stringify([...selectedTopics]));
        formData.append('difficulty', difficulty);
        formData.append('questionLimit', String(UNLIMITED));
        formData.append('useResume', 'true');

        res = await fetch(`${API}/interviews`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData,
        });
      } else {
        // Auto-save text resume if provided in resume mode
        if (isResumeMode && activeResumeTab === 'text' && resumeTextarea?.value.trim()) {
          try {
            await fetch(`${API}/user/resume`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
              body: JSON.stringify({ resumeData: resumeTextarea.value }),
            });
          } catch (_) { /* non-critical */ }
        }

        res = await fetch(`${API}/interviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify({
            interviewType,
            mode: interviewMode,
            selectedTopics: [...selectedTopics],
            difficulty,
            questionLimit: UNLIMITED,
            useResume: useResume || isResumeMode,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create interview session');

      const sessionId = data.data?.sessionId;
      if (!sessionId) throw new Error('No session ID returned');

      window.location.href = `mock-interview-session.html?session=${sessionId}`;
    } catch (err) {
      showError(err.message || 'Something went wrong. Please try again.');
      startBtn.disabled = false;
      startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Interview';
    }
  });

  // ── Pre-select interview type from URL param ──
  function applyModeFromURL() {
    if (!modeParam) return;
    const mappedMode = MODE_MAP[modeParam] || modeParam;
    const typeGroup = document.getElementById('typeGroup');
    if (!typeGroup) return;
    const pill = typeGroup.querySelector(`[data-value="${mappedMode}"]`);
    if (pill) {
      typeGroup.querySelectorAll('.option-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      interviewType = mappedMode;
      updateLayout();
    }
  }

  // ── Init ──
  renderTopics();
  loadResume();
  applyModeFromURL();
  updateLayout();
})();
