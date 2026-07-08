import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChartContainer from '../components/ChartContainer';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { MdFileDownload, MdPrint, MdAnalytics } from 'react-icons/md';

const Reports = () => {
  const [reportType, setReportType] = useState('monthly'); // daily, weekly, monthly, yearly
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports', { params: { type: reportType } });
      if (res.data.success) {
        setReportData(res.data.report);
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating analytics report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleExportExcel = () => {
    // CSV endpoint
    const exportUrl = `http://localhost:5000/api/reports/export/excel?type=${reportType}`;
    window.open(exportUrl, '_blank');
    showToast('Exporting CSV report for Excel...', 'success');
  };

  const handleExportPDF = () => {
    // Printable PDF HTML view
    const exportUrl = `http://localhost:5000/api/reports/export/pdf?type=${reportType}`;
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Control bar */}
      <div className="action-bar-container">
        <div className="report-period-selector" style={{ display: 'flex', gap: '8px' }}>
          {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
            <button 
              key={period} 
              className={`btn ${reportType === period ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setReportType(period)}
              style={{ textTransform: 'capitalize' }}
            >
              {period}
            </button>
          ))}
        </div>

        <div className="export-buttons-wrapper" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            <MdFileDownload /> Export CSV (Excel)
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <MdPrint /> Print PDF Report
          </button>
        </div>
      </div>

      {loading ? (
        <div>
          <div className="grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ height: '120px' }}>
                <Skeleton className="skeleton-title" />
                <Skeleton className="skeleton-text" />
              </div>
            ))}
          </div>
          <div className="card" style={{ height: '320px', marginTop: '30px' }}>
            <Skeleton className="skeleton-title" style={{ width: '40%' }} />
            <Skeleton style={{ height: '220px', width: '100%' }} />
          </div>
        </div>
      ) : (
        reportData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Statistics Metrics Cards */}
            <div className="grid-cols-4">
              <div className="card report-metric-card">
                <span>Total Revenue</span>
                <h3>${reportData.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
              <div className="card report-metric-card">
                <span>Completed Orders</span>
                <h3>{reportData.ordersCount}</h3>
              </div>
              <div className="card report-metric-card">
                <span>Items Sold</span>
                <h3>{reportData.itemsCount}</h3>
              </div>
              <div className="card report-metric-card">
                <span>Avg Order Value</span>
                <h3>${reportData.avgOrderValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
            </div>

            {/* Performance charts */}
            <ChartContainer 
              title={`Sales performance breakdown (${reportType.toUpperCase()})`}
              labels={reportData.chartLabels || []}
              data={reportData.chartValues || []}
              type="bar" // use bar charts for reports
            />

            {/* Table breakdowns */}
            <div className="card table-card" style={{ padding: '20px' }}>
              <div className="card-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdAnalytics style={{ fontSize: '20px', color: 'var(--primary)' }} />
                <h3>Detailed breakdown</h3>
              </div>
              
              <div className="table-wrapper">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Timeframe</th>
                      <th align="right">Revenue ($)</th>
                      <th align="center">Completed Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.chartLabels?.map((label, idx) => (
                      <tr key={idx}>
                        <td><strong>{label}</strong></td>
                        <td align="right"><strong>${reportData.chartValues[idx]?.toFixed(2)}</strong></td>
                        <td align="center">{reportData.chartOrdersCount[idx]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      <style>{`
        .report-metric-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 20px;
          text-align: center;
        }

        .report-metric-card span {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .report-metric-card h3 {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
        }

        .report-table th {
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 12px 16px;
        }

        .report-table td {
          padding: 12px 16px;
          font-size: 14px;
          border-bottom: 1px solid var(--border-color);
        }

        .report-table tr:last-child td {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default Reports;
