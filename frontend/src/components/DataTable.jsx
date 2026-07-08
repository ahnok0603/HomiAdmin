import React from 'react';
import Skeleton from './Skeleton';

const DataTable = ({ 
  headers, 
  data, 
  loading, 
  renderRow, 
  page, 
  totalPages, 
  onPageChange,
  emptyMessage = "No items found."
}) => {
  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{ width: h.width || 'auto', textAlign: h.align || 'left' }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading state: render 5 skeleton rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  {headers.map((_, hIdx) => (
                    <td key={hIdx}>
                      <Skeleton className="skeleton-text" style={{ margin: 0, height: '18px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="empty-row">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <button 
            className="pagination-btn" 
            onClick={() => onPageChange(page - 1)} 
            disabled={page === 1}
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
          
          <button 
            className="pagination-btn" 
            onClick={() => onPageChange(page + 1)} 
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        .table-container {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .table-wrapper {
          overflow-x: auto;
          width: 100%;
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .custom-table th {
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .custom-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color);
          font-size: 14px;
          color: var(--text-primary);
          vertical-align: middle;
        }

        .custom-table tr:last-child td {
          border-bottom: none;
        }

        .custom-table tr:hover td {
          background-color: var(--primary-light);
        }

        .empty-row {
          text-align: center;
          color: var(--text-muted);
          padding: 40px 24px !important;
          font-weight: 500;
        }

        .table-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }

        .pagination-btn {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 13px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default DataTable;
