import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const toQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  return params.toString();
};

export const expenseService = {
  getExpenses: async (filters = {}) => {
    const queryString = toQueryString(filters);
    const response = await api.get(`/expenses${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },
  
  getSummary: async (filters = {}) => {
    const queryString = toQueryString(filters);
    const response = await api.get(`/expenses/summary${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },
  
  getInsights: async () => {
    const response = await api.get('/expenses/insights');
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/expenses/categories');
    return response.data;
  },
  
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.patch(`/expenses/${id}`, expenseData);
    return response.data;
  },
  
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default api;
