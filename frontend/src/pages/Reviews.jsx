import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdSearch, MdDelete, MdStar } from 'react-icons/md';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Deletion state
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews', {
        params: { search, productId: productFilter }
      });
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load product reviews.', 'error');
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
    fetchReviews();
  }, [productFilter]);

  useEffect(() => {
    fetchProductsList();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const openDeleteModal = (rev) => {
    setSelectedReview(rev);
    setIsDeleteOpen(true);
  };

  const confirmDeleteReview = async () => {
    try {
      const res = await api.delete(`/reviews/${selectedReview.id}`);
      if (res.data.success) {
        showToast('Review deleted successfully.', 'success');
        setIsDeleteOpen(false);
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete review.', 'error');
    }
  };

  const tableHeaders = [
    { label: 'Product Name', width: '220px' },
    { label: 'User Name', width: '150px' },
    { label: 'Rating', width: '120px' },
    { label: 'Comment' },
    { label: 'Submitted Date', width: '150px' },
    { label: 'Actions', width: '80px', align: 'right' }
  ];

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', color: '#FFB300' }}>
        {Array.from({ length: rating }).map((_, i) => (
          <MdStar key={i} />
        ))}
      </div>
    );
  };

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="action-bar-container">
        <form onSubmit={handleSearchSubmit} className="search-bar-form">
          <div className="search-input-wrapper">
            <MdSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search reviews by user name or comment details..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="filter-group-wrapper">
          <select 
            value={productFilter} 
            onChange={(e) => setProductFilter(e.target.value)}
            className="filter-select"
            style={{ maxWidth: '250px' }}
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        headers={tableHeaders}
        data={reviews}
        loading={loading}
        renderRow={(rev) => (
          <tr key={rev.id}>
            <td><strong>{rev.productName}</strong></td>
            <td>{rev.userName}</td>
            <td>{renderStars(rev.rating)}</td>
            <td>
              <p className="review-comment" title={rev.comment}>
                {rev.comment}
              </p>
            </td>
            <td>{new Date(rev.createdDate).toLocaleDateString()}</td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-danger" onClick={() => openDeleteModal(rev)} title="Delete Review">
                  <MdDelete />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Review Deletion">
        <div>
          <p>Are you sure you want to delete this review by <strong>{selectedReview?.userName}</strong>?</p>
          <p style={{ margin: '10px 0', padding: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            "{selectedReview?.comment}"
          </p>
          <p style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '600' }}>This will remove the review permanently from the product details.</p>
          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmDeleteReview}>Delete Review</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .review-comment {
          margin: 0;
          max-width: 350px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-style: italic;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Reviews;
