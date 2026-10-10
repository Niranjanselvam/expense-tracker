import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const transactionAPI = {
  getAll: (filters = {}) => 
    api.get('/transactions', { params: filters }),
  
  getById: (id) => 
    api.get(`/transactions/${id}`),
  
  create: (data) => 
    api.post('/transactions', data),
  
  update: (id, data) => 
    api.put(`/transactions/${id}`, data),
  
  delete: (id) => 
    api.delete(`/transactions/${id}`),
  
  getMonthlySummary: (year, month) => 
    api.get(`/transactions/summary/monthly/${year}/${month}`),
  
  getCategories: (type) => 
    api.get(`/transactions/categories/${type}`),
  
  exportCSV: (filters = {}) => 
    api.get('/transactions/export/csv', { 
      params: filters,
      responseType: 'blob'
    }),
};

export const dailyExpenseAPI = {
  getAll: (date = null) => 
    api.get('/tracker/daily', { params: { date } }),
  
  getToday: () => 
    api.get('/tracker/daily/today'),
  
  getActive: () => 
    api.get('/tracker/daily/active'),
  
  start: (date = null, category = 'Daily') => 
    api.post('/tracker/daily/start', { date, category }),
  
  stop: (id, amount, description = '') => 
    api.post(`/tracker/daily/stop/${id}`, { amount, description }),
  
  update: (id, data) => 
    api.put(`/tracker/daily/${id}`, data),
  
  delete: (id) => 
    api.delete(`/tracker/daily/${id}`),
};

export const incomeAPI = {
  getAll: (filters = {}) => 
    api.get('/tracker/income', { params: filters }),
  
  getMonthly: (year, month) => 
    api.get(`/tracker/income/monthly/${year}/${month}`),
  
  getMonthlyTotal: (year, month) => 
    api.get(`/tracker/income/total/${year}/${month}`),
  
  create: (data) => 
    api.post('/tracker/income', data),
  
  update: (id, data) => 
    api.put(`/tracker/income/${id}`, data),
  
  delete: (id) => 
    api.delete(`/tracker/income/${id}`),
};

export const monthlyNotesAPI = {
  get: (year, month) => 
    api.get(`/tracker/notes/${year}/${month}`),
  
  createOrUpdate: (data) => 
    api.post('/tracker/notes', data),
};

export default api;
