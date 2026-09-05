import { useState, useEffect } from 'react';
import { authAPI } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  admin: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.4)', text: '#ec4899' },
  theatre_owner: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', text: '#3b82f6' },
  staff: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#10b981' },
  customer: { bg: 'rgba(229,160,23,0.12)', border: 'rgba(229,160,23,0.4)', text: '#e5a017' },
};

const RoleBadge = ({ role }) => {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.customer;
  const labels = { admin: '⚙️ Admin', theatre_owner: '🏢 Owner', staff: '🛂 Staff', customer: '🎫 Customer' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600,
      background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text
    }}>
      {labels[role] || role}
    </span>
  );
};

const AdminUsersPage = () => {
  const { user: currentUser, isOwner, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await authAPI.getAllUsers();
      setUsers(data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Role hierarchy:
  // Owner → can delete admin, staff, customer (anyone except themselves / another owner)
  // Admin → can only delete staff
  const canDelete = (targetUser) => {
    if (targetUser._id === currentUser?.id) return false; // Can't delete yourself
    if (isOwner) return targetUser.role !== 'theatre_owner'; // Owner removes anyone except owner
    if (isAdmin) return targetUser.role === 'staff';
    return false;
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authAPI.updateUser(userId, { role: newRole });
      toast.success('Role updated successfully');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await authAPI.updateUser(userId, { accountStatus: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, accountStatus: newStatus } : u));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (targetUser) => {
    const roleLabel = targetUser.role === 'theatre_owner' ? 'Theatre Owner' : targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1);
    if (!window.confirm(`Remove ${targetUser.firstName} ${targetUser.lastName} (${roleLabel}) from the system? This cannot be undone.`)) return;
    setDeletingId(targetUser._id);
    try {
      await authAPI.deleteUser(targetUser._id);
      toast.success(`${targetUser.firstName} has been removed`);
      setUsers(prev => prev.filter(u => u._id !== targetUser._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">👥 User Management</h1>
          <p className="page-subtitle">
            {isOwner ? 'Theatre Owner — you can remove Admin, Staff, and Customer accounts' : 'Admin — you can remove Staff accounts'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Users', count: users.length, color: '#e5a017', icon: '👥' },
          { label: 'Admins', count: roleCounts.admin || 0, color: '#ec4899', icon: '⚙️' },
          { label: 'Owners', count: roleCounts.theatre_owner || 0, color: '#3b82f6', icon: '🏢' },
          { label: 'Staff', count: roleCounts.staff || 0, color: '#10b981', icon: '🛂' },
          { label: 'Customers', count: roleCounts.customer || 0, color: '#e5a017', icon: '🎫' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '14px 16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ flex: '1 1 240px', minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input search-input" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="theatre_owner">Theatre Owner</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading users...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">No users found matching your filters</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Registered Users ({filtered.length})</h3>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: ROLE_COLORS[u.role]?.bg || 'var(--bg-elevated)',
                          border: `1px solid ${ROLE_COLORS[u.role]?.border || 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', fontWeight: 700, color: ROLE_COLORS[u.role]?.text || 'var(--text-primary)',
                          flexShrink: 0
                        }}>
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</div>
                          {u._id === currentUser?.id && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: 1 }}>● You</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>{u.email}</td>
                    <td style={{ fontSize: '0.88rem' }}>{u.phone || 'N/A'}</td>
                    <td>
                      {isAdmin && u.role !== 'admin' && u.role !== 'theatre_owner' && u._id !== currentUser?.id ? (
                        <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem' }}
                          value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}>
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <RoleBadge role={u.role} />
                      )}
                    </td>
                    <td>
                      {isAdmin && u.role !== 'theatre_owner' && u._id !== currentUser?.id ? (
                        <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.82rem' }}
                          value={u.accountStatus || 'Active'} onChange={e => handleStatusChange(u._id, e.target.value)}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600,
                          background: u.accountStatus === 'Active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          border: `1px solid ${u.accountStatus === 'Active' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                          color: u.accountStatus === 'Active' ? 'var(--green)' : 'var(--red)'
                        }}>
                          {u.accountStatus || 'Active'}
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {canDelete(u) ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u._id}
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                        >
                          {deletingId === u._id ? '⏳...' : '🗑️ Remove'}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {u._id === currentUser?.id ? '— You' : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
