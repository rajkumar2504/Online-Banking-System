import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const Withdraw = ({ showToast }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
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
    if (!selectedAccountId || !amount) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      showToast('Amount must be greater than zero', 'error');
      return;
    }

    const currentBalance = getSelectedAccountBalance();
    if (withdrawAmount > currentBalance) {
      showToast('Insufficient balance for this withdrawal', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.withdraw(selectedAccountId, amount);
      showToast(`Successfully withdrew ₹${withdrawAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}!`, 'success');
      navigate(`/account/${selectedAccountId}`);
    } catch (err) {
      showToast(err.message || 'Withdrawal failed', 'error');
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
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Withdraw Funds</h1>
        <p style={{ color: 'var(--text-muted)' }}>Securely withdraw capital from your active checking accounts</p>
      </div>

      <div className="card-glass form-card">
        {accounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You need an active checking account to make a withdrawal.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Create Account First
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="withdraw-account-select">Select Checking Account</label>
              <select
                id="withdraw-account-select"
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

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" htmlFor="withdraw-amount-input">Amount to Withdraw (₹)</label>
              <input
                id="withdraw-amount-input"
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
                {submitLoading ? <div className="spinner spinner-sm"></div> : 'Confirm Withdrawal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Withdraw;
