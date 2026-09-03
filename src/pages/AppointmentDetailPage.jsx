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

export default function AppointmentDetailPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await api.getAppointment(id);
      setData(response);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'auth') {
        onLogout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const appointment = data?.appointment;
  const payment = data?.payment;
  const consultation = data?.consultation?.session;

  return (
    <AdminLayout
      title={`Appointment #${id}`}
      subtitle="Booking, payment, and consultation details"
      backTo="/appointments"
      onLogout={onLogout}
    >
      {error ? <Alert title="Could not load appointment" message={error} onRetry={load} /> : null}
      {loading ? <LoadingBlock label="Loading appointment…" /> : null}

      {!loading && appointment ? (
        <div className="detail-grid">
          <section className="card detail-section">
            <h2>Booking</h2>
            <InfoRow label="Status" value={<StatusBadge status={appointment.status} />} />
            <InfoRow label="Consultation type" value={formatLabel(appointment.consultationType)} />
            <InfoRow label="Mode" value={formatLabel(appointment.mode)} />
            <InfoRow label="Amount" value={formatCurrency(appointment.amount)} />
            <InfoRow
              label="Duration"
              value={appointment.durationMinutes ? `${appointment.durationMinutes} min` : '—'}
            />
            <InfoRow label="Scheduled" value={formatDate(appointment.scheduledAt)} />
            <InfoRow label="Created" value={formatDate(appointment.createdAt)} />
            {appointment.notes ? <InfoRow label="Notes" value={appointment.notes} /> : null}
          </section>

          <section className="card detail-section">
            <h2>Participants</h2>
            <InfoRow label="User" value={appointment.userName || '—'} />
            <InfoRow label="User phone" value={formatPhone(appointment.userPhone)} />
            <InfoRow label="Lawyer" value={appointment.lawyerName || '—'} />
            <InfoRow label="Lawyer phone" value={formatPhone(appointment.lawyerPhone)} />
          </section>

          {payment ? (
            <section className="card detail-section">
              <h2>Payment</h2>
              <InfoRow label="Reference" value={payment.reference} />
              <InfoRow label="Type" value={formatLabel(payment.paymentType)} />
              <InfoRow label="Amount" value={formatCurrency(payment.amount)} />
              <InfoRow label="Status" value={<StatusBadge status={payment.status} />} />
              <InfoRow label="Razorpay order" value={payment.razorpayOrderId || '—'} />
              <InfoRow label="Razorpay payment" value={payment.razorpayPaymentId || '—'} />
              <InfoRow label="Paid at" value={formatDate(payment.createdAt)} />
            </section>
          ) : (
            <section className="card detail-section">
              <h2>Payment</h2>
              <p className="muted">No payment linked to this appointment.</p>
            </section>
          )}

          {consultation ? (
            <section className="card detail-section detail-section-wide">
              <div className="page-card-header">
                <div>
                  <h2>Consultation session</h2>
                  <p className="page-card-meta">Agora channel and join status</p>
                </div>
                <Link className="btn btn-secondary btn-sm" to={`/consultations/${consultation.id}`}>
                  View session
                </Link>
              </div>
              <InfoRow label="Session status" value={<StatusBadge status={consultation.status} />} />
              <InfoRow label="Channel" value={consultation.channelName || '—'} />
              <InfoRow label="User joined" value={formatDate(consultation.userJoinedAt)} />
              <InfoRow label="Lawyer joined" value={formatDate(consultation.lawyerJoinedAt)} />
              <InfoRow label="Started" value={formatDate(consultation.startedAt)} />
              <InfoRow label="Ends at" value={formatDate(consultation.endsAt)} />
              <InfoRow label="Ended" value={formatDate(consultation.endedAt)} />
            </section>
          ) : (
            <section className="card detail-section detail-section-wide">
              <h2>Consultation session</h2>
              <p className="muted">No consultation session started for this booking yet.</p>
            </section>
          )}
        </div>
      ) : null}
    </AdminLayout>
  );
}
