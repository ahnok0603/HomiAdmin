import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    status: 'active',
    image: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners');
      if (res.data.success) {
        setBanners(res.data.banners);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load active promotional banners.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setSelectedBanner(null);
    setFormData({
      title: '',
      link: '',
      status: 'active',
      image: null
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (ban) => {
    setSelectedBanner(ban);
    setFormData({
      title: ban.title,
      link: ban.link || '',
      status: ban.status || 'active',
      imageUrl: ban.image
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (ban) => {
    setSelectedBanner(ban);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setFormError('Banner title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('link', formData.link);
      data.append('status', formData.status);
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      let res;
      if (selectedBanner) {
        res = await api.put(`/banners/${selectedBanner.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/banners', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(selectedBanner ? 'Banner updated successfully.' : 'Banner created successfully.', 'success');
        setIsModalOpen(false);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error processing banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (ban) => {
    const nextStatus = ban.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/banners/${ban.id}`, { status: nextStatus });
      if (res.data.success) {
        showToast(`Banner status toggled to ${nextStatus}.`, 'success');
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to toggle status.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await api.delete(`/banners/${selectedBanner.id}`);
      if (res.data.success) {
        showToast('Banner deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete banner.', 'error');
    }
  };

  const tableHeaders = [
    { label: 'Banner Image', width: '220px' },
    { label: 'Title Name' },
    { label: 'Redirection Link', width: '200px' },
    { label: 'Status Toggle', width: '150px' },
    { label: 'Actions', width: '120px', align: 'right' }
  ];

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="action-bar-container" style={{ justifyContent: 'flex-end' }}>
        <button onClick={openAddModal} className="btn btn-primary">
          <MdAdd /> Add Promo Banner
        </button>
      </div>

      <DataTable
        headers={tableHeaders}
        data={banners}
        loading={loading}
        renderRow={(ban) => (
          <tr key={ban.id}>
            <td>
              <img src={ban.image} alt={ban.title} className="table-thumb" style={{ width: '180px', height: '70px', borderRadius: '4px' }} />
            </td>
            <td><strong>{ban.title}</strong></td>
            <td><code className="link-code">{ban.link || '/'}</code></td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge badge-${ban.status === 'active' ? 'success' : 'danger'}`}>
                  {ban.status}
                </span>
                <button className="status-toggle-switch" onClick={() => toggleStatus(ban)}>
                  {ban.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-primary" onClick={() => openEditModal(ban)}>
                  <MdEdit />
                </button>
                <button className="btn-icon text-danger" onClick={() => openDeleteModal(ban)}>
                  <MdDelete />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedBanner ? 'Modify Banner' : 'Create Promo Banner'}>
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="form-error-banner">{formError}</div>}

          <div className="form-group">
            <label className="form-label">Banner Title *</label>
            <input 
              type="text" 
              name="title" 
              className="form-control" 
              value={formData.title} 
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Link URL</label>
            <input 
              type="text" 
              name="link" 
              placeholder="e.g. /products/prod_1"
              className="form-control" 
              value={formData.link} 
              onChange={handleFormChange}
            />
          </div>

          <div className="grid-cols-2" style={{ gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Active Status</label>
              <select 
                name="status" 
                className="form-control" 
                value={formData.status} 
                onChange={handleFormChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Banner Banner Image</label>
              <input 
                type="file" 
                accept="image/*" 
                className="form-control" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {selectedBanner && formData.imageUrl && !formData.image && (
            <div style={{ marginTop: '10px' }}>
              <label className="form-label">Current Banner Image:</label>
              <br />
              <img src={formData.imageUrl} alt="Current" style={{ width: '100%', height: '120px', borderRadius: '6px', objectFit: 'cover', marginTop: '5px' }} />
            </div>
          )}

          <div className="modal-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : selectedBanner ? 'Save Changes' : 'Create Banner'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Banner">
        <div>
          <p>Are you sure you want to delete banner <strong>{selectedBanner?.title}</strong>?</p>
          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .link-code {
          background-color: var(--bg-primary);
          color: var(--primary);
          font-family: monospace;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .status-toggle-switch {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .status-toggle-switch:hover {
          background-color: var(--primary-light);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default Banners;
