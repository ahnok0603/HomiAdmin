import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartContainer from '../components/ChartContainer';
import Skeleton from '../components/Skeleton';
import { 
  MdPeople, 
  MdOutlineChair, 
  MdCategory, 
  MdReceipt, 
  MdAttachMoney 
} from 'react-icons/md';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-body">
        <div className="grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '135px' }}>
              <Skeleton className="skeleton-title" />
              <Skeleton className="skeleton-text" />
            </div>
          ))}
        </div>
        <div className="card" style={{ height: '350px' }}>
          <Skeleton className="skeleton-title" style={{ width: '30%' }} />
          <Skeleton style={{ height: '240px', width: '100%' }} />
        </div>
      </div>
    );
  }

  const {
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    completedOrders,
    revenue,
    chartLabels,
    chartData,
    latestOrders,
    bestSellingProducts,
    lowStockProducts
  } = stats || {};

  return (
    <div className="page-body">
      {/* Metrics Row */}
      <div className="stats-row grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={totalUsers?.toLocaleString() || 0}
          icon={<MdPeople />} 
          trend="+12%" 
          trendType="up"
        />
        <StatCard 
          title="Products" 
          value={totalProducts?.toLocaleString() || 0}
          icon={<MdOutlineChair />} 
          trend="+4 new" 
          trendType="up"
        />
        <StatCard 
          title="Orders" 
          value={totalOrders?.toLocaleString() || 0}
          icon={<MdReceipt />} 
          trend={`+${pendingOrders} pending`} 
          trendType="neutral"
        />
        <StatCard 
          title="Revenue" 
          value={`$${revenue?.toLocaleString() || 0}`}
          icon={<MdAttachMoney />} 
          trend="+18%" 
          trendType="up"
        />
      </div>

      {/* Chart Row */}
      <div className="chart-row">
        <ChartContainer 
          title="Monthly Sales & Revenue Overview" 
          labels={chartLabels || []} 
          data={chartData || []} 
          type="line"
        />
      </div>

      {/* Lower Dashboard Tables Grid */}
      <div className="lower-grid grid-cols-3">
        {/* Latest Orders */}
        <div className="card dashboard-table-card col-span-2">
          <div className="card-header">
            <h3>Latest Orders</h3>
          </div>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-text">No orders yet.</td>
                  </tr>
                ) : (
                  latestOrders?.map(order => (
                    <tr key={order.id}>
                      <td>
                        <div className="customer-info">
                          <strong>{order.customerName}</strong>
                          <span>{order.customerEmail}</span>
                        </div>
                      </td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td><strong>${order.totalPrice?.toFixed(2)}</strong></td>
                      <td>
                        <span className={`badge badge-${order.status === 'Delivered' ? 'success' : order.status === 'Pending' ? 'warning' : 'info'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="card dashboard-table-card">
          <div className="card-header">
            <h3>Best Sellers</h3>
          </div>
          <div className="best-sellers-list">
            {bestSellingProducts?.length === 0 ? (
              <p className="empty-text">No sales recorded.</p>
            ) : (
              bestSellingProducts?.map(prod => (
                <div className="best-seller-item" key={prod.id}>
                  <img src={prod.images?.[0]} alt={prod.name} className="prod-thumb" />
                  <div className="prod-details">
                    <h4>{prod.name}</h4>
                    <p>{prod.category}</p>
                  </div>
                  <div className="prod-sales-badge">
                    <strong>{prod.salesCount || 0}</strong> sales
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="card dashboard-table-card">
          <div className="card-header">
            <h3 style={{ color: 'var(--danger)' }}>Low Stock Products</h3>
          </div>
          <div className="best-sellers-list">
            {lowStockProducts?.length === 0 ? (
              <p className="empty-text" style={{ color: 'var(--success)' }}>All items well stocked!</p>
            ) : (
              lowStockProducts?.map(prod => (
                <div className="best-seller-item" key={prod.id}>
                  <img src={prod.images?.[0]} alt={prod.name} className="prod-thumb" />
                  <div className="prod-details">
                    <h4>{prod.name}</h4>
                    <p>In Stock: <strong style={{ color: 'var(--danger)' }}>{prod.quantity}</strong></p>
                  </div>
                  <div className="prod-sales-badge danger-stock">
                    Refill
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .col-span-2 {
          grid-column: span 2;
        }

        .dashboard-table-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .dashboard-table th {
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 12px 16px;
          text-align: left;
        }

        .dashboard-table td {
          padding: 12px 16px;
          font-size: 13px;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }

        .dashboard-table tr:last-child td {
          border-bottom: none;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
        }

        .customer-info strong {
          color: var(--text-primary);
        }

        .customer-info span {
          font-size: 11px;
          color: var(--text-muted);
        }

        .empty-text {
          text-align: center;
          padding: 30px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .best-sellers-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .best-seller-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .best-seller-item:last-child {
          border-bottom: none;
        }

        .prod-thumb {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          object-fit: cover;
        }

        .prod-details {
          flex-grow: 1;
        }

        .prod-details h4 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .prod-details p {
          font-size: 11px;
          color: var(--text-muted);
        }

        .prod-sales-badge {
          font-size: 12px;
          color: var(--text-secondary);
          background-color: var(--bg-primary);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .prod-sales-badge.danger-stock {
          background-color: var(--danger-light);
          color: var(--danger);
          font-weight: 600;
        }

        @media (max-width: 1200px) {
          .col-span-2 {
            grid-column: span 1;
          }
          .lower-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
