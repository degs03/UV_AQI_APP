import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const storedUser = await authService.getStoredUser();
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Registrar para notificaciones
        await notificationService.registerForPushNotifications();
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    
    // Registrar para notificaciones
    await notificationService.registerForPushNotifications();
    
    return data;
  };

  const register = async (email, password, name) => {
    const data = await authService.register(email, password, name);
    setUser(data.user);
    setIsAuthenticated(true);
    
    // Registrar para notificaciones
    await notificationService.registerForPushNotifications();
    
    return data;
  };

  const googleLogin = async (idToken) => {
    const data = await authService.googleLogin(idToken);
    setUser(data.user);
    setIsAuthenticated(true);
    
    // Registrar para notificaciones
    await notificationService.registerForPushNotifications();
    
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
