import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { Alert } from '../components/Alert.jsx';
import { LoadingBlock } from '../components/LoadingBlock.jsx';
import { api } from '../api/client.js';

function ProfileBadge({ complete }) {
  return (
    <span className={`badge ${complete ? 'badge-approved' : 'badge-pending'}`}>
      {complete ? 'Complete' : 'Incomplete'}
    </span>
  );
}

export default function UsersPage({ onLogout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(query = '') {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers(query ? { search: query } : {});
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminLayout title="Users" subtitle="Client accounts on the platform" onLogout={onLogout}>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="card">
        <div className="page-card-header">
          <div>
            <h2>All users</h2>
            <p className="page-card-meta">{users.length} registered accounts</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <input
            className="admin-input"
            style={{ flex: 1, minWidth: 220 }}
            placeholder="Search phone, name, email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
          />
          <button type="button" className="btn btn-primary" onClick={() => load(search)}>
            Search
          </button>
        </div>

        {loading ? (
          <LoadingBlock label="Loading users..." />
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p className="muted">Try a different search term.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Profile</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="table-row-clickable"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td>{user.fullName || '—'}</td>
                    <td>{user.phone}</td>
                    <td>{user.email || '—'}</td>
                    <td>{user.location || '—'}</td>
                    <td>
                      <ProfileBadge complete={user.profileComplete} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/users/${user.id}`);
                        }}
                      >
                        View
                      </button>
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
