// backend/models/Post.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Comment = require('./Comment');
const Like = require('./Like');

class Post extends Model {}

Post.init({
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  hashtags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'Post',
});

Post.belongsTo(User, { foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Post.hasMany(Like, { foreignKey: 'postId' });

module.exports = Post;