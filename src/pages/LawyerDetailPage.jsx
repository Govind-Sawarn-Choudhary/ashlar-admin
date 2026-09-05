import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client.js';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert, SuccessBanner } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import {
  asBool,
  barStatusLabel,
  formatSelectedDays,
  formatDate,
  isBarUnverified,
} from '../utils/lawyer.js';
import { formatLabel } from '../utils/format.js';

const DOC_LABELS = {
  bar_council_certificate: 'Bar Council Certificate',
  identity_proof: 'Identity Proof',
  law_degree: 'Law Degree',
  passport_photo: 'Passport Photo',
};

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '—'}</span>
    </div>
  );
}

function VerificationBadge({ status }) {
  const labels = {
    pending: 'Pending review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}

export default function LawyerDetailPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [portalName, setPortalName] = useState('');
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError('');
    setActionError('');
    setSuccess('');

    try {
      const data = await api.getLawyer(id);
      setLawyer(data.lawyer);
      setRejectionReason(data.lawyer.rejection_reason || '');
      setPortalName(data.lawyer.full_name || data.lawyer.bar_verified_name || '');
      if (data.lawyer.bar_enrollment_number) {
        setEnrollmentNumber(data.lawyer.bar_enrollment_number);
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'auth') {
        onLogout();
        navigate('/login', { replace: true });
        return;
      }

      setLoadError(err.message || 'Failed to load lawyer');
      setLawyer(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function updateStatus(nextStatus) {
    if (nextStatus === 'rejected' && !rejectionReason.trim()) {
      setActionError('Please enter a rejection reason');
      return;
    }

    setSaving(true);
    setActionError('');
    setSuccess('');

    try {
      const data = await api.updateVerification(id, {
        status: nextStatus,
        rejectionReason: nextStatus === 'rejected' ? rejectionReason.trim() : undefined,
      });
      setLawyer(data.lawyer);
      setSuccess(`Lawyer marked as ${nextStatus}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function checkBarOnPortal() {
    if (!enrollmentNumber.trim()) {
      setActionError('Enter an enrollment number');
      return;
    }

    setSaving(true);
    setActionError('');
    setSuccess('');

    try {
      const data = await api.updateBarVerification(id, {
        action: 'portal_check',
        enrollmentNumber: enrollmentNumber.trim(),
        fullName: portalName.trim(),
      });
      setLawyer(data.lawyer);
      setSuccess(data.result?.message || 'Portal check completed');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function approveBarManually() {
    setSaving(true);
    setActionError('');
    setSuccess('');

    try {
      const data = await api.updateBarVerification(id, {
        action: 'manual_approve',
        enrollmentNumber: enrollmentNumber.trim() || undefined,
        advocateName: portalName.trim() || undefined,
        state: 'UP',
      });
      setLawyer(data.lawyer);
      setSuccess('Bar Council manually approved');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    onLogout();
    navigate('/login');
  }

  if (loading) {
    return (
      <AdminLayout title="Lawyer review" onLogout={handleLogout} backTo="/" showSidebar={false}>
        <LoadingBlock label="Loading lawyer profile…" />
      </AdminLayout>
    );
  }

  if (!lawyer) {
    return (
      <AdminLayout title="Lawyer review" onLogout={handleLogout} backTo="/" showSidebar={false}>
        <Alert title="Lawyer not found" message={loadError || 'This profile could not be loaded.'} onRetry={load} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={lawyer.full_name || 'Lawyer profile'}
      subtitle={`+91 ${lawyer.phone}`}
      onLogout={handleLogout}
      backTo="/"
      showSidebar={false}
    >
      <SuccessBanner message={success} />
      {actionError ? <Alert message={actionError} /> : null}

      {isBarUnverified(lawyer) ? (
        <div className="alert alert-warning profile-unverified-banner">
          <strong>Profile not verified</strong>
          <p>
            Bar Council could not be auto-verified for this lawyer.
            {lawyer.bar_enrollment_number
              ? ` Enrollment on file: ${lawyer.bar_enrollment_number}.`
              : ' No enrollment number saved yet.'}
            {' '}Review the certificate and verify manually before final approval.
          </p>
        </div>
      ) : null}

      <div className="detail-grid">
        <section className="card detail-section">
          <h2>Profile</h2>
          <InfoRow label="Practice areas" value={lawyer.practice_areas} />
          <InfoRow label="Experience" value={lawyer.experience_years} />
          <InfoRow label="Bio" value={lawyer.bio} />
          <InfoRow label="Onboarding step" value={lawyer.onboarding_step} />
          <InfoRow
            label="Verification status"
            value={<VerificationBadge status={lawyer.verification_status} />}
          />
          <InfoRow label="Submitted" value={formatDate(lawyer.profile_updated_at || lawyer.updated_at)} />
        </section>

        <section className="card detail-section">
          <h2>Bar Council Verification</h2>
          <InfoRow label="Status" value={barStatusLabel(lawyer)} />
          <InfoRow label="State" value={lawyer.bar_state} />
          <InfoRow label="Enrollment entered" value={lawyer.bar_enrollment_number} />
          <InfoRow label="Portal name" value={lawyer.bar_verified_name} />
          <InfoRow label="Profile name" value={lawyer.full_name} />
          <InfoRow label="COP number" value={lawyer.bar_cop_number} />
          <InfoRow label="Enrollment date" value={lawyer.bar_verified_enrollment_date} />
          <InfoRow label="Address (portal)" value={lawyer.bar_verified_address} />
          <InfoRow
            label="Name match"
            value={
              lawyer.bar_name_matched === null || lawyer.bar_name_matched === undefined
                ? '—'
                : asBool(lawyer.bar_name_matched)
                  ? 'Yes'
                  : 'No'
            }
          />

          {asBool(lawyer.bar_manual_review) || isBarUnverified(lawyer) ? (
            <div className="bar-review-note">
              Profile not verified — manual Bar Council review required before final approval.
            </div>
          ) : null}

          <p className="helper-text">
            Uploading a Bar Council certificate photo does not auto-verify. Use portal check
            or manual approve after reviewing the uploaded document.
          </p>

          <div className="form-stack compact-stack">
            <input
              className="input"
              placeholder="Enrollment number e.g. UP0003B/19"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
            />
            <input
              className="input"
              placeholder="Name for portal match e.g. Asha Sharma"
              value={portalName}
              onChange={(e) => setPortalName(e.target.value)}
            />
            <div className="toolbar">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={saving}
                onClick={checkBarOnPortal}
              >
                Check UP Portal
              </button>
              {asBool(lawyer.bar_enrollment_verified) ? (
                <span className="badge badge-bar-auto">Bar Council verified</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={saving}
                  onClick={approveBarManually}
                >
                  Approve Bar Council
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="card detail-section">
          <h2>Documents</h2>
          {(lawyer.documents || []).length === 0 ? (
            <p className="muted">No documents uploaded.</p>
          ) : (
            <ul className="doc-list">
              {(lawyer.documents || []).map((doc) => (
                <li key={doc.doc_type}>
                  <div>
                    <strong>{DOC_LABELS[doc.doc_type] || doc.doc_type}</strong>
                    <p className="muted doc-meta">{doc.file_name}</p>
                  </div>
                  <a
                    className="btn btn-secondary btn-sm"
                    href={doc.file_path}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card detail-section">
          <h2>Availability</h2>
          {lawyer.availability ? (
            <>
              <InfoRow label="Working days" value={formatSelectedDays(lawyer.availability)} />
              <InfoRow
                label="Time"
                value={`${lawyer.availability.from_time || '—'} – ${lawyer.availability.to_time || '—'}`}
              />
              <InfoRow
                label="Repeat weekly"
                value={asBool(lawyer.availability.repeat_weekly) ? 'Yes' : 'No'}
              />
            </>
          ) : (
            <p className="muted">Not set</p>
          )}
        </section>

        <section className="card detail-section">
          <h2>Consultation fees</h2>
          {(lawyer.fees || []).length === 0 ? (
            <p className="muted">No fees configured.</p>
          ) : (
            <ul className="fee-list">
              {(lawyer.fees || []).map((fee) => (
                <li key={fee.fee_type}>
                  <strong>{formatLabel(fee.fee_type)}</strong>
                  <span>
                    {fee.fee_type === 'physical'
                      ? `₹${fee.amount} per session`
                      : `₹${fee.amount} / ${fee.duration_label}`}
                    {fee.location ? ` @ ${fee.location}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card detail-section detail-section-wide">
          <h2>Final approval</h2>

          <div className="approval-status-row">
            <span className="info-label">Current status</span>
            <VerificationBadge status={lawyer.verification_status} />
          </div>

          {lawyer.verification_status === 'approved' ? (
            <div className="alert alert-success approval-status-note">
              This lawyer is approved and visible for client bookings.
            </div>
          ) : null}

          {lawyer.verification_status === 'rejected' && lawyer.rejection_reason ? (
            <div className="bar-review-note">
              Rejection reason: {lawyer.rejection_reason}
            </div>
          ) : null}

          <div className="form-stack">
            {lawyer.verification_status !== 'rejected' ? (
              <textarea
                className="input"
                rows={3}
                placeholder="Rejection reason (required if rejecting)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            ) : null}

            <div className="toolbar">
              {lawyer.verification_status !== 'approved' ? (
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={saving}
                  onClick={() => updateStatus('approved')}
                >
                  Approve lawyer
                </button>
              ) : null}

              {lawyer.verification_status !== 'rejected' ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={saving}
                  onClick={() => updateStatus('rejected')}
                >
                  Reject
                </button>
              ) : null}

              {lawyer.verification_status !== 'pending' ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={saving}
                  onClick={() => updateStatus('pending')}
                >
                  Mark pending
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
