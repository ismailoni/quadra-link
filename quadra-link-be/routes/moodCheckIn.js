// backend/routes/moodCheckIn.js (updated)
const express = require('express');
const User = require('../models/User');
const MoodCheckIn = require('../models/MoodCheckIn');
const authMiddleware = require('../middleware/auth'); // Your role middleware
const router = express.Router();

// POST /mood-check-ins - Log a mood check-in (unchanged)
router.post('/', authMiddleware(), async (req, res) => {
  const { mood, notes } = req.body;
  if (mood < 1 || mood > 5) return res.status(400).json({ error: 'Mood must be 1-5' });

  const moodCheckIn = await MoodCheckIn.create({
    userId: req.user.id,
    mood,
    notes,
  });
  res.status(201).json(moodCheckIn);
});

// GET /mood-check-ins - View history (own or all for counselors/admins) (unchanged)
router.get('/', authMiddleware(), async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let moodCheckIns;
  if (['admin', 'counselor'].includes(req.user.role)) {
    moodCheckIns = await MoodCheckIn.findAll({
      attributes: ['id', 'mood', 'notes', 'timestamp', 'userId'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: User, attributes: ['pseudonym', 'role'] }],
    });
  } else {
    moodCheckIns = await MoodCheckIn.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'mood', 'notes', 'timestamp'],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }
  res.json(moodCheckIns);
});

// GET /mood-check-ins/:id - View specific entry (unchanged)
router.get('/:id', authMiddleware(), async (req, res) => {
  const moodCheckIn = await MoodCheckIn.findByPk(req.params.id, {
    attributes: ['id', 'mood', 'notes', 'timestamp', 'userId'],
    include: [{ model: User, attributes: ['pseudonym', 'role'] }],
  });
  if (!moodCheckIn) return res.status(404).json({ error: 'Entry not found' });

  if (moodCheckIn.userId !== req.user.id && !['admin', 'counselor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(moodCheckIn);
});

// PATCH /mood-check-ins/:id - Update own entry (within 24h) (unchanged)
router.patch('/:id', authMiddleware(), async (req, res) => {
  const { mood, notes } = req.body;
  if (mood && (mood < 1 || mood > 5)) return res.status(400).json({ error: 'Mood must be 1-5' });

  const moodCheckIn = await MoodCheckIn.findByPk(req.params.id);
  if (!moodCheckIn) return res.status(404).json({ error: 'Entry not found' });
  if (moodCheckIn.userId !== req.user.id) return res.status(403).json({ error: 'Can only update own entry' });

  const hoursSince = (Date.now() - new Date(moodCheckIn.timestamp)) / 3600000;
  if (hoursSince > 24) return res.status(400).json({ error: 'Cannot update after 24 hours' });

  await moodCheckIn.update({ mood, notes });
  res.json({ message: 'Updated' });
});

// DELETE /mood-check-ins/:id - Delete own entry (within 24h) (unchanged)
router.delete('/:id', authMiddleware(), async (req, res) => {
  const moodCheckIn = await MoodCheckIn.findByPk(req.params.id);
  if (!moodCheckIn) return res.status(404).json({ error: 'Entry not found' });
  if (moodCheckIn.userId !== req.user.id) return res.status(403).json({ error: 'Can only delete own entry' });

  const hoursSince = (Date.now() - new Date(moodCheckIn.timestamp)) / 3600000;
  if (hoursSince > 24) return res.status(400).json({ error: 'Cannot delete after 24 hours' });

  await moodCheckIn.destroy();
  res.json({ message: 'Deleted' });
});

// GET /mood-check-ins/stats - Aggregated stats (admin/counselor) (unchanged)
router.get('/stats', authMiddleware(['admin', 'counselor']), async (req, res) => {
  const stats = await MoodCheckIn.findAll({
    attributes: [
      'userId',
      [sequelize.fn('AVG', sequelize.col('mood')), 'avgMood'],
      [sequelize.fn('COUNT', sequelize.col('mood')), 'entryCount'],
    ],
    group: ['userId'],
    include: [{ model: User, attributes: ['pseudonym', 'role'] }],
  });
  res.json(stats);
});

// GET /mood-check-ins/trends - Mood trend analysis (admin/counselor)
router.get('/trends', authMiddleware(['admin', 'counselor']), async (req, res) => {
  const { period = 'week', userId } = req.query; // 'week' or 'month', optional user filter
  const whereClause = userId ? { userId } : {};

  let groupBy;
  if (period === 'week') {
    groupBy = [sequelize.fn('date_trunc', 'week', sequelize.col('timestamp')), 'userId'];
  } else if (period === 'month') {
    groupBy = [sequelize.fn('date_trunc', 'month', sequelize.col('timestamp')), 'userId'];
  } else {
    return res.status(400).json({ error: 'Period must be "week" or "month"' });
  }

  const trends = await MoodCheckIn.findAll({
    attributes: [
      [sequelize.fn('date_trunc', period, sequelize.col('timestamp')), 'timePeriod'],
      'userId',
      [sequelize.fn('AVG', sequelize.col('mood')), 'avgMood'],
      [sequelize.fn('COUNT', sequelize.col('mood')), 'entryCount'],
    ],
    where: whereClause,
    group: groupBy,
    order: [[sequelize.fn('date_trunc', period, sequelize.col('timestamp')), 'ASC']],
    include: [{ model: User, attributes: ['pseudonym', 'role'] }],
  });

  res.json(trends);
});

module.exports = router;