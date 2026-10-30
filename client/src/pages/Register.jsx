import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePage from '../hooks/usePage';
import '../styles/register.css';

export default function Register() {
  usePage('pg-register', 'Canteen — create account', 'd-flex align-items-center justify-content-center');
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          username,
          contact_number: contact,
          password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Account could not be created.');
        setLoading(false);
        return;
      }

      alert('Success! Please log in using your new account.');
      navigate('/login');
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
            <div className="icon-circle mx-auto mb-3">🧑‍🎓</div>
            <h2 className="font-display text-center mb-1">Create account</h2>
            <p className="text-center mb-4" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>So we can track your orders</p>

            <div className="alert alert-danger py-2 px-3 small" id="errorMsg" style={{ display: error ? 'block' : 'none' }}>{error}</div>

            <form id="registerForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label-dark form-label">Full name</label>
                <input id="fullName" type="text" className="form-control form-control-dark" required
                  value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="username" className="form-label-dark form-label">Username</label>
                <input id="username" type="text" className="form-control form-control-dark" required autoComplete="username"
                  value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="contact" className="form-label-dark form-label">Contact number (optional)</label>
                <input id="contact" type="tel" className="form-control form-control-dark" placeholder="09XX XXX XXXX"
                  value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label-dark form-label">Password</label>
                <input id="password" type="password" className="form-control form-control-dark" required autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-teal w-100" id="registerBtn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <Link to="/login" className="link-teal d-block text-center mt-3 small">Already have an account? Log in →</Link>
            <Link to="/" className="link-muted d-block text-center mt-2 small">← Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
