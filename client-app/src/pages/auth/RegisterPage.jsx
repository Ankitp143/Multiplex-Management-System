import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [ownerExists, setOwnerExists] = useState(false);
  const [checkingOwner, setCheckingOwner] = useState(true);

  // Check if a theatre owner already exists in the system
  useEffect(() => {
    authAPI.checkOwnerExists()
      .then(r => setOwnerExists(r.data.data.ownerExists))
      .catch(() => setOwnerExists(false))
      .finally(() => setCheckingOwner(false));
  }, []);

  const [regError, setRegError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegError('');
    // If owner role is taken, silently switch to customer
    if (name === 'role' && value === 'theatre_owner' && ownerExists) return;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegError('');
    try {
      const { data } = await authAPI.register(form);
      if (data.success) {
        login(data.data.user, data.data.token);
        toast.success('Welcome to CineMax! 🎬');
        const role = data.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'theatre_owner') navigate('/owner');
        else if (role === 'staff') navigate('/staff');
        else navigate('/booking-history');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setRegError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(229,160,23,0.06) 0%, transparent 60%)'
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎬</div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Join CineMax and book amazing movies
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" name="firstName" value={form.firstName}
                    onChange={handleChange} placeholder="Ankit" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" name="lastName" value={form.lastName}
                    onChange={handleChange} placeholder="Prajapati" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com" required />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" name="phone" value={form.phone}
                  onChange={handleChange} placeholder="9876543210" required />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" name="password" value={form.password}
                  onChange={handleChange} placeholder="Min. 6 characters" required />
              </div>

              <div className="form-group">
                <label className="form-label">Register As</label>
                <select className="form-select" name="role" value={form.role} onChange={handleChange}
                  disabled={checkingOwner}>
                  <option value="customer">🎫 Customer</option>
                  <option value="theatre_owner" disabled={ownerExists}>
                    🏢 Theatre Owner{ownerExists ? ' (Position Filled)' : ''}
                  </option>
                  <option value="staff">🛂 Staff</option>
                  <option value="admin">⚙️ Admin</option>
                </select>

                {/* Owner already exists notice */}
                {form.role === 'theatre_owner' && ownerExists && (
                  <p style={{
                    marginTop: 6, fontSize: '0.8rem', color: 'var(--red)',
                    display: 'flex', alignItems: 'center', gap: 5
                  }}>
                    ⚠️ A Theatre Owner already exists. Only one owner is allowed.
                  </p>
                )}
                {form.role === 'theatre_owner' && !ownerExists && !checkingOwner && (
                  <p style={{
                    marginTop: 6, fontSize: '0.8rem', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', gap: 5
                  }}>
                    🏢 You will become the sole Theatre Owner of this multiplex system.
                  </p>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg"
                disabled={loading || (form.role === 'theatre_owner' && ownerExists)}
                style={{ marginTop: 4 }}>
                {loading ? '⏳ Creating account...' : '🚀 Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
            </p>

            {regError && (
              <p style={{
                textAlign: 'center',
                marginTop: 14,
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 500
              }}>
                ⚠️ {regError}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterPage;
