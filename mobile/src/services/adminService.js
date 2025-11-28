import api from '../config/api';

export const adminService = {
  // Usuarios
  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data.users;
  },

  async createUser(email, password, name, role) {
    const response = await api.post('/admin/users', {
      email,
      password,
      name,
      role
    });
    return response.data;
  },

  async updateUser(id, data) {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Logs
  async getLogs(limit = 100, level = null, action = null) {
    const params = { limit };
    if (level) params.level = level;
    if (action) params.action = action;
    
    const response = await api.get('/admin/logs', { params });
    return response.data.logs;
  },

  // Estadísticas
  async getDashboardStats() {
    const response = await api.get('/admin/stats');
    return response.data.stats;
  }
};
