import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase() + (email.split('@')[0].charAt(1) || '').toUpperCase();
  };

  const getUserName = (email) => {
    if (!email) return 'User';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // SVGs designed to match the mockup style
  const DashboardIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-link-icon">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );

  const AccountsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-link-icon">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );

  const TransferIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-link-icon">
      <path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />
    </svg>
  );

  const HistoryIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-link-icon">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5M12 7v5l4 2" />
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-link-icon">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-link-icon">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sidebar-link-icon">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );

  const ToggleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
    </svg>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="sidebar-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Nexa<span>Bank</span>
        </div>
        <button className="sidebar-toggle-btn" style={{ padding: '8px' }} onClick={handleLogout} title="Logout">
          <LogoutIcon />
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Nexa<span>Bank</span>
            </div>
          )}
          <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand" : "Collapse"}>
            <ToggleIcon />
          </button>
        </div>

        {/* User Profile Block — fixed overflow */}
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: 'var(--gradient-primary)' }}>
            {getInitials(user?.email)}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name" title={getUserName(user?.email)}>{getUserName(user?.email)}</span>
              <span className="user-premium-badge">Premium Member</span>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {/* MAIN CATEGORY */}
          <div className="sidebar-section-title">MAIN</div>
          <ul className="sidebar-menu">
            <li>
              {/* Dashboard is only active on exact "/" */}
              <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <DashboardIcon />
                <span className="sidebar-link-text">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/accounts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <AccountsIcon />
                <span className="sidebar-link-text">Accounts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/transfer" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <TransferIcon />
                <span className="sidebar-link-text">Transfer</span>
              </NavLink>
            </li>
            <li>
              {/* Transactions page — use a custom active check to avoid conflicting with /transactions above */}
              <NavLink
                to="/transactions?history=true"
                className={({ isActive }) => {
                  // Check if the URL search contains history=true
                  const url = window.location.search;
                  const hasHistory = url.includes('history=true');
                  return `sidebar-link ${isActive && hasHistory ? 'active' : ''}`;
                }}
              >
                <HistoryIcon />
                <span className="sidebar-link-text">Transactions</span>
              </NavLink>
            </li>
          </ul>

          {/* OTHER CATEGORY */}
          <div className="sidebar-section-title">OTHER</div>
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <AnalyticsIcon />
                <span className="sidebar-link-text">Analytics</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <SettingsIcon />
                <span className="sidebar-link-text">Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogoutIcon />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar">
        <NavLink to="/" end className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/accounts" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <AccountsIcon />
          <span>Accounts</span>
        </NavLink>
        <NavLink to="/transfer" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <TransferIcon />
          <span>Transfer</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <AnalyticsIcon />
          <span>Analytics</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Sidebar;
