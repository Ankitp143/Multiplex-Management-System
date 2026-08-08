import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    paymentMode: 'Credit Card',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: ''
  });

  useEffect(() => {
    bookingAPI.getById(bookingId).then(r => setBooking(r.data.data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    setProcessing(true);
    try {
      const { data } = await paymentAPI.process({
        bookingId,
        paymentMode: form.paymentMode,
        accountNo: form.cardNumber || form.upiId || '0000'
      });
      toast.success('Payment Successful! Enjoy your movie 🎬');
      navigate(`/booking-success/${bookingId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <><Navbar /><div className="loading-page"><div className="spinner"/></div></>;
  if (!booking) return <><Navbar /><div className="empty-state"><p>Booking not found</p></div></>;

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 16px',
        background: 'radial-gradient(ellipse at 60% 50%, rgba(229,160,23,0.05) 0%, transparent 70%)'
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <h1 style={{ textAlign: 'center', marginBottom: 8 }}>💳 Complete Payment</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 28 }}>
            Your booking will be confirmed after successful payment
          </p>

          {/* Order Summary */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 14 }}>🧾 Booking Summary</h3>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>🎬 {booking.show?.movie?.title}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
              🏢 {booking.show?.theatre?.name} &nbsp;·&nbsp; ⏰ {booking.show?.startTime}
              &nbsp;·&nbsp; 📅 {new Date(booking.show?.showDate).toLocaleDateString('en-IN')}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              💺 Seats: {booking.seats?.map(s => s.seatNo).join(', ')}
            </p>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {booking.foodOrderAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Food & Drinks</span>
                  <span>₹{booking.foodOrderAmount}</span>
                </div>
              )}
              {booking.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.9rem', color: 'var(--green)' }}>
                  <span>Discount Applied</span>
                  <span>−₹{booking.discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--accent)' }}>₹{booking.finalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>🔒 Payment Details</h3>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={form.paymentMode}
                onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}>
                <option value="Credit Card">💳 Credit Card</option>
                <option value="Debit Card">💳 Debit Card</option>
                <option value="UPI">📱 UPI</option>
                <option value="Net Banking">🏦 Net Banking</option>
              </select>
            </div>

            {(form.paymentMode === 'Credit Card' || form.paymentMode === 'Debit Card') && (
              <>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Card Number</label>
                  <input className="form-input" placeholder="1234 5678 9012 3456"
                    value={form.cardNumber} onChange={e => setForm(p => ({ ...p, cardNumber: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input className="form-input" placeholder="12/28"
                      value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" type="password" placeholder="***"
                      value={form.cvv} onChange={e => setForm(p => ({ ...p, cvv: e.target.value }))} />
                  </div>
                </div>
              </>
            )}

            {form.paymentMode === 'UPI' && (
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">UPI ID</label>
                <input className="form-input" placeholder="yourname@upi"
                  value={form.upiId} onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))} />
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              🔒 This is a simulated payment. No real transaction will occur.
            </p>

            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={handlePay} disabled={processing}>
              {processing ? '⏳ Processing Payment...' : `Pay ₹${booking.finalAmount}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
