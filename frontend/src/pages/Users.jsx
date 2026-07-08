import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdSearch } from 'react-icons/md';
import { MdLock as LockIcon, MdLockOpen as UnlockIcon, MdDelete as DeleteIcon, MdVisibility as ViewIcon } from 'react-icons/md';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // User detail modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { search } });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load user directories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const viewUserDetails = async (user) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/users/${user.id}`);
      if (res.data.success) {
        setSelectedUser(res.data.user);
        setUserOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading user details.', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleLock = async (user) => {
    const nextStatus = user.status === 'locked' ? 'active' : 'locked';
    try {
      const res = await api.put(`/users/${user.id}/status`, { status: nextStatus });
      if (res.data.success) {
        showToast(`User account successfully ${nextStatus === 'locked' ? 'locked' : 'unlocked'}.`, 'success');
        fetchUsers();
        if (selectedUser?.id === user.id) {
          setSelectedUser(prev => ({ ...prev, status: nextStatus }));
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update account lock state.', 'error');
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/users/${selectedUser.id}`);
      if (res.data.success) {
        showToast('User account deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to remove user account.', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Tier', 'Joined', 'Status'];
    const csvRows = [headers.join(',')];
    
    users.forEach(user => {
      const row = [
        user.id,
        `"${user.name || ''}"`,
        `"${user.email || ''}"`,
        `"${user.phone || ''}"`,
        user.membershipTier || 'Silver',
        user.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A',
        user.status || 'active'
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };

  const tableHeaders = [
    { label: 'User Details' },
    { label: 'Phone', width: '150px' },
    { label: 'Tier', width: '120px' },
    { label: 'Joined', width: '130px' },
    { label: 'Status', width: '100px' },
    { label: 'Actions', width: '150px', align: 'right' }
  ];

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="action-bar-container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <form onSubmit={handleSearchSubmit} className="search-bar-form" style={{ flexGrow: 1 }}>
          <div className="search-input-wrapper">
            <MdSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search user directories by name, email, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        <button className="btn btn-primary" onClick={handleExportCSV}>Export CSV</button>
      </div>

      <DataTable
        headers={tableHeaders}
        data={users}
        loading={loading}
        renderRow={(user) => (
          <tr key={user.id}>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt={user.name} className="table-avatar" />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '4px' }}>{user.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
              </div>
            </td>
            <td>{user.phone || 'N/A'}</td>
            <td>
              <span className="badge badge-info" style={{ textTransform: 'none' }}>
                {user.membershipTier || 'Silver'}
              </span>
            </td>
            <td>{user.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A'}</td>
            <td>
              <span className={`badge badge-${user.status === 'active' ? 'success' : 'danger'}`}>
                {user.status || 'active'}
              </span>
            </td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-primary" onClick={() => viewUserDetails(user)} title="View Details">
                  <ViewIcon />
                </button>
                <button 
                  className={`btn-icon ${user.status === 'locked' ? 'text-primary' : 'text-warning'}`} 
                  onClick={() => toggleLock(user)} 
                  title={user.status === 'locked' ? 'Unlock Account' : 'Lock Account'}
                >
                  {user.status === 'locked' ? <UnlockIcon /> : <LockIcon />}
                </button>
                <button className="btn-icon text-danger" onClick={() => openDeleteModal(user)} title="Delete User">
                  <DeleteIcon />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* User Details Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="User Profile Details">
        {loadingDetail ? (
          <div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
              <div className="skeleton skeleton-avatar" style={{ width: '64px', height: '64px' }} />
              <div style={{ flexGrow: 1 }}>
                <div className="skeleton skeleton-title" style={{ width: '40%' }} />
                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              </div>
            </div>
            <div className="skeleton" style={{ height: '150px', width: '100%' }} />
          </div>
        ) : (
          selectedUser && (
            <div className="user-details-box">
              <div className="user-header-profile">
                <img src={selectedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt="Avatar" className="details-avatar" />
                <div>
                  <h4>{selectedUser.name}</h4>
                  <p>Membership: <strong>{selectedUser.membershipTier || 'Silver'}</strong></p>
                  <p>Status: <span className={`badge badge-${selectedUser.status === 'active' ? 'success' : 'danger'}`} style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>{selectedUser.status}</span></p>
                </div>
              </div>

              <div className="user-info-section">
                <div className="grid-cols-2" style={{ gap: '15px' }}>
                  <div className="info-item">
                    <span>Email Address</span>
                    <strong>{selectedUser.email}</strong>
                  </div>
                  <div className="info-item">
                    <span>Phone Number</span>
                    <strong>{selectedUser.phone || 'N/A'}</strong>
                  </div>
                </div>
                
                <div className="info-item" style={{ marginTop: '10px' }}>
                  <span>Shipping Address</span>
                  <strong>{selectedUser.address || 'No shipping address registered.'}</strong>
                </div>

                <div className="info-item" style={{ marginTop: '10px' }}>
                  <span>Member Since</span>
                  <strong>{selectedUser.createdDate ? new Date(selectedUser.createdDate).toLocaleString() : 'N/A'}</strong>
                </div>
              </div>

              <div className="user-orders-section">
                <h5>Order History ({userOrders.length})</h5>
                {userOrders.length === 0 ? (
                  <p className="empty-text">No order transaction logs found for this user.</p>
                ) : (
                  <div className="order-history-list">
                    {userOrders.map(order => (
                      <div className="order-history-item" key={order.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Order INV-{order.id.toUpperCase()}</strong>
                          <span className={`badge badge-${order.status === 'Delivered' ? 'success' : order.status === 'Pending' ? 'warning' : 'info'}`}>
                            {order.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                          <strong>Total: ${order.totalPrice?.toFixed(2)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </Modal>

      {/* Delete confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete User Account">
        <div>
          <p>Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? This will remove all their database records and block login access.</p>
          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Confirm Delete</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .table-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .user-header-profile {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .details-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary);
        }

        .user-header-profile h4 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .user-header-profile p {
          font-size: 12px;
          margin-top: 2px;
        }

        .user-info-section {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 16px;
          margin-bottom: 24px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item span {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .info-item strong {
          font-size: 14px;
          color: var(--text-primary);
          margin-top: 2px;
        }

        .user-orders-section h5 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .order-history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 200px;
          overflow-y: auto;
        }

        .order-history-item {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 10px 12px;
          background-color: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
};

export default Users;
