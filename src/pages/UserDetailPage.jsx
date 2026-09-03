import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function UserDetailPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.getUser(id);
      setData(response);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'auth') {
        onLogout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const user = data?.user;
  const appointments = data?.appointments || [];

  return (
    <AdminLayout
      title={user?.fullName || `User #${id}`}
      subtitle="Profile, wallet, and booking history"
      backTo="/users"
      onLogout={onLogout}
    >
      {error ? <Alert title="Could not load user" message={error} onRetry={load} /> : null}
      {loading ? <LoadingBlock label="Loading user…" /> : null}

      {!loading && user ? (
        <>
          <div className="detail-grid">
            <section className="card detail-section">
              <h2>Profile</h2>
              <InfoRow label="Phone" value={formatPhone(user.phone)} />
              <InfoRow label="Email" value={user.email || '—'} />
              <InfoRow label="Location" value={user.location || '—'} />
              <InfoRow label="Language" value={user.language || '—'} />
              <InfoRow
                label="Profile"
                value={
                  <span className={`badge ${user.profileComplete ? 'badge-approved' : 'badge-pending'}`}>
                    {user.profileComplete ? 'Complete' : 'Incomplete'}
                  </span>
                }
              />
              <InfoRow label="Joined" value={formatDate(user.createdAt)} />
            </section>

            <section className="card detail-section">
              <h2>Wallet</h2>
              <InfoRow label="Balance" value={formatCurrency(user.walletBalance)} />
            </section>
          </div>

          <div className="card">
            <div className="page-card-header">
              <div>
                <h2>Appointments</h2>
                <p className="page-card-meta">{appointments.length} bookings</p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="empty-state">
                <h3>No appointments</h3>
                <p className="muted">This user has not booked any consultations yet.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Lawyer</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((item) => (
                      <tr
                        key={item.id}
                        className="table-row-clickable"
                        onClick={() => navigate(`/appointments/${item.id}`)}
                      >
                        <td>{item.id}</td>
                        <td>{item.lawyerName || item.lawyerPhone}</td>
                        <td>{formatLabel(item.consultationType)}</td>
                        <td>{formatCurrency(item.amount)}</td>
                        <td>
                          <StatusBadge status={item.status} />
                        </td>
                        <td>{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </AdminLayout>
  );
}
