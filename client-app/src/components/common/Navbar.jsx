import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { notificationAPI } from '../../services/apiServices';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isOwner, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isOwner) return '/owner';
    if (isStaff) return '/staff';
    return '/booking-history';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="logo-icon">🎬</div>
          <span style={{ background: 'linear-gradient(135deg, #e5a017, #f5b52a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CineMax
          </span>
        </Link>

        <nav className="navbar-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/movies" className={`nav-link ${isActive('/movies')}`}>Movies</Link>
          <Link to="/theatres" className={`nav-link ${isActive('/theatres')}`}>Theatres</Link>
          {isAuthenticated && <Link to="/booking-history" className={`nav-link ${isActive('/booking-history')}`}>My Bookings</Link>}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-ghost btn-sm">
                {isAdmin ? '⚙️ Admin' : isOwner ? '🏢 Owner' : isStaff ? '🛂 Staff' : '👤'} Dashboard
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Hi, {user?.firstName}
                </span>
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
