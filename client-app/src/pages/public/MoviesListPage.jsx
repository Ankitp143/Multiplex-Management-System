import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI } from '../../services/apiServices';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const GENRES = ['All', 'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Horror', 'Biography', 'Animation'];
const STATUSES = ['All', 'Now Showing', 'Coming Soon'];

const MoviesListPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [status, setStatus] = useState('All');

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

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 24px' }}>
        <div className="page-header" style={{ marginBottom: 28 }}>
          <h1 className="page-title">🎬 All Movies</h1>
          <p className="page-subtitle">Browse latest releases and upcoming blockbusters</p>
        </div>

        {/* Filter bar */}
        <div className="filter-bar" style={{ marginBottom: 32 }}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input className="form-input search-input" placeholder="Search movies by title..."
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
          <div className="movie-grid">
            {movies.map(movie => (
              <div key={movie._id} className="movie-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <Link to={`/movie/${movie._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img className="movie-card-img" src={movie.poster} alt={movie.title}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80'; }} />
                </Link>
                <div className="movie-card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <Link to={`/movie/${movie._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="movie-card-title">{movie.title}</div>
                    </Link>
                    <div className="movie-card-meta">
                      <span className={`badge ${movie.status === 'Now Showing' ? 'badge-green' : 'badge-blue'}`}>
                        {movie.status}
                      </span>
                      <span className="badge badge-gold">⭐ {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : 'N/A'}</span>
                    </div>
                    <div className="movie-card-meta" style={{ marginTop: 6, marginBottom: 10 }}>
                      <span>🌐 {movie.language}</span>
                      <span>⏱ {movie.duration}m</span>
                    </div>
                  </div>
                  <Link to={`/movie/${movie._id}`} className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', marginTop: 8 }}>
                    🎟️ Book Tickets
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MoviesListPage;
