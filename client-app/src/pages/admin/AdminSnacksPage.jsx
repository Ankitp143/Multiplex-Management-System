import { useState, useEffect } from 'react';
import { snackAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const EMPTY_SNACK = {
  name: '', category: 'Popcorn', price: 150, description: '', image: '', isAvailable: true
};

const AdminSnacksPage = () => {
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSnack, setEditingSnack] = useState(null);
  const [form, setForm] = useState(EMPTY_SNACK);
  const [saving, setSaving] = useState(false);

  const fetchSnacks = async () => {
    try {
      const { data } = await snackAPI.getAll();
      setSnacks(data.data || []);
    } catch {
      toast.error('Failed to load snacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnacks();
  }, []);

  const openAdd = () => {
    setEditingSnack(null);
    setForm(EMPTY_SNACK);
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingSnack(s._id);
    setForm({ ...s });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSnack) {
        await snackAPI.update(editingSnack, form);
        toast.success('Snack updated!');
      } else {
        await snackAPI.create(form);
        toast.success('Snack added!');
      }
      setShowModal(false);
      fetchSnacks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save snack');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete snack "${name}"?`)) return;
    try {
      await snackAPI.delete(id);
      toast.success('Snack deleted');
      fetchSnacks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">🍿 Food & Beverage Management</h1>
          <p className="page-subtitle">Manage popcorn, drinks, combos, and snack inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Snack Item</button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading snacks...</span></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {snacks.map(s => (
            <div key={s._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <img src={s.image || 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80'} alt={s.name}
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80'; }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{s.name}</h4>
                  <span className="badge badge-gold">₹{s.price}</span>
                </div>
                <span className="badge badge-gray" style={{ marginBottom: 8 }}>{s.category}</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>{s.description}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id, s.name)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <h3 style={{ marginBottom: 16 }}>{editingSnack ? 'Edit Snack Item' : 'Add Snack Item'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="Popcorn">🍿 Popcorn</option>
                  <option value="Beverage">🥤 Beverage</option>
                  <option value="Snacks">Nachos / Pizza / Snacks</option>
                  <option value="Combos">🍿 Combo Deals</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="form-input" type="number" min={10} value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" value={form.image} placeholder="https://..."
                  onChange={e => setForm(p => ({ ...p, image: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSnacksPage;
