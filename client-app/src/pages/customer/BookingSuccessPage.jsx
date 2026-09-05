import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ticketAPI, bookingAPI } from '../../services/apiServices';

const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getById(bookingId)
      .then(r => {
        setBooking(r.data.data);
        return ticketAPI.getByBooking(bookingId);
      })
      .then(r => setTicket(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;

  return (
    <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 16px',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(34,197,94,0.07) 0%, transparent 60%)'
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {/* Success Banner */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)', border: '2px solid var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 16px'
            }}>✅</div>
            <h1 style={{ color: 'var(--green)', marginBottom: 6 }}>Booking Confirmed!</h1>
            <p style={{ color: 'var(--text-muted)' }}>Your seats have been successfully reserved</p>
          </div>

          {/* Digital Ticket */}
          {ticket && booking && (
            <div className="card" style={{
              border: '2px dashed var(--border-accent)',
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(229,160,23,0.04) 100%)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  🎬 Digital Ticket
                </p>
                <h2 style={{ fontSize: '1.4rem' }}>{booking.show?.movie?.title}</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, fontSize: '0.85rem' }}>
                {[
                  ['🏢 Theatre', booking.show?.theatre?.name],
                  ['📽️ Screen', booking.show?.screen?.name],
                  ['📅 Date', new Date(booking.show?.showDate).toLocaleDateString('en-IN')],
                  ['⏰ Time', booking.show?.startTime],
                  ['💺 Seats', booking.seats?.map(s => s.seatNo).join(', ')],
                  ['🎫 Tickets', booking.noOfTickets],
                  ['💰 Paid', `₹${booking.finalAmount}`],
                  ['🎟️ Booking ID', booking.bookingId],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* QR Code */}
              {ticket.qrCode && (
                <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: 10, margin: '0 auto', maxWidth: 180 }}>
                  <img src={ticket.qrCode} alt="QR Code" style={{ width: '100%', display: 'block' }} />
                  <p style={{ color: '#333', fontSize: '0.7rem', marginTop: 6 }}>{ticket.ticketNumber}</p>
                </div>
              )}

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 16 }}>
                Show this QR code at the entrance for verification
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/customer/bookings" className="btn btn-secondary">📋 My Bookings</Link>
            <Link to="/movies" className="btn btn-primary">🎬 Browse More Movies</Link>
          </div>
        </div>
    </div>
  );
};

export default BookingSuccessPage;
