// backend/models/Booking.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Councillors = require('./Councillors');

class Booking extends Model {}

Booking.init({
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
  councillorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Councillors',
      key: 'id',
    },
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'rescheduled', 'cancelled'),
    defaultValue: 'pending',
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'Booking',
});

Booking.belongsTo(User, { foreignKey: 'userId' });
Booking.belongsTo(Councillors, { foreignKey: 'councillorId' });

module.exports = Booking;