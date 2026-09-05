import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieAPI, reviewAPI, showAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const MovieDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    Promise.all([
      movieAPI.getById(id),
      reviewAPI.getByMovie(id),
    ]).then(([movieRes, reviewsRes]) => {
      setMovie(movieRes.data.data);
      setReviews(reviewsRes.data.data || []);
    }).catch(() => toast.error('Failed to load movie')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (movie && selectedDate) {
      showAPI.getAll({ movieId: movie._id, showDate: selectedDate })
        .then(r => setShows(r.data.data || []))
        .catch(() => setShows([]));
    } else if (movie) {
      showAPI.getAll({ movieId: movie._id })
        .then(r => setShows(r.data.data || []))
        .catch(() => setShows([]));
    }
  }, [movie, selectedDate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await reviewAPI.add({ movieId: id, ...reviewForm });
      toast.success('Review added!');
      const res = await reviewAPI.getByMovie(id);
      setReviews(res.data.data || []);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <><Navbar /><div className="loading-page"><div className="spinner" /><p>Loading...</p></div></>;
  if (!movie) return <><Navbar /><div className="empty-state"><p>Movie not found</p></div></>;

  return (
    <>
      <Navbar />
      {/* Movie Hero Banner */}
      <div style={{
        background: `linear-gradient(to bottom, rgba(10,11,15,0.5), rgba(10,11,15,1)), url(${movie.poster}) center/cover`,
        minHeight: 360, display: 'flex', alignItems: 'flex-end', padding: '0 24px 32px'
      }}>
        <div className="container" style={{ display: 'flex', gap: 32, alignItems: 'flex-end', padding: 0 }}>
          <img src={movie.poster} alt={movie.title}
            style={{ width: 140, borderRadius: 12, boxShadow: 'var(--shadow-lg)', flexShrink: 0 }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80'; }} />
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2.4rem)', marginBottom: 8 }}>{movie.title}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className="badge badge-gold">{movie.certificate}</span>
              <span className={`badge ${movie.status === 'Now Showing' ? 'badge-green' : 'badge-blue'}`}>{movie.status}</span>
              <span className="badge badge-gray">{movie.language}</span>
              <span className="badge badge-gray">⏱ {movie.duration} min</span>
              <span className="badge badge-gold">⭐ {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'N/A'} ({movie.numReviews} reviews)</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>{movie.description}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
              Genre: {movie.genre} &nbsp;|&nbsp; Release: {new Date(movie.releaseDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>
          <div>
            {/* Shows */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="page-header" style={{ marginBottom: 16 }}>
                <h2 className="section-title" style={{ margin: 0 }}>🎟️ Book Tickets</h2>
                <input type="date" className="form-input" style={{ width: 'auto' }}
                  value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              {shows.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-state-icon">🎭</div>
                  <p>No shows available for this selection</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {shows.map(show => (
                    <div key={show._id} className="card" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', flexWrap: 'wrap', gap: 12, cursor: 'default'
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: 4 }}>
                          🏢 {show.theatre?.name} &nbsp;·&nbsp; 📽️ {show.screen?.name}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          📅 {new Date(show.showDate).toLocaleDateString('en-IN')} &nbsp;
                          ⏰ {show.startTime} - {show.endTime} &nbsp;
                          📍 {show.theatre?.city}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>
                          ₹{show.ticketPrice}
                        </p>
                        <button className="btn btn-primary btn-sm"
                          onClick={() => {
                            if (!isAuthenticated) { toast.error('Please login to book'); navigate('/login'); return; }
                            navigate(`/select-seats/${show._id}`);
                          }}>
                          Select Seats
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="card">
              <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⭐ Reviews <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({reviews.length})</span>
              </h3>

              {isAuthenticated && user?.role === 'customer' && (
                <form onSubmit={handleReviewSubmit} style={{
                  background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, marginBottom: 20,
                  display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid var(--border)'
                }}>
                  <p style={{ fontWeight: 600 }}>Write Your Review</p>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <select className="form-select" style={{ width: 'auto' }} value={reviewForm.rating}
                      onChange={e => setReviewForm(p => ({ ...p, rating: +e.target.value }))}>
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)} ({r}/5)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea className="form-input" rows={3} placeholder="Share your thoughts..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : '📝 Submit Review'}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
              ) : reviews.map(r => (
                <div key={r._id} style={{
                  borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{r.user?.firstName} {r.user?.lastName}</span>
                    <span style={{ color: 'var(--accent)' }}>{'⭐'.repeat(r.rating)}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.comment}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Side Info */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Movie Details
              </h4>
              {[
                ['🎭', 'Genre', movie.genre],
                ['🌐', 'Language', movie.language],
                ['⏱', 'Duration', `${movie.duration} min`],
                ['📅', 'Release', new Date(movie.releaseDate).toLocaleDateString('en-IN')],
                ['🏷️', 'Certificate', movie.certificate],
              ].map(([icon, label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{icon} {label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            {movie.trailer && (
              <a href={movie.trailer} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
                ▶️ Watch Trailer
              </a>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MovieDetailPage;
