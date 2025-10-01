// backend/models/Room.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  communityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Communities',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Room;