// backend/routes/messages.js
const express = require('express');
const RoomChat = require('../models/RoomChat');
const Room = require('../models/Room');
const CommunityMembership = require('../models/CommunityMembership');
const authMiddleware = require('../middleware/auth');
const { broadcast } = require('../config/websocket');
const router = express.Router();

router.post('/rooms', authMiddleware(), async (req, res) => {
  const { communityId, name } = req.body;
  const membership = await CommunityMembership.findOne({
    where: { userId: req.user.id, communityId },
  });
  if (!membership) return res.status(403).json({ error: 'Must be a community member' });
  if (membership.role !== 'admin') return res.status(403).json({ error: 'Only admins can create rooms' });
  const room = await Room.create({ communityId, name });
  broadcast(req.user.id, `You created room "${name}" in community.`, 'info');
  res.status(201).json(room);
});

router.get('/rooms/:communityId', authMiddleware(), async (req, res) => {
  const membership = await CommunityMembership.findOne({
    where: { userId: req.user.id, communityId: req.params.communityId },
  });
  if (!membership) return res.status(403).json({ error: 'Not a member' });
  const rooms = await Room.findAll({ where: { communityId: req.params.communityId } });
  res.json(rooms);
});

router.post('/rooms/:roomId', authMiddleware(), async (req, res) => {
  const { content } = req.body;
  const room = await Room.findByPk(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const membership = await CommunityMembership.findOne({
    where: { userId: req.user.id, communityId: room.communityId },
  });
  if (!membership) return res.status(403).json({ error: 'Must be a community member' });
  const message = await RoomChat.create({
    senderId: req.user.id,
    roomId: room.id,
    content,
  });
//   const community = await community.findByPk(room.communityId);
  broadcast(membership.userId, `${req.user.pseudonym} sent a message in "${room.name}": "${content.substring(0, 20)}...".`, 'info');
  res.status(201).json(message);
});

router.get('/rooms/:roomId', authMiddleware(), async (req, res) => {
  const room = await Room.findByPk(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const membership = await CommunityMembership.findOne({
    where: { userId: req.user.id, communityId: room.communityId },
  });
  if (!membership) return res.status(403).json({ error: 'Not a member' });
  const messages = await RoomChat.findAll({
    where: { roomId: req.params.roomId },
    order: [['timestamp', 'ASC']],
  });
  res.json(messages);
});

module.exports = router;