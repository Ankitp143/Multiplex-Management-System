import { useState, useEffect } from 'react';
import { movieAPI } from '../../services/apiServices';
import { AdminSidebar } from '../../components/common/Sidebar';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', description: '', genre: '', language: 'English', duration: 120,
  releaseDate: '', certificate: 'U', status: 'Coming Soon', poster: '', trailer: ''
};

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    try {
      const { data } = await movieAPI.getAll(search ? { search } : {});
      setMovies(data.data || []);
    } catch { toast.error('Failed to load movies'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (m) => {
    setEditing(m._id);
    setForm({ ...m, releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await movieAPI.update(editing, form); toast.success('Movie updated!'); }
      else { await movieAPI.create(form); toast.success('Movie added!'); }
      setShowModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await movieAPI.delete(id); toast.success('Movie deleted'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const fieldChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">🎬 Movies</h1>
            <p className="page-subtitle">Manage movie catalogue</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Movie</button>
        </div>

        <div className="filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input className="form-input search-input" placeholder="Search movies..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="loading-page"><div className="spinner"/></div> : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Genre</th>
                    <th>Language</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No movies found</td></tr>
                  )}
                  {movies.map(m => (
                    <tr key={m._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={m.poster} alt={m.title}
                            style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4 }}
                            onError={e => { e.target.style.display = 'none'; }} />
                          <span style={{ fontWeight: 600 }}>{m.title}</span>
                        </div>
                      </td>
                      <td>{m.genre}</td>
                      <td>{m.language}</td>
                      <td>{m.duration} min</td>
                      <td>
                        <span className={`badge ${m.status === 'Now Showing' ? 'badge-green' : m.status === 'Coming Soon' ? 'badge-blue' : 'badge-gray'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td>⭐ {m.averageRating > 0 ? m.averageRating.toFixed(1) : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id, m.title)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal" style={{ maxWidth: 580 }}>
              <div className="modal-header">
                <h3 className="modal-title">{editing ? '✏️ Edit Movie' : '+ Add Movie'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Title *</label>
                    <input className="form-input" name="title" value={form.title} onChange={fieldChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Genre *</label>
                    <select className="form-select" name="genre" value={form.genre} onChange={fieldChange} required>
                      <option value="">Select genre</option>
                      {['Action','Drama','Comedy','Sci-Fi','Horror','Romance','Biography','Animation','Thriller'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select className="form-select" name="language" value={form.language} onChange={fieldChange}>
                      {['English','Hindi','Tamil','Telugu','Kannada','Malayalam'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (min)</label>
                    <input className="form-input" type="number" name="duration" value={form.duration} onChange={fieldChange} min={30} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certificate</label>
                    <select className="form-select" name="certificate" value={form.certificate} onChange={fieldChange}>
                      {['U','UA','A','S'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Release Date</label>
                    <input className="form-input" type="date" name="releaseDate" value={form.releaseDate} onChange={fieldChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="status" value={form.status} onChange={fieldChange}>
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Now Showing">Now Showing</option>
                      <option value="Ended">Ended</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Poster URL</label>
                    <input className="form-input" name="poster" value={form.poster} onChange={fieldChange} placeholder="https://..." />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Trailer URL</label>
                    <input className="form-input" name="trailer" value={form.trailer} onChange={fieldChange} placeholder="https://youtube.com/..." />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" name="description" value={form.description} onChange={fieldChange} rows={3} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editing ? '💾 Save Changes' : '+ Create Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMoviesPage;
