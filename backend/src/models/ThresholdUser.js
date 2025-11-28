const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const ThresholdUser = sequelize.define('ThresholdUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('UV', 'AQI'),
    allowNull: false
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  notificationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'thresholds_user',
  timestamps: true
});

User.hasMany(ThresholdUser, { foreignKey: 'userId' });
ThresholdUser.belongsTo(User, { foreignKey: 'userId' });

module.exports = ThresholdUser;
