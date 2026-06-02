import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error parsing and 401 management
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      // Redirect to login page on auth expiration
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Parse error message from Spring Boot backend
    const responseData = error.response?.data;
    let errorMessage = 'An unexpected error occurred';
    
    if (responseData) {
      if (typeof responseData === 'object') {
        if (responseData.error) {
          errorMessage = responseData.error;
        } else {
          // If validation errors map (e.g. Field validation error from binding results)
          const errorsList = Object.entries(responseData)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          errorMessage = errorsList || JSON.stringify(responseData);
        }
      } else {
        errorMessage = responseData;
      }
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiService = {
  // Auth REST calls
  register: (name, email, password) => {
    return apiClient.post('/api/auth/register', { name, email, password });
  },
  
  login: (email, password) => {
        return apiClient.post('/api/auth/login', { email, password }).then((res) => {
          const data = res.data;
          // Support both `accessToken` and `token` fields from backend
          const token = data.accessToken || data.token;
          if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', email);
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          }
          return data;
        });
      },

  // Account REST calls
  createAccount: (initialBalance) => {
    return apiClient.post('/api/account/create', { initialBalance: parseFloat(initialBalance) }).then((res) => res.data);
  },

  getMyAccounts: () => {
    return apiClient.get('/api/account/my-accounts').then((res) => res.data);
  },

  getAccountDetails: (id) => {
    return apiClient.get(`/api/account/${id}`).then((res) => res.data);
  },

  // Transaction REST calls
  deposit: (accountId, amount) => {
    return apiClient.post('/api/account/deposit', {
      accountId: parseInt(accountId),
      amount: parseFloat(amount)
    }).then((res) => res.data);
  },

  withdraw: (accountId, amount) => {
    return apiClient.post('/api/account/withdraw', {
      accountId: parseInt(accountId),
      amount: parseFloat(amount)
    }).then((res) => res.data);
  },

  transfer: (fromAccountId, toAccountId, amount) => {
    return apiClient.post('/api/account/transfer', {
      fromAccountId: parseInt(fromAccountId),
      toAccountId: parseInt(toAccountId),
      amount: parseFloat(amount)
    }).then((res) => res.data);
  },

  getTransactionHistory: (accountId, page = 0, size = 10) => {
    return apiClient.get(`/api/account/transactions/${accountId}`, {
      params: { page, size }
    }).then((res) => res.data);
  }
};
const api = { ...apiClient, ...apiService };
export default api;

