import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const expenseService = {
  getExpenses: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/expenses?${params}`);
    return response.data;
  },
  
  getSummary: async () => {
    const response = await api.get('/expenses/summary');
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
  
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default api;
