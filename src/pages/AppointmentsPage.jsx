import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { api } from '../api/client.js';

function StatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  return <span className={`badge badge-${normalized}`}>{status}</span>;
}

export default function AppointmentsPage({ onLogout }) {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(nextStatus = status) {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAppointments(nextStatus ? { status: nextStatus } : {});
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminLayout title="Appointments" subtitle="All platform bookings" onLogout={onLogout}>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="card">
        <div className="page-card-header">
          <div>
            <h2>Bookings</h2>
            <p className="page-card-meta">{appointments.length} appointments</p>
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
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <LoadingBlock label="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <h3>No appointments</h3>
            <p className="muted">
              {status ? `No ${status} appointments right now.` : 'No bookings have been made yet.'}
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
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.userName || item.userPhone}</td>
                    <td>{item.lawyerName || item.lawyerPhone}</td>
                    <td>{item.consultationType}</td>
                    <td>₹{item.amount}</td>
                    <td>
                      <StatusBadge status={item.status} />
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
