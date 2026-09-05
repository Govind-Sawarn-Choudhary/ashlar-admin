import { Link } from 'react-router-dom';
import { BackendStatus } from './BackendStatus.jsx';
import { AdminSidebar } from './AdminSidebar.jsx';

export function AdminLayout({ title, subtitle, onLogout, children, backTo, showSidebar = true }) {
  return (
    <div className="admin-app">
      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-brand">
            {backTo ? (
              <Link to={backTo} className="admin-back-link">
                ← Back
              </Link>
            ) : null}
            <div className="admin-brand-row">
              <div className="admin-brand-mark">A</div>
              <div>
                <p className="admin-brand-kicker">Ashlar Lawyer Hub</p>
                <h1 className="admin-brand-title">{title}</h1>
                {subtitle ? <p className="admin-brand-subtitle">{subtitle}</p> : null}
              </div>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <BackendStatus />
            <button type="button" className="btn btn-secondary btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>
        <div className="admin-body">
          {showSidebar ? <AdminSidebar /> : null}
          <main className="admin-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
