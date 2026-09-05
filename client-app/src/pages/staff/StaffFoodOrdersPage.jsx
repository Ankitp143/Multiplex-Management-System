import { useState, useEffect } from 'react';
import { foodOrderAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: { bg: 'rgba(229,160,23,0.12)', border: 'rgba(229,160,23,0.4)', text: '#e5a017' },
  Preparing: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', text: '#3b82f6' },
  Ready: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#10b981' },
  Delivered: { bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.4)', text: '#9ca3af' },
};

const StaffFoodOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await foodOrderAPI.getAllOrders();
      setOrders(data.data || []);
    } catch {
      toast.error('Failed to load food orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await foodOrderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">🍿 Food & Snack Orders</h1>
          <p className="page-subtitle">Manage and fulfil customer food orders for the current shows</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'Pending', 'Preparing', 'Ready', 'Delivered'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{
              padding: '7px 16px', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              border: '1px solid', transition: 'all 0.2s ease',
              background: filterStatus === s
                ? (STATUS_COLORS[s]?.bg || 'rgba(229,160,23,0.12)')
                : 'var(--bg-elevated)',
              borderColor: filterStatus === s
                ? (STATUS_COLORS[s]?.border || 'rgba(229,160,23,0.4)')
                : 'var(--border)',
              color: filterStatus === s
                ? (STATUS_COLORS[s]?.text || 'var(--accent)')
                : 'var(--text-secondary)',
            }}>
            {s === 'all' ? 'All Orders' : s}
            {' '}({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
          </button>
        ))}
        <button onClick={fetchOrders} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading orders...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍿</div>
          <p className="empty-state-text">No {filterStatus !== 'all' ? filterStatus.toLowerCase() : ''} food orders at the moment</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(order => {
            const colors = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
            const nextStatus = { Pending: 'Preparing', Preparing: 'Ready', Ready: 'Delivered' }[order.status];
            return (
              <div key={order._id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600,
                        background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text
                      }}>{order.status}</span>
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                      {(order.items || []).map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          <span>🍿 {item.snack?.name || 'Item'}</span>
                          <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      🎫 Booking: {order.booking?.bookingId || order.booking?._id?.slice(-6)} &nbsp;·&nbsp;
                      👤 {order.user?.firstName} {order.user?.lastName} &nbsp;·&nbsp;
                      🕐 {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>
                      ₹{order.totalAmount}
                    </p>
                    {nextStatus && order.status !== 'Delivered' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusUpdate(order._id, nextStatus)}
                        disabled={updatingId === order._id}
                        style={{ fontSize: '0.82rem' }}
                      >
                        {updatingId === order._id ? '⏳...' : `→ Mark ${nextStatus}`}
                      </button>
                    )}
                    {order.status === 'Delivered' && (
                      <span style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600 }}>✅ Delivered</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffFoodOrdersPage;
