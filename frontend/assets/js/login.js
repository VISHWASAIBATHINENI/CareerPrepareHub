const loginForm = document.getElementById('loginForm');
const identifierInput = document.getElementById('identifier');
const passwordInput = document.getElementById('password');
const loginTitle = document.getElementById('loginTitle');
const feedback = document.getElementById('loginFeedback');
const togglePasswordBtn = document.getElementById('togglePassword');
const confettiLayer = document.getElementById('confettiLayer');
const API_BASE_URL = 'http://localhost:5000/api';

const activeSession = JSON.parse(localStorage.getItem('currentUser') || 'null');
if (activeSession) {
  location.replace('home.html');
}

const confettiColors = ['#facc15', '#22c55e', '#3b82f6', '#f472b6', '#f97316'];

const showMessage = (message, isSuccess = false) => {
  feedback.textContent = message;
  feedback.classList.toggle('success', isSuccess);
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Invalid credentials. Please try again.');
    }

    const payload = result?.data || {};
    localStorage.setItem('authToken', payload.token || '');
    localStorage.setItem('currentUser', JSON.stringify(payload.user || null));

    loginTitle.textContent = 'Welcome!';
    showMessage('Login successful. Redirecting...', true);
    burstConfetti();
    loginForm.reset();

    setTimeout(() => {
      location.replace('home.html');
    }, 900);
  } catch (error) {
    showMessage(error.message || 'Unable to login right now.');
  }
});
