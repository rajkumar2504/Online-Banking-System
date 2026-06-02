import React from 'react';
import AccountDetails from './AccountDetails';

// Accounts page – wrapper around AccountDetails component.
// This satisfies the missing import in App.jsx.
const Accounts = (props) => {
  // Forward any props (e.g., showToast) to AccountDetails.
  return <AccountDetails {...props} />;
};

export default Accounts;
