// ---------------------------------------------------------------------------
// AUTH_API_BASE_URL — auto-resolved so the frontend works whether you open it
// via Live Server (port 5500) OR via Express directly (port 5000).
// Google OAuth does NOT work with file:// — always serve via http://localhost
// ---------------------------------------------------------------------------
const _origin = window.location.origin;
if (_origin.startsWith('file:')) {
  document.body.innerHTML = `
    <div style="font-family:sans-serif;max-width:540px;margin:80px auto;padding:32px;
                border:2px solid #e53e3e;border-radius:12px;background:#fff5f5;color:#c53030">
      <h2 style="margin-top:0">&#9888; Cannot open via file://</h2>
      <p>Google sign-in <strong>requires a real HTTP server</strong>.<br>
      The page is currently open as <code>${window.location.href}</code>.</p>
      <p><strong>Fix options:</strong></p>
      <ol>
        <li>Open <code>http://localhost:5000/pages/login.html</code> &mdash;
            the Express backend already serves the frontend.</li>
        <li>Or use VS Code Live Server and open
            <code>http://localhost:5500/pages/login.html</code>.</li>
      </ol>
      <p style="font-size:13px;opacity:.7">Both origins must be added as
      <em>Authorized JavaScript Origins</em> in Google Cloud Console.</p>
    </div>`;
  throw new Error('file:// origin is not allowed for Google OAuth.');
}

// Point API calls to port 5000 in local dev (if on another port like 5500), otherwise use relative /api
const AUTH_API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port && port !== '5000') {
    return `${protocol}//${hostname}:5000/api`;
  }
  return '/api';
})();
window.API_BASE_URL = AUTH_API_BASE_URL;

const AUTH_STORAGE_KEYS = Object.freeze({
  token: 'authToken',
  user: 'currentUser',
});

const getGoogleClientId = () => {
  const metaClientId = document.querySelector('meta[name="google-signin-client_id"]')?.content?.trim();
  return metaClientId || '';
};

const persistSession = ({ token, user }) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token || '');
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user || null));
};

const clearSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
};

const getCurrentSessionUser = () => JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.user) || 'null');

const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (_error) {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
};

const ensureSessionValidity = () => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (token && isTokenExpired(token)) {
    clearSession();
  }
};

const renderGoogleSignIn = ({ mountId, onCredential, onError }) => {
  const clientId = getGoogleClientId();
  console.log(`[Google Auth] Initializing Google Sign-In with Client ID: ${clientId}`);
  console.log(`[Google Auth] Current Browser Origin: ${window.location.origin}`);

  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    onError?.('Google Client ID is missing. Add your real CLIENT_ID in the page meta tag.');
    return;
  }

  const mountNode = document.getElementById(mountId);
  if (!mountNode) return;

  const initAndRender = () => {
    if (!window.google?.accounts?.id) {
      onError?.(
        'Google Identity Services script failed to load. ' +
        'Check your internet connection and that <script src="https://accounts.google.com/gsi/client"> is present.',
      );
      return;
    }

    const callbackUrl = AUTH_API_BASE_URL.startsWith('http')
      ? `${AUTH_API_BASE_URL}/auth/google/callback`
      : `${window.location.origin}${AUTH_API_BASE_URL}/auth/google/callback`;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        login_uri: callbackUrl,
        ux_mode: 'redirect',
        auto_select: false,
      });

      mountNode.innerHTML = '';
      window.google.accounts.id.renderButton(mountNode, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 320,
        logo_alignment: 'left',
      });
    } catch (err) {
      onError?.(err.message || 'Error initializing Google Sign-In.');
    }
  };

  if (window.google?.accounts?.id) {
    initAndRender();
  } else {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        initAndRender();
      } else if (attempts >= 30) {
        clearInterval(interval);
        onError?.('Google Identity Services script timed out.');
      }
    }, 100);
  }
};
