import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Skeleton from './components/Skeleton';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Banners from './pages/Banners';
import Rooms from './pages/Rooms';
import AISearch from './pages/AISearch';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Protected Route Component wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '40px', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--primary)', fontWeight: '700' }}>Authenticating Homi Portal...</h2>
        <div style={{ width: '300px' }}>
          <Skeleton className="skeleton-text" style={{ height: '10px' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar isOpen={sidebarOpen} />
      </div>
      {/* Mobile backdrop shadow click to close */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}

      <div className="main-content">
        <Topbar onToggleSidebar={toggleSidebar} />
        {children}
      </div>

      <style>{`
        .sidebar-wrapper {
          transition: var(--transition);
        }

        .sidebar-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(18, 17, 15, 0.4);
          z-index: 95;
          backdrop-filter: blur(2px);
        }

        @media (max-width: 991px) {
          .sidebar-wrapper {
            position: fixed;
            left: 0; top: 0; bottom: 0;
            z-index: 150;
            transform: translateX(-100%);
          }
          .sidebar-wrapper.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Administrative Dashboard Layout Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute>
          <AppLayout>
            <Products />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute>
          <AppLayout>
            <Categories />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <AppLayout>
            <Users />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <AppLayout>
            <Orders />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reviews" element={
        <ProtectedRoute>
          <AppLayout>
            <Reviews />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/banners" element={
        <ProtectedRoute>
          <AppLayout>
            <Banners />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/rooms" element={
        <ProtectedRoute>
          <AppLayout>
            <Rooms />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-search" element={
        <ProtectedRoute>
          <AppLayout>
            <AISearch />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout>
            <Notifications />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <AppLayout>
            <Reports />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Wildcard redirect handler */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
