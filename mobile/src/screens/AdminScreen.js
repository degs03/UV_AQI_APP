import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { adminService } from '../services/adminService';
import { sensorService } from '../services/sensorService';
import { useAuth } from '../contexts/AuthContext';

export default function AdminScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'sensors', 'logs'
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Acceso Denegado', 'No tienes permisos de administrador');
      navigation.goBack();
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const statsData = await adminService.getDashboardStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const usersData = await adminService.getAllUsers();
        setUsers(usersData);
      } else if (activeTab === 'sensors') {
        const sensorsData = await sensorService.getAllSensors();
        setSensors(sensorsData);
      } else if (activeTab === 'logs') {
        const logsData = await adminService.getLogs(50);
        setLogs(logsData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(userId);
              Alert.alert('Éxito', 'Usuario eliminado');
              loadData();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.error || 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  const handleToggleSensor = async (sensorId, currentStatus) => {
    try {
      await sensorService.updateSensor(sensorId, { isActive: !currentStatus });
      Alert.alert('Éxito', 'Sensor actualizado');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el sensor');
    }
  };

  const renderStats = () => (
    <View style={styles.content}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Usuarios Totales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeUsers}</Text>
          <Text style={styles.statLabel}>Usuarios Activos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSensors}</Text>
          <Text style={styles.statLabel}>Sensores Totales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeSensors}</Text>
          <Text style={styles.statLabel}>Sensores Activos</Text>
        </View>
      </View>
    </View>
  );

  const renderUsers = () => (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSubtitle}>{item.email}</Text>
            <Text style={styles.listItemMeta}>
              Rol: {item.role} | Estado: {item.isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
          {item.id !== user?.id && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item.id)}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay usuarios</Text>
        </View>
      }
    />
  );

  const renderSensors = () => (
    <FlatList
      data={sensors}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={styles.listItemContent}>
            <Text style={styles.listItemTitle}>{item.name}</Text>
            <Text style={styles.listItemSubtitle}>{item.location}</Text>
            <Text style={styles.listItemMeta}>
              Tipo: {item.type} | Estado: {item.isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, item.isActive ? styles.activeButton : styles.inactiveButton]}
            onPress={() => handleToggleSensor(item.id, item.isActive)}
          >
            <Text style={styles.toggleButtonText}>
              {item.isActive ? 'Desactivar' : 'Activar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay sensores</Text>
        </View>
      }
    />
  );

  const renderLogs = () => (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.logItem}>
          <View style={styles.logHeader}>
            <Text style={styles.logAction}>{item.action}</Text>
            <Text style={styles.logTime}>
              {new Date(item.timestamp).toLocaleString('es-PY')}
            </Text>
          </View>
          <Text style={styles.logDescription}>{item.description}</Text>
          {item.User && (
            <Text style={styles.logUser}>Usuario: {item.User.email}</Text>
          )}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay logs</Text>
        </View>
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Estadísticas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Usuarios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sensors' && styles.activeTab]}
          onPress={() => setActiveTab('sensors')}
        >
          <Text style={[styles.tabText, activeTab === 'sensors' && styles.activeTabText]}>
            Sensores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            Logs
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
        </View>
      ) : (
        <>
          {activeTab === 'stats' && stats && renderStats()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'sensors' && renderSensors()}
          {activeTab === 'logs' && renderLogs()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#9C27B0',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#9C27B0',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#9C27B0',
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  listItemMeta: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#FF9800',
  },
  inactiveButton: {
    backgroundColor: '#4CAF50',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  logDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  logUser: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
