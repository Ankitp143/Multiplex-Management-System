import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, theatreAPI, showAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [upcomingShows, setUpcomingShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportAPI.getDashboard().catch(() => ({ data: { data: {} } })),
      theatreAPI.getAll().catch(() => ({ data: { data: [] } })),
      showAPI.getAll({ limit: 5 }).catch(() => ({ data: { data: [] } })),
    ]).then(([statsRes, theatresRes, showsRes]) => {
      setStats(statsRes.data.data);
      setTheatres(theatresRes.data.data || []);
      setUpcomingShows(showsRes.data.data || []);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { icon: '🏢', label: 'My Theatres', desc: 'Manage your cinemas & screens', path: '/owner/theatres', color: '#3b82f6' },
    { icon: '📽️', label: 'Screens', desc: 'Configure seating & screen types', path: '/owner/screens', color: '#8b5cf6' },
    { icon: '🎟️', label: 'Shows', desc: 'Schedule & manage show times', path: '/owner/shows', color: '#10b981' },
    { icon: '📋', label: 'Bookings', desc: 'View customer reservations', path: '/owner/bookings', color: '#e5a017' },
    { icon: '📈', label: 'Revenue', desc: 'Analyse earnings & trends', path: '/owner/reports', color: '#ec4899' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(59,130,246,0.2)', border: '2px solid rgba(59,130,246,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0
        }}>🏢</div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>
            Welcome back, {user?.firstName}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Theatre Owner Dashboard — manage your theatres, screens, shows and revenue
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card blue">
              <div className="stat-icon">🏢</div>
              <div className="stat-value" style={{ color: 'var(--blue)' }}>{theatres.length}</div>
              <div className="stat-label">My Theatres</div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">📋</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>{stats?.totalBookingsCount || 0}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card gold">
              <div className="stat-icon">💰</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="stat-label">Revenue Earned</div>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {quickLinks.map(link => (
              <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '20px 18px',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = link.color + '66'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: link.color + '18', border: `1px solid ${link.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
                  }}>{link.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 3, color: 'var(--text-primary)' }}>{link.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{link.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* My Theatres */}
          {theatres.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>🏢 My Theatres</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {theatres.map(t => (
                  <div key={t._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10,
                    border: '1px solid var(--border)', flexWrap: 'wrap', gap: 10
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: 2 }}>{t.name}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        📍 {t.city} &nbsp;·&nbsp; 📽️ {t.totalScreens} Screens
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to="/owner/theatres" className="btn btn-secondary btn-sm">Manage</Link>
                      <Link to="/owner/shows" className="btn btn-primary btn-sm">Shows</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
