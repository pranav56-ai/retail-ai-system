import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://retail-ai-system-3kqt.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('retail_token');
  if (token) {
    config.headers.Authorization = \Bearer \\;
  }
  return config;
});

export default api;
