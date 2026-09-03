import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { api } from '../api/client.js';
import { formatCurrency, formatDate, formatLabel } from '../utils/format.js';

export default function AppointmentsPage({ onLogout }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(filters = {}) {
    setLoading(true);
    setError('');
    try {
      const params = {};
      const nextStatus = filters.status ?? status;
      const nextType = filters.consultationType ?? consultationType;
      if (nextStatus) params.status = nextStatus;
      if (nextType) params.consultationType = nextType;

      const data = await api.getAppointments(params);
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
              load({ status: e.target.value });
            }}
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="admin-input input-inline"
            value={consultationType}
            onChange={(e) => {
              setConsultationType(e.target.value);
              load({ consultationType: e.target.value });
            }}
          >
            <option value="">All types</option>
            <option value="chat">Chat</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="physical">Physical</option>
          </select>
        </div>

        {loading ? (
          <LoadingBlock label="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <h3>No appointments</h3>
            <p className="muted">
              {status || consultationType
                ? 'No appointments match the selected filters.'
                : 'No bookings have been made yet.'}
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
                  <th>Mode</th>
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
                    <td>{item.userName || item.userPhone}</td>
                    <td>{item.lawyerName || item.lawyerPhone}</td>
                    <td>{formatLabel(item.consultationType)}</td>
                    <td>{formatLabel(item.mode)}</td>
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
    </AdminLayout>
  );
}
