const sequelize = require('../config/database');
const User = require('./User');
const Sensor = require('./Sensor');
const SensorData = require('./SensorData');
const ThresholdUser = require('./ThresholdUser');
const ThresholdGlobal = require('./ThresholdGlobal');
const Log = require('./Log');

module.exports = {
  sequelize,
  User,
  Sensor,
  SensorData,
  ThresholdUser,
  ThresholdGlobal,
  Log
};
