// backend/routes/social.js
const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');
const { broadcast } = require('../config/websocket');
const router = express.Router();

// POST /posts - Create a post
router.post('/posts', authMiddleware(), async (req, res) => {
  const { content, media, hashtags } = req.body;
  const post = await Post.create({
    userId: req.user.id,
    content,
    media,
    hashtags: hashtags || [],
  });
  broadcast(req.user.id, `Your post "${content.substring(0, 20)}..." has been created.`, 'info');
  res.status(201).json(post);
});

// GET /posts - View all posts with pagination and total count
router.get('/posts', authMiddleware(), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const posts = await Post.findAll({
    attributes: ['id', 'content', 'media', 'hashtags', 'views', 'userId', 'createdAt'],
    include: [
      { model: User, attributes: ['pseudonym', 'role'] },
      { model: Comment, include: [{ model: User, attributes: ['pseudonym'] }] },
      { model: Like, include: [{ model: User, attributes: ['pseudonym'] }] },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
  });
  const total = await Post.count();
  res.json({ data: posts, total });
});

// PATCH /posts/:id - Update post (own only)
router.patch('/posts/:id', authMiddleware(), async (req, res) => {
  const { content, media, hashtags } = req.body;
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ error: 'Can only update own post' });
  await post.update({ content, media, hashtags });
  broadcast(req.user.id, `Your post has been updated.`, 'info');
  res.json({ message: 'Updated' });
});

// DELETE /posts/:id - Delete post (own only)
router.delete('/posts/:id', authMiddleware(), async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ error: 'Can only delete own post' });
  await post.destroy();
  broadcast(req.user.id, `Your post has been deleted.`, 'info');
  res.json({ message: 'Deleted' });
});

// POST /posts/:id/comments - Add comment
router.post('/posts/:id/comments', authMiddleware(), async (req, res) => {
  const { content } = req.body;
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comment = await Comment.create({
    userId: req.user.id,
    postId: post.id,
    content,
  });
  broadcast(post.userId, `New comment on your post by ${req.user.pseudonym}.`, 'info');
  res.status(201).json(comment);
});

// GET /posts/:id/comments - View comments with pagination and total count
router.get('/posts/:id/comments', authMiddleware(), async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comments = await Comment.findAll({
    where: { postId: req.params.id },
    attributes: ['id', 'content', 'userId', 'createdAt'],
    include: [{ model: User, attributes: ['pseudonym'] }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
  });
  const total = await Comment.count({ where: { postId: req.params.id } });
  res.json({ data: comments, total });
});

// DELETE /comments/:id - Delete comment (own only)
router.delete('/comments/:id', authMiddleware(), async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Can only delete own comment' });
  await comment.destroy();
  broadcast(comment.userId, `Your comment has been deleted.`, 'info');
  res.json({ message: 'Deleted' });
});

// POST /posts/:id/likes - Like a post
router.post('/posts/:id/likes', authMiddleware(), async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const [like, created] = await Like.findOrCreate({
    where: { userId: req.user.id, postId: req.params.id },
  });
  if (!created) return res.status(400).json({ error: 'Already liked' });
  await post.increment('views');
  broadcast(post.userId, `${req.user.pseudonym} liked your post.`, 'info');
  res.status(201).json(like);
});

// DELETE /posts/:id/likes - Unlike a post
router.delete('/posts/:id/likes', authMiddleware(), async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const like = await Like.findOne({ where: { userId: req.user.id, postId: req.params.id } });
  if (!like) return res.status(404).json({ error: 'Not liked' });
  await like.destroy();
  res.json({ message: 'Unliked' });
});

// POST /announcements - Create announcement (moderator/admin)
router.post('/announcements', authMiddleware(['moderator', 'admin']), async (req, res) => {
  const { title, content } = req.body;
  const announcement = await Announcement.create({
    userId: req.user.id,
    title,
    content,
  });
  broadcast(req.user.id, `Your announcement "${title}" has been created.`, 'info');
  res.status(201).json(announcement);
});

// PATCH /announcements/:id - Update announcement (moderator/admin)
router.patch('/announcements/:id', authMiddleware(['moderator', 'admin']), async (req, res) => {
  const { title, content } = req.body;
  const announcement = await Announcement.findByPk(req.params.id);
  if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
  await announcement.update({ title, content });
  broadcast(announcement.userId, `Your announcement has been updated.`, 'info');
  res.json({ message: 'Updated' });
});

// DELETE /announcements/:id - Delete announcement (moderator/admin)
router.delete('/announcements/:id', authMiddleware(['moderator', 'admin']), async (req, res) => {
  const announcement = await Announcement.findByPk(req.params.id);
  if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
  await announcement.destroy();
  broadcast(announcement.userId, `Your announcement has been deleted.`, 'info');
  res.json({ message: 'Deleted' });
});

// POST /events - Create event (admin only)
router.post('/events', authMiddleware(['admin']), async (req, res) => {
  const { title, content, startDate, endDate } = req.body;
  if (new Date(startDate) < new Date()) return res.status(400).json({ error: 'Start date must be future' });
  if (endDate && new Date(endDate) < new Date(startDate)) return res.status(400).json({ error: 'End date must be after start' });
  const event = await Event.create({
    userId: req.user.id,
    title,
    content,
    startDate,
    endDate,
  });
  broadcast(req.user.id, `Your event "${title}" has been created.`, 'info');
  res.status(201).json(event);
});

// PATCH /events/:id - Update event (admin only)
router.patch('/events/:id', authMiddleware(['admin']), async (req, res) => {
  const { title, content, startDate, endDate } = req.body;
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (new Date(startDate) < new Date() || (endDate && new Date(endDate) < new Date(startDate))) {
    return res.status(400).json({ error: 'Invalid dates' });
  }
  await event.update({ title, content, startDate, endDate });
  broadcast(event.userId, `Your event has been updated.`, 'info');
  res.json({ message: 'Updated' });
});

// DELETE /events/:id - Delete event (admin only)
router.delete('/events/:id', authMiddleware(['admin']), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  await event.destroy();
  broadcast(event.userId, `Your event has been deleted.`, 'info');
  res.json({ message: 'Deleted' });
});

// GET /events - View all events with pagination and total count
router.get('/events', authMiddleware(), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const events = await Event.findAll({
    include: [{ model: User, attributes: ['pseudonym', 'role'] }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['startDate', 'ASC']],
  });
  const total = await Event.count();
  res.json({ data: events, total });
});

module.exports = router;