import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Lawyers', hint: 'Onboarding & approval' },
  { to: '/users', label: 'Users', hint: 'Client accounts' },
  { to: '/appointments', label: 'Appointments', hint: 'Bookings' },
  { to: '/payments', label: 'Payments', hint: 'Transactions' },
  { to: '/settings', label: 'Settings', hint: 'Platform config' },
];

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
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
            <span className="admin-sidebar-link-label">{link.label}</span>
            <span className="admin-sidebar-link-hint">{link.hint}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
