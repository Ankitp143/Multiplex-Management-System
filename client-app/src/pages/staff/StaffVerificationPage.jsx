import { useState } from 'react';
import { ticketAPI, foodOrderAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const StaffVerificationPage = () => {
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24, textAlign: 'center' }}>
        <h1 className="page-title">🛂 Ticket & Entry Verification</h1>
        <p className="page-subtitle">Scan QR Code or enter Ticket Number for gate admission</p>
      </div>

      <div className="card" style={{ maxWidth: 500, margin: '0 auto 32px' }}>
        <form onSubmit={handleVerifyTicket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Enter Ticket Number</label>
            <input className="form-input" value={ticketNo} style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.1em' }}
              onChange={e => setTicketNo(e.target.value)} placeholder="TKT-123456" autoFocus required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={verifying}>
            {verifying ? 'Verifying...' : '🔍 Verify Admission'}
          </button>
        </form>

        {ticketResult && (
          <div style={{
            marginTop: 24, padding: 20, borderRadius: 12, textAlign: 'center',
            background: ticketResult.valid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${ticketResult.valid ? 'var(--green)' : 'var(--red)'}`
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{ticketResult.valid ? '✅' : '❌'}</div>
            <h3 style={{ color: ticketResult.valid ? 'var(--green)' : 'var(--red)', marginBottom: 8 }}>
              {ticketResult.valid ? 'ADMISSION ALLOWED' : 'ADMISSION DENIED'}
            </h3>
            {ticketResult.valid ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 12 }}>
                <p><strong>Movie:</strong> {ticketResult.data?.show?.movie?.title}</p>
                <p><strong>Theatre:</strong> {ticketResult.data?.show?.theatre?.name} ({ticketResult.data?.show?.screen?.name})</p>
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

export default StaffVerificationPage;
