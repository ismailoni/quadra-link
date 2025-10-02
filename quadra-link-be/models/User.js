// backend/models/User.js (updated)
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const Institution = require('./Institution');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role: {
    type: DataTypes.ENUM('student', 'moderator', 'counselor', 'admin'),
    defaultValue: 'student',
    allowNull: false,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullname: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstname} ${this.lastname}`;
    },
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pseudonym: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  institutionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Institutions',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'User'
});

// Associations
User.belongsTo(Institution, { foreignKey: 'institutionId' });
Institution.hasMany(User, { foreignKey: 'institutionId' });

module.exports = User;