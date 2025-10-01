// backend/models/Councillors.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Councillors extends Model {}

Councillors.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  availability: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}, // e.g., { "Monday": ["09:00-11:00"], "Wednesday": ["14:00-16:00"] }
  },
  status: {
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    defaultValue: 'available',
  },
  maxSessions: {
    type: DataTypes.INTEGER,
    defaultValue: 5, // Max bookings per week
  },
  sessionDuration: {
    type: DataTypes.INTEGER, // In minutes
    defaultValue: 30,
  },
}, {
  sequelize,
  modelName: 'Councillors',
});

Councillors.belongsTo(User, { foreignKey: 'userId' });

module.exports = Councillors;