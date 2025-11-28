import api from '../config/api';

export const thresholdService = {
  // Obtener umbrales del usuario
  async getUserThresholds() {
    const response = await api.get('/thresholds/user');
    return response.data.thresholds;
  },

  // Configurar umbral del usuario
  async setUserThreshold(type, value, notificationEnabled = true) {
    const response = await api.post('/thresholds/user', {
      type,
      value,
      notificationEnabled
    });
    return response.data;
  },

  // Eliminar umbral del usuario
  async deleteUserThreshold(id) {
    const response = await api.delete(`/thresholds/user/${id}`);
    return response.data;
  },

  // Obtener umbrales globales
  async getGlobalThresholds() {
    const response = await api.get('/thresholds/global');
    return response.data.thresholds;
  },

  // Configurar umbral global (admin)
  async setGlobalThreshold(type, level, minValue, maxValue, color, message) {
    const response = await api.post('/thresholds/global', {
      type,
      level,
      minValue,
      maxValue,
      color,
      message
    });
    return response.data;
  },

  // Eliminar umbral global (admin)
  async deleteGlobalThreshold(id) {
    const response = await api.delete(`/thresholds/global/${id}`);
    return response.data;
  }
};
