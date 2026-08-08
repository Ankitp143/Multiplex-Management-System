import { useState, useEffect } from 'react';
import { couponAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const EMPTY_COUPON = {
  code: '', discountAmount: 100, minBookingAmount: 300, validUntil: '2028-12-31', isActive: true
};

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { data } = await couponAPI.getAll();
      setCoupons(data.data || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAdd = () => {
    setEditingCoupon(null);
    setForm(EMPTY_COUPON);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingCoupon(c._id);
    setForm({ ...c, validUntil: c.validUntil ? c.validUntil.split('T')[0] : '2028-12-31' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCoupon) {
        await couponAPI.update(editingCoupon, form);
        toast.success('Coupon updated!');
      } else {
        await couponAPI.create(form);
        toast.success('Coupon created!');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await couponAPI.delete(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">🏷️ Coupon Management</h1>
          <p className="page-subtitle">Create and manage promo codes and discount vouchers</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Create Coupon</button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading coupons...</span></div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Active Discounts ({coupons.length})</h3>
          {coupons.length === 0 ? (
            <div className="empty-state"><p>No discount coupons available.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Min Spend</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        🏷️ {c.code}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--green)' }}>
                        {c.discountAmount ? `₹${c.discountAmount} OFF` : `${c.discountPercentage}% OFF`}
                      </td>
                      <td>₹{c.minBookingAmount || 0}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(c.validUntil).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>
                          {c.isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} style={{ marginRight: 6 }}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.code)}>🗑️ Delete</button>
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
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <h3 style={{ marginBottom: 16 }}>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Coupon Code</label>
                <input className="form-input" value={form.code} style={{ textTransform: 'uppercase' }}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SAVE100" required />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Amount (₹)</label>
                <input className="form-input" type="number" min={1} value={form.discountAmount}
                  onChange={e => setForm(p => ({ ...p, discountAmount: +e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Min. Booking Amount (₹)</label>
                <input className="form-input" type="number" min={0} value={form.minBookingAmount}
                  onChange={e => setForm(p => ({ ...p, minBookingAmount: +e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Valid Until</label>
                <input className="form-input" type="date" value={form.validUntil}
                  onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
