import { useState, useEffect } from 'react';
import { theatreAPI, screenAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const EMPTY_THEATRE = { name: '', city: '', address: '', phone: '', totalScreens: 1 };
const EMPTY_SCREEN = { name: '', screenType: '2D', seatingCapacity: 48, rows: 6, cols: 8 };

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [theatreForm, setTheatreForm] = useState(EMPTY_THEATRE);
  const [screenForm, setScreenForm] = useState(EMPTY_SCREEN);
  const [screens, setScreens] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchTheatres = async () => {
    try {
      const { data } = await theatreAPI.getAll();
      setTheatres(data.data || []);
    } catch {
      toast.error('Failed to load theatres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const openAddTheatre = () => {
    setEditingTheatre(null);
    setTheatreForm(EMPTY_THEATRE);
    setShowTheatreModal(true);
  };

  const openEditTheatre = (t) => {
    setEditingTheatre(t._id);
    setTheatreForm({ name: t.name, city: t.city, address: t.address, phone: t.phone, totalScreens: t.totalScreens });
    setShowTheatreModal(true);
  };

  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTheatre) {
        await theatreAPI.update(editingTheatre, theatreForm);
        toast.success('Theatre updated successfully!');
      } else {
        await theatreAPI.create(theatreForm);
        toast.success('Theatre created successfully!');
      }
      setShowTheatreModal(false);
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save theatre');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheatre = async (id, name) => {
    if (!window.confirm(`Delete theatre "${name}"?`)) return;
    try {
      await theatreAPI.delete(id);
      toast.success('Theatre deleted');
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete theatre');
    }
  };

  const openManageScreens = async (t) => {
    setSelectedTheatre(t);
    try {
      const { data } = await screenAPI.getByTheatre(t._id);
      setScreens(data.data || []);
    } catch {
      setScreens([]);
    }
  };

  const handleAddScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheatre) return;
    setSaving(true);
    try {
      await screenAPI.create({ ...screenForm, theatreId: selectedTheatre._id });
      toast.success('Screen added!');
      setShowScreenModal(false);
      openManageScreens(selectedTheatre);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add screen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">🏢 Theatre & Screen Management</h1>
          <p className="page-subtitle">Add, edit, or manage multiplexes and auditorium screens</p>
        </div>
        <button className="btn btn-primary" onClick={openAddTheatre}>➕ Add New Theatre</button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading theatres...</span></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedTheatre ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Theatre list */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Multiplex Theatres ({theatres.length})</h3>
            {theatres.length === 0 ? (
              <div className="empty-state"><p>No theatres added yet.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {theatres.map(t => (
                  <div key={t._id} className="card" style={{
                    padding: 16,
                    border: selectedTheatre?._id === t._id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: selectedTheatre?._id === t._id ? 'var(--accent-dim)' : 'var(--bg-elevated)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>🏢 {t.name}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📍 {t.address}, {t.city}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
                          📞 {t.phone} &nbsp;·&nbsp; 📽️ {t.totalScreens} Screens
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openManageScreens(t)}>📽️ Screens</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditTheatre(t)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTheatre(t._id, t.name)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Screen list for selected theatre */}
          {selectedTheatre && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ marginBottom: 2 }}>📽️ Screens in {selectedTheatre.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Manage screens and seating layouts</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { setScreenForm(EMPTY_SCREEN); setShowScreenModal(true); }}>
                    ➕ Add Screen
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedTheatre(null)}>✕ Close</button>
                </div>
              </div>

              {screens.length === 0 ? (
                <div className="empty-state"><p>No screens added for this theatre.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {screens.map(s => (
                    <div key={s._id} className="card" style={{ padding: 14, background: 'var(--bg-elevated)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{s.name} <span className="badge badge-gold">{s.screenType}</span></p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                            Capacity: {s.seatingCapacity} seats ({s.rows} rows × {s.cols} cols)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Theatre Modal */}
      {showTheatreModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 460 }}>
            <h3 style={{ marginBottom: 16 }}>{editingTheatre ? 'Edit Theatre' : 'Add New Theatre'}</h3>
            <form onSubmit={handleSaveTheatre} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Theatre Name</label>
                <input className="form-input" name="name" value={theatreForm.name}
                  onChange={e => setTheatreForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" name="city" value={theatreForm.city}
                  onChange={e => setTheatreForm(p => ({ ...p, city: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Address</label>
                <input className="form-input" name="address" value={theatreForm.address}
                  onChange={e => setTheatreForm(p => ({ ...p, address: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" name="phone" value={theatreForm.phone}
                  onChange={e => setTheatreForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Total Screens</label>
                <input className="form-input" type="number" min={1} name="totalScreens" value={theatreForm.totalScreens}
                  onChange={e => setTheatreForm(p => ({ ...p, totalScreens: +e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowTheatreModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Theatre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {showScreenModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <h3 style={{ marginBottom: 16 }}>Add Screen to {selectedTheatre?.name}</h3>
            <form onSubmit={handleAddScreen} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Screen Name</label>
                <input className="form-input" value={screenForm.name}
                  onChange={e => setScreenForm(p => ({ ...p, name: e.target.value }))} placeholder="Audi 1 (IMAX)" required />
              </div>
              <div className="form-group">
                <label className="form-label">Screen Format</label>
                <select className="form-select" value={screenForm.screenType}
                  onChange={e => setScreenForm(p => ({ ...p, screenType: e.target.value }))}>
                  <option value="2D">2D Standard</option>
                  <option value="3D">3D RealD</option>
                  <option value="IMAX">IMAX 3D</option>
                  <option value="4DX">4DX Motion</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Rows</label>
                  <input className="form-input" type="number" min={2} max={15} value={screenForm.rows}
                    onChange={e => setScreenForm(p => ({ ...p, rows: +e.target.value, seatingCapacity: +e.target.value * screenForm.cols }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Columns</label>
                  <input className="form-input" type="number" min={2} max={20} value={screenForm.cols}
                    onChange={e => setScreenForm(p => ({ ...p, cols: +e.target.value, seatingCapacity: +e.target.value * screenForm.rows }))} required />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total Seating Capacity: <strong>{screenForm.rows * screenForm.cols} seats</strong>
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowScreenModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Screen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatresPage;
