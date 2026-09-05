import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showAPI, bookingAPI, snackAPI, couponAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const STEP = { SEATS: 1, FOOD: 2, CHECKOUT: 3 };

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(STEP.SEATS);
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [cart, setCart] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Real-time seat locks
  const [realtimeLocks, setRealtimeLocks] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    Promise.all([
      showAPI.getById(showId),
      snackAPI.getAll({ available: 'true' })
    ]).then(([showRes, snackRes]) => {
      setShow(showRes.data.data);
      setSnacks(snackRes.data.data || []);
    }).catch(() => toast.error('Failed to load show')).finally(() => setLoading(false));
  }, [showId]);

  // Connect Socket.io for Real-time Seat Locking
  useEffect(() => {
    const getSocketUrl = () => {
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      if (envUrl && envUrl.startsWith('http')) {
        return envUrl.replace(/\/api\/?$/, '');
      }
      return window.location.protocol + '//' + window.location.hostname + ':5000';
    };

    const socketUrl = getSocketUrl();
    const s = io(socketUrl, { autoConnect: true, transports: ['websocket', 'polling'] });

    s.emit('join_show', { showId, userId: user?.id || 'guest' });

    s.on('seat_locks_updated', (locksMap) => {
      setRealtimeLocks(locksMap || {});
    });

    s.on('seat_lock_failed', ({ seatNo, message }) => {
      toast.error(message || 'Seat already locked');
      setSelectedSeats(prev => prev.filter(st => st.seatNo !== seatNo));
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [showId, user?.id]);

  const toggleSeat = (seat) => {
    if (show.bookedSeats.includes(seat.seatNo)) return;

    // Check if seat locked by someone else
    const lockInfo = realtimeLocks[seat.seatNo];
    if (lockInfo && lockInfo.userId !== (user?.id || 'guest') && lockInfo.socketId !== socket?.id) {
      toast.error(`Seat ${seat.seatNo} is locked by another user`);
      return;
    }

    const isAlreadySelected = selectedSeats.some(s => s.seatNo === seat.seatNo);
    if (isAlreadySelected) {
      setSelectedSeats(prev => prev.filter(s => s.seatNo !== seat.seatNo));
      if (socket) {
        socket.emit('unlock_seat', { showId, seatNo: seat.seatNo });
      }
    } else {
      setSelectedSeats(prev => [...prev, seat]);
      if (socket) {
        socket.emit('lock_seat', { showId, seatNo: seat.seatNo, userId: user?.id || 'guest' });
      }
    }
  };

  const getSeatPrice = (seat) => Math.round((show?.ticketPrice || 0) * seat.priceMultiplier);

  const ticketTotal = selectedSeats.reduce((sum, s) => sum + getSeatPrice(s), 0);
  const foodTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const snack = snacks.find(s => s._id === id);
    return sum + (snack ? snack.price * qty : 0);
  }, 0);
  const grandTotal = Math.max(0, ticketTotal + foodTotal - couponDiscount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponAPI.validate({ code: couponCode, bookingAmount: ticketTotal + foodTotal });
      setCouponDiscount(data.data.discountAmount || 0);
      toast.success(`Coupon applied! ₹${data.data.discountAmount} discount 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
    } finally { setCouponLoading(false); }
  };

  const handleCreateBooking = async () => {
    setBookingLoading(true);
    try {
      // Lock seats in backend DB
      await showAPI.lockSeats(showId, selectedSeats.map(s => s.seatNo));

      // Create booking
      const seats = selectedSeats.map(s => ({ seatNo: s.seatNo }));
      const { data } = await bookingAPI.create({
        showId,
        seats,
        foodOrderAmount: foodTotal,
        couponCode: couponCode || undefined
      });

      setBooking(data.data);
      setStep(STEP.CHECKOUT);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBookingLoading(false); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Loading show...</p></div>;
  if (!show) return <div className="empty-state"><p>Show not found</p></div>;

  const seatLayout = show.screen?.seatLayout || [];
  const rows = [...new Set(seatLayout.map(s => s.row))];

  return (
    <div className="container" style={{ padding: '28px 24px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        {[{ n: 1, label: '💺 Select Seats' }, { n: 2, label: '🍿 Food & Drinks' }, { n: 3, label: '💳 Checkout' }].map(s => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              padding: '6px 16px', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600,
              background: step >= s.n ? 'linear-gradient(135deg, var(--accent), #f5a623)' : 'var(--bg-elevated)',
              color: step >= s.n ? '#0a0b0f' : 'var(--text-muted)',
            }}>{s.label}</div>
            {s.n < 3 && <span style={{ color: 'var(--text-muted)' }}>›</span>}
          </div>
        ))}
      </div>

      {/* Show Info */}
      <div className="card" style={{ marginBottom: 24, padding: '14px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>🎬 {show.movie?.title}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              🏢 {show.theatre?.name} &nbsp;·&nbsp; 📽️ {show.screen?.name} &nbsp;·&nbsp;
              ⏰ {show.startTime} - {show.endTime} &nbsp;·&nbsp;
              📅 {new Date(show.showDate).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ color: 'var(--accent)', fontWeight: 700 }}>Base: ₹{show.ticketPrice}</p>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>⚡ Real-Time Live Sync</span>
          </div>
        </div>
      </div>

      {/* STEP 1: SEAT SELECTION */}
      {step === STEP.SEATS && (
        <div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--border)' }}>
            <div className="screen-curve" />
            <p className="screen-label">— SCREEN —</p>

            <div className="seat-grid-wrapper">
              {rows.map(row => {
                const rowSeats = seatLayout.filter(s => s.row === row);
                return (
                  <div key={row} className="seat-row">
                    <span className="seat-row-label">{row}</span>
                    {rowSeats.map(seat => {
                      const isBooked = show.bookedSeats.includes(seat.seatNo);
                      const isSelected = selectedSeats.some(s => s.seatNo === seat.seatNo);
                      const lockInfo = realtimeLocks[seat.seatNo];
                      const isLockedByOther = lockInfo && lockInfo.userId !== (user?.id || 'guest') && lockInfo.socketId !== socket?.id;

                      let cls = `seat seat-available ${seat.type}`;
                      if (isBooked) cls = 'seat seat-booked';
                      else if (isLockedByOther) cls = 'seat seat-locked';
                      else if (isSelected) cls = `seat seat-selected`;

                      return (
                        <div key={seat.seatNo} className={cls}
                          style={isLockedByOther ? { background: '#f59e0b', color: '#000', cursor: 'not-allowed', opacity: 0.8 } : {}}
                          title={isLockedByOther ? `${seat.seatNo} - Locked by another user` : `${seat.seatNo} - ${seat.type} - ₹${getSeatPrice(seat)}`}
                          onClick={() => toggleSeat(seat)}>
                          {seat.number}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="seat-legend">
              {[
                { cls: 'seat seat-available Standard', label: 'Standard' },
                { cls: 'seat seat-available Premium', label: 'Premium' },
                { cls: 'seat seat-available VIP', label: 'VIP' },
                { cls: 'seat seat-selected', label: 'Selected' },
                { cls: 'seat seat-locked', label: 'Locked (Other User)', style: { background: '#f59e0b', color: '#000' } },
                { cls: 'seat seat-booked', label: 'Booked' },
              ].map(l => (
                <div key={l.label} className="legend-item">
                  <div className={l.cls} style={{ width: 18, height: 16, borderRadius: 3, cursor: 'default', ...(l.style || {}) }} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary bar */}
          <div className="card" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 600 }}>
                {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected
                {selectedSeats.length > 0 && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.85rem' }}>
                    ({selectedSeats.map(s => s.seatNo).join(', ')})
                  </span>
                )}
              </p>
              <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem', marginTop: 4 }}>
                Total: ₹{ticketTotal}
              </p>
            </div>
            <button className="btn btn-primary btn-lg"
              onClick={() => setStep(STEP.FOOD)}
              disabled={selectedSeats.length === 0}>
              Next: Food & Drinks 🍿 →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: FOOD */}
      {step === STEP.FOOD && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>🍿 Add Food & Drinks <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>(Optional)</span></h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
              {snacks.map(snack => {
                const qty = cart[snack._id] || 0;
                return (
                  <div key={snack._id} className="card" style={{ padding: 14 }}>
                    <img src={snack.image} alt={snack.name}
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}
                      onError={e => { e.target.style.display = 'none'; }} />
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{snack.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>{snack.category}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{snack.price}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setCart(p => ({ ...p, [snack._id]: Math.max(0, (p[snack._id] || 0) - 1) }))}>−</button>
                        <span style={{ minWidth: 16, textAlign: 'center' }}>{qty}</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => setCart(p => ({ ...p, [snack._id]: (p[snack._id] || 0) + 1 }))}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p>Food Total: <strong style={{ color: 'var(--accent)' }}>₹{foodTotal}</strong></p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setStep(STEP.SEATS)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(STEP.CHECKOUT)}>
                Proceed to Checkout 💳
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CHECKOUT */}
      {step === STEP.CHECKOUT && !booking && (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 20 }}>🧾 Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tickets ({selectedSeats.length})</span>
                <span>₹{ticketTotal}</span>
              </div>
              {foodTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Food & Drinks</span>
                  <span>₹{foodTotal}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)' }}>
                  <span>Coupon Discount</span>
                  <span>−₹{couponDiscount}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--accent)' }}>₹{grandTotal}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
              <label className="form-label">Apply Promo / Coupon Code</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="e.g. WELCOME100"
                  value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} />
                <button className="btn btn-ghost" onClick={applyCoupon} disabled={couponLoading}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>Try: <strong>WELCOME100</strong> or <strong>BLOCKBUSTER20</strong></p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(STEP.FOOD)}>← Back</button>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
              onClick={handleCreateBooking} disabled={bookingLoading}>
              {bookingLoading ? '⏳ Confirming Booking...' : `Confirm & Pay ₹${grandTotal} 💳`}
            </button>
          </div>
        </div>
      )}

      {/* Redirect to payment once booking created */}
      {booking && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ marginBottom: 8 }}>Booking Created!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Complete payment to confirm your seats.</p>
          <button className="btn btn-primary btn-lg"
            onClick={() => navigate(`/payment/${booking._id}`)}>
            💳 Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default SeatSelectionPage;
