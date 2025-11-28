const { SensorData, Sensor } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Clasificar UV
const classifyUV = (uv) => {
  if (uv <= 2) return { level: 'Bajo', color: '#4CAF50' };
  if (uv <= 5) return { level: 'Moderado', color: '#FFC107' };
  if (uv <= 7) return { level: 'Alto', color: '#FF9800' };
  return { level: 'Muy alto', color: '#F44336' };
};

// Clasificar AQI
const classifyAQI = (aqi) => {
  if (aqi <= 50) return { level: 'Bueno', color: '#4CAF50' };
  if (aqi <= 100) return { level: 'Moderado', color: '#FFC107' };
  if (aqi <= 150) return { level: 'No saludable para grupos sensibles', color: '#FF9800' };
  if (aqi <= 200) return { level: 'No saludable', color: '#F44336' };
  return { level: 'Muy perjudicial', color: '#9C27B0' };
};

// Get current data from all sensors
exports.getCurrentData = async (req, res) => {
  try {
    const sensors = await Sensor.findAll({
      where: { isActive: true },
      include: [
        {
          model: SensorData,
          limit: 1,
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    const data = sensors.map(sensor => {
      const latestData = sensor.SensorData[0];
      
      if (!latestData) return null;

      return {
        sensorId: sensor.id,
        sensorName: sensor.name,
        location: sensor.location,
        latitude: sensor.latitude,
        longitude: sensor.longitude,
        uvIndex: latestData.uvIndex,
        uvClassification: latestData.uvIndex ? classifyUV(latestData.uvIndex) : null,
        aqi: latestData.aqi,
        aqiClassification: latestData.aqi ? classifyAQI(latestData.aqi) : null,
        temperature: latestData.temperature,
        humidity: latestData.humidity,
        pm25: latestData.pm25,
        pm10: latestData.pm10,
        timestamp: latestData.timestamp
      };
    }).filter(d => d !== null);

    res.json({ data });
  } catch (error) {
    console.error('Error al obtener datos actuales:', error);
    res.status(500).json({ error: 'Error al obtener datos actuales' });
  }
};

// Get map data (sensors with latest readings)
exports.getMapData = async (req, res) => {
  try {
    const sensors = await Sensor.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'location', 'latitude', 'longitude', 'type'],
      include: [
        {
          model: SensorData,
          attributes: ['uvIndex', 'aqi', 'temperature', 'humidity', 'timestamp'],
          limit: 1,
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    const mapData = sensors.map(sensor => {
      const latestData = sensor.SensorData[0] || {};
      
      return {
        id: sensor.id,
        name: sensor.name,
        location: sensor.location,
        coordinates: {
          latitude: parseFloat(sensor.latitude),
          longitude: parseFloat(sensor.longitude)
        },
        type: sensor.type,
        uvIndex: latestData.uvIndex || null,
        uvClassification: latestData.uvIndex ? classifyUV(latestData.uvIndex) : null,
        aqi: latestData.aqi || null,
        aqiClassification: latestData.aqi ? classifyAQI(latestData.aqi) : null,
        temperature: latestData.temperature || null,
        humidity: latestData.humidity || null,
        timestamp: latestData.timestamp || null
      };
    });

    res.json({ sensors: mapData });
  } catch (error) {
    console.error('Error al obtener datos del mapa:', error);
    res.status(500).json({ error: 'Error al obtener datos del mapa' });
  }
};

// Get historical data
exports.getHistory = async (req, res) => {
  try {
    const { from, to, sensorId } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Se requieren parámetros from y to' });
    }

    const whereClause = {
      timestamp: {
        [Op.between]: [new Date(from), new Date(to)]
      }
    };

    if (sensorId) {
      whereClause.sensorId = sensorId;
    }

    const data = await SensorData.findAll({
      where: whereClause,
      include: [
        {
          model: Sensor,
          attributes: ['id', 'name', 'location']
        }
      ],
      order: [['timestamp', 'ASC']]
    });

    res.json({ history: data });
  } catch (error) {
    console.error('Error al obtener histórico:', error);
    res.status(500).json({ error: 'Error al obtener histórico' });
  }
};

// Get historical data by sensor
exports.getHistoryBySensor = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { from, to } = req.query;

    const whereClause = { sensorId };

    if (from && to) {
      whereClause.timestamp = {
        [Op.between]: [new Date(from), new Date(to)]
      };
    }

    const data = await SensorData.findAll({
      where: whereClause,
      include: [
        {
          model: Sensor,
          attributes: ['id', 'name', 'location', 'latitude', 'longitude']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 1000
    });

    res.json({ history: data });
  } catch (error) {
    console.error('Error al obtener histórico del sensor:', error);
    res.status(500).json({ error: 'Error al obtener histórico del sensor' });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const { from, to, sensorId } = req.query;

    const whereClause = {};

    if (from && to) {
      whereClause.timestamp = {
        [Op.between]: [new Date(from), new Date(to)]
      };
    }

    if (sensorId) {
      whereClause.sensorId = sensorId;
    }

    const stats = await SensorData.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('uvIndex')), 'avgUV'],
        [sequelize.fn('MAX', sequelize.col('uvIndex')), 'maxUV'],
        [sequelize.fn('MIN', sequelize.col('uvIndex')), 'minUV'],
        [sequelize.fn('AVG', sequelize.col('aqi')), 'avgAQI'],
        [sequelize.fn('MAX', sequelize.col('aqi')), 'maxAQI'],
        [sequelize.fn('MIN', sequelize.col('aqi')), 'minAQI'],
        [sequelize.fn('AVG', sequelize.col('temperature')), 'avgTemp'],
        [sequelize.fn('AVG', sequelize.col('humidity')), 'avgHumidity']
      ]
    });

    res.json({ statistics: stats[0] });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
