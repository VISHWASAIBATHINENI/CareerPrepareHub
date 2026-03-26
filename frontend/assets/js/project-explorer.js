const languageFilter = document.getElementById('languageFilter');
const domainFilter = document.getElementById('domainFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const searchInput = document.getElementById('searchInput');
const resultsMeta = document.getElementById('resultsMeta');
const pageMeta = document.getElementById('pageMeta');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const explorerContainer = document.getElementById('explorerContainer');
const API_BASE_URL = 'http://localhost:5000/api';

const PAGE_SIZE = 12;

let allEntries = [];
let filteredEntries = [];
let currentPage = 1;

const expandedLanguages = new Set();
const expandedDomains = new Set();

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function difficultyClass(difficulty) {
  const d = normalize(difficulty);
  if (d === 'beginner') return 'beginner';
  if (d === 'intermediate') return 'intermediate';
  return 'advanced';
}

function getRefLabel(ref) {
  const url = normalize(ref);
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'Open YouTube';
  if (url.includes('github.com')) return 'Open GitHub';
  return 'Open Reference';
}

async function loadAllData() {
  const response = await fetch(`${API_BASE_URL}/content/project-explorer`);
  if (!response.ok) throw new Error(`Failed to fetch project explorer data (${response.status})`);
  const payload = await response.json();
  const parsed = payload?.data;

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid dataset: generate_doc.json must contain an array');
  }

  return parsed;
}

function flattenData(data) {
  return data.flatMap((entry) => {
    const language = entry.language;
    const domain = entry.domain;
    const projects = Array.isArray(entry.projects) ? entry.projects : [];

    return projects.map((project, index) => ({
      id: `${language}-${domain}-${index}-${project.title}`,
      language,
      domain,
      type: project.type || 'Unknown',
      title: project.title || 'Untitled Project',
      desc: project.desc || '',
      difficulty: project.difficulty || 'Intermediate',
      concepts: project.concepts || '',
      ref: project.ref || '',
    }));
  });
}

function populateFilters(entries) {
  const languages = [...new Set(entries.map((item) => item.language))].sort((a, b) => a.localeCompare(b));
  const domains = [...new Set(entries.map((item) => item.domain))].sort((a, b) => a.localeCompare(b));

  languages.forEach((language) => {
    const opt = document.createElement('option');
    opt.value = language;
    opt.textContent = language;
    languageFilter.appendChild(opt);
  });

  domains.forEach((domain) => {
    const opt = document.createElement('option');
    opt.value = domain;
    opt.textContent = domain;
    domainFilter.appendChild(opt);
  });
}

function applyFilters() {
  const language = languageFilter.value;
  const domain = domainFilter.value;
  const difficulty = difficultyFilter.value;
  const keyword = normalize(searchInput.value);

  filteredEntries = allEntries.filter((item) => {
    const languagePass = language === 'all' || item.language === language;
    const domainPass = domain === 'all' || item.domain === domain;
    const difficultyPass = difficulty === 'all' || item.difficulty === difficulty;
    const keywordBlob = normalize(`${item.title} ${item.concepts} ${item.domain}`);
    const keywordPass = !keyword || keywordBlob.includes(keyword);

    return languagePass && domainPass && difficultyPass && keywordPass;
  });

  currentPage = 1;
  renderCurrentPage();
}

function getPagedEntries() {
  const start = (currentPage - 1) * PAGE_SIZE;
  return filteredEntries.slice(start, start + PAGE_SIZE);
}

function groupEntries(entries) {
  const grouped = new Map();

  entries.forEach((item) => {
    if (!grouped.has(item.language)) grouped.set(item.language, new Map());
    const domainsMap = grouped.get(item.language);

    if (!domainsMap.has(item.domain)) domainsMap.set(item.domain, []);
    domainsMap.get(item.domain).push(item);
  });

  return grouped;
}

function renderCurrentPage() {
  const total = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (currentPage > totalPages) currentPage = totalPages;

  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
  pageMeta.textContent = `Page ${currentPage} of ${totalPages}`;
  resultsMeta.textContent = `${total} project${total !== 1 ? 's' : ''} found`;

  const entries = getPagedEntries();
  if (!entries.length) {
    explorerContainer.innerHTML = '<div class="empty-state">No projects match your filters.</div>';
    return;
  }

  const grouped = groupEntries(entries);
  const sortedLanguages = [...grouped.keys()].sort((a, b) => a.localeCompare(b));

  explorerContainer.innerHTML = sortedLanguages
    .map((language) => {
      const domainMap = grouped.get(language);
      const languageKey = `lang::${language}`;
      const languageCollapsed = !expandedLanguages.has(languageKey);
      const sortedDomains = [...domainMap.keys()].sort((a, b) => a.localeCompare(b));

      const domainsHTML = sortedDomains
        .map((domain) => {
          const domainKey = `domain::${language}::${domain}`;
          const domainCollapsed = !expandedDomains.has(domainKey);
          const cards = domainMap.get(domain);

          const cardsHTML = cards
            .map((project) => {
              const conceptList = project.concepts
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean)
                .slice(0, 6);

              return `
              <article class="project-card">
                <h4>${escapeHTML(project.title)}</h4>
                <p>${escapeHTML(project.desc)}</p>
                <div class="meta-row">
                  <span class="badge ${difficultyClass(project.difficulty)}">${escapeHTML(project.difficulty)}</span>
                  <span class="badge type">${escapeHTML(project.type === 'Ref' ? 'Reference' : project.type)}</span>
                </div>
                <div class="concepts">
                  ${conceptList.map((c) => `<span class="concept-chip">${escapeHTML(c)}</span>`).join('')}
                </div>
                ${project.ref ? `<a class="ref-btn" href="${escapeHTML(project.ref)}" target="_blank" rel="noopener noreferrer">${getRefLabel(project.ref)}</a>` : ''}
              </article>
            `;
            })
            .join('');

          return `
          <section class="domain-block">
            <button class="domain-header ${domainCollapsed ? 'collapsed' : ''}" type="button" data-domain-key="${escapeHTML(
              domainKey
            )}">
              <span class="domain-title">${escapeHTML(domain)}</span>
              <span>${domainCollapsed ? '+' : '−'}</span>
            </button>
            <div class="domain-content">
              <div class="cards-grid">${cardsHTML}</div>
            </div>
          </section>`;
        })
        .join('');

      return `
        <section class="lang-block">
          <button class="lang-header ${languageCollapsed ? 'collapsed' : ''}" type="button" data-language-key="${escapeHTML(
            languageKey
          )}">
            <span class="lang-title">${escapeHTML(language)}</span>
            <span>${languageCollapsed ? '+' : '−'}</span>
          </button>
          <div class="lang-content">
            ${domainsHTML}
          </div>
        </section>
      `;
    })
    .join('');
}

function setupEvents() {
  languageFilter.addEventListener('change', applyFilters);
  domainFilter.addEventListener('change', applyFilters);
  difficultyFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);

  prevPageBtn.addEventListener('click', () => {
    if (currentPage <= 1) return;
    currentPage -= 1;
    renderCurrentPage();
  });

  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
    if (currentPage >= totalPages) return;
    currentPage += 1;
    renderCurrentPage();
  });

  explorerContainer.addEventListener('click', (event) => {
    const langHeader = event.target.closest('[data-language-key]');
    if (langHeader) {
      const key = langHeader.getAttribute('data-language-key');
      if (!key) return;
      if (expandedLanguages.has(key)) expandedLanguages.delete(key);
      else expandedLanguages.add(key);
      renderCurrentPage();
      return;
    }

    const domainHeader = event.target.closest('[data-domain-key]');
    if (domainHeader) {
      const key = domainHeader.getAttribute('data-domain-key');
      if (!key) return;
      if (expandedDomains.has(key)) expandedDomains.delete(key);
      else expandedDomains.add(key);
      renderCurrentPage();
    }
  });
}

async function init() {
  try {
    const data = await loadAllData();
    allEntries = flattenData(data);

    // Expand first level by default for better UX
    [...new Set(allEntries.map((p) => p.language))].forEach((language) => {
      expandedLanguages.add(`lang::${language}`);
    });

    allEntries.forEach((item) => {
      expandedDomains.add(`domain::${item.language}::${item.domain}`);
    });

    populateFilters(allEntries);
    setupEvents();
    filteredEntries = [...allEntries];
    renderCurrentPage();
  } catch (error) {
    console.error(error);
    resultsMeta.textContent = 'Unable to load projects right now.';
    explorerContainer.innerHTML =
      '<div class="empty-state">Could not load project explorer data from backend.</div>';
  }
}

init();
