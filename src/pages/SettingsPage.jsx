import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { api } from '../api/client.js';

export default function SettingsPage({ onLogout }) {
  const [settings, setSettings] = useState({});
  const [meta, setMeta] = useState({});
  const [updatedAt, setUpdatedAt] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.getSettings();
        setSettings(data.settings || {});
        setMeta(data.meta || {});
        setUpdatedAt(data.updatedAt || {});
      } catch (err) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function save() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await api.updateSettings(settings);
      setSettings(data.settings || {});
      setMeta(data.meta || {});
      setUpdatedAt(data.updatedAt || {});
      setMessage('Settings saved successfully');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function update(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  const fields = [
    { key: 'support_phone', label: 'Support phone' },
    { key: 'commission_percent', label: 'Commission %', type: 'number' },
    { key: 'min_wallet_topup', label: 'Min wallet top-up', type: 'number' },
    { key: 'min_wallet_withdrawal', label: 'Min wallet withdrawal', type: 'number' },
    { key: 'challan_test_otp', label: 'Challan test OTP' },
  ];

  return (
    <AdminLayout title="Settings" subtitle="Platform configuration" onLogout={onLogout}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}
      {loading ? (
        <LoadingBlock label="Loading settings..." />
      ) : (
        <div className="card">
          <div className="page-card-header">
            <div>
              <h2>Platform settings</h2>
              <p className="page-card-meta">
                Values marked as enforced are applied live in booking, wallet, and payout flows
              </p>
            </div>
          </div>
          <div className="admin-form-grid settings-form-grid">
            {fields.map((field) => (
              <label key={field.key}>
                <span className="settings-label-row">
                  <span>{field.label}</span>
                  {meta[field.key]?.enforced ? (
                    <span className="settings-enforced-badge">Enforced</span>
                  ) : null}
                </span>
                <input
                  className="admin-input"
                  type={field.type || 'text'}
                  value={settings[field.key] || ''}
                  onChange={(e) => update(field.key, e.target.value)}
                />
                {meta[field.key]?.description ? (
                  <span className="settings-help">{meta[field.key].description}</span>
                ) : null}
                {updatedAt[field.key] ? (
                  <span className="settings-help">Last updated {updatedAt[field.key]}</span>
                ) : null}
              </label>
            ))}
            <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
