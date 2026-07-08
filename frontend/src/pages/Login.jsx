import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Login = () => {
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Toast notifications state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showToast('Please enter your email address first to reset password.', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      showToast(res.message || 'Password reset link sent to your email.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to trigger password reset.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {toast && (
        <div className="toast-container">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}

      <div className="login-image-side">
        <div className="login-overlay-text">
          <h2>Crafted Spaces, Smart Designs</h2>
          <p>Welcome to Homi Admin Hub. Manage categories, track spatial search logs, configure smart room collections, and process customer orders in real-time.</p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-header">
            <h2>HOMI<span>ADMIN</span></h2>
            <p>Enter administrative credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="admin@homi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                Remember Me
              </label>

              <button 
                type="button" 
                className="forgot-pass-link" 
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer-info">
            <p>Demo accounts: <strong>admin@homi.com</strong> / <strong>admin123</strong></p>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          background-color: var(--bg-primary);
        }

        .login-image-side {
          flex: 1.2;
          background-image: url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80');
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 60px;
        }

        .login-image-side::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to top, rgba(18,17,15,0.85) 0%, rgba(18,17,15,0.1) 100%);
        }

        .login-overlay-text {
          position: relative;
          z-index: 5;
          color: #FFFFFF;
          max-width: 550px;
        }

        .login-overlay-text h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 15px;
          letter-spacing: 0.5px;
        }

        .login-overlay-text p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 15px;
          line-height: 1.6;
        }

        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 40px;
          box-shadow: var(--shadow-lg);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 1px;
        }

        .login-header h2 span {
          color: var(--text-primary);
          font-weight: 400;
        }

        .login-header p {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 25px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .forgot-pass-link {
          color: var(--primary);
          font-weight: 600;
          font-size: 13px;
        }
        .forgot-pass-link:hover {
          color: var(--primary-hover);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
        }

        .login-footer-info {
          margin-top: 24px;
          text-align: center;
          padding: 10px;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }

        .login-footer-info p {
          font-size: 12px;
          color: var(--text-secondary);
        }

        @media (max-width: 991px) {
          .login-image-side {
            display: none;
          }
          .login-form-side {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
