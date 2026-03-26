const backBtn = document.getElementById('backBtn');
const emailForm = document.getElementById('emailForm');
const otpForm = document.getElementById('otpForm');
const resetForm = document.getElementById('resetForm');
const emailInput = document.getElementById('emailInput');
const otpInput = document.getElementById('otpInput');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const emailDisplay = document.getElementById('emailDisplay');
const resendBtn = document.getElementById('resendBtn');
const resendTimer = document.getElementById('resendTimer');
const API_BASE_URL = 'http://localhost:5000/api';

let currentEmail = '';
let currentOtp = '';
let resendCountdown = 0;
let isResending = false;

// Password visibility toggle
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
togglePasswordButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const passwordInput = e.target.previousElementSibling;
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    e.target.classList.toggle('fa-eye');
    e.target.classList.toggle('fa-eye-slash');
  });
});

// Back button
backBtn.addEventListener('click', () => {
  window.location.href = 'login.html';
});

// Show specific step
function showStep(stepNumber) {
  document.querySelectorAll('.forgot-step').forEach(step => {
    step.classList.add('hidden');
  });
  document.getElementById(`step${stepNumber}`).classList.remove('hidden');
}

// Email form submission
emailForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentEmail = emailInput.value.trim().toLowerCase();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentEmail }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unable to send OTP');
    }

    alert('OTP sent to your email. Please check inbox/spam.');
    emailDisplay.textContent = `Email: ${currentEmail}`;
    resendCountdown = 60;
    startResendTimer();
    showStep(2);
  } catch (error) {
    alert(error.message || 'Unable to send OTP right now.');
  }
});

// OTP form submission
otpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const enteredOTP = otpInput.value.trim();

  if (enteredOTP.length !== 6 || isNaN(enteredOTP)) {
    alert('Please enter a valid 6-digit OTP');
    return;
  }

  currentOtp = enteredOTP;
  showStep(3);
});

// Reset password form submission
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = newPassword.value;
  const confirmPass = confirmPassword.value;

  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  if (password !== confirmPass) {
    alert('Passwords do not match!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentEmail,
        otp: currentOtp,
        password,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unable to reset password');
    }

    alert('Password reset successfully!');
    showStep(4);
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (error) {
    alert(error.message || 'Unable to reset password right now.');
  }
});

// Resend OTP
resendBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  if (isResending || resendCountdown > 0) {
    return;
  }

  isResending = true;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentEmail }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unable to resend OTP');
    }

    alert('New OTP sent to your email. Please check inbox/spam.');

    resendCountdown = 60;
    startResendTimer();
    otpInput.value = '';
    otpInput.focus();
  } catch (error) {
    alert(error.message || 'Unable to resend OTP right now.');
  } finally {
    isResending = false;
  }
});

// Resend timer
function startResendTimer() {
  resendBtn.classList.add('disabled');
  resendBtn.style.pointerEvents = 'none';
  resendBtn.style.opacity = '0.5';

  const interval = setInterval(() => {
    resendCountdown--;
    if (resendCountdown > 0) {
      resendTimer.textContent = `(${resendCountdown}s)`;
    } else {
      clearInterval(interval);
      resendBtn.classList.remove('disabled');
      resendBtn.style.pointerEvents = 'auto';
      resendBtn.style.opacity = '1';
      resendTimer.textContent = '';
    }
  }, 1000);
}
