// backend/routes/communities.js
const express = require('express');
const Community = require('../models/Community');
const CommunityMembership = require('../models/CommunityMembership');
const authMiddleware = require('../middleware/auth');
const { broadcast } = require('../config/websocket');
const router = express.Router();

router.post('/', authMiddleware(), async (req, res) => {
  const { name, description } = req.body;
  const community = await Community.create({
    name,
    description,
    createdBy: req.user.id,
  });
  await CommunityMembership.create({
    userId: req.user.id,
    communityId: community.id,
    role: 'admin',
  });
  broadcast(req.user.id, `You created community "${name}".`, 'info');
  res.status(201).json(community);
});

router.get('/', authMiddleware(), async (req, res) => {
  const communities = await Community.findAll({
    include: [{
      model: CommunityMembership,
      where: { userId: req.user.id },
      required: false,
    }],
  });
  res.json(communities);
});

router.post('/join/:id', authMiddleware(), async (req, res) => {
  const community = await Community.findByPk(req.params.id);
  if (!community) return res.status(404).json({ error: 'Community not found' });
  const membership = await CommunityMembership.findOne({
    where: { userId: req.user.id, communityId: community.id },
  });
  if (membership) return res.status(400).json({ error: 'Already a member' });
  await CommunityMembership.create({
    userId: req.user.id,
    communityId: community.id,
  });
  broadcast(req.user.id, `You joined community "${community.name}".`, 'info');
  res.json({ message: 'Joined' });
});

router.delete('/leave/:id', authMiddleware(), async (req, res) => {
  const membership = await CommunityMembership.findOne({
    where: { userId: req.user.id, communityId: req.params.id },
  });
  if (!membership) return res.status(404).json({ error: 'Not a member' });
  if (membership.role === 'admin') return res.status(403).json({ error: 'Admin cannot leave' });
  await membership.destroy();
  broadcast(req.user.id, `You left community "${await Community.findByPk(req.params.id).then(c => c.name)}".`, 'info');
  res.json({ message: 'Left' });
});

module.exports = router;