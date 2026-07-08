import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdDashboard, 
  MdOutlineChair, 
  MdCategory, 
  MdPeople, 
  MdReceipt, 
  MdRateReview, 
  MdImage, 
  MdMeetingRoom, 
  MdCameraAlt, 
  MdNotifications, 
  MdBarChart, 
  MdSettings,
  MdLogout
} from 'react-icons/md';

const Sidebar = ({ isOpen }) => {
  const { logout, admin } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard /> },
    { name: 'Products', path: '/products', icon: <MdOutlineChair /> },
    { name: 'Categories', path: '/categories', icon: <MdCategory /> },
    { name: 'Users', path: '/users', icon: <MdPeople /> },
    { name: 'Orders', path: '/orders', icon: <MdReceipt /> },
    { name: 'Reviews', path: '/reviews', icon: <MdRateReview /> },
    { name: 'Banners', path: '/banners', icon: <MdImage /> },
    { name: 'Room Inspiration', path: '/rooms', icon: <MdMeetingRoom /> },
    { name: 'AI Search History', path: '/ai-search', icon: <MdCameraAlt /> },
    { name: 'Notifications', path: '/notifications', icon: <MdNotifications /> },
    { name: 'Reports', path: '/reports', icon: <MdBarChart /> },
    { name: 'Settings', path: '/settings', icon: <MdSettings /> },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <h2>HOMI<span>ADMIN</span></h2>
      </div>

      <div className="sidebar-user">
        <img 
          src={admin?.photo?.startsWith('/uploads') ? `http://localhost:5000${admin.photo}` : (admin?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")} 
          alt="Avatar" 
          className="user-avatar"
        />
        <div className="user-info">
          <h4>{admin?.name || 'Homi Admin'}</h4>
          <p>{admin?.email || 'admin@homi.com'}</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <span className="menu-icon"><MdLogout /></span>
          <span className="menu-text">Logout</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: var(--transition);
        }

        .sidebar-brand {
          height: var(--header-height);
          display: flex;
          align-items: center;
          padding: 0 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-brand h2 {
          font-size: 20px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 1px;
        }

        .sidebar-brand h2 span {
          color: var(--text-primary);
          font-weight: 400;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary);
        }

        .user-info h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-info p {
          font-size: 11px;
          color: var(--text-muted);
        }

        .sidebar-menu {
          flex-grow: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text-secondary);
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition);
        }

        .menu-item:hover {
          background-color: var(--bg-primary);
          color: var(--primary);
        }

        .menu-item.active {
          background-color: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .menu-icon {
          font-size: 20px;
          display: flex;
          align-items: center;
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--border-color);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--danger);
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          font-weight: 500;
          text-align: left;
        }

        .logout-btn:hover {
          background-color: var(--danger-light);
        }

        @media (max-width: 991px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
