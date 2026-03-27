import axiosClient from './axiosClient';

const authApi = {
  login: (data) => axiosClient.post('/auth/login', data),
  register: (data) => axiosClient.post('/auth/register', data),
  googleLogin: (data) => axiosClient.post('/auth/google-login', data),
};

export default authApi;
