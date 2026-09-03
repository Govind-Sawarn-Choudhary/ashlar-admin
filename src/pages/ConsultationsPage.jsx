import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatCurrency, formatDate, formatLabel, formatPhone } from '../utils/format.js';

export default function ConsultationsPage({ onLogout }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(nextStatus = status) {
    setLoading(true);
    setError('');
    try {
      const data = await api.getConsultations(nextStatus ? { status: nextStatus } : {});
      setSessions(data.sessions || []);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'auth') {
        onLogout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Failed to load consultations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeCount = sessions.filter((item) => item.status === 'active').length;
  const waitingCount = sessions.filter((item) => item.status === 'waiting').length;

  return (
    <AdminLayout
      title="Consultations"
      subtitle="Live and past chat, audio, and video sessions"
      onLogout={onLogout}
    >
      {error ? <Alert title="Could not load consultations" message={error} onRetry={() => load()} /> : null}

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Total sessions</h3>
          <p>{sessions.length}</p>
        </div>
        <div className="card stat-card">
          <h3>Active now</h3>
          <p>{activeCount}</p>
        </div>
        <div className="card stat-card">
          <h3>Waiting</h3>
          <p>{waitingCount}</p>
        </div>
      </div>

      <div className="card">
        <div className="page-card-header">
          <div>
            <h2>All sessions</h2>
            <p className="page-card-meta">Agora-powered consultations</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <select
            className="admin-input input-inline"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              load(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option value="waiting">Waiting</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {loading ? (
          <LoadingBlock label="Loading consultations…" />
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <h3>No consultation sessions</h3>
            <p className="muted">
              {status
                ? `No ${status} sessions right now.`
                : 'Sessions appear after users start a paid consultation.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Lawyer</th>
                  <th>Type</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="table-row-clickable"
                    onClick={() => navigate(`/consultations/${session.id}`)}
                  >
                    <td>{session.id}</td>
                    <td>{session.userName || formatPhone(session.userPhone)}</td>
                    <td>{session.lawyerName || formatPhone(session.lawyerPhone)}</td>
                    <td>{formatLabel(session.consultationType)}</td>
                    <td className="mono-cell">{session.channelName || '—'}</td>
                    <td>
                      <StatusBadge status={session.status} />
                    </td>
                    <td>{formatDate(session.startedAt || session.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/consultations/${session.id}`);
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
