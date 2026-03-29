import axiosClient from './axiosClient';

const adminApi = {
  getAllUsers: () => axiosClient.get('/admin/users'),
  updateUser: (id, data) => axiosClient.patch(`/admin/users/${id}`, data),
  resetPassword: (id, newPassword) => axiosClient.post(`/admin/users/${id}/reset-password`, { newPassword })
};

export default adminApi;
