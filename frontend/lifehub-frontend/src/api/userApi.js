import axiosClient from './axiosClient';

const userApi = {
  getProfile: () => axiosClient.get('/users/me'),
  updateProfile: (data) => axiosClient.put('/users/me', data),
  changePassword: (data) => axiosClient.put('/users/change-password', data),
  getSummary: () => axiosClient.get('/users/me/summary'),
};

export default userApi;
