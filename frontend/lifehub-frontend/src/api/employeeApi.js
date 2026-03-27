import axiosClient from './axiosClient';

const employeeApi = {
  getAll: (pageNumber, pageSize, searchTerm) => axiosClient.get(`/employees`, {
      params: {
        pageNumber,
        pageSize,
        searchTerm
      }
    }),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
  getDepartments: () => axiosClient.get('/departments'),
  createDepartment: (data) => axiosClient.post('/departments', data),
  updateDepartment: (id, data) => axiosClient.put(`/departments/${id}`, data),
  deleteDepartment: (id) => axiosClient.delete(`/departments/${id}`),

  getPositions: () => axiosClient.get('/positions'),
  createPosition: (data) => axiosClient.post('/positions', data),
  updatePosition: (id, data) => axiosClient.put(`/positions/${id}`, data),
  deletePosition: (id) => axiosClient.delete(`/positions/${id}`),


  getStats: () => axiosClient.get('/dashboard/stats'),
  
  exportEmployees: async () => {
    const response = await axiosClient.get('/employees/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Employees_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

export default employeeApi;

