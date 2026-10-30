import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePage from '../hooks/usePage';
import { setAdminSession } from '../lib/session';
import '../styles/adminlogin.css';

export default function AdminLogin() {
  usePage('pg-adminlogin', 'Canteen — admin login', 'd-flex align-items-center justify-content-center');
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Incorrect username or password.');
        setLoading(false);
        return;
      }

      setAdminSession(data.username);
      navigate('/admin/orders');
    } catch (err) {
      setError('Connection problem. Make sure the server is running.');
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-11 col-sm-8 col-md-5 col-lg-4">
          <div className="card-dark p-4">
            <div className="icon-circle mx-auto mb-3">🔐</div>
            <h2 className="font-display text-center mb-1">Admin log in</h2>
            <p className="text-center mb-4" style={{ color: 'var(--muted)', fontSize: '.85rem' }}>JPC Online Canteen</p>
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
              <button type="submit" className="btn btn-teal w-100" id="loginBtn" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            <Link to="/login" className="link-muted d-block text-center mt-3 small">Customer login / Google admin sign-in →</Link>
            <Link to="/" className="link-muted d-block text-center mt-2 small">← Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
