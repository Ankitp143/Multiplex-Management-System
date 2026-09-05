import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [ticketNo, setTicketNo] = useState('');
  const [ticketResult, setTicketResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    if (!ticketNo.trim()) return;
    setVerifying(true);
    setTicketResult(null);
    try {
      const { data } = await ticketAPI.verify(ticketNo.trim());
      setTicketResult({ valid: true, data: data.data });
      toast.success('Valid Ticket Verified! ✅');
    } catch (err) {
      setTicketResult({ valid: false, message: err.response?.data?.message || 'Invalid Ticket' });
      toast.error(err.response?.data?.message || 'Invalid or Expired Ticket ❌');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(16,185,129,0.18)', border: '2px solid rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0
        }}>🛂</div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>
            Welcome, {user?.firstName}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Staff Dashboard — Verify tickets and manage food orders at the entry gate
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { icon: '✅', label: 'Verify Ticket', desc: 'Scan / enter ticket number for gate entry', path: '/staff/verify-ticket', color: '#10b981' },
          { icon: '🍿', label: 'Food Orders', desc: 'View and manage snack & food orders', path: '/staff/food-orders', color: '#e5a017' },
        ].map(link => (
          <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '22px 20px',
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
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{link.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{link.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Ticket Verify */}
      <div className="card" style={{ maxWidth: 520 }}>
        <h3 style={{ marginBottom: 18 }}>🔍 Quick Ticket Verification</h3>
        <form onSubmit={handleVerifyTicket} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Ticket Number</label>
            <input className="form-input" value={ticketNo}
              style={{ fontSize: '1.1rem', textAlign: 'center', letterSpacing: '0.08em' }}
              onChange={e => setTicketNo(e.target.value)} placeholder="TKT-123456" autoFocus required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={verifying}>
            {verifying ? '⏳ Verifying...' : '✅ Verify & Allow Entry'}
          </button>
        </form>

        {ticketResult && (
          <div style={{
            marginTop: 20, padding: 20, borderRadius: 12, textAlign: 'center',
            background: ticketResult.valid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${ticketResult.valid ? 'var(--green)' : 'var(--red)'}`
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{ticketResult.valid ? '✅' : '❌'}</div>
            <h3 style={{ color: ticketResult.valid ? 'var(--green)' : 'var(--red)', marginBottom: 8 }}>
              {ticketResult.valid ? 'ADMISSION ALLOWED' : 'ADMISSION DENIED'}
            </h3>
            {ticketResult.valid ? (
              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                <p><strong>Movie:</strong> {ticketResult.data?.show?.movie?.title}</p>
                <p><strong>Theatre:</strong> {ticketResult.data?.show?.theatre?.name} — {ticketResult.data?.show?.screen?.name}</p>
                <p><strong>Seats:</strong> {ticketResult.data?.seats?.map(s => s.seatNo).join(', ')}</p>
                <p><strong>Show Time:</strong> {ticketResult.data?.show?.startTime}</p>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>{ticketResult.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
