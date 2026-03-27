import axios from 'axios';

const axiosClient = axios.create({
  // Vite dev server proxies /api to https://localhost:5001/api
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

