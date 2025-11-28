import api from '../config/api';

export const dataService = {
  // Obtener datos actuales
  async getCurrentData() {
    const response = await api.get('/data/current');
    return response.data.data;
  },

  // Obtener datos del mapa
  async getMapData() {
    const response = await api.get('/data/map');
    return response.data.sensors;
  },

  // Obtener histórico
  async getHistory(from, to, sensorId = null) {
    const params = { from, to };
    if (sensorId) {
      params.sensorId = sensorId;
    }
    const response = await api.get('/data/history', { params });
    return response.data.history;
  },

  // Obtener histórico por sensor
  async getHistoryBySensor(sensorId, from = null, to = null) {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    
    const response = await api.get(`/data/history/${sensorId}`, { params });
    return response.data.history;
  },

  // Obtener estadísticas
  async getStatistics(from, to, sensorId = null) {
    const params = { from, to };
    if (sensorId) {
      params.sensorId = sensorId;
    }
    const response = await api.get('/data/statistics', { params });
    return response.data.statistics;
  }
};
