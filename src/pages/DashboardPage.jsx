import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { barBadgeType, formatDate, isBarUnverified } from '../utils/lawyer.js';
import { formatCurrency, formatLabel } from '../utils/format.js';

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

function IntegrationPill({ label, ok, detail }) {
  return (
    <div className={`integration-pill ${ok ? 'integration-pill-ok' : 'integration-pill-warn'}`}>
      <span className="integration-pill-label">{label}</span>
      <span className="integration-pill-detail">{detail}</span>
    </div>
  );
}

function PremiumStatCard({ icon, label, value, linkTo, linkLabel }) {
  return (
    <div className="card stat-card premium-stat-card">
      <div className="premium-stat-top">
        <h3>{label}</h3>
        <span className="premium-stat-icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p>{value}</p>
      {linkTo ? (
        <Link className="stat-link" to={linkTo}>
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

export default function DashboardPage({ onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [integrations, setIntegrations] = useState(null);
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
      const [statsData, lawyersData, overviewData, integrationsData] = await Promise.all([
        api.getStats(),
        api.getLawyers({
          status: barUnverified ? undefined : status,
          barUnverified: barUnverified ? '1' : undefined,
          search: search || undefined,
        }),
        api.getOverviewStats().catch(() => null),
        api.getIntegrations().catch(() => null),
      ]);
      setStats(statsData.stats);
      setLawyers(lawyersData.lawyers);
      setOverview(overviewData);
      setIntegrations(integrationsData);
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
      title="Dashboard"
      subtitle="Platform overview, lawyer onboarding, and live consultations"
      onLogout={handleLogout}
    >
      {error ? (
        <Alert title="Could not load dashboard" message={error} onRetry={load} />
      ) : null}

      {overview ? (
        <div className="stats-grid">
          <PremiumStatCard icon="◉" label="Users" value={overview.users} />
          <PremiumStatCard icon="◈" label="Appointments" value={overview.appointments} />
          <PremiumStatCard icon="◇" label="Revenue" value={formatCurrency(overview.paymentTotal)} />
          <PremiumStatCard
            icon="◎"
            label="Active sessions"
            value={overview.activeConsultations ?? 0}
            linkTo="/consultations?status=active"
            linkLabel="View live"
          />
          <PremiumStatCard
            icon="◌"
            label="Waiting sessions"
            value={overview.waitingConsultations ?? 0}
          />
        </div>
      ) : null}

      {overview?.bookingsByType?.length ? (
        <div className="card">
          <div className="page-card-header">
            <div>
              <h2>Bookings by type</h2>
              <p className="page-card-meta">Consultation mix across the platform</p>
            </div>
          </div>
          <div className="stats-grid">
            {overview.bookingsByType.map((item) => (
              <div key={item.type} className="mini-stat">
                <span className="mini-stat-label">{formatLabel(item.type)}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {integrations ? (
        <div className="card">
          <div className="page-card-header">
            <div>
              <h2>Integrations</h2>
              <p className="page-card-meta">Payment and consultation providers</p>
            </div>
          </div>
          <div className="integration-grid">
            <IntegrationPill
              label="Razorpay"
              ok={integrations.razorpay?.enabled}
              detail={
                integrations.razorpay?.enabled
                  ? 'Configured and enabled'
                  : 'Add keys in backend .env'
              }
            />
            <IntegrationPill
              label="Agora RTC"
              ok={integrations.agora?.enabled}
              detail={
                integrations.agora?.enabled
                  ? 'Voice & video ready'
                  : 'Set AGORA_APP_ID and certificate'
              }
            />
            <IntegrationPill
              label="Agora Chat"
              ok={integrations.agora?.chatAppKeyConfigured}
              detail={
                integrations.agora?.chatAppKeyConfigured
                  ? 'Chat SDK ready'
                  : 'Set AGORA_CHAT_APP_KEY'
              }
            />
            <IntegrationPill
              label="OTP"
              ok={integrations.otp?.testMode}
              detail={`Test mode · ${integrations.otp?.testPhone || '8521429014'}`}
            />
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
            <h3>Pending lawyers</h3>
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
        <div className="page-card-header">
          <div>
            <h2>Lawyer onboarding</h2>
            <p className="page-card-meta">Review and approve lawyer profiles</p>
          </div>
        </div>

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
