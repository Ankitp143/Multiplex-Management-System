import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, cancellationAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  const map = { Confirmed: 'badge-green', Pending: 'badge-gold', Cancelled: 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    bookingAPI.getUserBookings()
      .then(r => setBookings(r.data.data || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? 85% refund will be issued.')) return;
    setCancellingId(bookingId);
    try {
      await cancellationAPI.request({ bookingId, reason: 'Customer requested cancellation' });
      toast.success('Booking cancelled. Refund initiated.');
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: 'Cancelled' } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally { setCancellingId(null); }
  };

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">📋 My Bookings</h1>
            <p className="page-subtitle">All your ticket reservations</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"/></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎟️</div>
            <p className="empty-state-text">No bookings yet</p>
            <Link to="/movies" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Movies</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map(booking => (
              <div key={booking._id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem' }}>{booking.show?.movie?.title}</h3>
                      {statusBadge(booking.bookingStatus)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>🏢 {booking.show?.theatre?.name}</span>
                      <span>📽️ {booking.show?.screen?.name}</span>
                      <span>📅 {booking.show?.showDate ? new Date(booking.show.showDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                      <span>⏰ {booking.show?.startTime}</span>
                      <span>💺 {booking.seats?.map(s => s.seatNo).join(', ')}</span>
                      <span>🎫 {booking.noOfTickets} ticket{booking.noOfTickets !== 1 ? 's' : ''}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 8 }}>
                      Booking ID: {booking.bookingId} &nbsp;·&nbsp; Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.15rem', marginBottom: 10 }}>₹{booking.finalAmount}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {booking.bookingStatus === 'Confirmed' && (
                        <Link to={`/ticket/${booking._id}`} className="btn btn-secondary btn-sm">🎟️ View Ticket</Link>
                      )}
                      {booking.bookingStatus === 'Confirmed' && (
                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancellingId === booking._id}>
                          {cancellingId === booking._id ? '⏳...' : '❌ Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default BookingHistoryPage;
