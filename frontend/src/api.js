import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  timeout: 10000,
});

// Response interceptor to provide friendly error messages
api.interceptors.response.use(
  res => res,
  err => {
    const msg = (err.response && err.response.data && (err.response.data.message || err.response.data.error)) || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

export default api;
