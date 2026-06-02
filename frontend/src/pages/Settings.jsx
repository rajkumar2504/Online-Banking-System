import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = ({ showToast }) => {
  const { user } = useAuth();

  // Profile state
  const [fullName, setFullName] = useState(() => {
    if (!user?.email) return '';
    const name = user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  });

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences state
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Danger zone: delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const getMaskedEmail = (emailStr) => {
    if (!emailStr) return '•••@example.com';
    const parts = emailStr.split('@');
    if (parts.length < 2) return emailStr;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name}•••@${domain}`;
    return `${name.substring(0, 2)}•••@${domain}`;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    showToast('Profile updated successfully!', 'success');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    showToast('Password updated successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }
    showToast('Account deletion requested — this is a demo', 'info');
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="settings-grid">
        {/* ── 1. Profile Settings ── */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title">Profile Settings</h2>
              <p className="settings-card-subtitle">Update your display name and account info</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-full-name">Full Name</label>
              <input
                id="settings-full-name"
                type="text"
                className="form-input"
                placeholder="Your display name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="settings-email"
                  type="text"
                  className="form-input"
                  value={getMaskedEmail(user?.email)}
                  readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed', paddingRight: '80px' }}
                />
                <span style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.04)', padding: '2px 8px',
                  borderRadius: '4px', border: '1px solid var(--border-glass)',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>Read-only</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Save Changes
            </button>
          </form>
        </section>

        {/* ── 2. Security ── */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title">Security</h2>
              <p className="settings-card-subtitle">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-current-pw">Current Password</label>
              <input
                id="settings-current-pw"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-new-pw">New Password</label>
              <input
                id="settings-new-pw"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-confirm-pw">Confirm New Password</label>
              <input
                id="settings-confirm-pw"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Update Password
            </button>
          </form>
        </section>

        {/* ── 3. Preferences ── */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title">Preferences</h2>
              <p className="settings-card-subtitle">Customize your experience</p>
            </div>
          </div>

          {/* Currency */}
          <div className="settings-pref-row">
            <div>
              <div className="settings-pref-label">Currency Display</div>
              <div className="settings-pref-desc">Used across all balances and amounts</div>
            </div>
            <div className="settings-currency-badge">₹ INR</div>
          </div>

          {/* Notifications toggle */}
          <div className="settings-pref-row">
            <div>
              <div className="settings-pref-label">Notifications</div>
              <div className="settings-pref-desc">
                {notificationsOn ? 'Enabled — receiving all alerts' : 'Disabled — no alerts'}
              </div>
            </div>
            <button
              id="settings-notifications-toggle"
              className={`settings-toggle ${notificationsOn ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => setNotificationsOn(!notificationsOn)}
              aria-pressed={notificationsOn}
              title={notificationsOn ? 'Turn off notifications' : 'Turn on notifications'}
            >
              <div className="settings-toggle-thumb" />
            </button>
          </div>

          {/* Theme toggle */}
          <div className="settings-pref-row">
            <div>
              <div className="settings-pref-label">Theme</div>
              <div className="settings-pref-desc">
                {isDarkMode ? '🌙 Dark mode active' : '☀️ Light mode active'}
              </div>
            </div>
            <button
              id="settings-theme-toggle"
              className={`settings-toggle ${isDarkMode ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-pressed={isDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="settings-toggle-thumb" />
            </button>
          </div>
        </section>

        {/* ── 4. Danger Zone ── */}
        <section className="settings-card settings-danger-card">
          <div className="settings-card-header">
            <div className="settings-card-icon settings-danger-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title" style={{ color: 'var(--color-error)' }}>Danger Zone</h2>
              <p className="settings-card-subtitle">Irreversible and destructive actions</p>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
            Once you delete your account, all data including accounts and transactions will be permanently removed. This action cannot be undone.
          </p>

          <button
            id="settings-delete-account-btn"
            className="btn-danger-outline"
            onClick={() => setShowDeleteModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete Account
          </button>
        </section>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ borderColor: 'rgba(244, 63, 94, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)', flexShrink: 0
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="modal-title" style={{ marginBottom: 0, color: 'var(--color-error)' }}>Delete Account</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>This action is permanent and cannot be undone</p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
              Type <strong style={{ color: 'var(--color-error)' }}>DELETE</strong> in the box below to confirm account deletion.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <input
                id="settings-delete-confirm-input"
                type="text"
                className="form-input"
                placeholder='Type "DELETE" to confirm'
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                style={{ borderColor: deleteConfirmText === 'DELETE' ? 'var(--color-error)' : undefined }}
              />
            </div>

            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>
                Cancel
              </button>
              <button
                id="settings-delete-confirm-btn"
                className="btn"
                style={{
                  background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: 'var(--color-error)',
                  opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed'
                }}
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
