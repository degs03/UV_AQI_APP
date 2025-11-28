import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { dataService } from '../services/dataService';

export default function MapScreen() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Coordenadas del centro de Encarnación
  const ENCARNACION_CENTER = {
    latitude: -27.335,
    longitude: -55.868,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    loadMapData();
    const interval = setInterval(loadMapData, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const loadMapData = async () => {
    try {
      const mapData = await dataService.getMapData();
      setSensors(mapData);
    } catch (error) {
      console.error('Error al cargar datos del mapa:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del mapa');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (sensor) => {
    // Priorizar UV si está disponible
    if (sensor.uvIndex !== null && sensor.uvIndex !== undefined) {
      if (sensor.uvIndex <= 2) return '#4CAF50';
      if (sensor.uvIndex <= 5) return '#FFC107';
      if (sensor.uvIndex <= 7) return '#FF9800';
      return '#F44336';
    }
    
    // Usar AQI si UV no está disponible
    if (sensor.aqi !== null && sensor.aqi !== undefined) {
      if (sensor.aqi <= 50) return '#4CAF50';
      if (sensor.aqi <= 100) return '#FFC107';
      if (sensor.aqi <= 150) return '#FF9800';
      if (sensor.aqi <= 200) return '#F44336';
      return '#9C27B0';
    }
    
    return '#666';
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
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={ENCARNACION_CENTER}
        showsUserLocation
        showsMyLocationButton
      >
        {sensors.map((sensor) => (
          <Marker
            key={sensor.id}
            coordinate={{
              latitude: sensor.coordinates.latitude,
              longitude: sensor.coordinates.longitude,
            }}
            pinColor={getMarkerColor(sensor)}
            onPress={() => setSelectedSensor(sensor)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(sensor) }]}>
              <Text style={styles.markerText}>
                {sensor.uvIndex !== null ? sensor.uvIndex.toFixed(1) : sensor.aqi?.toFixed(0) || '?'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedSensor && (
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedSensor(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.infoTitle}>{selectedSensor.name}</Text>
          <Text style={styles.infoLocation}>{selectedSensor.location}</Text>

          <View style={styles.infoRow}>
            {selectedSensor.uvIndex !== null && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>UV</Text>
                <Text style={styles.infoValue}>{selectedSensor.uvIndex.toFixed(1)}</Text>
                {selectedSensor.uvClassification && (
                  <Text style={[styles.infoBadge, { color: getMarkerColor(selectedSensor) }]}>
                    {selectedSensor.uvClassification.level}
                  </Text>
                )}
              </View>
            )}

            {selectedSensor.aqi !== null && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>AQI</Text>
                <Text style={styles.infoValue}>{selectedSensor.aqi.toFixed(0)}</Text>
                {selectedSensor.aqiClassification && (
                  <Text style={[styles.infoBadge, { color: getMarkerColor(selectedSensor) }]}>
                    {selectedSensor.aqiClassification.level}
                  </Text>
                )}
              </View>
            )}
          </View>

          {selectedSensor.temperature !== null && (
            <Text style={styles.infoText}>
              Temperatura: {selectedSensor.temperature.toFixed(1)}°C
            </Text>
          )}

          {selectedSensor.humidity !== null && (
            <Text style={styles.infoText}>
              Humedad: {selectedSensor.humidity.toFixed(0)}%
            </Text>
          )}

          {selectedSensor.timestamp && (
            <Text style={styles.infoTimestamp}>
              Actualizado: {new Date(selectedSensor.timestamp).toLocaleString('es-PY')}
            </Text>
          )}
        </View>
      )}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Bajo/Bueno</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Moderado</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Alto</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Muy Alto</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  legend: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
  },
});
