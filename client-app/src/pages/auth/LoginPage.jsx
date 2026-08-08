import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';

const ROLES = [
  { id: 'customer', label: 'Customer', icon: '🎫', color: '#e5a017' },
  { id: 'theatre_owner', label: 'Owner', icon: '🏢', color: '#3b82f6' },
  { id: 'staff', label: 'Staff', icon: '🛂', color: '#10b981' },
  { id: 'admin', label: 'Admin', icon: '⚙️', color: '#ec4899' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('customer');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      if (data.success) {
        login(data.data.user, data.data.token);
        toast.success(`Welcome back, ${data.data.user.firstName}! 🎬`);
        const userRole = data.data.user.role;
        if (userRole === 'admin') navigate('/admin');
        else if (userRole === 'theatre_owner') navigate('/owner');
        else if (userRole === 'staff') navigate('/staff');
        else navigate('/booking-history');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const activeRoleObj = ROLES.find(r => r.id === selectedRole);

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(circle at 50% 30%, rgba(229, 160, 23, 0.12) 0%, rgba(10, 11, 15, 0.98) 70%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Glow */}
        <div style={{
          position: 'absolute', width: 450, height: 450, borderRadius: '50%',
          background: `radial-gradient(circle, ${activeRoleObj.color}22 0%, transparent 70%)`,
          top: '20%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
          transition: 'all 0.5s ease'
        }} />

        <div style={{ width: '100%', maxWidth: 460, zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', width: 60, height: 60, borderRadius: 20,
              background: `linear-gradient(135deg, ${activeRoleObj.color}33, ${activeRoleObj.color}11)`,
              border: `1px solid ${activeRoleObj.color}66`,
              alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: 12,
              boxShadow: `0 8px 24px ${activeRoleObj.color}33`,
              transition: 'all 0.3s ease'
            }}>
              {activeRoleObj.icon}
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
              Sign In to CineMax
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select your portal and enter your credentials
            </p>
          </div>

          <div style={{
            background: 'rgba(20, 22, 28, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}>
            {/* 4 Role Selector Tabs */}
            <div style={{ marginBottom: 22 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                SELECT PORTAL / ROLE
              </label>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
                background: 'rgba(0, 0, 0, 0.4)', padding: 4, borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {ROLES.map(role => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '8px 4px', borderRadius: 8,
                        background: isSelected ? role.color : 'transparent',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none', cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: '0.75rem', transition: 'all 0.25s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{role.icon}</span>
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500 }}>Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={`Enter ${activeRoleObj.label} email...`}
                  required
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${selectedRole ? activeRoleObj.color + '44' : 'rgba(255, 255, 255, 0.12)'}`,
                    padding: '12px 14px', borderRadius: 10
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 500 }}>Password</label>
                <input
                  className="form-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${selectedRole ? activeRoleObj.color + '44' : 'rgba(255, 255, 255, 0.12)'}`,
                    padding: '12px 14px', borderRadius: 10
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: '14px',
                  borderRadius: 10,
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  background: activeRoleObj.color,
                  border: 'none',
                  color: '#fff',
                  boxShadow: `0 6px 20px ${activeRoleObj.color}44`,
                  cursor: 'pointer', transition: 'all 0.3s ease'
                }}
              >
                {loading ? '⏳ Signing in...' : `🔓 Sign In as ${activeRoleObj.label}`}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: activeRoleObj.color, fontWeight: 600 }}>Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
