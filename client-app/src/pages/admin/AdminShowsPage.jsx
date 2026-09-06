import { useState, useEffect } from 'react';
import { showAPI, movieAPI, theatreAPI, screenAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const EMPTY_SHOW = {
  movieId: '', theatreId: '', screenId: '', showDate: '', startTime: '14:00', endTime: '17:00', ticketPrice: 300
};

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_SHOW);
  const [saving, setSaving] = useState(false);

  const fetchInitial = async () => {
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        showAPI.getAll(),
        movieAPI.getAll(),
        theatreAPI.getAll()
      ]);
      setShows(showsRes.data.data || []);
      setMovies(moviesRes.data.data || []);
      setTheatres(theatresRes.data.data || []);
    } catch {
      toast.error('Failed to load shows data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleTheatreChange = async (tId) => {
    setForm(p => ({ ...p, theatreId: tId, screenId: '' }));
    if (!tId) { setScreens([]); return; }
    try {
      const { data } = await screenAPI.getByTheatre(tId);
      const fetchedScreens = data.data || [];
      setScreens(fetchedScreens);
      if (fetchedScreens.length > 0) {
        setForm(p => ({ ...p, theatreId: tId, screenId: fetchedScreens[0]._id }));
      }
    } catch {
      setScreens([]);
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await showAPI.create(form);
      toast.success('Show scheduled successfully!');
      setShowModal(false);
      const { data } = await showAPI.getAll();
      setShows(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule show');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Cancel and delete this show?')) return;
    try {
      await showAPI.delete(id);
      toast.success('Show deleted');
      setShows(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">🎟️ Show Scheduling</h1>
          <p className="page-subtitle">Schedule movie screenings across theatres and screens</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setForm(EMPTY_SHOW);
          setShowModal(true);
          if (theatres.length > 0) {
            handleTheatreChange(theatres[0]._id);
          }
        }}>
          ➕ Schedule New Show
        </button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading shows...</span></div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>All Scheduled Shows ({shows.length})</h3>
          {shows.length === 0 ? (
            <div className="empty-state"><p>No shows scheduled yet.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Theatre</th>
                    <th>Screen</th>
                    <th>Date & Time</th>
                    <th>Price</th>
                    <th>Booked Seats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shows.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600 }}>🎬 {s.movie?.title}</td>
                      <td>🏢 {s.theatre?.name}</td>
                      <td>📽️ {s.screen?.name} ({s.screen?.screenType})</td>
                      <td>
                        📅 {new Date(s.showDate).toLocaleDateString('en-IN')}<br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏰ {s.startTime} - {s.endTime}</span>
                      </td>
                      <td style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{s.ticketPrice}</td>
                      <td>{s.bookedSeats?.length || 0} / {s.screen?.seatingCapacity || 48}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteShow(s._id)}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 480 }}>
            <h3 style={{ marginBottom: 16 }}>Schedule New Show</h3>
            <form onSubmit={handleCreateShow} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Select Movie</label>
                <select className="form-select" value={form.movieId}
                  onChange={e => setForm(p => ({ ...p, movieId: e.target.value }))} required>
                  <option value="">-- Select Movie --</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title} ({m.language})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Theatre</label>
                <select className="form-select" value={form.theatreId}
                  onChange={e => handleTheatreChange(e.target.value)} required>
                  <option value="">-- Select Theatre --</option>
                  {theatres.map(t => <option key={t._id} value={t._id}>{t.name} ({t.city})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Screen</label>
                <select className="form-select" value={form.screenId}
                  onChange={e => setForm(p => ({ ...p, screenId: e.target.value }))}
                  disabled={!form.theatreId} required>
                  <option value="">-- Select Screen --</option>
                  {screens.map(sc => <option key={sc._id} value={sc._id}>{sc.name} ({sc.screenType})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Show Date</label>
                <input className="form-input" type="date" value={form.showDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, showDate: e.target.value }))} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time" value={form.startTime}
                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="time" value={form.endTime}
                    onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Base Price (₹)</label>
                <input className="form-input" type="number" min={50} value={form.ticketPrice}
                  onChange={e => setForm(p => ({ ...p, ticketPrice: +e.target.value }))} required />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Scheduling...' : 'Schedule Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;
