// backend/models/CommunityMembership.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommunityMembership = sequelize.define('CommunityMembership', {
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
  communityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Communities',
      key: 'id',
    },
  },
  role: {
    type: DataTypes.ENUM('member', 'moderator', 'admin'),
    defaultValue: 'member',
  },
});

module.exports = CommunityMembership;