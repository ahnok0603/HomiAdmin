import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { MdSearch, MdVisibility, MdPrint, MdLocalShipping } from 'react-icons/md';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState(null);

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', {
        params: { search, status: statusFilter }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to retrieve order listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Order status updated to ${newStatus}.`, 'success');
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update order status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const printInvoice = (orderId) => {
    // Open the print layout API directly in a new window/tab
    const printUrl = `http://localhost:5000/api/orders/${orderId}/invoice`;
    window.open(printUrl, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Order Date', 'Total Price', 'Payment', 'Status'];
    const csvRows = [headers.join(',')];
    
    orders.forEach(order => {
      const row = [
        `INV-${order.id.toUpperCase().substring(0, 8)}`,
        `"${order.customerName || ''}"`,
        `"${order.customerEmail || ''}"`,
        new Date(order.orderDate).toLocaleDateString(),
        order.totalPrice || 0,
        order.paymentMethod || 'N/A',
        order.status || 'Pending'
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Orders exported successfully!', 'success');
  };

  const tableHeaders = [
    { label: 'Order ID', width: '150px' },
    { label: 'Customer' },
    { label: 'Order Date', width: '130px' },
    { label: 'Total Price', width: '120px', align: 'right' },
    { label: 'Payment', width: '120px' },
    { label: 'Status', width: '140px' },
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
              placeholder="Search orders by customer name, email, or invoice ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="filter-group-wrapper" style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipping">Shipping</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="btn btn-primary" onClick={handleExportCSV}>Export CSV</button>
        </div>
      </div>

      <DataTable
        headers={tableHeaders}
        data={orders}
        loading={loading}
        renderRow={(order) => (
          <tr key={order.id}>
            <td>
              <span className="order-id-lbl" style={{ whiteSpace: 'nowrap' }}>INV-{order.id.toUpperCase().substring(0, 8)}</span>
            </td>
            <td>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{order.customerName}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customerEmail}</span>
              </div>
            </td>
            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
            <td align="right">
              <strong>${order.totalPrice?.toFixed(2)}</strong>
            </td>
            <td>
              <span className="badge badge-info" style={{ textTransform: 'none' }}>{order.paymentMethod}</span>
            </td>
            <td>
              <span className={`badge badge-${
                order.status === 'Delivered' ? 'success' : 
                order.status === 'Pending' ? 'warning' : 
                order.status === 'Cancelled' ? 'danger' : 'info'
              }`}>
                {order.status}
              </span>
            </td>
            <td align="right">
              <div className="table-actions">
                <button className="btn-icon text-primary" onClick={() => viewOrderDetails(order)} title="View Detail">
                  <MdVisibility />
                </button>
                <button className="btn-icon text-primary" onClick={() => printInvoice(order.id)} title="Print Invoice">
                  <MdPrint />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Order Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Order Details View">
        {selectedOrder && (
          <div className="order-details-box">
            <div className="order-details-header">
              <div>
                <h4>Invoice INV-{selectedOrder.id.toUpperCase()}</h4>
                <p>Placed on: {new Date(selectedOrder.orderDate).toLocaleString()}</p>
              </div>
              <div className="order-status-selector">
                <label className="form-label" style={{ marginBottom: '2px' }}>Order Status:</label>
                <select 
                  value={selectedOrder.status} 
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  disabled={updatingStatus}
                  className="form-control"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid-cols-2" style={{ gap: '20px', margin: '20px 0' }}>
              <div className="order-customer-card">
                <h5>Customer Information</h5>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone || 'N/A'}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
              </div>
              <div className="order-customer-card">
                <h5>Shipping Address</h5>
                <p style={{ whiteSpace: 'pre-line' }}>{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            <div className="order-items-summary">
              <h5>Order Items</h5>
              <div className="order-items-list">
                {selectedOrder.items?.map((item, index) => (
                  <div className="order-item-row" key={index}>
                    <img src={item.image} alt={item.name} className="order-item-thumb" />
                    <div className="order-item-info">
                      <h6>{item.name}</h6>
                      <p>${item.price?.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="order-item-subtotal">
                      <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-price-breakdown">
              {selectedOrder.voucher && (
                <div className="price-row">
                  <span>Voucher Discount ({selectedOrder.voucher.code})</span>
                  <strong>-{selectedOrder.voucher.discount}%</strong>
                </div>
              )}
              <div className="price-row">
                <span>Shipping Fee</span>
                <strong>${(selectedOrder.shippingFee || 0).toFixed(2)}</strong>
              </div>
              <div className="price-row grand-total-row">
                <span>Grand Total</span>
                <strong>${(selectedOrder.totalPrice + (selectedOrder.shippingFee || 0)).toFixed(2)}</strong>
              </div>
            </div>

            <div className="modal-actions-row">
              <button className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => printInvoice(selectedOrder.id)}>
                <MdPrint /> Print Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .order-id-lbl {
          font-family: monospace;
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
        }

        .order-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 15px;
        }

        .order-details-header h4 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .order-details-header p {
          font-size: 11px;
          color: var(--text-muted);
        }

        .order-customer-card {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 16px;
        }

        .order-customer-card h5 {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          margin-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 4px;
        }

        .order-customer-card p {
          font-size: 13px;
          margin-bottom: 4px;
          color: var(--text-secondary);
        }

        .order-items-summary h5 {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .order-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 180px;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .order-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border-color);
          padding: 8px;
          border-radius: var(--border-radius-sm);
        }

        .order-item-thumb {
          width: 44px;
          height: 44px;
          border-radius: 4px;
          object-fit: cover;
        }

        .order-item-info {
          flex-grow: 1;
        }

        .order-item-info h6 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .order-item-info p {
          font-size: 11px;
          color: var(--text-muted);
        }

        .order-item-subtotal {
          font-size: 13px;
          color: var(--text-primary);
        }

        .order-price-breakdown {
          border-top: 1px solid var(--border-color);
          padding-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-end;
          margin-bottom: 20px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          width: 250px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .grand-total-row {
          font-size: 15px;
          color: var(--primary);
          font-weight: bold;
          border-top: 1px dashed var(--border-color);
          padding-top: 6px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default Orders;
