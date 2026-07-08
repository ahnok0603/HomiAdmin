import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Toast from '../components/Toast';
import { MdSend, MdHistory } from 'react-icons/md';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('All Users');
  const [sending, setSending] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve notification records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      showToast('Please fill out both title and message body.', 'warning');
      return;
    }

    setSending(true);
    try {
      const res = await api.post('/notifications', { title, body, target });
      if (res.data.success) {
        showToast('Push announcement broadcast successfully.', 'success');
        setTitle('');
        setBody('');
        fetchNotifications(); // reload log
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to dispatch push notification.', 'error');
    } finally {
      setSending(false);
    }
  };

  const tableHeaders = [
    { label: 'Title', width: '200px' },
    { label: 'Message Body' },
    { label: 'Target Audience', width: '150px' },
    { label: 'Broadcast Date', width: '180px' }
  ];

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="notification-layout grid-cols-3">
        {/* Drafting Card */}
        <div className="card form-draft-card">
          <div className="card-header">
            <h3>Draft Push Announcement</h3>
          </div>
          
          <form onSubmit={handleBroadcast} className="broadcast-form" style={{ marginTop: '15px' }}>
            <div className="form-group">
              <label className="form-label">Notification Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Nordic Series Inbound!" 
                className="form-control" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={sending}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message Body *</label>
              <textarea 
                rows="4" 
                placeholder="Write message details for shoppers..." 
                className="form-control" 
                value={body} 
                onChange={(e) => setBody(e.target.value)}
                required
                disabled={sending}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Segment</label>
              <select 
                className="form-control" 
                value={target} 
                onChange={(e) => setTarget(e.target.value)}
                disabled={sending}
              >
                <option value="All Users">All Shoppers</option>
                <option value="Gold Members">Gold Tier Members</option>
                <option value="Platinum Members">Platinum Tier Members</option>
                <option value="Silver Members">Silver Tier Members</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary broadcast-btn" disabled={sending} style={{ width: '100%', marginTop: '10px' }}>
              <MdSend /> {sending ? 'Broadcasting...' : 'Broadcast Notification'}
            </button>
          </form>
        </div>

        {/* Previous Log Table */}
        <div className="col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdHistory style={{ fontSize: '20px', color: 'var(--primary)' }} />
            <h3>Broadcast History Log</h3>
          </div>
          
          <DataTable
            headers={tableHeaders}
            data={notifications}
            loading={loading}
            renderRow={(notif) => (
              <tr key={notif.id}>
                <td><strong>{notif.title}</strong></td>
                <td><p style={{ margin: 0, fontSize: '13px' }}>{notif.body}</p></td>
                <td>
                  <span className="badge badge-info" style={{ textTransform: 'none' }}>{notif.target}</span>
                </td>
                <td>{new Date(notif.sentDate).toLocaleString()}</td>
              </tr>
            )}
          />
        </div>
      </div>

      <style>{`
        .notification-layout {
          align-items: flex-start;
        }

        .form-draft-card {
          padding: 24px;
        }

        .broadcast-btn {
          padding: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
