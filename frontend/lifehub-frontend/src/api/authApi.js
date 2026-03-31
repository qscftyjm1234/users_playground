import axiosClient from './axiosClient';

const authApi = {
  login: (data) => axiosClient.post('/Auth/login', data),
  register: (data) => axiosClient.post('/Auth/register', data),
  googleLogin: (data) => axiosClient.post('/Auth/google-login', data),
};

export default authApi;
