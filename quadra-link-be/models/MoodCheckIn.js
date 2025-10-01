// backend/models/MoodCheckIn.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class MoodCheckIn extends Model {}

MoodCheckIn.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID, // Changed from INTEGER to UUID
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  mood: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'MoodCheckIn',
});

// Associations
MoodCheckIn.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(MoodCheckIn, { foreignKey: 'userId' });

module.exports = MoodCheckIn;