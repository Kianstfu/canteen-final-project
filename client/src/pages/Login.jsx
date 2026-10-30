import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePage from '../hooks/usePage';
import { setAdminSession, setCustomerSession } from '../lib/session';
import { ADMIN_EMAIL, auth, googleProvider, signInWithPopup } from '../lib/firebase';
import '../styles/login.css';

// Ipinapakita ang TUNAY na dahilan (error code) para madaling ma-debug.
function friendlyAuthError(err) {
  const code = (err && err.code) || 'unknown';
  switch (code) {
    case 'auth/unauthorized-domain':
      return `This website (${window.location.hostname}) is not authorized for Google sign-in yet. (${code})`;
    case 'auth/popup-blocked':
      return `Your browser blocked the Google popup. Allow popups for this site, then try again. (${code})`;
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled. Click the button to try again.';
    case 'auth/operation-not-allowed':
      return `Google sign-in is not enabled for this app yet. (${code})`;
    case 'auth/network-request-failed':
      return `Network problem. Check your internet connection and try again. (${code})`;
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return `Invalid Firebase API key. (${code})`;
    default:
      return `Google sign-in failed. Please try again. (${code})`;
  }
}

export default function Login() {
  usePage('pg-login', 'Canteen — login', 'd-flex align-items-center justify-content-center');
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Username / password login ──
  async function handleSubmit(e) {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Incorrect username or password.');
        setLoginLoading(false);
        return;
      }

      setCustomerSession(data.customer_id, data.full_name);
      navigate('/menu');
    } catch (err) {
      setError('Connection problem. Make sure the server is running.');
      setLoginLoading(false);
    }
  }

  // ── Continue with Google ──
  async function handleGoogleLogin() {
    setError('');
    setGoogleLoading(true);

    // Hakbang 1: Google / Firebase popup
    let user;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    } catch (err) {
      console.error('Firebase sign-in error:', err.code, err.message);
      setError(friendlyAuthError(err));
      setGoogleLoading(false);
      return;
    }

    const email = (user.email || '').toLowerCase();
    const displayName = user.displayName || '';

    // Admin: rekta sa admin page
    if (user.emailVerified && email === ADMIN_EMAIL.toLowerCase()) {
      setAdminSession(displayName || email);
      navigate('/admin/orders');
      return;
    }

    // Hakbang 2: Lahat ng iba = guest/customer, i-save sa backend
    try {
      const res = await fetch('/api/customer/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: displayName })
      });

      // Basahin muna bilang text — kapag HTML ang binalik (hal. Render natutulog
      // o 502 galing Netlify proxy), hindi mag-crash ang res.json().
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (_) { /* hindi JSON */ }

      if (!data) {
        console.error('Non-JSON response from server:', res.status, text.slice(0, 200));
        setError(`The server is not responding properly (status ${res.status}). It may be waking up — wait about a minute and try again.`);
        setGoogleLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        console.error('google-login API error:', res.status, data);
        setError(data.message || data.error || `Server error (status ${res.status}).`);
        setGoogleLoading(false);
        return;
      }

      setCustomerSession(data.customer_id, data.full_name);
      navigate('/menu');
    } catch (err) {
      console.error('google-login fetch failed:', err);
      setError('Signed in with Google, but could not reach the server. Please try again in a moment.');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-11 col-sm-8 col-md-5 col-lg-4">
          <div className="card-dark p-4">
            <div className="icon-circle mx-auto mb-3">🧑‍🎓</div>
            <h2 className="font-display text-center mb-1">Log in</h2>
            <p className="text-center mb-4" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Welcome to JPC Online Canteen</p>

            <div className="alert alert-danger py-2 px-3 small" id="errorMsg" style={{ display: error ? 'block' : 'none' }}>{error}</div>

            <form id="loginForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label-dark form-label">Username</label>
                <input id="username" type="text" className="form-control form-control-dark" required autoComplete="username"
                  value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label-dark form-label">Password</label>
                <input id="password" type="password" className="form-control form-control-dark" required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-teal w-100" id="loginBtn" disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <div className="divider-row">
              <hr /><span>or</span><hr />
            </div>

            <button type="button" className="btn btn-google w-100 d-flex justify-content-center align-items-center gap-2"
              id="googleLoginBtn" onClick={handleGoogleLogin} disabled={googleLoading}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.02l7.73 6c4.51-4.18 7.09-10.36 7.09-17.49z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <Link to="/register" className="link-teal d-block text-center mt-3 small">Don't have an account? Register →</Link>
            <Link to="/" className="link-muted d-block text-center mt-2 small">← Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
