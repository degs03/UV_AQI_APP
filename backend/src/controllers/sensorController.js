const { Sensor, SensorData, Log } = require('../models');
const crypto = require('crypto');
const { sendPushNotification } = require('../utils/notifications');
const { checkThresholds } = require('../utils/thresholds');

// Get all sensors
exports.getAllSensors = async (req, res) => {
  try {
    const sensors = await Sensor.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ sensors });
  } catch (error) {
    console.error('Error al obtener sensores:', error);
    res.status(500).json({ error: 'Error al obtener sensores' });
  }
};

// Create sensor (admin only)
exports.createSensor = async (req, res) => {
  try {
    const { name, type, location, latitude, longitude, description } = req.body;

    if (!name || !type || !location || !latitude || !longitude) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Generar API key única
    const apiKey = crypto.randomBytes(32).toString('hex');

    const sensor = await Sensor.create({
      name,
      type,
      location,
      latitude,
      longitude,
      description,
      apiKey
    });

    await Log.create({
      userId: req.user.id,
      action: 'CREATE_SENSOR',
      description: `Sensor ${name} creado`,
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Sensor creado exitosamente',
      sensor
    });
  } catch (error) {
    console.error('Error al crear sensor:', error);
    res.status(500).json({ error: 'Error al crear sensor' });
  }
};

// Update sensor (admin only)
exports.updateSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, location, latitude, longitude, description, isActive } = req.body;

    const sensor = await Sensor.findByPk(id);
    
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor no encontrado' });
    }

    await sensor.update({
      name: name || sensor.name,
      type: type || sensor.type,
      location: location || sensor.location,
      latitude: latitude || sensor.latitude,
      longitude: longitude || sensor.longitude,
      description: description !== undefined ? description : sensor.description,
      isActive: isActive !== undefined ? isActive : sensor.isActive
    });

    await Log.create({
      userId: req.user.id,
      action: 'UPDATE_SENSOR',
      description: `Sensor ${sensor.name} actualizado`,
      ipAddress: req.ip
    });

    res.json({
      message: 'Sensor actualizado exitosamente',
      sensor
    });
  } catch (error) {
    console.error('Error al actualizar sensor:', error);
    res.status(500).json({ error: 'Error al actualizar sensor' });
  }
};

// Delete sensor (admin only)
exports.deleteSensor = async (req, res) => {
  try {
    const { id } = req.params;

    const sensor = await Sensor.findByPk(id);
    
    if (!sensor) {
      return res.status(404).json({ error: 'Sensor no encontrado' });
    }

    await sensor.destroy();

    await Log.create({
      userId: req.user.id,
      action: 'DELETE_SENSOR',
      description: `Sensor ${sensor.name} eliminado`,
      ipAddress: req.ip
    });

    res.json({ message: 'Sensor eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar sensor:', error);
    res.status(500).json({ error: 'Error al eliminar sensor' });
  }
};

// Receive data from ESP32 sensors
exports.receiveSensorData = async (req, res) => {
  try {
    const { apiKey, uvIndex, aqi, pm25, pm10, temperature, humidity } = req.body;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key requerida' });
    }

    // Verificar API key
    const sensor = await Sensor.findOne({ where: { apiKey, isActive: true } });
    
    if (!sensor) {
      return res.status(401).json({ error: 'API key inválida o sensor inactivo' });
    }

    // Crear registro de datos
    const sensorData = await SensorData.create({
      sensorId: sensor.id,
      uvIndex: uvIndex || null,
      aqi: aqi || null,
      pm25: pm25 || null,
      pm10: pm10 || null,
      temperature: temperature || null,
      humidity: humidity || null,
      timestamp: new Date()
    });

    // Verificar umbrales y enviar notificaciones si es necesario
    await checkThresholds(sensorData, sensor);

    res.status(201).json({
      message: 'Datos recibidos exitosamente',
      dataId: sensorData.id
    });
  } catch (error) {
    console.error('Error al recibir datos del sensor:', error);
    res.status(500).json({ error: 'Error al procesar datos del sensor' });
  }
};
