import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ showToast }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [initialBalance, setInitialBalance] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Stats summaries
  const [stats, setStats] = useState({
    totalDeposited: 0,
    depositCount: 0,
    totalWithdrawn: 0,
    withdrawnCount: 0,
  });

  const navigate = useNavigate();

  // Dynamic Greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = (email) => {
    if (!email) return 'Guest';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getInitials = (email) => {
    if (!email) return 'G';
    return email.charAt(0).toUpperCase() + (email.split('@')[0].charAt(1) || '').toUpperCase();
  };

  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const maskCardNumber = (accNum) => {
    if (!accNum) return '**** **** ****';
    const last4 = accNum.slice(-4);
    return `**** **** ${last4}`;
  };

  const maskAccountMini = (accNum) => {
    if (!accNum) return '••0000';
    return `••${accNum.slice(-4)}`;
  };

  const formatRupee = (value) => {
    return `₹${parseFloat(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Main fetch operations
  const fetchDashboardData = useCallback(async () => {
    try {
      const activeAccounts = await api.getMyAccounts();
      setAccounts(activeAccounts || []);

      if (activeAccounts && activeAccounts.length > 0) {
        // Fetch transactions for the primary (first) account to populate the recent activity ledger
        const primaryId = activeAccounts[0].id;
        const txData = await api.getTransactionHistory(primaryId, 0, 5);
        const txList = txData?.content || [];
        setTransactions(txList);

        // Aggregate statistics across recent transactions for visual summary cards
        let totalDep = 0;
        let depCount = 0;
        let totalWith = 0;
        let withCount = 0;

        txList.forEach((tx) => {
          if (tx.type === 'DEPOSIT') {
            totalDep += tx.amount;
            depCount++;
          } else if (tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER') {
            totalWith += tx.amount;
            withCount++;
          }
        });

        setStats({
          totalDeposited: totalDep,
          depositCount: depCount,
          totalWithdrawn: totalWith,
          withdrawnCount: withCount,
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to sync dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const balance = initialBalance === '' ? 0 : parseFloat(initialBalance);
    if (balance < 0) {
      showToast('Initial balance cannot be negative', 'error');
      return;
    }

    setCreateLoading(true);
    try {
      await api.createAccount(balance);
      showToast('New checking account created successfully!', 'success');
      setModalOpen(false);
      setInitialBalance('');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to create account', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  };

  const formatTxDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return timestamp;
    }
  };

  // SVGs for arrow indicators and quick actions
  const CircleArrowDown = () => (
    <div className="tx-circle-badge tx-circle-deposit">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
    </div>
  );

  const CircleArrowUp = () => (
    <div className="tx-circle-badge tx-circle-withdraw">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </div>
  );

  const CircleArrowTransfer = () => (
    <div className="tx-circle-badge tx-circle-transfer">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m17 3 4 4-4 4M21 7H3M7 21l-4-4 4-4M3 17h18" />
      </svg>
    </div>
  );

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Top Header Bar */}
      <div className="dashboard-top-bar">
        <div className="dashboard-greeting">
          <h1>{getGreeting()}, {getUserName(user?.email)} 👋</h1>
          <p>{formatDate()}</p>
        </div>
        
        <div className="dashboard-user-actions">
          {/* Notification Icon */}
          <button className="header-action-btn" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          {/* Initials Avatar */}
          <div className="header-avatar" title={user?.email}>
            {getInitials(user?.email)}
          </div>
          {/* Menu button */}
          <button className="header-action-btn" title="Options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid of 3 stats summary cards */}
      <div className="summary-stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Total Balance</div>
          <div className="stat-card-value">{formatRupee(calculateTotalBalance())}</div>
          {calculateTotalBalance() === 0 ? (
            <div className="stat-card-subtitle" style={{ color: 'var(--text-disabled)' }}>No transactions yet</div>
          ) : (
            <div className="stat-card-subtitle stat-subtitle-success">Active accounts</div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Deposited</div>
          <div className="stat-card-value">{formatRupee(stats.totalDeposited)}</div>
          {stats.totalDeposited === 0 ? (
            <div className="stat-card-subtitle" style={{ color: 'var(--text-disabled)' }}>No transactions yet</div>
          ) : (
            <div className="stat-card-subtitle stat-subtitle-primary" onClick={() => navigate('/transactions?history=true')}>
              {stats.depositCount} {stats.depositCount === 1 ? 'transaction' : 'transactions'}
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Withdrawn</div>
          <div className="stat-card-value">{formatRupee(stats.totalWithdrawn)}</div>
          {stats.totalWithdrawn === 0 ? (
            <div className="stat-card-subtitle" style={{ color: 'var(--text-disabled)' }}>No transactions yet</div>
          ) : (
            <div className="stat-card-subtitle stat-subtitle-accent" onClick={() => navigate('/transactions?history=true')}>
              {stats.withdrawnCount} {stats.withdrawnCount === 1 ? 'transaction' : 'transactions'}
            </div>
          )}
        </div>
      </div>

      {/* Accounts Section */}
      <div style={{ marginBottom: '32px' }}>
        <div className="accounts-section-header">
          <h2 style={{ fontSize: '1.25rem' }}>Active Accounts</h2>
        </div>

        {accounts.length === 0 ? (
          <div className="card-glass empty-state dashboard-empty-accounts">
            {/* Illustrated bank/card SVG */}
            <div className="dashboard-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="6" y1="15" x2="9" y2="15" />
                <line x1="11" y1="15" x2="14" y2="15" />
              </svg>
            </div>
            <h3 className="dashboard-empty-heading">No accounts yet</h3>
            <p className="dashboard-empty-subtext">
              Create your first checking account to start managing your finances
            </p>
            <button className="btn btn-primary" style={{ marginTop: '4px' }} onClick={() => setModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Account
            </button>
          </div>
        ) : (
          <div className="account-cards-grid">
            {accounts.map((acc, idx) => (
              <div 
                key={acc.id} 
                className={`nexa-account-card ${idx > 0 ? 'secondary' : ''}`}
              >
                <div className="nexa-card-header">
                  <div className="nexa-card-title-group">
                    <span className="nexa-card-type">Checking Account</span>
                    <span className="nexa-card-number">{maskCardNumber(acc.accountNumber)}</span>
                  </div>
                  <span className={`nexa-card-badge ${idx === 0 ? 'nexa-badge-primary' : 'nexa-badge-secondary'}`}>
                    {idx === 0 ? 'Primary' : 'Secondary'}
                  </span>
                </div>
                <div className="nexa-card-balance">
                  {formatRupee(acc.balance)}
                </div>
                <div className="nexa-card-buttons">
                  <button className="nexa-card-btn" onClick={() => navigate(`/deposit?accountId=${acc.id}`)}>Deposit</button>
                  <button className="nexa-card-btn" onClick={() => navigate(`/withdraw?accountId=${acc.id}`)}>Withdraw</button>
                  <button className="nexa-card-btn" onClick={() => navigate(`/account/${acc.id}`)}>Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Grid (4 Buttons) */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Quick Actions</h2>
        <div className="quick-action-grid">
          <div className="quick-action-card-btn" onClick={() => setModalOpen(true)}>
            <div className="quick-action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="quick-action-text">New Account</span>
          </div>

          <div className="quick-action-card-btn" onClick={() => navigate('/transfer')}>
            <div className="quick-action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />
              </svg>
            </div>
            <span className="quick-action-text">Transfer</span>
          </div>

          <div className="quick-action-card-btn" onClick={() => navigate('/deposit')}>
            <div className="quick-action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="quick-action-text">Deposit</span>
          </div>

          <div className="quick-action-card-btn" onClick={() => navigate('/withdraw')}>
            <div className="quick-action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="quick-action-text">Withdraw</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div style={{ marginBottom: '32px' }}>
        <div className="ledger-header">
          <h2 style={{ fontSize: '1.25rem' }}>Recent Transactions</h2>
          {accounts.length > 0 && (
            <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); navigate(`/transactions?accountId=${accounts[0].id}`); }}>
              View all 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          )}
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>DATE</th>
                <th>ACCOUNT</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No active accounts.</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No transaction logs.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="nexa-tx-desc-cell">
                      {tx.type === 'DEPOSIT' ? (
                        <CircleArrowDown />
                      ) : tx.type === 'WITHDRAWAL' ? (
                        <CircleArrowUp />
                      ) : (
                        <CircleArrowTransfer />
                      )}
                      <span className="tx-desc-text">
                        {tx.type === 'TRANSFER' && tx.targetAccountId ? (
                          `Transfer to ${maskAccountMini(tx.targetAccountId.toString())}`
                        ) : tx.type === 'DEPOSIT' && tx.targetAccountId ? (
                          `Transfer from ${maskAccountMini(tx.targetAccountId.toString())}`
                        ) : tx.type === 'DEPOSIT' ? (
                          'Deposit'
                        ) : (
                          'Withdrawal'
                        )}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatTxDate(tx.timestamp)}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {maskAccountMini(accounts[0].accountNumber)}
                    </td>
                    <td style={{
                      fontWeight: '600',
                      color: tx.type === 'DEPOSIT' ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{formatRupee(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Creation Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Open New Checking Account</h3>
            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-initial-balance">
                  Initial Deposit (₹)
                </label>
                <input
                  id="modal-initial-balance"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={createLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? <div className="spinner spinner-sm"></div> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
