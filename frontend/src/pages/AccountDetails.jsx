import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const AccountDetails = ({ showToast }) => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDetails = useCallback(async () => {
    try {
      const accData = await api.getAccountDetails(id);
      setAccount(accData);
      
      const txData = await api.getTransactionHistory(id, 0, 5);
      setTransactions(txData?.content || []);
    } catch (err) {
      showToast(err.message || 'Failed to load account details', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Overview
        </button>
      </div>

      {/* Account Info Panel */}
      <div className="summary-container" style={{ marginBottom: '32px' }}>
        <div className="card-glass balance-card-redesign" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="title">Account Number</div>
            <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              {account?.accountNumber}
            </div>
            <div className="title">Available Balance</div>
            <div className="amount" style={{ marginBottom: '0', fontSize: '2.5rem' }}>
              ₹{parseFloat(account?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <span className="badge badge-info">Checking Account</span>
            <span className="badge badge-success">Account ID: #{account?.id}</span>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="card-glass" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Account Operations</h3>
          
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/deposit?accountId=${account?.id}`)}
            style={{ width: '100%', background: 'var(--gradient-cyan)' }}
          >
            Deposit Funds
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/withdraw?accountId=${account?.id}`)}
            style={{ width: '100%' }}
          >
            Withdraw Funds
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/transfer?accountId=${account?.id}`)}
            style={{ width: '100%', borderColor: 'rgba(139, 92, 246, 0.3)', color: 'var(--color-accent)' }}
          >
            Transfer Money
          </button>
        </div>
      </div>

      {/* Recent Ledger Records */}
      <div className="card-glass" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Recent Activity</h3>
          {transactions.length > 0 && (
            <Link
              to={`/transactions?accountId=${account?.id}`}
              style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
            >
              View Full Statement
            </Link>
          )}
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Details</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No recent transaction activity.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{tx.id}</td>
                    <td>
                      <span className={`badge ${tx.type === 'DEPOSIT' ? 'badge-success' : tx.type === 'WITHDRAWAL' ? 'badge-error' : 'badge-info'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: tx.type === 'DEPOSIT' ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      {tx.type === 'TRANSFER' && tx.targetAccountId ? (
                        <span>To Account #{tx.targetAccountId}</span>
                      ) : tx.type === 'DEPOSIT' && tx.targetAccountId ? (
                        <span>From Account #{tx.targetAccountId}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Self-directed</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatTimestamp(tx.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
