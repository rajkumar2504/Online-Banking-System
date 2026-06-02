import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const TransactionHistory = ({ showToast }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactionsData, setTransactionsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load user accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.getMyAccounts();
        setAccounts(data || []);

        // Retrieve initial account from search param or default to first account
        const queryId = searchParams.get('accountId');
        if (queryId) {
          setSelectedAccountId(queryId);
        } else if (data && data.length > 0) {
          setSelectedAccountId(data[0].id.toString());
          setSearchParams({ accountId: data[0].id.toString() });
        }
      } catch (err) {
        showToast(err.message || 'Failed to fetch accounts', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [searchParams, setSearchParams, showToast]);

  // Load transactions
  const fetchTransactions = useCallback(async () => {
    if (!selectedAccountId) return;
    setTxLoading(true);
    try {
      const data = await api.getTransactionHistory(selectedAccountId, currentPage, 10);
      setTransactionsData(data);
    } catch (err) {
      showToast(err.message || 'Failed to load transactions', 'error');
    } finally {
      setTxLoading(false);
    }
  }, [selectedAccountId, currentPage, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAccountChange = (e) => {
    const accountId = e.target.value;
    setSelectedAccountId(accountId);
    setCurrentPage(0);
    setSearchParams({ accountId });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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

  const txContent = transactionsData?.content || [];
  const totalPages = transactionsData?.totalPages || 0;
  const totalElements = transactionsData?.totalElements || 0;
  const isFirst = transactionsData?.first ?? true;
  const isLast = transactionsData?.last ?? true;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Transaction History</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review complete transaction statements and transfer records</p>
        </div>

        {accounts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px' }}>
            <label className="form-label" htmlFor="history-account-select" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Active Checking Account
            </label>
            <select
              id="history-account-select"
              className="form-input form-select"
              value={selectedAccountId}
              onChange={handleAccountChange}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} (₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="card-glass empty-state txh-empty-state">
          <div className="txh-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5M12 7v5l4 2" />
            </svg>
          </div>
          <h3 className="txh-empty-heading">No transactions yet</h3>
          <p className="txh-empty-subtext">
            Your transaction history will appear here
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="card-glass" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Account Ledger Statement</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Records: {totalElements}</span>
          </div>

          {txLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
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
                    {txContent.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No transactions found for this account.
                        </td>
                      </tr>
                    ) : (
                      txContent.map((tx) => (
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

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="btn btn-secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={isFirst}>
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button className="btn btn-secondary" onClick={() => handlePageChange(currentPage + 1)} disabled={isLast}>
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
