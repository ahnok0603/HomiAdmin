import React from 'react';

const StatCard = ({ title, value, icon, trend, trendType }) => {
  // trendType: 'up' | 'down' | 'neutral'
  const isUp = trendType === 'up';
  const isDown = trendType === 'down';

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        <span className="stat-icon-wrapper">{icon}</span>
      </div>
      
      <div className="stat-card-value">{value}</div>
      
      {trend && (
        <div className="stat-card-trend">
          <span className={`trend-badge ${isUp ? 'trend-up' : isDown ? 'trend-down' : 'trend-neutral'}`}>
            {trend}
          </span>
          <span className="trend-text">vs last month</span>
        </div>
      )}

      <style>{`
        .stat-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }

        .stat-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-icon-wrapper {
          font-size: 24px;
          color: var(--primary);
          background-color: var(--primary-light);
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-card-trend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .trend-badge {
          padding: 2px 8px;
          border-radius: 20px;
          font-weight: 600;
        }

        .trend-up {
          background-color: var(--success-light);
          color: var(--success);
        }

        .trend-down {
          background-color: var(--danger-light);
          color: var(--danger);
        }

        .trend-neutral {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .trend-text {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default StatCard;
