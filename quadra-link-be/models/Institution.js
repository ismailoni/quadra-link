// backend/models/Institution.js (updated)
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Institution extends Model {}

Institution.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  shortcode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  placeholder: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emailPattern: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., '^[0-9]{9}@live\\.unilag\\.edu\\.ng$'
  },
  // Add more fields later if needed, e.g., crisisHotline
}, {
  sequelize,
  modelName: 'Institution',
});

module.exports = Institution;