import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { VictoryLine, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { dataService } from '../services/dataService';
import { format, subDays } from 'date-fns';

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // '24h', '7d', '30d'
  const [dataType, setDataType] = useState('uv'); // 'uv' or 'aqi'

  useEffect(() => {
    loadHistoricalData();
  }, [timeRange]);

  const loadHistoricalData = async () => {
    setLoading(true);
    try {
      const to = new Date();
      let from;

      switch (timeRange) {
        case '24h':
          from = subDays(to, 1);
          break;
        case '7d':
          from = subDays(to, 7);
          break;
        case '30d':
          from = subDays(to, 30);
          break;
        default:
          from = subDays(to, 7);
      }

      const history = await dataService.getHistory(
        from.toISOString(),
        to.toISOString()
      );

      setData(history);
    } catch (error) {
      console.error('Error al cargar histórico:', error);
      Alert.alert('Error', 'No se pudo cargar el histórico');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!data || data.length === 0) return [];

    return data
      .filter(item => dataType === 'uv' ? item.uvIndex !== null : item.aqi !== null)
      .map(item => ({
        x: new Date(item.timestamp),
        y: dataType === 'uv' ? item.uvIndex : item.aqi,
      }));
  };

  const getAverageValue = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return 0;
    
    const sum = chartData.reduce((acc, item) => acc + item.y, 0);
    return (sum / chartData.length).toFixed(2);
  };

  const getMaxValue = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return 0;
    
    return Math.max(...chartData.map(item => item.y)).toFixed(2);
  };

  const getMinValue = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return 0;
    
    return Math.min(...chartData.map(item => item.y)).toFixed(2);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Mediciones</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Tipo de dato:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, dataType === 'uv' && styles.filterButtonActive]}
            onPress={() => setDataType('uv')}
          >
            <Text style={[styles.filterButtonText, dataType === 'uv' && styles.filterButtonTextActive]}>
              UV
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, dataType === 'aqi' && styles.filterButtonActive]}
            onPress={() => setDataType('aqi')}
          >
            <Text style={[styles.filterButtonText, dataType === 'aqi' && styles.filterButtonTextActive]}>
              AQI
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Período:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === '24h' && styles.filterButtonActive]}
            onPress={() => setTimeRange('24h')}
          >
            <Text style={[styles.filterButtonText, timeRange === '24h' && styles.filterButtonTextActive]}>
              24h
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === '7d' && styles.filterButtonActive]}
            onPress={() => setTimeRange('7d')}
          >
            <Text style={[styles.filterButtonText, timeRange === '7d' && styles.filterButtonTextActive]}>
              7 días
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeRange === '30d' && styles.filterButtonActive]}
            onPress={() => setTimeRange('30d')}
          >
            <Text style={[styles.filterButtonText, timeRange === '30d' && styles.filterButtonTextActive]}>
              30 días
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : getChartData().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay datos disponibles para este período</Text>
        </View>
      ) : (
        <>
          <View style={styles.chartContainer}>
            <VictoryChart theme={VictoryTheme.material} height={250}>
              <VictoryAxis
                tickFormat={(t) => format(new Date(t), 'dd/MM')}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 }
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  tickLabels: { fontSize: 10, padding: 5 }
                }}
              />
              <VictoryLine
                data={getChartData()}
                style={{
                  data: { stroke: dataType === 'uv' ? '#FF9800' : '#2196F3', strokeWidth: 2 }
                }}
              />
            </VictoryChart>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Promedio</Text>
              <Text style={styles.statValue}>{getAverageValue()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Máximo</Text>
              <Text style={styles.statValue}>{getMaxValue()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Mínimo</Text>
              <Text style={styles.statValue}>{getMinValue()}</Text>
            </View>
          </View>
        </>
      )}
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
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});
