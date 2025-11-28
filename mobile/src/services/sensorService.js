import api from '../config/api';

export const sensorService = {
  // Obtener todos los sensores
  async getAllSensors() {
    const response = await api.get('/sensors');
    return response.data.sensors;
  },

  // Crear sensor (admin)
  async createSensor(name, type, location, latitude, longitude, description) {
    const response = await api.post('/sensors', {
      name,
      type,
      location,
      latitude,
      longitude,
      description
    });
    return response.data;
  },

  // Actualizar sensor (admin)
  async updateSensor(id, data) {
    const response = await api.put(`/sensors/${id}`, data);
    return response.data;
  },

  // Eliminar sensor (admin)
  async deleteSensor(id) {
    const response = await api.delete(`/sensors/${id}`);
    return response.data;
  }
};
