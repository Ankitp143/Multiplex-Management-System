import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ticketAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const TicketViewPage = () => {
  const { bookingId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketAPI.getByBooking(bookingId)
      .then(r => setTicket(r.data.data))
      .catch(() => toast.error('Ticket not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  if (!ticket) return <div className="empty-state"><p>Ticket not found</p></div>;

  const { booking } = ticket;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <h1 style={{ textAlign: 'center', marginBottom: 24 }}>🎟️ Your Ticket</h1>
          <div className="card" style={{
            border: `2px dashed ${ticket.status === 'Valid' ? 'var(--green)' : ticket.status === 'Used' ? 'var(--blue)' : 'var(--red)'}`,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span className={`badge ${ticket.status === 'Valid' ? 'badge-green' : ticket.status === 'Used' ? 'badge-blue' : 'badge-red'}`}
                style={{ fontSize: '0.85rem', padding: '5px 14px' }}>
                {ticket.status === 'Valid' ? '✅ Valid' : ticket.status === 'Used' ? '🔵 Used' : '❌ Cancelled'}
              </span>
              <h2 style={{ marginTop: 14 }}>{booking?.show?.movie?.title}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20, fontSize: '0.85rem' }}>
              {[
                ['🏢', 'Theatre', booking?.show?.theatre?.name],
                ['📽️', 'Screen', booking?.show?.screen?.name],
                ['📅', 'Date', new Date(booking?.show?.showDate).toLocaleDateString('en-IN')],
                ['⏰', 'Time', booking?.show?.startTime],
                ['💺', 'Seats', booking?.seats?.map(s => s.seatNo).join(', ')],
                ['🎫', 'Booking ID', booking?.bookingId],
              ].map(([icon, label, value]) => (
                <div key={label}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.73rem', marginBottom: 2 }}>{icon} {label}</p>
                  <p style={{ fontWeight: 600 }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: 10, maxWidth: 200, margin: '0 auto' }}>
              <img src={ticket.qrCode} alt="QR" style={{ width: '100%' }} />
              <p style={{ color: '#333', fontSize: '0.68rem', marginTop: 6, fontFamily: 'monospace' }}>
                {ticket.ticketNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TicketViewPage;
