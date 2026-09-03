import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatCurrency, formatDate, formatLabel, formatPhone } from '../utils/format.js';

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}

export default function ConsultationDetailPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.getConsultation(id);
      setData(response);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'auth') {
        onLogout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Failed to load consultation');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function forceEnd() {
    if (!window.confirm('Force end this consultation session?')) {
      return;
    }

    setEnding(true);
    setError('');
    try {
      await api.endConsultation(id);
      setMessage('Session ended');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to end session');
    } finally {
      setEnding(false);
    }
  }

  const session = data?.session;
  const messages = data?.messages || [];

  return (
    <AdminLayout
      title={`Session #${id}`}
      subtitle="Consultation timeline and chat transcript"
      backTo="/consultations"
      onLogout={onLogout}
    >
      {error ? <Alert title="Error" message={error} onRetry={load} /> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}
      {loading ? <LoadingBlock label="Loading session…" /> : null}

      {!loading && session ? (
        <>
          <div className="detail-grid">
            <section className="card detail-section">
              <div className="page-card-header">
                <div>
                  <h2>Session</h2>
                  <p className="page-card-meta">Agora channel details</p>
                </div>
                {session.status !== 'ended' ? (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={ending}
                    onClick={forceEnd}
                  >
                    {ending ? 'Ending…' : 'Force end'}
                  </button>
                ) : null}
              </div>
              <InfoRow label="Status" value={<StatusBadge status={session.status} />} />
              <InfoRow label="Channel" value={session.channelName || '—'} />
              <InfoRow label="Type" value={formatLabel(session.consultationType)} />
              <InfoRow label="Mode" value={formatLabel(session.mode)} />
              <InfoRow label="Amount" value={formatCurrency(session.amount)} />
              <InfoRow
                label="Duration"
                value={session.durationMinutes ? `${session.durationMinutes} min` : '—'}
              />
              <InfoRow label="User joined" value={formatDate(session.userJoinedAt)} />
              <InfoRow label="Lawyer joined" value={formatDate(session.lawyerJoinedAt)} />
              <InfoRow label="Started" value={formatDate(session.startedAt)} />
              <InfoRow label="Ends at" value={formatDate(session.endsAt)} />
              <InfoRow label="Ended" value={formatDate(session.endedAt)} />
            </section>

            <section className="card detail-section">
              <h2>Participants</h2>
              <InfoRow label="User" value={session.userName || '—'} />
              <InfoRow label="User phone" value={formatPhone(session.userPhone)} />
              <InfoRow label="Lawyer" value={session.lawyerName || '—'} />
              <InfoRow label="Lawyer phone" value={formatPhone(session.lawyerPhone)} />
              <InfoRow
                label="Appointment"
                value={
                  <Link to={`/appointments/${session.appointmentId}`}>
                    #{session.appointmentId}
                  </Link>
                }
              />
            </section>
          </div>

          <div className="card">
            <div className="page-card-header">
              <div>
                <h2>Chat messages</h2>
                <p className="page-card-meta">{messages.length} messages</p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="empty-state">
                <h3>No messages</h3>
                <p className="muted">Chat history will appear here once participants send messages.</p>
              </div>
            ) : (
              <div className="chat-log">
                {messages.map((item) => (
                  <div key={item.id} className="chat-log-item">
                    <div className="chat-log-meta">
                      <strong>{formatLabel(item.senderRole)}</strong>
                      <span className="muted">{formatDate(item.createdAt)}</span>
                    </div>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
}
