const { User, ThresholdUser, ThresholdGlobal } = require('../models');
const { sendPushNotification, sendBulkNotifications } = require('./notifications');
const { Op } = require('sequelize');

/**
 * Verificar umbrales y enviar notificaciones
 */
const checkThresholds = async (sensorData, sensor) => {
  try {
    // Verificar umbrales de UV
    if (sensorData.uvIndex !== null) {
      await checkUVThresholds(sensorData.uvIndex, sensor);
    }

    // Verificar umbrales de AQI
    if (sensorData.aqi !== null) {
      await checkAQIThresholds(sensorData.aqi, sensor);
    }
  } catch (error) {
    console.error('Error al verificar umbrales:', error);
  }
};

/**
 * Verificar umbrales de UV
 */
const checkUVThresholds = async (uvValue, sensor) => {
  try {
    // Obtener umbrales de usuarios que tienen notificaciones activadas
    const userThresholds = await ThresholdUser.findAll({
      where: {
        type: 'UV',
        notificationEnabled: true,
        value: { [Op.lte]: uvValue }
      },
      include: [User]
    });

    // Enviar notificaciones personalizadas
    for (const threshold of userThresholds) {
      await sendPushNotification(
        threshold.userId,
        '⚠️ Alerta UV',
        `El índice UV en ${sensor.location} es ${uvValue.toFixed(1)}, superando tu umbral de ${threshold.value}`,
        { type: 'UV', value: uvValue, sensorId: sensor.id }
      );
    }

    // Verificar umbrales globales
    const globalThreshold = await ThresholdGlobal.findOne({
      where: {
        type: 'UV',
        minValue: { [Op.lte]: uvValue },
        maxValue: { [Op.or]: [{ [Op.gte]: uvValue }, { [Op.is]: null }] }
      }
    });

    // Si es un nivel crítico según umbrales globales, notificar a todos
    if (globalThreshold && (globalThreshold.level === 'high' || globalThreshold.level === 'critical')) {
      const allUsers = await User.findAll({
        where: { pushToken: { [Op.ne]: null } },
        attributes: ['id']
      });

      const userIds = allUsers.map(u => u.id);

      await sendBulkNotifications(
        userIds,
        '🌞 Alerta UV Global',
        `Nivel ${globalThreshold.level} de radiación UV (${uvValue.toFixed(1)}) en ${sensor.location}. ${globalThreshold.message || ''}`,
        { type: 'UV_GLOBAL', value: uvValue, level: globalThreshold.level, sensorId: sensor.id }
      );
    }
  } catch (error) {
    console.error('Error al verificar umbrales UV:', error);
  }
};

/**
 * Verificar umbrales de AQI
 */
const checkAQIThresholds = async (aqiValue, sensor) => {
  try {
    // Obtener umbrales de usuarios que tienen notificaciones activadas
    const userThresholds = await ThresholdUser.findAll({
      where: {
        type: 'AQI',
        notificationEnabled: true,
        value: { [Op.lte]: aqiValue }
      },
      include: [User]
    });

    // Enviar notificaciones personalizadas
    for (const threshold of userThresholds) {
      await sendPushNotification(
        threshold.userId,
        '⚠️ Alerta Calidad del Aire',
        `El AQI en ${sensor.location} es ${aqiValue.toFixed(0)}, superando tu umbral de ${threshold.value}`,
        { type: 'AQI', value: aqiValue, sensorId: sensor.id }
      );
    }

    // Verificar umbrales globales
    const globalThreshold = await ThresholdGlobal.findOne({
      where: {
        type: 'AQI',
        minValue: { [Op.lte]: aqiValue },
        maxValue: { [Op.or]: [{ [Op.gte]: aqiValue }, { [Op.is]: null }] }
      }
    });

    // Si es un nivel crítico según umbrales globales, notificar a todos
    if (globalThreshold && (globalThreshold.level === 'unhealthy' || globalThreshold.level === 'critical')) {
      const allUsers = await User.findAll({
        where: { pushToken: { [Op.ne]: null } },
        attributes: ['id']
      });

      const userIds = allUsers.map(u => u.id);

      await sendBulkNotifications(
        userIds,
        '🏭 Alerta Calidad del Aire Global',
        `Nivel ${globalThreshold.level} de calidad del aire (AQI: ${aqiValue.toFixed(0)}) en ${sensor.location}. ${globalThreshold.message || ''}`,
        { type: 'AQI_GLOBAL', value: aqiValue, level: globalThreshold.level, sensorId: sensor.id }
      );
    }
  } catch (error) {
    console.error('Error al verificar umbrales AQI:', error);
  }
};

module.exports = {
  checkThresholds
};
