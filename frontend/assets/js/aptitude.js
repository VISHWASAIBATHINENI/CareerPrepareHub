document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  const els = {
    topicFilter: document.getElementById('aptitudeTopicFilter'),
    progress: document.getElementById('aptitudeProgress'),
    questionNumber: document.getElementById('aptitudeQuestionNumber'),
    difficulty: document.getElementById('aptitudeDifficulty'),
    questionText: document.getElementById('aptitudeQuestionText'),
    optionsWrap: document.getElementById('aptitudeOptions'),
    submitAnswerBtn: document.getElementById('submitAnswerBtn'),
    submitFeedback: document.getElementById('submitFeedback'),
    showAnswerBtn: document.getElementById('showAnswerBtn'),
    answerPanel: document.getElementById('answerPanel'),
    correctAnswerText: document.getElementById('correctAnswerText'),
    explanationText: document.getElementById('explanationText'),
    prevBtn: document.getElementById('prevQuestionBtn'),
    nextBtn: document.getElementById('nextQuestionBtn'),
    statusMessage: document.getElementById('aptitudeStatusMessage'),
    modal: document.getElementById('answerConfirmModal'),
    modalYes: document.getElementById('confirmShowAnswerBtn'),
    modalNo: document.getElementById('cancelShowAnswerBtn')
  };

  const state = {
    allQuestions: [],
    filteredQuestions: [],
    currentIndex: 0,
    selectedAnswersById: {},
    revealedById: {},
    activeTopic: 'all'
  };

  const getQuestionId = (question) => question.__id;

  const normalizeTopicLabel = (topicKey) =>
    topicKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const getQuestionTopic = (question) =>
    question.topic || question.Topic || question.__topicKey || 'General';

  const flattenTopicDataset = (dataset) => {
    if (Array.isArray(dataset)) return dataset;
    if (!dataset || typeof dataset !== 'object') return [];

    return Object.entries(dataset).flatMap(([topicKey, questions]) => {
      if (!Array.isArray(questions)) return [];
      return questions.map((question) => ({
        ...question,
        topic: question.topic || normalizeTopicLabel(topicKey),
        topicKey: question.topicKey || topicKey
      }));
    });
  };

  const setStatus = (message = '') => {
    els.statusMessage.textContent = message;
    els.statusMessage.classList.toggle('hidden', !message);
  };

  const clearSubmitFeedback = () => {
    els.submitFeedback.textContent = '';
    els.submitFeedback.className = 'submit-feedback hidden';
  };

  const setSubmitFeedback = (message, type = 'info') => {
    els.submitFeedback.textContent = message;
    els.submitFeedback.className = `submit-feedback ${type}`;
  };

  const closeAnswerModal = () => els.modal.classList.add('hidden');
  const openAnswerModal = () => els.modal.classList.remove('hidden');

  const updateNavigationControls = () => {
    const total = state.filteredQuestions.length;
    els.prevBtn.disabled = state.currentIndex <= 0;
    els.nextBtn.disabled = state.currentIndex >= total - 1;
  };

  const updateProgress = () => {
    const total = state.filteredQuestions.length;
    const current = total ? state.currentIndex + 1 : 0;
    els.progress.textContent = `${current} / ${total}`;
  };

  const buildOptionButton = (optionText, optionIndex, question) => {
    const questionId = getQuestionId(question);
    const selectedAnswer = state.selectedAnswersById[questionId];
    const isRevealed = !!state.revealedById[questionId];
    const isSelected = selectedAnswer === optionText;
    const isCorrect = question.answer === optionText;

    const optionBtn = document.createElement('button');
    optionBtn.type = 'button';
    optionBtn.className = 'option-btn';
    optionBtn.setAttribute('role', 'radio');
    optionBtn.setAttribute('aria-checked', String(isSelected));
    optionBtn.textContent = `${String.fromCharCode(65 + optionIndex)}. ${optionText}`;

    if (isSelected) optionBtn.classList.add('selected');
    if (isRevealed) {
      if (isCorrect) optionBtn.classList.add('correct');
      if (isSelected && !isCorrect) optionBtn.classList.add('wrong');
    }

    optionBtn.addEventListener('click', () => {
      state.selectedAnswersById[questionId] = optionText;
      renderQuestion();
    });

    return optionBtn;
  };

  const revealAnswerForCurrent = () => {
    const question = state.filteredQuestions[state.currentIndex];
    if (!question) return;

    const questionId = getQuestionId(question);
    state.revealedById[questionId] = true;
    renderQuestion();
    closeAnswerModal();
  };

  const renderQuestion = () => {
    const question = state.filteredQuestions[state.currentIndex];
    const total = state.filteredQuestions.length;

    if (!question || total === 0) {
      els.questionNumber.textContent = 'Q0';
      els.questionText.textContent = 'No questions found for this topic.';
      els.optionsWrap.innerHTML = '';
      els.answerPanel.classList.add('hidden');
      clearSubmitFeedback();
      els.submitAnswerBtn.disabled = true;
      els.showAnswerBtn.disabled = true;
      els.prevBtn.disabled = true;
      els.nextBtn.disabled = true;
      els.difficulty.classList.add('hidden');
      updateProgress();
      return;
    }

    const questionId = getQuestionId(question);
    const isRevealed = !!state.revealedById[questionId];
    const topic = getQuestionTopic(question);
    const selectedAnswer = state.selectedAnswersById[questionId];

    els.questionNumber.textContent = `Q${state.currentIndex + 1}`;
    els.questionText.textContent = question.question;

    if (question.difficulty) {
      els.difficulty.textContent = question.difficulty;
      els.difficulty.classList.remove('hidden');
    } else {
      els.difficulty.classList.add('hidden');
    }

    els.optionsWrap.innerHTML = '';
    (question.options || []).forEach((option, optionIndex) => {
      els.optionsWrap.appendChild(buildOptionButton(option, optionIndex, question));
    });

    els.correctAnswerText.textContent = `${question.answer} (${topic})`;
    els.explanationText.textContent = question.explanation || 'No explanation available.';

    els.answerPanel.classList.toggle('hidden', !isRevealed);
    els.answerPanel.classList.toggle('show', isRevealed);
    els.submitAnswerBtn.disabled = !selectedAnswer;
    els.showAnswerBtn.disabled = isRevealed;
    els.showAnswerBtn.textContent = isRevealed ? 'Answer Shown' : 'Show Answer';
    clearSubmitFeedback();

    updateNavigationControls();
    updateProgress();
  };

  const applyTopicFilter = () => {
    state.filteredQuestions = state.activeTopic === 'all'
      ? [...state.allQuestions]
      : state.allQuestions.filter((question) => question.__topicKey === state.activeTopic);

    state.currentIndex = 0;
    renderQuestion();
  };

  const populateTopicFilter = (topicKeys) => {
    const options = ['<option value="all">All Topics</option>'];
    topicKeys.forEach((topicKey) => {
      options.push(`<option value="${topicKey}">${normalizeTopicLabel(topicKey)}</option>`);
    });
    els.topicFilter.innerHTML = options.join('');
  };

  const loadAptitudeQuestions = async () => {
    try {
      setStatus('');
      let page = 1;
      let totalPages = 1;
      const apiQuestions = [];

      while (page <= totalPages) {
        const response = await fetch(`${API_BASE_URL}/aptitude?page=${page}&limit=100`);
        if (!response.ok) throw new Error(`Could not load dataset (HTTP ${response.status})`);

        const payload = await response.json();
        const pageQuestions = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        apiQuestions.push(...pageQuestions);
        totalPages = Number(payload?.meta?.pagination?.totalPages || 1);
        page += 1;
      }

      const questionSource = apiQuestions;

      state.allQuestions = questionSource.map((question, index) => {
        const topicKey = (question.topicKey || question.topic || 'general').toLowerCase().replace(/\s+/g, '_');
        return {
          ...question,
          __topicKey: topicKey,
          __id: question._id || `${topicKey}-${index}`
        };
      });

      const topicKeys = [...new Set(state.allQuestions.map((question) => question.__topicKey))];

      if (!state.allQuestions.length) setStatus('No aptitude questions available in backend.');
      populateTopicFilter(topicKeys);
      applyTopicFilter();
    } catch (error) {
      setStatus(`Unable to load aptitude questions. ${error.message}`);
    }
  };

  els.topicFilter.addEventListener('change', (event) => {
    state.activeTopic = event.target.value;
    applyTopicFilter();
  });

  els.prevBtn.addEventListener('click', () => {
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      renderQuestion();
    }
  });

  els.nextBtn.addEventListener('click', () => {
    if (state.currentIndex < state.filteredQuestions.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
    }
  });

  els.showAnswerBtn.addEventListener('click', () => {
    const question = state.filteredQuestions[state.currentIndex];
    if (!question) return;

    const questionId = getQuestionId(question);
    if (state.revealedById[questionId]) return;
    openAnswerModal();
  });

  els.submitAnswerBtn.addEventListener('click', () => {
    const question = state.filteredQuestions[state.currentIndex];
    if (!question) return;

    const questionId = getQuestionId(question);
    const selectedAnswer = state.selectedAnswersById[questionId];
    if (!selectedAnswer) {
      setSubmitFeedback('Please select an option before submitting.', 'info');
      return;
    }

    if (selectedAnswer === question.answer) {
      setSubmitFeedback('✅ Correct answer! Great job.', 'correct');
    } else {
      setSubmitFeedback('❌ Incorrect answer. Try once more or click Show Answer.', 'wrong');
    }
  });

  els.modalYes.addEventListener('click', revealAnswerForCurrent);
  els.modalNo.addEventListener('click', closeAnswerModal);
  els.modal.addEventListener('click', (event) => {
    if (event.target === els.modal) closeAnswerModal();
  });

  loadAptitudeQuestions();
});