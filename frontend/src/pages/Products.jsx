import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdStar, MdStarBorder } from 'react-icons/md';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discount: '',
    quantity: '',
    material: '',
    color: '',
    dimensions: '',
    status: 'active',
    featured: false,
    images: [] // holds File objects or URLs
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          search,
          category: categoryFilter,
          status: statusFilter,
          sort: sortField,
          order: sortOrder,
          page,
          limit: 8
        }
      });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotalProducts(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?.name || '',
      price: '',
      discount: '0',
      quantity: '10',
      material: '',
      color: '',
      dimensions: '',
      status: 'active',
      featured: false,
      images: []
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setSelectedProduct(prod);
    setFormData({
      name: prod.name,
      description: prod.description || '',
      category: prod.category,
      price: prod.price.toString(),
      discount: prod.discount ? prod.discount.toString() : '0',
      quantity: prod.quantity.toString(),
      material: prod.material || '',
      color: prod.color || '',
      dimensions: prod.dimensions || '',
      status: prod.status || 'active',
      featured: prod.featured || false,
      images: prod.images || [] // stores URLs of current images
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (prod) => {
    setSelectedProduct(prod);
    setIsDeleteOpen(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Add file objects to formData state
    setFormData(prev => ({
      ...prev,
      newImages: files // Stores native File objects to upload
    }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { name, price, category } = formData;
    if (!name || !price || !category) {
      setFormError('Name, price, and category are required.');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('discount', formData.discount);
      data.append('quantity', formData.quantity);
      data.append('material', formData.material);
      data.append('color', formData.color);
      data.append('dimensions', formData.dimensions);
      data.append('status', formData.status);
      data.append('featured', formData.featured);

      // Add existing images if updating
      if (selectedProduct) {
        if (Array.isArray(formData.images)) {
          formData.images.forEach(img => data.append('existingImages', img));
        } else {
          data.append('existingImages', formData.images);
        }
      }

      // Add new files
      if (formData.newImages) {
        formData.newImages.forEach(file => {
          data.append('images', file);
        });
      }

      let res;
      if (selectedProduct) {
        res = await api.put(`/products/${selectedProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showToast(selectedProduct ? 'Product updated successfully.' : 'Product created successfully.', 'success');
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error processing product.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await api.delete(`/products/${selectedProduct.id}`);
      if (res.data.success) {
        showToast('Product deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product.', 'error');
    }
  };

  const tableHeaders = [
    { label: 'Image', width: '80px' },
    { label: 'Name' },
    { label: 'Category', width: '150px' },
    { label: 'Price', width: '100px', align: 'right' },
    { label: 'Qty', width: '80px', align: 'center' },
    { label: 'Status', width: '120px' },
    { label: 'Featured', width: '100px', align: 'center' },
    { label: 'Actions', width: '120px', align: 'right' }
  ];

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header filter actions */}
      <div className="action-bar-container">
        <form onSubmit={handleSearchSubmit} className="search-bar-form">
          <div className="search-input-wrapper">
            <MdSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products by name, color..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="filter-group-wrapper">
          <select 
            value={categoryFilter} 
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button onClick={openAddModal} className="btn btn-primary">
            <MdAdd /> Add Product
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        headers={tableHeaders}
        data={products}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        renderRow={(prod) => (
          <tr key={prod.id}>
            <td>
              <img src={prod.images?.[0]} alt={prod.name} className="table-thumb" />
            </td>
            <td>
              <div className="prod-name-cell">
                <strong>{prod.name}</strong>
                <span>{prod.color} | {prod.material}</span>
              </div>
            </td>
            <td>{prod.category}</td>
            <td align="right">
              <strong>${prod.price?.toFixed(2)}</strong>
              {prod.discount > 0 && <span className="discount-lbl">-{prod.discount}%</span>}
            </td>
            <td align="center">
              <span className={`stock-level ${prod.quantity <= 5 ? 'low-stock' : ''}`}>
                {prod.quantity}
              </span>
            </td>
            <td>
              <span className={`badge badge-${prod.status === 'active' ? 'success' : 'danger'}`}>
                {prod.status}
              </span>
            </td>
            <td align="center" style={{ fontSize: '20px', color: 'var(--primary)' }}>
              {prod.featured ? <MdStar /> : <MdStarBorder style={{ color: 'var(--text-muted)' }} />}
            </td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-primary" onClick={() => openEditModal(prod)} title="Edit">
                  <MdEdit />
                </button>
                <button className="btn-icon text-danger" onClick={() => openDeleteModal(prod)} title="Delete">
                  <MdDelete />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Form Dialog Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedProduct ? 'Modify Product Details' : 'Add New Product'}
      >
        <form onSubmit={handleFormSubmit} className="product-form">
          {formError && <div className="form-error-banner">{formError}</div>}
          
          <div className="grid-cols-2" style={{ gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
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
              <label className="form-label">Category *</label>
              <select 
                name="category" 
                className="form-control" 
                value={formData.category} 
                onChange={handleFormChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
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

          <div className="grid-cols-3" style={{ gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input 
                type="number" 
                name="price" 
                step="0.01" 
                className="form-control" 
                value={formData.price} 
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount (%)</label>
              <input 
                type="number" 
                name="discount" 
                className="form-control" 
                value={formData.discount} 
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input 
                type="number" 
                name="quantity" 
                className="form-control" 
                value={formData.quantity} 
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="grid-cols-3" style={{ gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Material</label>
              <input 
                type="text" 
                name="material" 
                placeholder="e.g. Velvet, Oak wood" 
                className="form-control" 
                value={formData.material} 
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input 
                type="text" 
                name="color" 
                placeholder="e.g. Forest Green" 
                className="form-control" 
                value={formData.color} 
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dimensions</label>
              <input 
                type="text" 
                name="dimensions" 
                placeholder="e.g. 200 x 90 x 85 cm" 
                className="form-control" 
                value={formData.dimensions} 
                onChange={handleFormChange}
              />
            </div>
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

            <div className="form-group" style={{ justifyContent: 'center', paddingLeft: '5px' }}>
              <label className="checkbox-label" style={{ fontWeight: '500' }}>
                <input 
                  type="checkbox" 
                  name="featured" 
                  checked={formData.featured} 
                  onChange={handleFormChange} 
                />
                Promote as Featured Product
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Product Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="form-control" 
              onChange={handleFileChange}
            />
            {selectedProduct && formData.images.length > 0 && (
              <div className="image-preview-strip">
                {formData.images.map((img, i) => (
                  <img key={i} src={img} alt="Current Preview" className="preview-mini-thumb" />
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Processing...' : selectedProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Deletion">
        <div className="delete-confirm-box">
          <p>Are you sure you want to permanently delete the product <strong>{selectedProduct?.name}</strong>? This operation is irreversible.</p>
          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .action-bar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }


        .table-thumb {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .prod-name-cell {
          display: flex;
          flex-direction: column;
        }

        .prod-name-cell span {
          font-size: 11px;
          color: var(--text-muted);
        }

        .discount-lbl {
          font-size: 10px;
          background-color: var(--danger-light);
          color: var(--danger);
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 600;
          margin-left: 5px;
        }

        .stock-level.low-stock {
          color: var(--danger);
          font-weight: 700;
          background-color: var(--danger-light);
          padding: 2px 8px;
          border-radius: 20px;
        }

        .table-actions {
          display: flex;
          gap: 4px;
          justify-content: flex-end;
        }

        .text-primary { color: var(--primary); }
        .text-danger { color: var(--danger); }

        .image-preview-strip {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .preview-mini-thumb {
          width: 44px;
          height: 44px;
          border-radius: 4px;
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .form-error-banner {
          background-color: var(--danger-light);
          color: var(--danger);
          border-radius: var(--border-radius-sm);
          padding: 10px 15px;
          margin-bottom: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .modal-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
};

export default Products;
