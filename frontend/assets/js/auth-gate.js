/*
  Shared front-end auth gate
  --------------------------
  - Shows a prompt with Cancel/Login for guests.
  - Login action redirects to login.html.
  - Protects restricted pages and restricted links.
*/

(function () {
  const RESTRICTED_PAGES = new Set([
    'tech-skills.html',
    'core-subjects.html',
    'project-explorer.html',
    'aptitude.html',
    'aptitude-topics.html',
    'aptitude-practice.html',
    'coding-questions.html',
    'programming-languages.html',
    'domains.html'
  ]);

  const path = window.location.pathname.split('/').pop() || 'home.html';
  const isHome = path === 'home.html' || path === 'index.html' || path === '';
  const isRestrictedPage = RESTRICTED_PAGES.has(path) || document.body.dataset.restrictedPage === 'true';

  let pendingUrl = '';
  const getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser') || 'null');

  function buildAuthUI() {
    if (document.getElementById('authOverlay')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="authOverlay" class="auth-overlay" aria-hidden="true">
        <div id="accessDialog" class="auth-dialog hidden" role="dialog" aria-modal="true" aria-labelledby="authAccessTitle">
          <h3 id="authAccessTitle" class="auth-title">Please login to access this content</h3>
          <p class="auth-subtitle">You need to login to continue.</p>
          <div class="auth-actions">
            <button id="accessCancelBtn" type="button" class="auth-btn secondary">Cancel</button>
            <button id="accessLoginBtn" type="button" class="auth-btn primary">Login</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper.firstElementChild);
  }

  function setDialog(dialogId) {
    const overlay = document.getElementById('authOverlay');
    const accessDialog = document.getElementById('accessDialog');

    if (!overlay || !accessDialog) return;

    [accessDialog].forEach((dialog) => {
      dialog.classList.add('hidden');
      dialog.classList.remove('show');
    });

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    const target = document.getElementById(dialogId);
    if (!target) return;

    target.classList.remove('hidden');
    requestAnimationFrame(() => target.classList.add('show'));
  }

  function closeOverlay() {
    const overlay = document.getElementById('authOverlay');
    const dialogs = document.querySelectorAll('.auth-dialog');
    if (!overlay) return;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    dialogs.forEach((d) => {
      d.classList.remove('show');
      d.classList.add('hidden');
    });
  }

  function openAccessPrompt(url) {
    pendingUrl = url || '';
    setDialog('accessDialog');
  }

  function wireEvents() {
    const accessCancelBtn = document.getElementById('accessCancelBtn');
    const accessLoginBtn = document.getElementById('accessLoginBtn');

    if (accessCancelBtn) {
      accessCancelBtn.addEventListener('click', () => {
        closeOverlay();
        pendingUrl = '';

        if (isRestrictedPage && !getCurrentUser()) {
          window.location.href = 'home.html';
        }
      });
    }

    if (accessLoginBtn) {
      accessLoginBtn.addEventListener('click', () => {
        const target = pendingUrl ? `login.html?next=${encodeURIComponent(pendingUrl)}` : 'login.html';
        window.location.href = target;
      });
    }

    // Intercept restricted links on current page.
    document.querySelectorAll('a[href]').forEach((anchor) => {
      const href = anchor.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

      const target = href.split('/').pop();
      if (!RESTRICTED_PAGES.has(target)) return;

      anchor.addEventListener('click', (event) => {
        if (getCurrentUser()) return;
        event.preventDefault();
        openAccessPrompt(href);
      });
    });
  }

  function init() {
    buildAuthUI();
    wireEvents();

    const user = getCurrentUser();
    if (!user && isRestrictedPage) {
      openAccessPrompt(window.location.pathname.split('/').pop() || '');
      return;
    }

    if (!user && isHome) {
      openAccessPrompt('');
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();