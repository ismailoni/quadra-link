// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // Your role middleware
const router = express.Router();

// GET /users - Admin only, list all (with optional pagination)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash', 'resetToken', 'resetExpires'] }, // Hide sensitive
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [{ model: require('../models/Institution'), attributes: ['name', 'shortcode'] }],
  });
  res.json(users);
});

// GET /users/:id - Get by ID (own or permitted)
router.get('/:id', authMiddleware(), async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash', 'resetToken', 'resetExpires'] },
    include: [{ model: require('../models/Institution'), attributes: ['name', 'shortcode'] }],
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Permission: Own, or admin/mod/counselor (with consent logic later)
  if (req.user.id !== user.id && !['admin', 'moderator', 'counselor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(user);
});

// PATCH /users/:id - Update own profile
router.patch('/:id', authMiddleware(), async (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) return res.status(403).json({ error: 'Can only update own profile' });

  const { bio, pseudonym, preferences, firstname, lastname, level } = req.body; // Exclude email, institution
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.update({ bio, pseudonym, preferences, firstname, lastname, level });
  res.json({ message: 'Updated' });
});

// PATCH /users/:id/ban - Ban user
router.patch('/:id/ban', authMiddleware(['moderator', 'admin']), async (req, res) => {
  const { isBanned } = req.body; // true/false
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.update({ isBanned });
  res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'}` });
});

// PATCH /users/:id/role - Change role (admin only)
router.patch('/:id/role', authMiddleware(['admin']), async (req, res) => {
  const { role } = req.body;
  if (!['student', 'moderator', 'counselor', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.update({ role });
  res.json({ message: 'Role updated' });
});

// DELETE /users/:id - Soft-delete (admin only)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.update({ isDeleted: true });
  res.json({ message: 'User deleted' });
});

// PATCH /users/:id/verify - Verify user
router.patch('/:id/verify', authMiddleware(['moderator', 'admin']), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.update({ isVerified: true });
  res.json({ message: 'User verified' });
});

module.exports = router;