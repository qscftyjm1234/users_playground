import axiosClient from './axiosClient';

const groupApi = {
  getMine: () => axiosClient.get('/groups'),
  create: (data) => axiosClient.post('/groups', data),
  join: (inviteCode) => axiosClient.post('/groups/join', { inviteCode }),
  invite: (groupId, searchTerm) => axiosClient.post(`/groups/${groupId}/invite`, { searchTerm }),
  leave: (groupId) => axiosClient.delete(`/groups/${groupId}/leave`),
  getById: (id) => axiosClient.get(`/groups/${id}`),
};

export default groupApi;
