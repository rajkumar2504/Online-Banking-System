import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const Transfer = ({ showToast }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.getMyAccounts();
        setAccounts(data || []);
        
        // Auto-select from query param or default to first account
        const queryId = searchParams.get('accountId');
        if (queryId) {
          setSelectedAccountId(queryId);
        } else if (data && data.length > 0) {
          setSelectedAccountId(data[0].id.toString());
        }
      } catch (err) {
        showToast(err.message || 'Failed to fetch accounts', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [searchParams, showToast]);

  const getSelectedAccountBalance = () => {
    const acc = accounts.find((a) => a.id.toString() === selectedAccountId);
    return acc ? acc.balance : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccountId || !targetAccountId || !amount) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    if (selectedAccountId === targetAccountId) {
      showToast('Cannot transfer to the same account', 'error');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      showToast('Amount must be greater than zero', 'error');
      return;
    }

    const currentBalance = getSelectedAccountBalance();
    if (transferAmount > currentBalance) {
      showToast('Insufficient balance for this transfer', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.transfer(selectedAccountId, targetAccountId, amount);
      showToast(`Successfully transferred ₹${transferAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to Account ID #${targetAccountId}!`, 'success');
      navigate(`/account/${selectedAccountId}`);
    } catch (err) {
      showToast(err.message || 'Transfer failed. Check if destination account ID exists.', 'error');
    } finally {
      setSubmitLoading(false);
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
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Transfer Money</h1>
        <p style={{ color: 'var(--text-muted)' }}>Move capital securely between checking accounts or to another customer</p>
      </div>

      <div className="card-glass form-card">
        {accounts.length === 0 ? (
          <div className="transfer-empty-state">
            {/* Transfer arrows icon */}
            <div className="transfer-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />
              </svg>
            </div>
            <h3 className="transfer-empty-heading">No accounts to transfer from</h3>
            <p className="transfer-empty-subtext">You need at least one checking account</p>
            <button className="btn btn-primary" style={{ marginBottom: '32px' }} onClick={() => navigate('/')}>
              Create Account
            </button>

            {/* Greyed-out form preview */}
            <div className="transfer-form-preview">
              <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Form Preview
              </p>
              <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
                <div className="form-group">
                  <label className="form-label">From Account</label>
                  <select className="form-input form-select" disabled>
                    <option>Select account...</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">To Account Number</label>
                  <input type="text" className="form-input" placeholder="e.g. 2" disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="0.00" disabled />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="transfer-source-select">Source Checking Account</label>
              <select
                id="transfer-source-select"
                className="form-input form-select"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountNumber} (Balance: ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="transfer-target-input">Destination Account ID</label>
              <input
                id="transfer-target-input"
                type="number"
                className="form-input"
                placeholder="e.g. 2"
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                Enter the numerical ID of the recipient's bank account.
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" htmlFor="transfer-amount-input">Amount to Transfer (₹)</label>
              <input
                id="transfer-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '30px', textAlign: 'right' }}>
              Available: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{getSelectedAccountBalance().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(-1)} disabled={submitLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }} disabled={submitLoading}>
                {submitLoading ? <div className="spinner spinner-sm"></div> : 'Confirm Transfer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Transfer;
