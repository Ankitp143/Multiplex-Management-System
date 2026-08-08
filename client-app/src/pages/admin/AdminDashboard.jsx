import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/apiServices';
import { AdminSidebar } from '../../components/common/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportAPI.getDashboard(),
      reportAPI.getRevenue()
    ]).then(([statsRes, revRes]) => {
      setStats(statsRes.data.data);
      setRevenue(revRes.data.data || []);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">📊 Admin Dashboard</h1>
            <p className="page-subtitle">Platform overview and analytics</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"/></div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card gold">
                <div className="stat-icon">💰</div>
                <div className="stat-value" style={{ color: 'var(--accent)' }}>
                  ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                </div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon">📋</div>
                <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats?.totalBookingsCount || 0}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">🎬</div>
                <div className="stat-value" style={{ color: 'var(--green)' }}>{stats?.totalMovies || 0}</div>
                <div className="stat-label">Movies</div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">👥</div>
                <div className="stat-value" style={{ color: 'var(--red)' }}>{stats?.totalUsers || 0}</div>
                <div className="stat-label">Registered Users</div>
              </div>
            </div>

            {revenue.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 20 }}>📈 Daily Revenue</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                      formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="dailyTotal" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card">
              <h3 style={{ marginBottom: 16 }}>📋 Recent Bookings</h3>
              {stats?.recentBookings?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No recent bookings</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Movie</th>
                        <th>Theatre</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentBookings || []).map(b => (
                        <tr key={b._id}>
                          <td>{b.user?.firstName} {b.user?.lastName}</td>
                          <td>{b.show?.movie?.title}</td>
                          <td>{b.show?.theatre?.name}</td>
                          <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{b.finalAmount}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
