// backend/models/Like.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');

class Like extends Model {}

Like.init({
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
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'Like',
  indexes: [
    { unique: true, fields: ['userId', 'postId'] },
  ],
});

Like.belongsTo(User, { foreignKey: 'userId' });
Like.belongsTo(Post, { foreignKey: 'postId' });

module.exports = Like;