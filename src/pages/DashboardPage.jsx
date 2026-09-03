import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { barBadgeType, formatDate, isBarUnverified } from '../utils/lawyer.js';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

function BarVerificationBadge({ lawyer }) {
  const type = barBadgeType(lawyer);
  const labels = {
    'bar-auto': 'Bar verified',
    'bar-unverified': 'Not verified',
    'bar-pending': 'Enrollment saved',
    'bar-none': 'Not verified',
  };

  return <span className={`badge badge-${type}`}>{labels[type]}</span>;
}

export default function DashboardPage({ onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [status, setStatus] = useState('pending');
  const [barUnverified, setBarUnverified] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [statsData, lawyersData, overviewData] = await Promise.all([
        api.getStats(),
        api.getLawyers({
          status: barUnverified ? undefined : status,
          barUnverified: barUnverified ? '1' : undefined,
          search: search || undefined,
        }),
        api.getOverviewStats().catch(() => null),
      ]);
      setStats(statsData.stats);
      setLawyers(lawyersData.lawyers);
      setOverview(overviewData);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'auth') {
        onLogout();
        navigate('/login', { replace: true });
        return;
      }

      setError(err.message || 'Failed to load dashboard');
      setStats(null);
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status, barUnverified]);

  function handleLogout() {
    onLogout();
    navigate('/login');
  }

  return (
    <AdminLayout
      title="Lawyers"
      subtitle="Review onboarding submissions and approve lawyers"
      onLogout={handleLogout}
    >
      {error ? (
        <Alert
          title="Could not load dashboard"
          message={error}
          onRetry={load}
        />
      ) : null}

      {overview ? (
        <div className="stats-grid">
          <div className="card stat-card">
            <h3>Users</h3>
            <p>{overview.users}</p>
          </div>
          <div className="card stat-card">
            <h3>Appointments</h3>
            <p>{overview.appointments}</p>
          </div>
          <div className="card stat-card">
            <h3>Payments total</h3>
            <p>₹{overview.paymentTotal}</p>
          </div>
        </div>
      ) : null}

      {stats ? (
        <div className="stats-grid">
          <button
            type="button"
            className={`card stat-card stat-card-button ${status === 'pending' && !barUnverified ? 'stat-card-active' : ''}`}
            onClick={() => {
              setBarUnverified(false);
              setStatus('pending');
            }}
          >
            <h3>Pending</h3>
            <p>{stats.pending}</p>
            <span className="stat-hint">Click to filter</span>
          </button>
          <button
            type="button"
            className={`card stat-card stat-card-button ${status === 'approved' && !barUnverified ? 'stat-card-active' : ''}`}
            onClick={() => {
              setBarUnverified(false);
              setStatus('approved');
            }}
          >
            <h3>Approved</h3>
            <p>{stats.approved}</p>
            <span className="stat-hint">Click to filter</span>
          </button>
          <button
            type="button"
            className={`card stat-card stat-card-button ${status === 'rejected' && !barUnverified ? 'stat-card-active' : ''}`}
            onClick={() => {
              setBarUnverified(false);
              setStatus('rejected');
            }}
          >
            <h3>Rejected</h3>
            <p>{stats.rejected}</p>
            <span className="stat-hint">Click to filter</span>
          </button>
          <button
            type="button"
            className={`card stat-card stat-card-button ${barUnverified ? 'stat-card-active' : ''}`}
            onClick={() => {
              setBarUnverified((value) => !value);
              if (!barUnverified) {
                setStatus('');
              }
            }}
          >
            <h3>Bar not verified</h3>
            <p>{stats.barUnverified ?? 0}</p>
            <span className="stat-hint">Click to filter</span>
          </button>
          <div className="card stat-card">
            <h3>Total complete</h3>
            <p>{stats.total}</p>
          </div>
        </div>
      ) : null}

      <div className="card">
        <div className="toolbar">
          <select
            className="input input-inline"
            value={barUnverified ? 'bar_unverified' : status}
            onChange={(e) => {
              if (e.target.value === 'bar_unverified') {
                setBarUnverified(true);
                setStatus('');
                return;
              }
              setBarUnverified(false);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="bar_unverified">Bar not verified</option>
          </select>
          <input
            className="input"
            style={{ flex: 1, minWidth: 220 }}
            placeholder="Search phone or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                load();
              }
            }}
          />
          <button type="button" className="btn btn-primary" onClick={load}>
            Search
          </button>
        </div>

        {loading ? <LoadingBlock label="Loading lawyers…" /> : null}

        {!loading && !error && lawyers.length === 0 ? (
          <div className="empty-state">
            <h3>No lawyers found</h3>
            <p className="muted">
              {barUnverified
                ? 'No lawyers with unverified Bar Council profiles.'
                : status
                  ? `No ${status} lawyers right now. Try another filter.`
                  : 'No completed lawyer profiles yet.'}
            </p>
          </div>
        ) : null}

        {!loading && lawyers.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Bar Council</th>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lawyers.map((lawyer) => (
                  <tr
                    key={lawyer.id}
                    className={`table-row-clickable${isBarUnverified(lawyer) ? ' table-row-unverified' : ''}`}
                    onClick={() => navigate(`/lawyers/${lawyer.id}`)}
                  >
                    <td>
                      {lawyer.full_name || '—'}
                      {isBarUnverified(lawyer) ? (
                        <span className="inline-flag">Not verified</span>
                      ) : null}
                    </td>
                    <td>+91 {lawyer.phone}</td>
                    <td>
                      <BarVerificationBadge lawyer={lawyer} />
                    </td>
                    <td>{lawyer.onboarding_step}</td>
                    <td>
                      <StatusBadge status={lawyer.verification_status} />
                    </td>
                    <td>{formatDate(lawyer.updated_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lawyers/${lawyer.id}`);
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
