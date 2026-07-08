import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdDelete, MdShoppingBag } from 'react-icons/md';

const AISearch = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Deletion Modal
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai-search');
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load spatial search history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openDeleteModal = (item) => {
    setSelectedHistory(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/ai-search/${selectedHistory.id}`);
      if (res.data.success) {
        showToast('AI Search record deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete AI Search history log.', 'error');
    }
  };

  const tableHeaders = [
    { label: 'Uploaded Image', width: '130px' },
    { label: 'Spatial Recommendations' },
    { label: 'Inquired User', width: '180px' },
    { label: 'Search Timestamp', width: '200px' },
    { label: 'Actions', width: '80px', align: 'right' }
  ];

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <DataTable
        headers={tableHeaders}
        data={history}
        loading={loading}
        renderRow={(item) => (
          <tr key={item.id}>
            <td>
              <img src={item.uploadedImage} alt="Search upload" className="table-thumb" style={{ width: '80px', height: '60px', borderRadius: '4px' }} />
            </td>
            <td>
              <div className="room-badges-list">
                {item.recommendedProducts?.map(prod => (
                  <span className="room-product-badge" key={prod.id} style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                    <MdShoppingBag /> {prod.name}
                  </span>
                ))}
              </div>
            </td>
            <td>
              <strong>{item.userName || 'Anonymous Guest'}</strong>
            </td>
            <td>{new Date(item.searchTime).toLocaleString()}</td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-danger" onClick={() => openDeleteModal(item)} title="Delete Log">
                  <MdDelete />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete AI Search Query Log">
        <div>
          <p>Are you sure you want to delete this AI spatial search record uploaded by <strong>{selectedHistory?.userName || 'Anonymous'}</strong>?</p>
          <div style={{ display: 'flex', gap: '15px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', margin: '15px 0', backgroundColor: 'var(--bg-primary)' }}>
            <img src={selectedHistory?.uploadedImage} alt="Uploaded Search" style={{ width: '80px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
            <div>
              <strong>Recommendations:</strong>
              <p style={{ margin: 0, fontSize: '12px' }}>{selectedHistory?.recommendedProducts?.map(p => p.name).join(', ')}</p>
            </div>
          </div>
          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete Record</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AISearch;
