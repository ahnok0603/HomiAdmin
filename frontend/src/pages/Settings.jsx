import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';
import { MdSettings, MdSave, MdLock, MdPerson } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    logo: '',
    contactInfo: '',
    email: '',
    phone: '',
    socialLinks: { facebook: '', instagram: '', twitter: '' },
    about: '',
    privacyPolicy: '',
    terms: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const { admin, updateAdminProfile } = useAuth();
  const [adminName, setAdminName] = useState(admin?.name || '');
  const [adminAvatarFile, setAdminAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load system settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['facebook', 'instagram', 'twitter'].includes(name)) {
      setSettings(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('companyName', settings.companyName);
      data.append('contactInfo', settings.contactInfo);
      data.append('email', settings.email);
      data.append('phone', settings.phone);
      data.append('facebook', settings.socialLinks?.facebook || '');
      data.append('instagram', settings.socialLinks?.instagram || '');
      data.append('twitter', settings.socialLinks?.twitter || '');
      data.append('about', settings.about);
      data.append('privacyPolicy', settings.privacyPolicy);
      data.append('terms', settings.terms);

      if (logoFile) {
        data.append('logo', logoFile);
      }

      const res = await api.put('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showToast('Settings saved successfully.', 'success');
        setSettings(res.data.settings);
        setLogoFile(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = new FormData();
      data.append('name', adminName);
      if (adminAvatarFile) {
        data.append('avatar', adminAvatarFile);
      }
      const res = await updateAdminProfile(data);
      if (res.success) {
        showToast('Admin profile updated successfully.', 'success');
        setAdminAvatarFile(null);
      } else {
        showToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('Error updating profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body">
        <div className="card" style={{ height: '350px' }}>
          <h3>Loading settings...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Admin Profile Section */}
      <form onSubmit={handleAdminSubmit} className="card" style={{ marginBottom: '30px' }}>
        <div className="settings-card-header">
          <MdPerson className="settings-header-icon" />
          <h3>Admin Profile</h3>
        </div>
        <div className="grid-cols-2" style={{ gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Admin Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={adminName} 
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Avatar Photo</label>
            <input 
              type="file" 
              accept="image/*" 
              className="form-control" 
              onChange={(e) => setAdminAvatarFile(e.target.files[0])}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            <MdSave /> {savingProfile ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>

      <form onSubmit={handleSubmit} className="settings-form-layout">
        <div className="grid-cols-3" style={{ alignItems: 'flex-start' }}>
          
          {/* Brand/Contact Panel */}
          <div className="card settings-left-card col-span-2">
            <div className="settings-card-header">
              <MdSettings className="settings-header-icon" />
              <h3>Company Profile & Brand</h3>
            </div>
            
            <div className="settings-form-body">
              <div className="grid-cols-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input 
                    type="text" 
                    name="companyName" 
                    className="form-control" 
                    value={settings.companyName} 
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand Logo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="form-control" 
                    onChange={handleLogoChange}
                  />
                </div>
              </div>

              {settings.logo && !logoFile && (
                <div style={{ margin: '10px 0' }}>
                  <span className="form-label">Current Logo preview:</span>
                  <br />
                  <img src={settings.logo} alt="Logo" style={{ maxHeight: '44px', objectFit: 'contain', marginTop: '5px', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '4px', backgroundColor: '#fff' }} />
                </div>
              )}

              <div className="grid-cols-3" style={{ gap: '15px', marginTop: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input 
                    type="text" 
                    name="phone" 
                    className="form-control" 
                    value={settings.phone} 
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    value={settings.email} 
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Corporate Address</label>
                  <input 
                    type="text" 
                    name="contactInfo" 
                    className="form-control" 
                    value={settings.contactInfo} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label className="form-label">About Pitch / Tagline</label>
                <textarea 
                  name="about" 
                  rows="4" 
                  className="form-control" 
                  value={settings.about} 
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Social Links Panel */}
          <div className="card settings-right-card">
            <div className="settings-card-header">
              <h3>Social Networks</h3>
            </div>
            
            <div className="settings-form-body">
              <div className="form-group">
                <label className="form-label">Facebook Link</label>
                <input 
                  type="text" 
                  name="facebook" 
                  placeholder="https://facebook.com/..."
                  className="form-control" 
                  value={settings.socialLinks?.facebook || ''} 
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instagram Link</label>
                <input 
                  type="text" 
                  name="instagram" 
                  placeholder="https://instagram.com/..."
                  className="form-control" 
                  value={settings.socialLinks?.instagram || ''} 
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Twitter Link</label>
                <input 
                  type="text" 
                  name="twitter" 
                  placeholder="https://twitter.com/..."
                  className="form-control" 
                  value={settings.socialLinks?.twitter || ''} 
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Agreements */}
        <div className="card settings-bottom-card" style={{ marginTop: '30px' }}>
          <div className="settings-card-header" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MdLock style={{ color: 'var(--primary)', fontSize: '20px' }} />
            <h3>Terms & Legal Policies</h3>
          </div>
          
          <div className="grid-cols-2" style={{ gap: '24px', marginTop: '15px' }}>
            <div className="form-group">
              <label className="form-label">Privacy Policy Document</label>
              <textarea 
                name="privacyPolicy" 
                rows="6" 
                className="form-control" 
                value={settings.privacyPolicy} 
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Terms of Services & Shipping Conditions</label>
              <textarea 
                name="terms" 
                rows="6" 
                className="form-control" 
                value={settings.terms} 
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <MdSave /> {saving ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .col-span-2 {
          grid-column: span 2;
        }

        .settings-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }

        .settings-card-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .settings-header-icon {
          font-size: 20px;
          color: var(--primary);
        }

        @media (max-width: 1200px) {
          .col-span-2 {
            grid-column: span 1;
          }
          .settings-form-layout .grid-cols-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
