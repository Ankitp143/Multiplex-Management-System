import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      toast.success(res.data.message || 'OTP sent to your email!');
      if (res.data.data?.devOtp) {
        setDevOtp(res.data.data.devOtp);
      }
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the 6-digit OTP code');

    setLoading(true);
    try {
      await authAPI.verifyOtp(email, otp);
      toast.success('OTP verified! Now enter your new password.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return toast.error('Please fill in all password fields');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 16px',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(229,160,23,0.06) 0%, transparent 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="card" style={{ padding: 36 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: '2.8rem' }}>🔑</span>
            <h2 style={{ marginTop: 12, marginBottom: 6 }}>Forgot Password</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {step === 1 && 'Enter your account email to receive a 6-digit reset OTP code'}
              {step === 2 && `Enter the 6-digit OTP code sent to ${email}`}
              {step === 3 && 'Create a new strong password for your account'}
            </p>
          </div>

          {/* Progress Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: 32, height: 6, borderRadius: 4,
                background: step >= s ? 'var(--accent)' : 'var(--border)'
              }} />
            ))}
          </div>

          {/* Step 1: Send Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Reset OTP 📩'}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP Form */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              {devOtp && (
                <div style={{
                  background: 'rgba(229,160,23,0.12)', border: '1px dashed var(--accent)',
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16, textAlign: 'center', fontSize: '0.85rem'
                }}>
                  💡 <strong>Test OTP Code:</strong> <span style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: 2 }}>{devOtp}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">6-Digit Verification OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="123456"
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: 6, fontWeight: 700 }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP ✓'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password Form */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password 🔒'}
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem' }}>
            <Link to="/login" style={{ color: 'var(--text-muted)' }}>
              Back to <strong style={{ color: 'var(--accent)' }}>Login</strong>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
