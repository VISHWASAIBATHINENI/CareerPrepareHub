const signupForm = document.getElementById('signupForm');
const signupFeedback = document.getElementById('signupFeedback');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const API_BASE_URL = 'http://localhost:5000/api';

const showMessage = (message, isSuccess = false) => {
  signupFeedback.textContent = message;
  signupFeedback.classList.toggle('success', isSuccess);
};

togglePasswordBtn.addEventListener('click', () => {
  const icon = togglePasswordBtn.querySelector('i');
  const showPassword = passwordInput.type === 'password';
  passwordInput.type = showPassword ? 'text' : 'password';
  icon.classList.toggle('fa-eye', !showPassword);
  icon.classList.toggle('fa-eye-slash', showPassword);
});

toggleConfirmPasswordBtn.addEventListener('click', () => {
  const icon = toggleConfirmPasswordBtn.querySelector('i');
  const showPassword = confirmPasswordInput.type === 'password';
  confirmPasswordInput.type = showPassword ? 'text' : 'password';
  icon.classList.toggle('fa-eye', !showPassword);
  icon.classList.toggle('fa-eye-slash', showPassword);
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstname = signupForm.querySelector('#firstname').value.trim();
  const middlename = signupForm.querySelector('#middlename').value.trim();
  const lastname = signupForm.querySelector('#lastname').value.trim();
  const dob = signupForm.querySelector('#dob').value;
  const username = signupForm.querySelector('#username').value.trim();
  const email = signupForm.querySelector('#email').value.trim();
  const password = signupForm.querySelector('#password').value;
  const confirmPassword = signupForm.querySelector('#confirmPassword').value;
  const nationality = signupForm.querySelector('#nationality').value;
  const status = signupForm.querySelector('#status').value;

  if (!firstname || !lastname || !dob || !username || !email || !password || !nationality || !status) {
    showMessage('Please fill all required fields.');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Password and Re-confirm Password must match.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${firstname} ${middlename} ${lastname}`.replace(/\s+/g, ' ').trim(),
        email,
        password,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unable to create account');
    }

    const payload = result?.data || {};
    localStorage.setItem('authToken', payload.token || '');
    localStorage.setItem('currentUser', JSON.stringify(payload.user || null));

    showMessage('Account created successfully! Redirecting...', true);
    signupForm.reset();

    setTimeout(() => {
      location.href = 'home.html';
    }, 900);
  } catch (error) {
    showMessage(error.message || 'Unable to create account right now.');
  }
});