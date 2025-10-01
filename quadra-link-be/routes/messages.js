// backend/routes/messages.js
const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');
const { broadcast } = require('../config/websocket');
const router = express.Router();

router.post('/', authMiddleware(), async (req, res) => {
  const { receiverId, content } = req.body;
  const message = await Message.create({
    senderId: req.user.id,
    receiverId,
    content,
  });
  broadcast(receiverId, `${req.user.pseudonym} sent you a message: "${content.substring(0, 20)}...".`, 'info');
  res.status(201).json(message);
});

router.get('/:receiverId', authMiddleware(), async (req, res) => {
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: req.user.id, receiverId: req.params.receiverId },
        { senderId: req.params.receiverId, receiverId: req.user.id },
      ],
    },
    order: [['timestamp', 'ASC']],
  });
  res.json(messages);
});

module.exports = router;