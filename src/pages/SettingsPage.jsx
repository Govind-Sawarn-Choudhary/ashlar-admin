import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { api } from '../api/client.js';

export default function SettingsPage({ onLogout }) {
  const [settings, setSettings] = useState({});
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
      setMessage('Settings saved');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function update(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

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
              <p className="page-card-meta">Support, commission, wallet, and test OTP</p>
            </div>
          </div>
          <div className="admin-form-grid">
          <label>
            Support phone
            <input
              className="admin-input"
              value={settings.support_phone || ''}
              onChange={(e) => update('support_phone', e.target.value)}
            />
          </label>
          <label>
            Commission %
            <input
              className="admin-input"
              value={settings.commission_percent || ''}
              onChange={(e) => update('commission_percent', e.target.value)}
            />
          </label>
          <label>
            Min wallet top-up
            <input
              className="admin-input"
              value={settings.min_wallet_topup || ''}
              onChange={(e) => update('min_wallet_topup', e.target.value)}
            />
          </label>
          <label>
            Challan test OTP
            <input
              className="admin-input"
              value={settings.challan_test_otp || ''}
              onChange={(e) => update('challan_test_otp', e.target.value)}
            />
          </label>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
