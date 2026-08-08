import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI } from '../../services/apiServices';
import Navbar from '../../components/common/Navbar';

const GENRES = ['All', 'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Horror', 'Biography', 'Animation'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];
const STATUSES = ['All', 'Now Showing', 'Coming Soon'];

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [status, setStatus] = useState('Now Showing');

  useEffect(() => {
    fetchMovies();
  }, [search, genre, status]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (genre !== 'All') params.genre = genre;
      if (status !== 'All') params.status = status;
      const { data } = await movieAPI.getAll(params);
      setMovies(data.data || []);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const nowShowing = movies.filter(m => m.status === 'Now Showing');
  const comingSoon = movies.filter(m => m.status === 'Coming Soon');

  return (
    <>
      <Navbar />
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0b0f 0%, #111318 40%, rgba(229,160,23,0.06) 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', borderRadius: 99,
            background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
            fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600,
            marginBottom: 20, letterSpacing: '0.05em'
          }}>
            🎬 THE CINEMATIC EXPERIENCE
          </div>
          <h1 style={{ marginBottom: 16, lineHeight: 1.2 }}>
            Book Your Perfect{' '}
            <span style={{ background: 'linear-gradient(135deg, #e5a017, #f5b52a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Movie Night
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 32, lineHeight: 1.7 }}>
            Premium seats, blockbuster movies, and unforgettable experiences.
            Reserve your seats in seconds.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/movies" className="btn btn-primary btn-lg">🍿 Browse Movies</Link>
            <Link to="/register" className="btn btn-ghost btn-lg">Create Account</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Filters */}
        <div className="filter-bar" style={{ marginBottom: 32 }}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input className="form-input search-input" placeholder="Search movies..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto' }}
            value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }}
            value={genre} onChange={e => setGenre(e.target.value)}>
            {GENRES.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Loading movies...</span></div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <p className="empty-state-text">No movies found matching your filters</p>
          </div>
        ) : (
          <>
            {nowShowing.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <h2 className="section-title">🔥 Now Showing</h2>
                <div className="movie-grid">
                  {nowShowing.map(movie => <MovieCard key={movie._id} movie={movie} />)}
                </div>
              </section>
            )}
            {comingSoon.length > 0 && (
              <section>
                <h2 className="section-title">📅 Coming Soon</h2>
                <div className="movie-grid">
                  {comingSoon.map(movie => <MovieCard key={movie._id} movie={movie} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        marginTop: 40
      }}>
        🎬 CineMax Multiplex Management System &nbsp;|&nbsp; © 2026 Group-13
      </footer>
    </>
  );
};

const MovieCard = ({ movie }) => (
  <Link to={`/movies/${movie._id}`} className="movie-card">
    <img className="movie-card-img" src={movie.poster}
      alt={movie.title}
      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80'; }} />
    <div className="movie-card-body">
      <div className="movie-card-title">{movie.title}</div>
      <div className="movie-card-meta">
        <span className={`badge ${movie.status === 'Now Showing' ? 'badge-green' : 'badge-blue'}`} style={{ marginBottom: 4 }}>
          {movie.status}
        </span>
      </div>
      <div className="movie-card-meta" style={{ marginTop: 6 }}>
        <span>🌐 {movie.language}</span>
        <span>⏱ {movie.duration}m</span>
        <span>⭐ {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'N/A'}</span>
      </div>
    </div>
  </Link>
);

export default HomePage;
