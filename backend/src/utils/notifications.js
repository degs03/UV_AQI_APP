const { Expo } = require('expo-server-sdk');
const { User, ThresholdUser } = require('../models');

const expo = new Expo();

/**
 * Enviar notificación push a un usuario
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findByPk(userId);
    
    if (!user || !user.pushToken) {
      console.log(`Usuario ${userId} no tiene pushToken`);
      return;
    }

    // Verificar que el token sea válido
    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.error(`Token inválido para usuario ${userId}: ${user.pushToken}`);
      return;
    }

    const message = {
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high'
    };

    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error al enviar notificación:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error en sendPushNotification:', error);
  }
};

/**
 * Enviar notificaciones a múltiples usuarios
 */
const sendBulkNotifications = async (userIds, title, body, data = {}) => {
  try {
    const users = await User.findAll({
      where: {
        id: userIds,
        pushToken: { [require('sequelize').Op.ne]: null }
      }
    });

    const messages = users
      .filter(user => Expo.isExpoPushToken(user.pushToken))
      .map(user => ({
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high'
      }));

    if (messages.length === 0) {
      console.log('No hay usuarios con tokens válidos');
      return;
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error al enviar notificaciones bulk:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error en sendBulkNotifications:', error);
  }
};

module.exports = {
  sendPushNotification,
  sendBulkNotifications
};
