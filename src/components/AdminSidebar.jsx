import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', hint: 'Lawyers & overview', icon: '◆' },
  { to: '/users', label: 'Users', hint: 'Client accounts', icon: '◉' },
  { to: '/appointments', label: 'Appointments', hint: 'Bookings', icon: '◈' },
  { to: '/consultations', label: 'Consultations', hint: 'Chat, audio, video', icon: '◎' },
  { to: '/payments', label: 'Payments', hint: 'Transactions', icon: '◇' },
  { to: '/settings', label: 'Settings', hint: 'Platform config', icon: '◌' },
];

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-mark">A</div>
        <div>
          <p className="admin-sidebar-brand-title">Ashlar Admin</p>
          <p className="admin-sidebar-brand-sub">Control center</p>
        </div>
      </div>
      <p className="admin-sidebar-title">Navigation</p>
      <nav className="admin-sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? ' is-active' : ''}`
            }
          >
            <span className="admin-sidebar-link-icon" aria-hidden="true">
              {link.icon}
            </span>
            <span className="admin-sidebar-link-copy">
              <span className="admin-sidebar-link-label">{link.label}</span>
              <span className="admin-sidebar-link-hint">{link.hint}</span>
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
