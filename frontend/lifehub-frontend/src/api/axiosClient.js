import axios from 'axios';

const axiosClient = axios.create({
  // Vite dev server proxies /api to https://localhost:5001/api
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('lifehub-token');
    
    // 相容性修復：如果獨立 token 不存在，嘗試從 lifehub-user 物件中取出
    if (!token) {
      const savedUser = localStorage.getItem('lifehub-user');
      if (savedUser) {
        try {
          const userObj = JSON.parse(savedUser);
          token = userObj.token;
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;

