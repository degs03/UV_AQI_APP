const { Log } = require('../models');

const logger = (action, level = 'info') => {
  return async (req, res, next) => {
    try {
      await Log.create({
        userId: req.user?.id || null,
        action,
        description: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip,
        level
      });
    } catch (error) {
      console.error('Error al crear log:', error);
    }
    next();
  };
};

module.exports = logger;
