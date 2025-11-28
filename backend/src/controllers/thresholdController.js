const { ThresholdUser, ThresholdGlobal, Log } = require('../models');

// Get user thresholds
exports.getUserThresholds = async (req, res) => {
  try {
    const thresholds = await ThresholdUser.findAll({
      where: { userId: req.user.id }
    });

    res.json({ thresholds });
  } catch (error) {
    console.error('Error al obtener umbrales del usuario:', error);
    res.status(500).json({ error: 'Error al obtener umbrales' });
  }
};

// Create or update user threshold
exports.setUserThreshold = async (req, res) => {
  try {
    const { type, value, notificationEnabled } = req.body;

    if (!type || value === undefined) {
      return res.status(400).json({ error: 'Tipo y valor son requeridos' });
    }

    // Buscar si ya existe
    let threshold = await ThresholdUser.findOne({
      where: { userId: req.user.id, type }
    });

    if (threshold) {
      // Actualizar
      await threshold.update({
        value,
        notificationEnabled: notificationEnabled !== undefined ? notificationEnabled : threshold.notificationEnabled
      });
    } else {
      // Crear nuevo
      threshold = await ThresholdUser.create({
        userId: req.user.id,
        type,
        value,
        notificationEnabled: notificationEnabled !== undefined ? notificationEnabled : true
      });
    }

    await Log.create({
      userId: req.user.id,
      action: 'SET_THRESHOLD',
      description: `Umbral ${type} configurado en ${value}`,
      ipAddress: req.ip
    });

    res.json({
      message: 'Umbral configurado exitosamente',
      threshold
    });
  } catch (error) {
    console.error('Error al configurar umbral:', error);
    res.status(500).json({ error: 'Error al configurar umbral' });
  }
};

// Delete user threshold
exports.deleteUserThreshold = async (req, res) => {
  try {
    const { id } = req.params;

    const threshold = await ThresholdUser.findOne({
      where: { id, userId: req.user.id }
    });

    if (!threshold) {
      return res.status(404).json({ error: 'Umbral no encontrado' });
    }

    await threshold.destroy();

    res.json({ message: 'Umbral eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar umbral:', error);
    res.status(500).json({ error: 'Error al eliminar umbral' });
  }
};

// Get global thresholds
exports.getGlobalThresholds = async (req, res) => {
  try {
    const thresholds = await ThresholdGlobal.findAll({
      order: [['type', 'ASC'], ['minValue', 'ASC']]
    });

    res.json({ thresholds });
  } catch (error) {
    console.error('Error al obtener umbrales globales:', error);
    res.status(500).json({ error: 'Error al obtener umbrales globales' });
  }
};

// Set global threshold (admin only)
exports.setGlobalThreshold = async (req, res) => {
  try {
    const { type, level, minValue, maxValue, color, message } = req.body;

    if (!type || !level || minValue === undefined) {
      return res.status(400).json({ error: 'Tipo, nivel y valor mínimo son requeridos' });
    }

    // Buscar si ya existe
    let threshold = await ThresholdGlobal.findOne({
      where: { type, level }
    });

    if (threshold) {
      // Actualizar
      await threshold.update({
        minValue,
        maxValue: maxValue || null,
        color: color || threshold.color,
        message: message || threshold.message
      });
    } else {
      // Crear nuevo
      threshold = await ThresholdGlobal.create({
        type,
        level,
        minValue,
        maxValue: maxValue || null,
        color,
        message
      });
    }

    await Log.create({
      userId: req.user.id,
      action: 'SET_GLOBAL_THRESHOLD',
      description: `Umbral global ${type} - ${level} configurado`,
      ipAddress: req.ip
    });

    res.json({
      message: 'Umbral global configurado exitosamente',
      threshold
    });
  } catch (error) {
    console.error('Error al configurar umbral global:', error);
    res.status(500).json({ error: 'Error al configurar umbral global' });
  }
};

// Delete global threshold (admin only)
exports.deleteGlobalThreshold = async (req, res) => {
  try {
    const { id } = req.params;

    const threshold = await ThresholdGlobal.findByPk(id);

    if (!threshold) {
      return res.status(404).json({ error: 'Umbral no encontrado' });
    }

    await threshold.destroy();

    await Log.create({
      userId: req.user.id,
      action: 'DELETE_GLOBAL_THRESHOLD',
      description: `Umbral global ${threshold.type} - ${threshold.level} eliminado`,
      ipAddress: req.ip
    });

    res.json({ message: 'Umbral global eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar umbral global:', error);
    res.status(500).json({ error: 'Error al eliminar umbral global' });
  }
};
