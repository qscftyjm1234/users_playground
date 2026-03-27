import axiosClient from './axiosClient';

const auditApi = {
  getRecentLogs: (count = 50) => axiosClient.get(`/auditlogs/recent?count=${count}`),
};

export default auditApi;

