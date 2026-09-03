import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { api } from '../api/client.js';

function StatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase();
  return <span className={`badge badge-${normalized}`}>{status}</span>;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PaymentsPage({ onLogout }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getPayments();
        setPayments(data.payments || []);
      } catch (err) {
        setError(err.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const total = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <AdminLayout title="Payments" subtitle="Transactions across the platform" onLogout={onLogout}>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Total transactions</h3>
          <p>{payments.length}</p>
        </div>
        <div className="card stat-card">
          <h3>Volume</h3>
          <p>₹{total.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="card">
        <div className="page-card-header">
          <div>
            <h2>Payment history</h2>
            <p className="page-card-meta">Wallet, bookings, and challan payments</p>
          </div>
        </div>

        {loading ? (
          <LoadingBlock label="Loading payments..." />
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <h3>No payments yet</h3>
            <p className="muted">Transactions will appear here once users pay.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Razorpay</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.reference}</td>
                    <td>{payment.userName || payment.userPhone}</td>
                    <td>{payment.paymentType}</td>
                    <td>₹{Number(payment.amount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td>{payment.razorpayPaymentId || payment.razorpayOrderId || '—'}</td>
                    <td>{formatDate(payment.createdAt)}</td>
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
