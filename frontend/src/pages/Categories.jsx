import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    image: null
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      image: null
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      status: cat.status || 'active',
      imageUrl: cat.image // store current URL
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCategory(cat);
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
    if (!formData.name) {
      setFormError('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('status', formData.status);
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      let res;
      if (selectedCategory) {
        res = await api.put(`/categories/${selectedCategory.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/categories', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(selectedCategory ? 'Category updated successfully.' : 'Category created successfully.', 'success');
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error processing category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await api.delete(`/categories/${selectedCategory.id}`);
      if (res.data.success) {
        showToast('Category deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete category.', 'error');
    }
  };

  const tableHeaders = [
    { label: 'Cover Image', width: '120px' },
    { label: 'Category Name', width: '200px' },
    { label: 'Description' },
    { label: 'Status', width: '120px' },
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
          <MdAdd /> Add Category
        </button>
      </div>

      <DataTable
        headers={tableHeaders}
        data={categories}
        loading={loading}
        renderRow={(cat) => (
          <tr key={cat.id}>
            <td>
              <img src={cat.image} alt={cat.name} className="table-thumb" style={{ width: '80px', height: '50px' }} />
            </td>
            <td><strong>{cat.name}</strong></td>
            <td><p style={{ margin: 0 }}>{cat.description}</p></td>
            <td>
              <span className={`badge badge-${cat.status === 'active' ? 'success' : 'danger'}`}>
                {cat.status}
              </span>
            </td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-primary" onClick={() => openEditModal(cat)}>
                  <MdEdit />
                </button>
                <button className="btn-icon text-danger" onClick={() => openDeleteModal(cat)}>
                  <MdDelete />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="form-error-banner">{formError}</div>}

          <div className="form-group">
            <label className="form-label">Category Name *</label>
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
            <label className="form-label">Description</label>
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
              <label className="form-label">Status</label>
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
              <label className="form-label">Cover Image</label>
              <input 
                type="file" 
                accept="image/*" 
                className="form-control" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {selectedCategory && formData.imageUrl && !formData.image && (
            <div style={{ marginTop: '10px' }}>
              <label className="form-label">Current Image:</label>
              <br />
              <img src={formData.imageUrl} alt="Current" style={{ width: '120px', height: '80px', borderRadius: '6px', objectFit: 'cover', marginTop: '5px' }} />
            </div>
          )}

          <div className="modal-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Processing...' : selectedCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Delete Category">
        <div>
          <p>Are you sure you want to delete category <strong>{selectedCategory?.name}</strong>? All products within this category will need updated references.</p>
          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
