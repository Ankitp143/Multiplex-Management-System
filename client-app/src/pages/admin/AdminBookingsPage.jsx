import { useState, useEffect } from 'react';
import { bookingAPI, cancellationAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getAllBookings();
      setBookings(data.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 className="page-title">📋 Booking Management</h1>
        <p className="page-subtitle">View and monitor all customer ticket reservations across multiplexes</p>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading bookings...</span></div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>All System Bookings ({bookings.length})</h3>
          {bookings.length === 0 ? (
            <div className="empty-state"><p>No bookings found.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Movie & Show</th>
                    <th>Seats</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace' }}>
                        #{b.bookingId || b._id.substring(18)}
                      </td>
                      <td>
                        {b.user?.firstName} {b.user?.lastName}<br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</span>
                      </td>
                      <td>
                        🎬 {b.show?.movie?.title}<br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🏢 {b.show?.theatre?.name}</span>
                      </td>
                      <td>
                        {b.seats?.map(s => s.seatNo).join(', ')}
                        <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({b.seats?.length} seats)</span>
                      </td>
                      <td style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{b.finalAmount}</td>
                      <td>
                        <span className={`badge ${b.bookingStatus === 'Confirmed' ? 'badge-green' : b.bookingStatus === 'Cancelled' ? 'badge-red' : 'badge-gold'}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
