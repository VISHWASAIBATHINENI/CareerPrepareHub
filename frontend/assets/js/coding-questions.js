const companyFilter = document.getElementById('companyFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const searchInput = document.getElementById('searchInput');
const questionsContainer = document.getElementById('questionsContainer');
const resultsMeta = document.getElementById('resultsMeta');
const premiumModal = document.getElementById('premiumModal');
const premiumCloseBtn = document.getElementById('premiumCloseBtn');
const payNowBtn = document.getElementById('payNowBtn');
const API_BASE_URL = 'http://localhost:5000/api';

let allQuestions = [];
let activeRequestId = 0;

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function isPremiumUser() {
  const user = getCurrentUser();
  return Boolean(user && user.isPaid);
}

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function badgeClass(difficulty) {
  const normalized = normalizeText(difficulty);
  if (normalized === 'easy') return 'easy';
  if (normalized === 'medium') return 'medium';
  return 'hard';
}

function getSampleIO(question) {
  return {
    input: question.sampleInput || 'Sample input not provided.',
    output: question.sampleOutput || 'Sample output not provided.',
  };
}

function getHints(question) {
  return Array.isArray(question.hints) ? question.hints : [];
}

function openPremiumModal() {
  if (!premiumModal) return;

  if (isPremiumUser() && payNowBtn) {
    payNowBtn.disabled = true;
    payNowBtn.textContent = 'You are already Premium';
  } else if (payNowBtn) {
    payNowBtn.disabled = false;
    payNowBtn.textContent = 'Pay Now';
  }

  premiumModal.classList.add('active');
  premiumModal.setAttribute('aria-hidden', 'false');
}

function closePremiumModal() {
  if (!premiumModal) return;
  premiumModal.classList.remove('active');
  premiumModal.setAttribute('aria-hidden', 'true');
}

function wirePremiumModalEvents() {
  if (premiumCloseBtn) {
    premiumCloseBtn.addEventListener('click', closePremiumModal);
  }

  if (premiumModal) {
    premiumModal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.dataset.closePremium === 'true') {
        closePremiumModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && premiumModal?.classList.contains('active')) {
      closePremiumModal();
    }
  });

  if (payNowBtn) {
    payNowBtn.addEventListener('click', () => {
      if (payNowBtn.disabled) return;
      payNowBtn.textContent = 'Payment integration coming soon';
      payNowBtn.disabled = true;
    });
  }
}

function populateCompanyFilter(questions) {
  const selected = companyFilter.value || 'all';
  const companies = [...new Set(questions.map((q) => q.company).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  companyFilter.innerHTML = '<option value="all">All Companies</option>';

  companies.forEach((company) => {
    const option = document.createElement('option');
    option.value = company;
    option.textContent = company;
    companyFilter.appendChild(option);
  });

  if (selected !== 'all' && companies.includes(selected)) {
    companyFilter.value = selected;
  }
}

function buildQueryString() {
  const selectedCompany = companyFilter.value;
  const selectedDifficulty = normalizeText(difficultyFilter.value);
  const keyword = normalizeText(searchInput.value);
  const params = new URLSearchParams();

  if (selectedCompany && selectedCompany !== 'all') {
    params.set('company', selectedCompany);
  }

  if (selectedDifficulty && selectedDifficulty !== 'all') {
    params.set('difficulty', selectedDifficulty);
  }

  if (keyword) {
    params.set('search', keyword);
  }

  return params;
}

async function fetchCodingPages(baseParams) {
  let page = 1;
  let totalPages = 1;
  const records = [];

  while (page <= totalPages) {
    const params = new URLSearchParams(baseParams);
    params.set('page', String(page));
    params.set('limit', '100');

    const response = await fetch(`${API_BASE_URL}/coding?${params.toString()}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load coding questions (${response.status})`);
    }

    const payload = await response.json();
    const pageQuestions = Array.isArray(payload?.data) ? payload.data : [];
    records.push(...pageQuestions);

    totalPages = Number(payload?.meta?.pagination?.totalPages || 1);
    page += 1;
  }

  return records;
}

async function applyFilters() {
  const requestId = ++activeRequestId;

  try {
    resultsMeta.textContent = 'Loading questions...';
    const params = buildQueryString();
    const apiQuestions = await fetchCodingPages(params);

    if (requestId !== activeRequestId) return;

    allQuestions = apiQuestions.map((question) => ({
      ...question,
      company: question.company || 'General',
      topic: question.topic || 'General',
      difficulty: normalizeText(question.difficulty),
    }));

    renderQuestions(allQuestions);
  } catch (error) {
    console.error(error);
    resultsMeta.textContent = 'Unable to load questions right now.';
    questionsContainer.innerHTML =
      '<div class="empty-state">Could not fetch coding questions from API. Please verify backend server and database.</div>';
  }
}

function renderQuestions(questions) {
  const premiumActive = isPremiumUser();
  const difficultyOrder = ['easy', 'medium', 'hard'];
  const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

  questionsContainer.innerHTML = '';
  resultsMeta.textContent = `${questions.length} question${questions.length !== 1 ? 's' : ''} found`;

  if (!questions.length) {
    questionsContainer.innerHTML = '<div class="empty-state">No questions match your filters.</div>';
    return;
  }

  const companyMap = new Map();

  questions.forEach((question) => {
    if (!companyMap.has(question.company)) {
      companyMap.set(question.company, {
        easy: [],
        medium: [],
        hard: [],
      });
    }

    const key = normalizeText(question.difficulty);
    if (companyMap.get(question.company)[key]) {
      companyMap.get(question.company)[key].push(question);
    }
  });

  const sortedCompanies = [...companyMap.keys()].sort((a, b) => a.localeCompare(b));

  sortedCompanies.forEach((company) => {
    const sections = companyMap.get(company);
    const companyBlock = document.createElement('article');
    companyBlock.className = 'company-group';

    const difficultiesHTML = difficultyOrder
      .map((difficulty) => {
        const questionList = sections[difficulty];
        if (!questionList.length) return '';

        const cardsHTML = questionList
          .map((q, index) => {
            const isHard = normalizeText(q.difficulty) === 'hard';
            const isLocked = isHard && !premiumActive;
            const sample = getSampleIO(q);
            const hints = getHints(q);
            const cardId = `${normalizeText(q.company).replace(/[^a-z0-9]/g, '-')}-${normalizeText(
              q.difficulty
            )}-${index}`;

            if (isLocked) {
              return `
            <article class="question-card locked-question-card">
              <div class="question-head">
                <span class="company-chip">${escapeHTML(q.company)}</span>
                <span class="difficulty-badge hard">${escapeHTML(q.difficulty)}</span>
              </div>

              <div class="locked-content-wrap">
                <h3 class="question-title">Hard Question 🔒</h3>
                <p class="question-description"><strong>Topic:</strong> ${escapeHTML(q.topic || 'General')}</p>
                <p class="locked-message">This is a premium question. Upgrade to unlock.</p>

                <div class="locked-preview" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <div class="action-row">
                <button class="upgrade-btn" type="button">Upgrade to Premium</button>
              </div>
            </article>
          `;
            }

            const hintsButtonHTML = hints.length
              ? `<button class="hint-btn" type="button" data-target="hints-${cardId}">Show Hints</button>`
              : '';

            const premiumBadgeHTML = isHard && premiumActive
              ? '<span class="premium-badge"><i class="fa-solid fa-crown"></i> Premium</span>'
              : '';

            const hintsPanelHTML = hints.length
              ? `
                <div class="hints-panel hidden" id="hints-${cardId}">
                  <h5>Hints</h5>
                  <ul>
                    ${hints.map((hint) => `<li>${escapeHTML(hint)}</li>`).join('')}
                  </ul>
                </div>
              `
              : '';

            return `
            <article class="question-card">
              <div class="question-head">
                <span class="company-chip">${escapeHTML(q.company)}</span>
                <div class="badge-stack">
                  <span class="difficulty-badge ${badgeClass(q.difficulty)}">${escapeHTML(q.difficulty)}</span>
                  ${premiumBadgeHTML}
                </div>
              </div>
              <h3 class="question-title">${escapeHTML(q.title)}</h3>
              <p class="question-description"><strong>Topic:</strong> ${escapeHTML(q.topic || 'General')}</p>
              <p class="question-description">${escapeHTML(q.description)}</p>
              <div class="detail-block">
                <h5>Sample Input</h5>
                <p>${escapeHTML(sample.input)}</p>
              </div>
              <div class="detail-block">
                <h5>Sample Output</h5>
                <p>${escapeHTML(sample.output)}</p>
              </div>
              <div class="full-question hidden" id="full-${cardId}">
                <p>${escapeHTML(q.description)}</p>
                ${q.constraints ? `<div class="detail-block"><h5>Constraints</h5><p>${escapeHTML(q.constraints)}</p></div>` : ''}
                ${q.explanation ? `<div class="detail-block"><h5>Explanation</h5><p>${escapeHTML(q.explanation)}</p></div>` : ''}
              </div>
              ${hintsPanelHTML}
              <div class="action-row">
                <button class="expand-btn" type="button" data-target="full-${cardId}">Expand Full Question</button>
                ${hintsButtonHTML}
              </div>
            </article>
          `;
          })
          .join('');

        return `
          <section class="difficulty-section">
            <h4 class="difficulty-heading">${difficultyLabel[difficulty] || difficulty}</h4>
            <div class="cards-grid">${cardsHTML}</div>
          </section>
        `;
      })
      .join('');

    companyBlock.innerHTML = `
      <h2 class="company-title">${escapeHTML(company)}</h2>
      ${difficultiesHTML}
    `;

    questionsContainer.appendChild(companyBlock);
  });

  attachCardHandlers();
}

function attachCardHandlers() {
  const expandButtons = questionsContainer.querySelectorAll('.expand-btn');
  expandButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const detail = targetId ? document.getElementById(targetId) : null;
      if (!detail) return;

      detail.classList.toggle('hidden');
      button.textContent = detail.classList.contains('hidden')
        ? 'Expand Full Question'
        : 'Hide Full Question';
    });
  });

  const hintButtons = questionsContainer.querySelectorAll('.hint-btn');
  hintButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const panel = targetId ? document.getElementById(targetId) : null;
      if (!panel) return;

      panel.classList.toggle('hidden');
      button.textContent = panel.classList.contains('hidden') ? 'Show Hints' : 'Hide Hints';
    });
  });

  const upgradeButtons = questionsContainer.querySelectorAll('.upgrade-btn');
  upgradeButtons.forEach((button) => {
    if (isPremiumUser()) {
      button.disabled = true;
      button.textContent = 'Premium Enabled';
      return;
    }

    button.addEventListener('click', openPremiumModal);
  });
}

async function initCodingQuestions() {
  try {
    const companySeedQuestions = await fetchCodingPages(new URLSearchParams());
    const normalized = companySeedQuestions.map((question) => ({
      ...question,
      company: question.company || 'General',
    }));
    populateCompanyFilter(normalized);
    await applyFilters();
  } catch (error) {
    console.error(error);
    resultsMeta.textContent = 'Unable to load questions right now.';
    questionsContainer.innerHTML =
      '<div class="empty-state">Could not fetch coding questions from API. Please verify backend server and database.</div>';
  }
}

companyFilter.addEventListener('change', applyFilters);
difficultyFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

wirePremiumModalEvents();
initCodingQuestions();
