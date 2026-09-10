// API Configuration
// Detect if we're running locally or on a server
// const getBaseUrl = () => {
//   // If the page is served from the backend (same origin)
//   if (window.location.port === '5000' || window.location.port === '') {
//     return `${window.location.origin}/api`;
//   }
//   // If the page is served from a different port (live server, etc.)
//   // Try to connect to the backend on port 5000
//   return 'http://172.20.10.3:5000/api';
// };


// const API_BASE_URL = getBaseUrl();
// API Configuration
const API_BASE_URL = 'https://fx-pro-backend.onrender.com/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Get user from localStorage
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
const isAuthenticated = () => !!getToken();

// Check if user is admin
const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// API Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  };

  // Add body for non-GET requests
  if (options.body && config.method !== 'GET') {
    if (options.body instanceof FormData) {
      // Don't set Content-Type for FormData - browser will set it with boundary
      delete config.headers['Content-Type'];
      config.body = options.body;
    } else if (typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    } else {
      config.body = options.body;
    }
  }

  // Add auth token if available
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`Making ${config.method} request to:`, url); // Debug log
    
    const response = await fetch(url, config);
    
    console.log('Response status:', response.status); // Debug log
    
    // Get response text first
    const responseText = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Not valid JSON
      console.error('Invalid JSON response:', responseText);
      throw new Error('Server returned invalid response. Please check if the backend is running.');
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Provide more helpful error messages
    // if (error.message.includes('Failed to fetch')) {
    //   throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
    // }
    if (error.message.includes('Failed to fetch')) {
  throw new Error('Cannot connect to server. Please check your internet or if the backend service is awake.');
}
    
    throw error;
  }
};

// Auth APIs
const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials
  }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
};

// User APIs
const userAPI = {
  getDashboard: () => apiRequest('/user/dashboard'),
  
  getProfile: () => apiRequest('/user/profile'),
  
  updateProfile: (data) => apiRequest('/user/update-profile', {
    method: 'PUT',
    body: data
  }),
  
  getTransactions: (page = 1, limit = 20) => 
    apiRequest(`/user/transactions?page=${page}&limit=${limit}`)
};

// Deposit APIs
const depositAPI = {
  create: (formData) => apiRequest('/deposits', {
    method: 'POST',
    body: formData
  }),
  
  getMyDeposits: () => apiRequest('/deposits'),
  
  getAll: (status, page = 1, limit = 20) => 
    apiRequest(`/deposits/all?status=${status}&page=${page}&limit=${limit}`),
  
  approve: (id) => apiRequest(`/deposits/admin/${id}/approve`, {
    method: 'PUT'
  }),
  
  decline: (id, notes) => apiRequest(`/deposits/admin/${id}/decline`, {
    method: 'PUT',
    body: { notes }
  })
};

// Withdrawal APIs
const withdrawalAPI = {
  create: (data) => apiRequest('/withdrawals', {
    method: 'POST',
    body: data
  }),
  
  getMyWithdrawals: () => apiRequest('/withdrawals'),
  
  getAll: (status, page = 1, limit = 20) => 
    apiRequest(`/withdrawals/all?status=${status}&page=${page}&limit=${limit}`),
  
  approve: (id) => apiRequest(`/withdrawals/admin/${id}/approve`, {
    method: 'PUT'
  }),
  
  decline: (id, notes) => apiRequest(`/withdrawals/admin/${id}/decline`, {
    method: 'PUT',
    body: { notes }
  })
};

// Investment Plan APIs
const investmentPlanAPI = {
  getAll: () => apiRequest('/investment-plans'),
  
  getAllAdmin: () => apiRequest('/investment-plans/all'),
  
  create: (data) => apiRequest('/investment-plans', {
    method: 'POST',
    body: data
  }),
  
  update: (id, data) => apiRequest(`/investment-plans/${id}`, {
    method: 'PUT',
    body: data
  }),
  
  delete: (id) => apiRequest(`/investment-plans/${id}`, {
    method: 'DELETE'
  })
};

// Investment APIs
const investmentAPI = {
  create: (data) => apiRequest('/investments', {
    method: 'POST',
    body: data
  }),
  
  getMyInvestments: () => apiRequest('/investments'),
  
  getAll: (status, page = 1, limit = 20) => 
    apiRequest(`/investments/admin/all?status=${status}&page=${page}&limit=${limit}`),
  
  complete: (id) => apiRequest(`/investments/admin/${id}/complete`, {
    method: 'PUT'
  })
};

// Loan APIs
const loanAPI = {
  getPlans: () => apiRequest('/loans/plans'),
  
  getPlansAdmin: () => apiRequest('/loans/plans/all'),
  
  createPlan: (data) => apiRequest('/loans/plans', {
    method: 'POST',
    body: data
  }),
  
  updatePlan: (id, data) => apiRequest(`/loans/plans/${id}`, {
    method: 'PUT',
    body: data
  }),
  
  deletePlan: (id) => apiRequest(`/loans/plans/${id}`, {
    method: 'DELETE'
  }),
  
  request: (data) => apiRequest('/loans/request', {
    method: 'POST',
    body: data
  }),
  
  getMyLoans: () => apiRequest('/loans'),
  
  getAll: (status, page = 1, limit = 20) => 
    apiRequest(`/loans/admin/all?status=${status}&page=${page}&limit=${limit}`),
  
  approve: (id) => apiRequest(`/loans/admin/${id}/approve`, {
    method: 'PUT'
  }),
  
  decline: (id, notes) => apiRequest(`/loans/admin/${id}/decline`, {
    method: 'PUT',
    body: { notes }
  })
};

// KYC APIs
const kycAPI = {
  submit: (formData) => apiRequest('/kyc', {
    method: 'POST',
    body: formData
  }),
  
  getMyKYC: () => apiRequest('/kyc'),
  
  getAll: (status, page = 1, limit = 20) => 
    apiRequest(`/kyc/admin/all?status=${status}&page=${page}&limit=${limit}`),
  
  approve: (id) => apiRequest(`/kyc/admin/${id}/approve`, {
    method: 'PUT'
  }),
  
  reject: (id, reason) => apiRequest(`/kyc/admin/${id}/reject`, {
    method: 'PUT',
    body: { reason }
  })
};

// Message APIs
const messageAPI = {
  send: (data) => apiRequest('/messages', {
    method: 'POST',
    body: data
  }),
  
  getMessages: (userId) => apiRequest(`/messages/${userId || ''}`),
  
  getConversations: () => apiRequest('/messages/admin/conversations'),
  
  getUnreadCount: () => apiRequest('/messages/unread/count')
};

// Settings APIs
const settingsAPI = {
  get: () => apiRequest('/settings'),
  
  getAdmin: () => apiRequest('/settings/admin'),
  
  update: (data) => apiRequest('/settings', {
    method: 'PUT',
    body: data
  }),
  
  getBTCWallet: () => apiRequest('/settings/btc-wallet'),
  
  updateBTCWallet: (data) => apiRequest('/settings/btc-wallet', {
    method: 'PUT',
    body: data
  })
};

// Referral APIs
const referralAPI = {
  getMyReferrals: () => apiRequest('/referrals'),
  
  getStats: () => apiRequest('/referrals/admin/stats')
};

// Admin APIs
const adminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  
  getUsers: (search, kycStatus, page = 1, limit = 20) => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (kycStatus) url += `&kycStatus=${kycStatus}`;
    return apiRequest(url);
  },
  // LOOOOOOOOLLLLLL

  // logout: () => {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('admin');
  //   window.location.href = 'login.html';
  // },

  // LOOOOOOOOOLLLLLL





  
  getUser: (id) => apiRequest(`/admin/users/${id}`),
  
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: data
  }),
  
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, {
    method: 'DELETE'
  }),
  
  getLogs: (page = 1, limit = 50) => 
    apiRequest(`/admin/logs?page=${page}&limit=${limit}`),
  
  addLog: (data) => apiRequest('/admin/logs', {
    method: 'POST',
    body: data
  })
};

// Notification APIs
const notificationAPI = {
  getAll: (page = 1, limit = 20) => 
    apiRequest(`/notifications?page=${page}&limit=${limit}`),
  
  getUnreadCount: () => apiRequest('/notifications/unread-count'),
  
  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, {
    method: 'PUT'
  }),
  
  markAllAsRead: () => apiRequest('/notifications/read-all', {
    method: 'PUT'
  }),
  
  delete: (id) => apiRequest(`/notifications/${id}`, {
    method: 'DELETE'
  }),
  
  // Admin only
  broadcast: (message, type = 'system') => apiRequest('/notifications/broadcast', {
    method: 'POST',
    body: { message, type }
  })
};

// Crypto APIs
const cryptoAPI = {
  getPrices: () => apiRequest('/crypto/prices'),
  
  getTrending: () => apiRequest('/crypto/trending'),
  
  getHistory: (coinId, days = 7) => 
    apiRequest(`/crypto/history/${coinId}?days=${days}`)
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount || 0);
};

// Format date
const formatDate = (dateString, options = {}) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
};

// Format datetime
const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Show alert as a sliding toast notification (top-right, slides in from the side)
const showAlert = (message, type = 'info', container = null) => {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 4500);
};

// Show loading
const showLoading = (container) => {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading';
  loadingDiv.innerHTML = '<div class="spinner"></div>';
  container.innerHTML = '';
  container.appendChild(loadingDiv);
};

// Export all
window.API = {
  auth: authAPI,
  user: userAPI,
  deposit: depositAPI,
  withdrawal: withdrawalAPI,
  investmentPlan: investmentPlanAPI,
  investment: investmentAPI,
  loan: loanAPI,
  kyc: kycAPI,
  message: messageAPI,
  settings: settingsAPI,
  referral: referralAPI,
  admin: adminAPI,
  notification: notificationAPI,
  crypto: cryptoAPI,
  utils: {
    formatCurrency,
    formatDate,
    formatDateTime,
    showAlert,
    showLoading,
    getToken,
    getUser,
    isAuthenticated,
    isAdmin,
    getBaseUrl: () => API_BASE_URL.replace(/\/api\/?$/, '')
  }
};
