import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
                <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                  <option value="customer">🎫 Customer</option>
                  <option value="theatre_owner">🏢 Theatre Owner</option>
                  <option value="staff">🛂 Staff</option>
                  <option value="admin">⚙️ Admin</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? '⏳ Creating account...' : '🚀 Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
