const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sensor = require('./Sensor');

const SensorData = sequelize.define('SensorData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sensorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Sensor,
      key: 'id'
    }
  },
  uvIndex: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  aqi: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  pm25: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  pm10: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  humidity: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sensor_data',
  timestamps: false,
  indexes: [
    {
      fields: ['sensorId', 'timestamp']
    }
  ]
});

Sensor.hasMany(SensorData, { foreignKey: 'sensorId' });
SensorData.belongsTo(Sensor, { foreignKey: 'sensorId' });

module.exports = SensorData;
