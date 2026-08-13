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
    navBadge.textContent = ((user.firstname || user.email || 'U')[0]).toUpperCase();
    navBadge.classList.remove('hidden');
  }

  // ── Get session ID from URL ──
  const params    = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');
  if (!sessionId) {
    window.location.href = 'mock-interview.html';
    return;
  }

  // ── DOM refs ──
  const loadingEl           = document.getElementById('loadingState');
  const layoutEl            = document.getElementById('interviewLayout');
  const errorBanner         = document.getElementById('errorBanner');
  const messagesArea        = document.getElementById('messagesArea');
  const answerInput         = document.getElementById('answerInput');
  const submitBtn           = document.getElementById('submitAnswerBtn');
  const endBtn              = document.getElementById('endInterviewBtn');
  const qCounter            = document.getElementById('qCounter');
  const sideProgress        = document.getElementById('sideProgress');
  const sideTimer           = document.getElementById('sideTimer');
  const sideType            = document.getElementById('sideType');
  const sideDiff            = document.getElementById('sideDiff');
  const sideMode            = document.getElementById('sideMode');
  const chatModeBadge       = document.getElementById('chatModeBadge');
  const sideTopics          = document.getElementById('sideTopics');
  const answerArea          = document.getElementById('answerArea');
  const textAnswerContainer = document.getElementById('textAnswerContainer');
  const voiceAnswerContainer= document.getElementById('voiceAnswerContainer');
  const completeBanner      = document.getElementById('completeBanner');
  const viewReportBtn       = document.getElementById('viewReportBtn');
  const charCount           = document.getElementById('charCount');

  // Voice Mode DOM refs
  const micRecordBtn        = document.getElementById('micRecordBtn');
  const micIcon             = document.getElementById('micIcon');
  const micStatusText       = document.getElementById('micStatusText');
  const recordingTimer      = document.getElementById('recordingTimer');
  const transcriptBox       = document.getElementById('transcriptBox');
  const voiceTranscriptTextarea = document.getElementById('voiceTranscriptTextarea');
  const submitVoiceAnswerBtn= document.getElementById('submitVoiceAnswerBtn');
  const reRecordBtn         = document.getElementById('reRecordBtn');
  const focusTranscriptBtn  = document.getElementById('focusTranscriptBtn');
  const voiceErrorBanner    = document.getElementById('voiceErrorBanner');
  const voiceErrorTitle     = document.getElementById('voiceErrorTitle');
  const voiceErrorMsg       = document.getElementById('voiceErrorMsg');
  const retryMicBtn         = document.getElementById('retryMicBtn');
  const switchToTextBtn     = document.getElementById('switchToTextBtn');

  // ── State ──
  let session             = null;
  let submitting          = false;
  let timerInterval       = null;
  let startTime           = Date.now();
  let activeMode          = 'text'; // 'text' | 'voice'

  // Voice & Speech Recognition State
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition         = null;
  let isRecording         = false;
  let recordSeconds       = 0;
  let recordTimerInterval = null;
  let currentTranscript   = '';

  function showError(msg) {
    errorBanner.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
    errorBanner.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function clearError() { errorBanner.classList.remove('show'); }

  // ── Timer ──
  function startTimer() {
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      sideTimer.textContent = `${m}:${s}`;
    }, 1000);
  }

  // ── Text-To-Speech (TTS) for AI Questions ──
  function speakQuestion(text, btnEl) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (btnEl) btnEl.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (btnEl) btnEl.innerHTML = '<i class="fa-solid fa-square"></i> Stop';

    utterance.onend = () => {
      if (btnEl) btnEl.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
    };
    utterance.onerror = () => {
      if (btnEl) btnEl.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
    };

    window.speechSynthesis.speak(utterance);
  }

  // ── Render a message bubble ──
  function appendMessage(role, content) {
    const isAI = role === 'interviewer';
    const div = document.createElement('div');
    div.className = `msg ${isAI ? 'ai' : 'user'}`;
    
    let ttsBtnHtml = '';
    if (isAI) {
      ttsBtnHtml = `
        <button class="tts-play-btn" type="button" aria-label="Listen to question">
          <i class="fa-solid fa-volume-high"></i> Listen
        </button>
      `;
    }

    div.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <span class="msg-label">${isAI ? '🤖 Interviewer' : 'You'}</span>
        ${ttsBtnHtml}
      </div>
      <div class="msg-bubble">${escapeHtml(content)}</div>
    `;

    const ttsBtn = div.querySelector('.tts-play-btn');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => speakQuestion(content, ttsBtn));
    }

    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return div;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  // ── Show typing indicator ──
  function showTyping() {
    const div = document.createElement('div');
    div.className = 'msg ai';
    div.id = 'typingIndicator';
    div.innerHTML = `
      <span class="msg-label">🤖 Interviewer</span>
      <div class="msg-bubble typing-indicator">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>`;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  // ── Update sidebar and counter ──
  function updateSidebar(questionNumber, questionLimit) {
    sideProgress.textContent = `${questionNumber}/${questionLimit}`;
    qCounter.textContent = `Question ${questionNumber} of ${questionLimit}`;
  }

  // ── Mode UI Setup ──
  function setupModeUI(mode) {
    activeMode = mode || 'text';
    if (activeMode === 'voice') {
      if (sideMode) sideMode.textContent = '🎙️ Voice';
      if (chatModeBadge) {
        chatModeBadge.className = 'badge';
        chatModeBadge.style.background = 'rgba(239,68,68,0.1)';
        chatModeBadge.style.color = '#dc2626';
        chatModeBadge.style.border = '1px solid rgba(220,38,38,0.2)';
        chatModeBadge.innerHTML = '<i class="fa-solid fa-microphone"></i> Voice Mode';
      }
      textAnswerContainer.classList.add('hidden');
      voiceAnswerContainer.classList.remove('hidden');
      initSpeechRecognition();
    } else {
      if (sideMode) sideMode.textContent = '⌨️ Text';
      if (chatModeBadge) {
        chatModeBadge.className = 'badge';
        chatModeBadge.style.background = '';
        chatModeBadge.style.color = '';
        chatModeBadge.style.border = '';
        chatModeBadge.innerHTML = '<i class="fa-solid fa-keyboard"></i> Text Mode';
      }
      textAnswerContainer.classList.remove('hidden');
      voiceAnswerContainer.classList.add('hidden');
    }
  }

  // ── Voice Speech-to-Text Pipeline ──
  function initSpeechRecognition() {
    if (!SpeechRecognition) {
      showVoiceError(
        'Speech Recognition Unavailable',
        'Your browser does not support native speech recognition. You can switch to Text Interview mode to continue.'
      );
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isRecording = true;
        updateMicUI('recording');
        startRecordTimer();
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          currentTranscript += finalTranscript;
        }

        if (transcriptBox) transcriptBox.classList.remove('hidden');
        if (voiceTranscriptTextarea) {
          voiceTranscriptTextarea.value = (currentTranscript + interimTranscript).trim();
        }
      };

      recognition.onerror = (event) => {
        stopRecording();
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showVoiceError(
            'Microphone Access Denied',
            'Microphone permission was denied. Please allow microphone access in your browser or switch to Text Mode.'
          );
        } else if (event.error === 'no-speech') {
          updateMicUI('idle');
          if (micStatusText) micStatusText.textContent = 'No speech detected. Click the microphone to try again.';
        } else {
          showVoiceError(
            'Speech Error',
            `Speech recognition encountered an error (${event.error}). You can retry or switch to Text Mode.`
          );
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          stopRecording();
        }
      };
    } catch (err) {
      showVoiceError('Voice Mode Error', err.message);
    }
  }

  function startRecording() {
    clearVoiceError();
    if (!recognition) {
      initSpeechRecognition();
      if (!recognition) return;
    }
    currentTranscript = '';
    if (voiceTranscriptTextarea) voiceTranscriptTextarea.value = '';
    
    try {
      recognition.start();
    } catch (e) {
      recognition.stop();
      setTimeout(() => recognition.start(), 200);
    }
  }

  function stopRecording() {
    isRecording = false;
    if (recordTimerInterval) clearInterval(recordTimerInterval);
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    updateMicUI('ready');
  }

  function startRecordTimer() {
    recordSeconds = 0;
    if (recordingTimer) {
      recordingTimer.classList.remove('hidden');
      recordingTimer.textContent = 'Recording... 00:00';
    }
    if (recordTimerInterval) clearInterval(recordTimerInterval);
    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      const m = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
      const s = String(recordSeconds % 60).padStart(2, '0');
      if (recordingTimer) recordingTimer.textContent = `Recording... ${m}:${s}`;
    }, 1000);
  }

  function updateMicUI(state) {
    if (state === 'recording') {
      if (micRecordBtn) micRecordBtn.className = 'mic-btn-large recording';
      if (micIcon) micIcon.className = 'fa-solid fa-square';
      if (micStatusText) micStatusText.textContent = 'Recording... Speak clearly into your microphone';
    } else if (state === 'ready') {
      if (micRecordBtn) micRecordBtn.className = 'mic-btn-large';
      if (micIcon) micIcon.className = 'fa-solid fa-microphone';
      if (micStatusText) micStatusText.textContent = 'Transcript ready! You can review or edit below before submitting.';
      if (recordingTimer) recordingTimer.classList.add('hidden');
      if (transcriptBox) transcriptBox.classList.remove('hidden');
    } else { // idle
      if (micRecordBtn) micRecordBtn.className = 'mic-btn-large';
      if (micIcon) micIcon.className = 'fa-solid fa-microphone';
      if (micStatusText) micStatusText.textContent = 'Click the microphone to start speaking';
      if (recordingTimer) recordingTimer.classList.add('hidden');
    }
  }

  function showVoiceError(title, msg) {
    if (voiceErrorTitle) voiceErrorTitle.textContent = title;
    if (voiceErrorMsg) voiceErrorMsg.textContent = msg;
    if (voiceErrorBanner) voiceErrorBanner.style.display = 'block';
  }

  function clearVoiceError() {
    if (voiceErrorBanner) voiceErrorBanner.style.display = 'none';
  }

  // Voice Event Listeners
  if (micRecordBtn) {
    micRecordBtn.addEventListener('click', () => {
      if (isRecording) stopRecording();
      else startRecording();
    });
  }

  if (reRecordBtn) {
    reRecordBtn.addEventListener('click', () => {
      stopRecording();
      startRecording();
    });
  }

  if (focusTranscriptBtn) {
    focusTranscriptBtn.addEventListener('click', () => {
      if (voiceTranscriptTextarea) voiceTranscriptTextarea.focus();
    });
  }

  if (retryMicBtn) {
    retryMicBtn.addEventListener('click', () => {
      clearVoiceError();
      startRecording();
    });
  }

  if (switchToTextBtn) {
    switchToTextBtn.addEventListener('click', () => {
      clearVoiceError();
      setupModeUI('text');
    });
  }

  if (submitVoiceAnswerBtn) {
    submitVoiceAnswerBtn.addEventListener('click', () => {
      const val = voiceTranscriptTextarea ? voiceTranscriptTextarea.value.trim() : '';
      if (!val) {
        showError('Please record or edit your spoken answer before submitting.');
        return;
      }
      answerInput.value = val;
      submitBtn.click();

      // Reset voice UI after submitting
      if (voiceTranscriptTextarea) voiceTranscriptTextarea.value = '';
      if (transcriptBox) transcriptBox.classList.add('hidden');
      updateMicUI('idle');
    });
  }

  // ── Load existing session ──
  async function loadSession() {
    try {
      const res = await fetch(`${API}/interviews/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Session not found');

      session = data.data;

      // Populate sidebar
      sideType.textContent = session.interviewType;
      sideDiff.textContent = session.difficulty;
      sideTopics.innerHTML = (session.selectedTopics || [])
        .map(t => `<span class="topic-pill-sm">${t}</span>`).join('');

      updateSidebar(session.currentQuestionNumber, session.questionLimit);

      // Setup mode (text vs voice)
      setupModeUI(session.mode);

      // If session is already completed, redirect to report
      if (session.status === 'completed') {
        window.location.href = `mock-interview-report.html?session=${sessionId}`;
        return;
      }

      // Render all existing messages
      (session.messages || []).forEach(m => appendMessage(m.role, m.content));

      // Set timer start based on session start time
      if (session.startedAt) {
        startTime = new Date(session.startedAt).getTime();
      }

      loadingEl.classList.add('hidden');
      layoutEl.classList.remove('hidden');
      startTimer();

      if (session.currentQuestionNumber >= session.questionLimit) {
        showCompleted();
      }
    } catch (err) {
      loadingEl.classList.add('hidden');
      showError(err.message || 'Failed to load interview session.');
    }
  }

  // ── Show completed state ──
  function showCompleted() {
    answerArea.classList.add('hidden');
    completeBanner.classList.remove('hidden');
    if (timerInterval) clearInterval(timerInterval);
    if (isRecording) stopRecording();
  }

  // ── Submit answer ──
  submitBtn.addEventListener('click', async () => {
    if (submitting) return;
    clearError();
    const answer = answerInput.value.trim();
    if (!answer) {
      if (activeMode === 'text') {
        answerInput.focus();
        answerInput.style.borderColor = 'var(--danger)';
        setTimeout(() => { answerInput.style.borderColor = ''; }, 1500);
      } else {
        showError('Please provide a spoken or typed answer before submitting.');
      }
      return;
    }

    submitting = true;
    submitBtn.disabled = true;
    if (submitVoiceAnswerBtn) submitVoiceAnswerBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
    if (submitVoiceAnswerBtn) submitVoiceAnswerBtn.innerHTML = '<span class="spinner"></span> Submitting...';

    appendMessage('candidate', answer);
    answerInput.value = '';
    charCount.textContent = '0 / 5000';
    showTyping();

    try {
      const res = await fetch(`${API}/interviews/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      hideTyping();

      if (!res.ok) throw new Error(data.message || 'Failed to get next question');

      const result = data.data;

      if (result.isInterviewComplete) {
        showCompleted();
      } else if (result.nextQuestion) {
        appendMessage('interviewer', result.nextQuestion.content);
        updateSidebar(result.currentQuestionNumber, session.questionLimit);
        session.currentQuestionNumber = result.currentQuestionNumber;
      }
    } catch (err) {
      hideTyping();
      showError(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      submitting = false;
      submitBtn.disabled = false;
      if (submitVoiceAnswerBtn) submitVoiceAnswerBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Answer';
      if (submitVoiceAnswerBtn) submitVoiceAnswerBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Answer';
    }
  });

  // ── Char counter ──
  answerInput.addEventListener('input', () => {
    const len = answerInput.value.length;
    charCount.textContent = `${len} / 5000`;
    charCount.classList.toggle('warn', len > 4500);
  });

  // ── Submit on Ctrl+Enter ──
  answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submitBtn.click();
    }
  });

  // ── End interview ──
  endBtn.addEventListener('click', async () => {
    if (!confirm('End the interview now? Your answers so far will be evaluated.')) return;
    endBtn.disabled = true;
    endBtn.innerHTML = '<span class="spinner"></span> Ending...';
    try {
      const res = await fetch(`${API}/interviews/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to end interview');
      }
      if (timerInterval) clearInterval(timerInterval);
      if (isRecording) stopRecording();
      window.location.href = `mock-interview-report.html?session=${sessionId}`;
    } catch (err) {
      showError(err.message);
      endBtn.disabled = false;
      endBtn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> End Interview';
    }
  });

  // ── View report ──
  viewReportBtn.addEventListener('click', async () => {
    viewReportBtn.disabled = true;
    viewReportBtn.innerHTML = '<span class="spinner"></span> Generating Report...';
    try {
      const res = await fetch(`${API}/interviews/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to generate report');
      }
      window.location.href = `mock-interview-report.html?session=${sessionId}`;
    } catch (err) {
      showError(err.message);
      viewReportBtn.disabled = false;
      viewReportBtn.innerHTML = '<i class="fa-solid fa-chart-line"></i> View My Report';
    }
  });

  // ── Init ──
  loadSession();
})();
