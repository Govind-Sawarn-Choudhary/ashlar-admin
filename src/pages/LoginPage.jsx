import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, checkBackendHealth } from '../api/client.js';
import { Alert } from '../components/Alert.jsx';
import { BackendStatus } from '../components/BackendStatus.jsx';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [backendHint, setBackendHint] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBackendHealth().then((status) => {
      if (!status.online) {
        setBackendHint(status.message);
      }
    });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(email, password);
      onLogin(data.token);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'network') {
        setError(err.message);
      } else {
        setError(err.message || 'Sign in failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-panel">
        <div className="login-hero">
          <div className="login-hero-mark">A</div>
          <p className="admin-brand-kicker">Ashlar Lawyer Hub</p>
          <h1>Admin Console</h1>
          <p className="muted">Premium control center for lawyer verification and platform ops</p>
        </div>

        <div className="login-top">
          <BackendStatus />
        </div>

        <div className="card login-card">
          {backendHint ? (
            <Alert
              type="warning"
              title="Backend not connected"
              message={backendHint}
            />
          ) : null}

          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field-label">
              Email
              <input
                className="input"
                type="email"
                placeholder="admin@ashlarlaw.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field-label">
              Password
              <input
                className="input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <Alert message={error} /> : null}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
