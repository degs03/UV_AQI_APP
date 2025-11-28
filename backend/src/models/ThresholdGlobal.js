const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThresholdGlobal = sequelize.define('ThresholdGlobal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('UV', 'AQI'),
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false // 'low', 'moderate', 'high', 'critical'
  },
  minValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  maxValue: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'thresholds_global',
  timestamps: true
});

module.exports = ThresholdGlobal;
