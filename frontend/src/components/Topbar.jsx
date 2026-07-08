import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MdMenu, MdLightMode, MdDarkMode } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ onToggleSidebar }) => {
  const { admin } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('homi_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('homi_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Convert pathname to readable breadcrumbs
  const getPageTitleAndBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Dashboard', crumbs: ['Admin', 'Dashboard'] };
    if (path === '/products') return { title: 'Product Management', crumbs: ['Admin', 'Products'] };
    if (path === '/categories') return { title: 'Category Management', crumbs: ['Admin', 'Categories'] };
    if (path === '/users') return { title: 'User Management', crumbs: ['Admin', 'Users'] };
    if (path === '/orders') return { title: 'Order Management', crumbs: ['Admin', 'Orders'] };
    if (path === '/reviews') return { title: 'Review Management', crumbs: ['Admin', 'Reviews'] };
    if (path === '/banners') return { title: 'Banner Management', crumbs: ['Admin', 'Banners'] };
    if (path === '/rooms') return { title: 'Room Inspiration', crumbs: ['Admin', 'Room Collections'] };
    if (path === '/ai-search') return { title: 'AI Search History', crumbs: ['Admin', 'AI Queries'] };
    if (path === '/notifications') return { title: 'Notification Center', crumbs: ['Admin', 'Notifications'] };
    if (path === '/reports') return { title: 'Analytics & Reports', crumbs: ['Admin', 'Reports'] };
    if (path === '/settings') return { title: 'System Settings', crumbs: ['Admin', 'Settings'] };
    return { title: 'Homi Admin', crumbs: ['Admin'] };
  };

  const { title, crumbs } = getPageTitleAndBreadcrumbs();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={onToggleSidebar}>
          <MdMenu />
        </button>
        <div className="title-section">
          <h1>{title}</h1>
          <nav className="breadcrumbs">
            {crumbs.map((crumb, index) => (
              <React.Fragment key={crumb}>
                {index > 0 && <span className="crumb-separator">/</span>}
                <span className={`crumb-item ${index === crumbs.length - 1 ? 'active' : ''}`}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      <div className="topbar-right">
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
        </button>
        <div className="admin-profile">
          <img 
            src={admin?.photo?.startsWith('/uploads') ? `http://localhost:5000${admin.photo}` : (admin?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")} 
            alt="Admin" 
            className="profile-pic"
          />
        </div>
      </div>

      <style>{`
        .topbar {
          height: var(--header-height);
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          position: sticky;
          top: 0;
          z-index: 90;
          box-shadow: var(--shadow-sm);
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-toggle-btn {
          font-size: 24px;
          display: none;
          color: var(--text-primary);
          align-items: center;
        }

        .title-section h1 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          margin-top: 2px;
          color: var(--text-muted);
        }

        .crumb-separator {
          color: var(--text-muted);
        }

        .crumb-item.active {
          color: var(--primary);
          font-weight: 500;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .theme-toggle-btn {
          font-size: 22px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: 50%;
          transition: var(--transition);
        }

        .theme-toggle-btn:hover {
          background-color: var(--bg-primary);
        }

        .profile-pic {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--primary);
        }

        @media (max-width: 991px) {
          .menu-toggle-btn {
            display: flex;
          }
          .topbar {
            padding: 0 15px;
          }
        }
      `}</style>
    </header>
  );
};

export default Topbar;
