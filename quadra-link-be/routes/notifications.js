// backend/routes/notifications.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getNotifications } = require('../config/websocket');
const router = express.Router();

router.get('/', authMiddleware(), async (req, res) => {
  const notifications = await getNotifications(req.user.id);
  res.json(notifications);
});

module.exports = router;