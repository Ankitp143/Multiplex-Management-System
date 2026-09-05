import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path ? 'sidebar-item active' : 'sidebar-item';

  const items = [
    { icon: '📊', label: 'Dashboard', path: '/admin' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '🎬', label: 'Movies', path: '/admin/movies' },
    { icon: '🏢', label: 'Theatres', path: '/admin/theatres' },
    { icon: '📽️', label: 'Screens', path: '/admin/screens' },
    { icon: '🎟️', label: 'Shows', path: '/admin/shows' },
    { icon: '📋', label: 'Bookings', path: '/admin/bookings' },
    { icon: '🍿', label: 'Snacks', path: '/admin/snacks' },
    { icon: '🏷️', label: 'Coupons', path: '/admin/coupons' },
    { icon: '📈', label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <aside className="sidebar">
      <p className="sidebar-title">Admin Panel</p>
      {items.map(item => (
        <Link key={item.path} to={item.path} className={isActive(item.path)}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button className="sidebar-item" style={{ width: '100%', color: 'var(--red)' }}
          onClick={() => { logout(); navigate('/'); }}>
          <span>🚪</span><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const OwnerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path ? 'sidebar-item active' : 'sidebar-item';

  const items = [
    { icon: '📊', label: 'Dashboard', path: '/owner' },
    { icon: '🏢', label: 'My Theatres', path: '/owner/theatres' },
    { icon: '📽️', label: 'Screens', path: '/owner/screens' },
    { icon: '🎟️', label: 'Shows', path: '/owner/shows' },
    { icon: '📋', label: 'Bookings', path: '/owner/bookings' },
    { icon: '👥', label: 'Users', path: '/owner/users' },
    { icon: '📈', label: 'Revenue', path: '/owner/reports' },
  ];

  return (
    <aside className="sidebar">
      <p className="sidebar-title">Theatre Owner</p>
      {items.map(item => (
        <Link key={item.path} to={item.path} className={isActive(item.path)}>
          <span>{item.icon}</span><span>{item.label}</span>
        </Link>
      ))}
      <button className="sidebar-item" style={{ width: '100%', color: 'var(--red)', marginTop: 16 }}
        onClick={() => { logout(); navigate('/'); }}>
        <span>🚪</span><span>Logout</span>
      </button>
    </aside>
  );
};

const StaffSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path ? 'sidebar-item active' : 'sidebar-item';

  return (
    <aside className="sidebar">
      <p className="sidebar-title">Staff Panel</p>
      <Link to="/staff" className={isActive('/staff')}>
        <span>🏠</span><span>Dashboard</span>
      </Link>
      <Link to="/staff/verify-ticket" className={isActive('/staff/verify-ticket')}>
        <span>✅</span><span>Verify Ticket</span>
      </Link>
      <Link to="/staff/food-orders" className={isActive('/staff/food-orders')}>
        <span>🍿</span><span>Food Orders</span>
      </Link>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button className="sidebar-item" style={{ width: '100%', color: 'var(--red)' }}
          onClick={() => { logout(); navigate('/'); }}>
          <span>🚪</span><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export { AdminSidebar, OwnerSidebar, StaffSidebar };
