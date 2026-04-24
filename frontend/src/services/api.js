import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dhanai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const resendOTP = (data) => API.post('/auth/resend-otp', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const getMe = () => API.get('/auth/me');

// Expenses
export const fetchExpenses = () => API.get('/expenses');
export const addExpense = (data) => API.post('/expenses/add', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const uploadExpenseFile = (formData) =>
  API.post('/expenses/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Analytics
export const fetchSummary = () => API.get('/analytics/summary');
export const fetchTrends = () => API.get('/analytics/trends');
export const fetchForecast = () => API.get('/analytics/forecast');
export const fetchGoalStrategy = (data) => API.post('/analytics/goal-strategy', data);

// Chat
export const sendChatMessage = (message) => API.post('/chat', { message });
export const fetchChatHistory = () => API.get('/chat/history');
export const clearChatHistory = () => API.delete('/chat/history');

// Settings
export const fetchSettings = () => API.get('/settings');
export const updateProfile = (data) => API.patch('/settings/profile', data);
export const changePassword = (data) => API.patch('/settings/password', data);
export const updateCurrencyAPI = (currency) => API.patch('/settings/currency', { currency });
export const updateNotifications = (data) => API.patch('/settings/notifications', data);
export const exportCSV = () => API.get('/settings/export-csv', { responseType: 'blob' });
