import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdAdd, MdEdit, MdDelete, MdShoppingBag } from 'react-icons/md';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalPrice: '',
    products: [], // holds product IDs
    coverImage: null
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms');
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve room inspiration bundles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 100 } });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchProductsList();
  }, []);

  const openAddModal = () => {
    setSelectedRoom(null);
    setFormData({
      name: '',
      description: '',
      totalPrice: '',
      products: [],
      coverImage: null
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      totalPrice: room.totalPrice?.toString() || '0',
      products: room.products || [],
      imageUrl: room.coverImage
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (room) => {
    setSelectedRoom(room);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductCheckboxChange = (prodId) => {
    setFormData(prev => {
      const alreadySelected = prev.products.includes(prodId);
      const nextProducts = alreadySelected 
        ? prev.products.filter(id => id !== prodId)
        : [...prev.products, prodId];
      
      // Auto calculate aggregate bundle price from selected products if total price is empty
      const nextPrice = nextProducts.reduce((sum, id) => {
        const prodObj = products.find(p => p.id === id);
        return sum + (prodObj ? prodObj.price : 0);
      }, 0);

      return {
        ...prev,
        products: nextProducts,
        totalPrice: nextPrice > 0 ? nextPrice.toFixed(2) : prev.totalPrice
      };
    });
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, coverImage: e.target.files[0] }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError('Room collection name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('totalPrice', formData.totalPrice);
      data.append('products', JSON.stringify(formData.products));
      
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      let res;
      if (selectedRoom) {
        res = await api.put(`/rooms/${selectedRoom.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/rooms', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(selectedRoom ? 'Room inspiration saved.' : 'Room inspiration created.', 'success');
        setIsModalOpen(false);
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error processing room inspiration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await api.delete(`/rooms/${selectedRoom.id}`);
      if (res.data.success) {
        showToast('Room collection deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete room collection.', 'error');
    }
  };

  const tableHeaders = [
    { label: 'Room Design', width: '130px' },
    { label: 'Collection Title', width: '220px' },
    { label: 'Associated Products' },
    { label: 'Bundle Price', width: '120px', align: 'right' },
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
          <MdAdd /> New Collection
        </button>
      </div>

      <DataTable
        headers={tableHeaders}
        data={rooms}
        loading={loading}
        renderRow={(room) => (
          <tr key={room.id}>
            <td>
              <img src={room.coverImage} alt={room.name} className="table-thumb" style={{ width: '90px', height: '60px', borderRadius: '4px' }} />
            </td>
            <td>
              <div className="prod-name-cell">
                <strong>{room.name}</strong>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{room.description}</p>
              </div>
            </td>
            <td>
              <div className="room-badges-list">
                {room.products?.map(prodId => {
                  const pObj = products.find(x => x.id === prodId);
                  return (
                    <span className="room-product-badge" key={prodId}>
                      <MdShoppingBag /> {pObj ? pObj.name : prodId}
                    </span>
                  );
                })}
              </div>
            </td>
            <td align="right">
              <strong>${room.totalPrice?.toFixed(2)}</strong>
            </td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-primary" onClick={() => openEditModal(room)}>
                  <MdEdit />
                </button>
                <button className="btn-icon text-danger" onClick={() => openDeleteModal(room)}>
                  <MdDelete />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedRoom ? 'Edit Room Collection' : 'Create Room Collection'}>
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="form-error-banner">{formError}</div>}

          <div className="grid-cols-2" style={{ gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Room Collection Name *</label>
              <input 
                type="text" 
                name="name" 
                className="form-control" 
                value={formData.name} 
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bundle Price ($) *</label>
              <input 
                type="number" 
                name="totalPrice" 
                step="0.01"
                className="form-control" 
                value={formData.totalPrice} 
                onChange={handleFormChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Inspiration Pitch</label>
            <textarea 
              name="description" 
              rows="3" 
              className="form-control" 
              value={formData.description} 
              onChange={handleFormChange}
            />
          </div>

          <div className="grid-cols-2" style={{ gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <input 
                type="file" 
                accept="image/*" 
                className="form-control" 
                onChange={handleFileChange}
              />
            </div>

            {selectedRoom && formData.imageUrl && !formData.coverImage && (
              <div style={{ paddingLeft: '5px' }}>
                <label className="form-label">Current Cover:</label>
                <br />
                <img src={formData.imageUrl} alt="Current" style={{ width: '120px', height: '70px', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="form-label">Select Bundled Products ("Shop This Room")</label>
            <div className="products-checkbox-selector">
              {products.map(prod => (
                <label className="product-checkbox-item" key={prod.id}>
                  <input 
                    type="checkbox" 
                    checked={formData.products.includes(prod.id)}
                    onChange={() => handleProductCheckboxChange(prod.id)}
                  />
                  <img src={prod.images?.[0]} alt={prod.name} className="mini-chk-thumb" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="chk-label-title">{prod.name}</span>
                    <span className="chk-label-price">${prod.price}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : selectedRoom ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Room Collection">
        <div>
          <p>Are you sure you want to delete room inspiration <strong>{selectedRoom?.name}</strong>? Bundled references will be discarded.</p>
          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .room-badges-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .room-product-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .products-checkbox-selector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          max-height: 180px;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: var(--border-radius-sm);
          background-color: var(--bg-primary);
        }

        .product-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--bg-secondary);
          padding: 6px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          cursor: pointer;
        }

        .mini-chk-thumb {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          object-fit: cover;
        }

        .chk-label-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .chk-label-price {
          font-size: 10px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Rooms;
