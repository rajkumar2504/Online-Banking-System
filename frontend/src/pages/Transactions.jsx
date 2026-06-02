import React from 'react';
import TransactionHistory from './TransactionHistory';

// Transactions page – a thin wrapper around the TransactionHistory component.
// This file resolves the missing import error in App.jsx.
const Transactions = (props) => {
  // Props can be passed through if needed (e.g., showToast).
  return <TransactionHistory {...props} />;
};

export default Transactions;
