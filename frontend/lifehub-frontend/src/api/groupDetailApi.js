import axiosClient from './axiosClient';

const groupDetailApi = {
  // --- Expenses ---
  expenses: {
    getAll: (groupId) => axiosClient.get(`/groups/${groupId}/expenses`),
    getSummary: (groupId) => axiosClient.get(`/groups/${groupId}/expenses/summary`),
    add: (groupId, data) => axiosClient.post(`/groups/${groupId}/expenses`, { ...data, groupId }),
    delete: (groupId, id) => axiosClient.delete(`/groups/${groupId}/expenses/${id}`),
  },

  // --- Tasks ---
  tasks: {
    getAll: (groupId) => axiosClient.get(`/groups/${groupId}/tasks`),
    create: (groupId, data) => axiosClient.post(`/groups/${groupId}/tasks`, { ...data, groupId }),
    updateStatus: (groupId, taskId, status) => axiosClient.put(`/groups/${groupId}/tasks/${taskId}/status`, { status }),
    update: (groupId, taskId, data) => axiosClient.put(`/groups/${groupId}/tasks/${taskId}`, data),
    delete: (groupId, taskId) => axiosClient.delete(`/groups/${groupId}/tasks/${taskId}`),
  },

  // --- Memos ---
  memos: {
    getAll: (groupId) => axiosClient.get(`/groups/${groupId}/memos`),
    create: (groupId, data) => axiosClient.post(`/groups/${groupId}/memos`, data),
    delete: (groupId, id) => axiosClient.delete(`/groups/${groupId}/memos/${id}`),
  },

  // --- Events ---
  events: {
    getAll: (groupId) => axiosClient.get(`/groups/${groupId}/events`),
    create: (groupId, data) => axiosClient.post(`/groups/${groupId}/events`, data),
    delete: (groupId, id) => axiosClient.delete(`/groups/${groupId}/events/${id}`),
  }
};

export default groupDetailApi;
