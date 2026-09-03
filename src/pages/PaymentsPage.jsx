import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { api } from '../api/client.js';
import { formatCurrency, formatDate, formatLabel } from '../utils/format.js';

export default function PaymentsPage({ onLogout }) {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(filters = {}) {
    setLoading(true);
    setError('');
    try {
      const params = {};
      const nextStatus = filters.status ?? status;
      const nextType = filters.paymentType ?? paymentType;
      if (nextStatus) params.status = nextStatus;
      if (nextType) params.paymentType = nextType;

      const data = await api.getPayments(params);
      setPayments(data.payments || []);
    } catch (err) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const completedTotal = payments
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <AdminLayout title="Payments" subtitle="Transactions across the platform" onLogout={onLogout}>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Transactions</h3>
          <p>{payments.length}</p>
        </div>
        <div className="card stat-card">
          <h3>Completed volume</h3>
          <p>{formatCurrency(completedTotal)}</p>
        </div>
      </div>

      <div className="card">
        <div className="page-card-header">
          <div>
            <h2>Payment history</h2>
            <p className="page-card-meta">Wallet, bookings, and challan payments</p>
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
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            className="admin-input input-inline"
            value={paymentType}
            onChange={(e) => {
              setPaymentType(e.target.value);
              load({ paymentType: e.target.value });
            }}
          >
            <option value="">All types</option>
            <option value="booking">Booking</option>
            <option value="wallet_topup">Wallet top-up</option>
            <option value="challan">Challan</option>
          </select>
        </div>

        {loading ? (
          <LoadingBlock label="Loading payments..." />
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <h3>No payments yet</h3>
            <p className="muted">
              {status || paymentType
                ? 'No payments match the selected filters.'
                : 'Transactions will appear here once users pay.'}
            </p>
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
                    <td>{formatLabel(payment.paymentType)}</td>
                    <td>{formatCurrency(payment.amount)}</td>
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
