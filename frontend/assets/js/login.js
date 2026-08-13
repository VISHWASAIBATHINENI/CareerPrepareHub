const loginForm = document.getElementById('loginForm');
const identifierInput = document.getElementById('identifier');
const passwordInput = document.getElementById('password');
const loginTitle = document.getElementById('loginTitle');
const feedback = document.getElementById('loginFeedback');
const togglePasswordBtn = document.getElementById('togglePassword');
const confettiLayer = document.getElementById('confettiLayer');

ensureSessionValidity();

const activeSession = getCurrentSessionUser();
if (activeSession) {
  location.replace('home.html');
}

const confettiColors = ['#facc15', '#22c55e', '#3b82f6', '#f472b6', '#f97316'];

const showMessage = (message, isSuccess = false) => {
  feedback.textContent = message;
  feedback.classList.toggle('success', isSuccess);
};

const isIgnorableGoogleError = (message) =>
  typeof message === 'string' && message.toLowerCase().includes('did not return a credential');

const setButtonLoading = (button, isLoading, idleText) => {
  if (!button) return;
  button.disabled = isLoading;
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = idleText || button.textContent.trim();
  }
  button.textContent = isLoading ? 'Please wait...' : button.dataset.defaultText;
};

const completeLogin = (payload, successMessage) => {
  persistSession(payload || {});
  if (loginTitle) loginTitle.textContent = 'Welcome!';
  showMessage(successMessage || 'Login successful. Redirecting...', true);
  try { burstConfetti(); } catch (_) {}
  try { loginForm?.reset(); } catch (_) {}

  setTimeout(() => {
    window.location.href = 'home.html';
  }, 400);
};

const burstConfetti = () => {
  for (let i = 0; i < 30; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'confetti';

    const x = (Math.random() - 0.5) * 260;
    const y = -Math.random() * 260;

    particle.style.left = '50%';
    particle.style.top = '55%';
    particle.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    particle.style.setProperty('--tx', `${x}px`);
    particle.style.setProperty('--ty', `${y}px`);

    confettiLayer.appendChild(particle);
    setTimeout(() => particle.remove(), 950);
  }
};

togglePasswordBtn.addEventListener('click', () => {
  const icon = togglePasswordBtn.querySelector('i');
  const showPassword = passwordInput.type === 'password';
  passwordInput.type = showPassword ? 'text' : 'password';
  icon.classList.toggle('fa-eye', !showPassword);
  icon.classList.toggle('fa-eye-slash', showPassword);
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const identifier = identifierInput.value.trim();
  const password = passwordInput.value;

  if (!identifier || !password) {
    showMessage('Please enter both email/username and password.');
    return;
  }

  try {
    setButtonLoading(document.getElementById('loginBtn'), true, 'Login');
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Invalid credentials. Please try again.');
    }

    const payload = result?.data || {};
    completeLogin(payload, 'Login successful. Redirecting...');
  } catch (error) {
    showMessage(error.message || 'Unable to login right now.');
  } finally {
    setButtonLoading(document.getElementById('loginBtn'), false, 'Login');
  }
});

renderGoogleSignIn({
  mountId: 'googleLoginMount',
  onCredential: async ({ credential }) => {
    try {
      showMessage('Verifying Google credentials...', true);
      const response = await fetch(`${AUTH_API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Google login failed.');
      }

      completeLogin(result.data || {}, 'Google login successful. Redirecting...');
    } catch (error) {
      showMessage(error.message || 'Google login failed.');
    }
  },
  onError: (message) => {
    if (!isIgnorableGoogleError(message)) {
      showMessage(message);
    }
  },
});
