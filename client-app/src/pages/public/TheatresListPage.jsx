import { useState, useEffect } from 'react';
import { theatreAPI } from '../../services/apiServices';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const TheatresListPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTheatres();
  }, [search]);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const params = search ? { city: search } : {};
      const { data } = await theatreAPI.getAll(params);
      setTheatres(data.data || []);
    } catch {
      setTheatres([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 24px' }}>
        <div className="page-header" style={{ marginBottom: 28 }}>
          <h1 className="page-title">🏢 Multiplex Theatres</h1>
          <p className="page-subtitle">Find premium cinema halls and screen formats near you</p>
        </div>

        {/* Filter */}
        <div className="filter-bar" style={{ marginBottom: 32, maxWidth: 500 }}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input className="form-input search-input" placeholder="Search by city..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Loading theatres...</span></div>
        ) : theatres.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <p className="empty-state-text">No theatres found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {theatres.map(t => (
              <div key={t._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>🏢 {t.name}</h3>
                  <span className="badge badge-gold">📍 {t.city}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  📍 {t.address}
                </p>
                <div style={{
                  display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 'auto'
                }}>
                  <span>📞 {t.phone || 'N/A'}</span>
                  <span>📽️ {t.totalScreens} Screens</span>
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

export default TheatresListPage;
