import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { dataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentData = await dataService.getCurrentData();
      setData(currentData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const getUVColor = (level) => {
    if (!level) return '#666';
    if (level.includes('Bajo')) return '#4CAF50';
    if (level.includes('Moderado')) return '#FFC107';
    if (level.includes('Alto')) return '#FF9800';
    return '#F44336';
  };

  const getAQIColor = (level) => {
    if (!level) return '#666';
    if (level.includes('Bueno')) return '#4CAF50';
    if (level.includes('Moderado')) return '#FFC107';
    if (level.includes('sensibles')) return '#FF9800';
    if (level.includes('No saludable')) return '#F44336';
    return '#9C27B0';
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitor UV y AQI</Text>
        <Text style={styles.headerSubtitle}>Encarnación</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!isAuthenticated && (
          <View style={styles.guestBanner}>
            <Text style={styles.guestText}>Modo invitado</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.guestButton}
            >
              <Text style={styles.guestButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}

        {data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay datos disponibles</Text>
          </View>
        ) : (
          data.map((sensor, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{sensor.sensorName}</Text>
              <Text style={styles.cardLocation}>{sensor.location}</Text>

              <View style={styles.dataRow}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Índice UV</Text>
                  <Text style={styles.dataValue}>
                    {sensor.uvIndex?.toFixed(1) || 'N/A'}
                  </Text>
                  {sensor.uvClassification && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: getUVColor(sensor.uvClassification.level) },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {sensor.uvClassification.level}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Calidad del Aire</Text>
                  <Text style={styles.dataValue}>
                    {sensor.aqi?.toFixed(0) || 'N/A'}
                  </Text>
                  {sensor.aqiClassification && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: getAQIColor(sensor.aqiClassification.level) },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {sensor.aqiClassification.level}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.dataRow}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Temperatura</Text>
                  <Text style={styles.dataValue}>
                    {sensor.temperature?.toFixed(1) || 'N/A'}°C
                  </Text>
                </View>

                <View style={styles.dataItem}>
                  <Text style={styles.dataLabel}>Humedad</Text>
                  <Text style={styles.dataValue}>
                    {sensor.humidity?.toFixed(0) || 'N/A'}%
                  </Text>
                </View>
              </View>

              <Text style={styles.timestamp}>
                Última actualización:{' '}
                {sensor.timestamp
                  ? new Date(sensor.timestamp).toLocaleString('es-PY')
                  : 'N/A'}
              </Text>
            </View>
          ))
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.actionButtonText}>Ver Mapa</Text>
          </TouchableOpacity>

          {isAuthenticated && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={styles.actionButtonText}>Ver Histórico</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  guestBanner: {
    backgroundColor: '#FFC107',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestText: {
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  guestButtonText: {
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
