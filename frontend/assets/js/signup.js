const signupForm = document.getElementById('signupForm');
const signupFeedback = document.getElementById('signupFeedback');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const ruleLength = document.getElementById('ruleLength');
const ruleUpper = document.getElementById('ruleUpper');
const ruleLower = document.getElementById('ruleLower');
const ruleNumber = document.getElementById('ruleNumber');
const ruleSpecial = document.getElementById('ruleSpecial');
const emailInput = document.getElementById('email');
const verifyEmailBtn = document.getElementById('verifyEmailBtn');
const signupOtpPanel = document.getElementById('signupOtpPanel');
const signupOtpInput = document.getElementById('signupOtp');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const emailVerificationStatus = document.getElementById('emailVerificationStatus');
const otpVerificationStatus = document.getElementById('otpVerificationStatus');

ensureSessionValidity();

if (getCurrentSessionUser()) {
  location.replace('home.html');
}

const verificationState = {
  verifiedEmail: '',
  otpSentEmail: '',
};

const requiredFieldConfigs = [
  { id: 'username', label: 'Username' },
  { id: 'email', label: 'Gmail Address' },
  { id: 'password', label: 'Password' },
  { id: 'confirmPassword', label: 'Re-confirm Password' },
];

const showMessage = (message, isSuccess = false) => {
  signupFeedback.textContent = message;
  signupFeedback.classList.toggle('success', isSuccess);
};

const getErrorElement = (fieldId) => document.getElementById(`${fieldId}Error`);

const setFieldError = (fieldId, message = '') => {
  const input = document.getElementById(fieldId);
  const errorElement = getErrorElement(fieldId);
  const hasError = Boolean(message);
  input?.classList.toggle('input-error', hasError);
  if (errorElement) errorElement.textContent = message;
};

const clearAllFieldErrors = () => {
  requiredFieldConfigs.forEach(({ id }) => setFieldError(id, ''));
  setFieldError('signupOtp', '');
};

const setVerificationStatus = (element, message = '', type = '') => {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('success', 'error');
  if (type) element.classList.add(type);
};

const validateRequiredFields = () => {
  const missingLabels = [];
  requiredFieldConfigs.forEach(({ id, label }) => {
    const input = document.getElementById(id);
    const value = input?.value?.trim?.() ?? input?.value ?? '';
    const isMissing = !value;
    setFieldError(id, isMissing ? `${label} is required.` : '');
    if (isMissing) missingLabels.push(label);
  });
  return missingLabels;
};

const isPasswordStrong = (value) => {
  return value.length >= 8
    && /[A-Z]/.test(value)
    && /[a-z]/.test(value)
    && /\d/.test(value)
    && /[^A-Za-z\d]/.test(value);
};

const updateRuleState = (element, isValid) => {
  if (!element) return;
  element.classList.toggle('valid', isValid);
  element.classList.toggle('invalid', !isValid);
};

const updatePasswordChecklist = () => {
  const password = passwordInput?.value || '';
  updateRuleState(ruleLength, password.length >= 8);
  updateRuleState(ruleUpper, /[A-Z]/.test(password));
  updateRuleState(ruleLower, /[a-z]/.test(password));
  updateRuleState(ruleNumber, /\d/.test(password));
  updateRuleState(ruleSpecial, /[^A-Za-z\d]/.test(password));
};

const setButtonLoading = (button, isLoading, idleText, loadingText = 'Please wait...') => {
  if (!button) return;
  button.disabled = isLoading;
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = idleText || button.textContent.trim();
  }
  button.textContent = isLoading ? loadingText : button.dataset.defaultText;
};

const resetEmailVerificationState = ({ clearOtp = true } = {}) => {
  verificationState.verifiedEmail = '';
  verificationState.otpSentEmail = '';
  signupOtpPanel?.classList.add('hidden');
  if (clearOtp && signupOtpInput) signupOtpInput.value = '';
  setVerificationStatus(emailVerificationStatus, '');
  setVerificationStatus(otpVerificationStatus, '');
  setFieldError('signupOtp', '');
};

const completeSignup = (payload, successMessage) => {
  persistSession(payload || {});
  showMessage(successMessage || 'Signup successful. Redirecting...', true);
  try { signupForm?.reset(); } catch (_) {}
  try { updatePasswordChecklist(); } catch (_) {}
  try { resetEmailVerificationState(); } catch (_) {}

  setTimeout(() => {
    window.location.href = 'home.html';
  }, 400);
};

const isIgnorableGoogleError = (message) =>
  typeof message === 'string' && message.toLowerCase().includes('did not return a credential');

togglePasswordBtn?.addEventListener('click', () => {
  const icon = togglePasswordBtn.querySelector('i');
  const showPassword = passwordInput.type === 'password';
  passwordInput.type = showPassword ? 'text' : 'password';
  icon.classList.toggle('fa-eye', !showPassword);
  icon.classList.toggle('fa-eye-slash', showPassword);
});

toggleConfirmPasswordBtn?.addEventListener('click', () => {
  const icon = toggleConfirmPasswordBtn.querySelector('i');
  const showPassword = confirmPasswordInput.type === 'password';
  confirmPasswordInput.type = showPassword ? 'text' : 'password';
  icon.classList.toggle('fa-eye', !showPassword);
  icon.classList.toggle('fa-eye-slash', showPassword);
});

passwordInput?.addEventListener('input', updatePasswordChecklist);
updatePasswordChecklist();

emailInput?.addEventListener('input', () => {
  const currentEmail = emailInput.value.trim().toLowerCase();
  const matchesVerified = currentEmail && currentEmail === verificationState.verifiedEmail;
  const matchesOtpSent = currentEmail && currentEmail === verificationState.otpSentEmail;

  if (!matchesVerified) {
    verificationState.verifiedEmail = '';
    setVerificationStatus(emailVerificationStatus, '');
  }

  if (!matchesOtpSent) {
    verificationState.otpSentEmail = '';
    signupOtpPanel?.classList.add('hidden');
    signupOtpInput && (signupOtpInput.value = '');
    setVerificationStatus(otpVerificationStatus, '');
    setFieldError('signupOtp', '');
  }
});

verifyEmailBtn?.addEventListener('click', async () => {
  const email = emailInput.value.trim().toLowerCase();
  setFieldError('email', '');
  showMessage('');

  if (!email) {
    setFieldError('email', 'Gmail Address is required.');
    return;
  }

  if (!email.endsWith('@gmail.com')) {
    setFieldError('email', 'Please enter a valid Gmail address.');
    setVerificationStatus(emailVerificationStatus, 'Please use a Gmail address for verification.', 'error');
    return;
  }

  try {
    setButtonLoading(verifyEmailBtn, true, 'Verify', 'Sending OTP...');
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'signup' }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unable to send OTP');
    }

    verificationState.verifiedEmail = '';
    verificationState.otpSentEmail = email;
    signupOtpPanel?.classList.remove('hidden');
    setVerificationStatus(emailVerificationStatus, 'OTP sent to your Gmail. Please verify to continue.', 'success');
    setVerificationStatus(otpVerificationStatus, '');
    signupOtpInput?.focus();
  } catch (error) {
    setVerificationStatus(emailVerificationStatus, error.message || 'Unable to send OTP right now.', 'error');
  } finally {
    setButtonLoading(verifyEmailBtn, false, 'Verify');
  }
});

verifyOtpBtn?.addEventListener('click', async () => {
  const email = emailInput.value.trim().toLowerCase();
  const otp = signupOtpInput?.value?.trim() || '';
  setFieldError('signupOtp', '');
  showMessage('');

  if (!otp) {
    setFieldError('signupOtp', 'OTP is required.');
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    setFieldError('signupOtp', 'Please enter a valid 6-digit OTP.');
    return;
  }

  try {
    setButtonLoading(verifyOtpBtn, true, 'Verify OTP', 'Verifying...');
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose: 'signup' }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Unable to verify OTP');
    }

    verificationState.verifiedEmail = email;
    verificationState.otpSentEmail = email;
    setVerificationStatus(emailVerificationStatus, 'Email verified successfully.', 'success');
    setVerificationStatus(otpVerificationStatus, 'OTP verified successfully.', 'success');
  } catch (error) {
    setVerificationStatus(otpVerificationStatus, error.message || 'Unable to verify OTP right now.', 'error');
  } finally {
    setButtonLoading(verifyOtpBtn, false, 'Verify OTP');
  }
});

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearAllFieldErrors();
  showMessage('');

  const missingFields = validateRequiredFields();
  if (missingFields.length) {
    showMessage(`Please fill in: ${missingFields.join(', ')}.`);
    return;
  }

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!email.endsWith('@gmail.com')) {
    setFieldError('email', 'Please enter a valid Gmail address.');
    showMessage('Please use a Gmail address for signup.');
    return;
  }

  if (verificationState.verifiedEmail !== email) {
    setVerificationStatus(emailVerificationStatus, 'Please verify your Gmail before creating an account.', 'error');
    showMessage('Email verification is required before account creation.');
    return;
  }

  if (password !== confirmPassword) {
    setFieldError('confirmPassword', 'Passwords do not match.');
    showMessage('Password and Re-confirm Password must match.');
    return;
  }

  if (!isPasswordStrong(password)) {
    setFieldError('password', 'Please satisfy all password conditions.');
    showMessage('Please satisfy all password conditions before creating your account.');
    return;
  }

  try {
    setButtonLoading(signupForm.querySelector('.primary-btn'), true, 'Create Account');
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      // Surface per-field validation details if the backend provides them
      const detailText = Array.isArray(result.details) ? result.details.join('; ') : '';
      throw new Error(detailText || result.message || 'Unable to create account');
    }

    completeSignup(result?.data || {}, 'Account created successfully! Redirecting...');
  } catch (error) {
    showMessage(error.message || 'Unable to create account right now.');
  } finally {
    setButtonLoading(signupForm.querySelector('.primary-btn'), false, 'Create Account');
  }
});

renderGoogleSignIn({
  mountId: 'googleSignupMount',
  onCredential: async ({ credential }) => {
    try {
      showMessage('Verifying Google sign-in...', true);
      const response = await fetch(`${AUTH_API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Google signup failed.');
      }

      const googleMessage = result.data?.isNewUser
        ? 'Google account created successfully! Redirecting...'
        : 'Existing account found. Signed in with Google successfully!';

      completeSignup(result.data || {}, googleMessage);
    } catch (error) {
      showMessage(error.message || 'Google signup failed.');
    }
  },
  onError: (message) => {
    if (!isIgnorableGoogleError(message)) {
      showMessage(message);
    }
  },
});