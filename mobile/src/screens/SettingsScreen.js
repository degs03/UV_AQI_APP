import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { thresholdService } from '../services/thresholdService';

export default function SettingsScreen({ navigation }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [userThresholds, setUserThresholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uvThreshold, setUvThreshold] = useState('');
  const [aqiThreshold, setAqiThreshold] = useState('');
  const [uvNotifications, setUvNotifications] = useState(true);
  const [aqiNotifications, setAqiNotifications] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserThresholds();
    }
  }, [isAuthenticated]);

  const loadUserThresholds = async () => {
    try {
      const thresholds = await thresholdService.getUserThresholds();
      setUserThresholds(thresholds);
      
      const uvThresh = thresholds.find(t => t.type === 'UV');
      const aqiThresh = thresholds.find(t => t.type === 'AQI');
      
      if (uvThresh) {
        setUvThreshold(uvThresh.value.toString());
        setUvNotifications(uvThresh.notificationEnabled);
      }
      if (aqiThresh) {
        setAqiThreshold(aqiThresh.value.toString());
        setAqiNotifications(aqiThresh.notificationEnabled);
      }
    } catch (error) {
      console.error('Error al cargar umbrales:', error);
    }
  };

  const handleSaveUVThreshold = async () => {
    if (!uvThreshold || isNaN(parseFloat(uvThreshold))) {
      Alert.alert('Error', 'Ingrese un valor válido para el umbral UV');
      return;
    }

    setLoading(true);
    try {
      await thresholdService.setUserThreshold('UV', parseFloat(uvThreshold), uvNotifications);
      Alert.alert('Éxito', 'Umbral UV configurado correctamente');
      loadUserThresholds();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el umbral UV');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAQIThreshold = async () => {
    if (!aqiThreshold || isNaN(parseFloat(aqiThreshold))) {
      Alert.alert('Error', 'Ingrese un valor válido para el umbral AQI');
      return;
    }

    setLoading(true);
    try {
      await thresholdService.setUserThreshold('AQI', parseFloat(aqiThreshold), aqiNotifications);
      Alert.alert('Éxito', 'Umbral AQI configurado correctamente');
      loadUserThresholds();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el umbral AQI');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: logout, style: 'destructive' }
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthText}>Debes iniciar sesión para acceder a configuraciones</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Usuario</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{user?.name}</Text>
          
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
          
          <Text style={styles.label}>Rol:</Text>
          <Text style={styles.value}>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Umbrales Personalizados</Text>
        
        <View style={styles.card}>
          <Text style={styles.thresholdTitle}>Umbral UV</Text>
          <Text style={styles.thresholdDescription}>
            Recibirás una notificación cuando el índice UV supere este valor
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 6"
            value={uvThreshold}
            onChangeText={setUvThreshold}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text>Notificaciones activadas</Text>
            <Switch
              value={uvNotifications}
              onValueChange={setUvNotifications}
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveUVThreshold}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Umbral UV</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.thresholdTitle}>Umbral AQI</Text>
          <Text style={styles.thresholdDescription}>
            Recibirás una notificación cuando el AQI supere este valor
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 100"
            value={aqiThreshold}
            onChangeText={setAqiThreshold}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text>Notificaciones activadas</Text>
            <Switch
              value={aqiNotifications}
              onValueChange={setAqiNotifications}
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAQIThreshold}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Umbral AQI</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {user?.role === 'admin' && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.adminButtonText}>Panel de Administración</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  thresholdTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  thresholdDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  adminButton: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
