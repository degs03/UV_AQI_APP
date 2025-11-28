import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Registro con email/password
  async register(email, password, name) {
    const response = await api.post('/auth/register', {
      email,
      password,
      name
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Login con email/password
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Login con Google
  async googleLogin(idToken) {
    const response = await api.post('/auth/google', {
      idToken
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Obtener usuario actual
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  // Actualizar push token
  async updatePushToken(pushToken) {
    const response = await api.post('/auth/push-token', { pushToken });
    return response.data;
  },

  // Logout
  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  // Verificar si está autenticado
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },

  // Obtener usuario almacenado
  async getStoredUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
