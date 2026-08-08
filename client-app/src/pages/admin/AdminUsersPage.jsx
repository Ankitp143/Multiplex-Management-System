import { useState, useEffect } from 'react';
import { authAPI } from '../../services/apiServices';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <h1 className="page-title">👥 User Management</h1>
        <p className="page-subtitle">Manage customer accounts, staff permissions, and admin access</p>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /><span>Loading users...</span></div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Registered Users ({users.length})</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                        value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}>
                        <option value="customer">Customer</option>
                        <option value="theatre_owner">Theatre Owner</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
                        value={u.accountStatus || 'Active'} onChange={e => handleStatusChange(u._id, e.target.value)}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
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
