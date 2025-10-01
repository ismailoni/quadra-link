// backend/config/websocket.js
const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const Notification = require('../models/Notification');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on('connection', (ws, req) => {
  const userId = req.url.split('/')[1]; // Expect URL like /userId
  clients.set(userId, ws);

  ws.on('message', (message) => {
    console.log(`Received: ${message} from ${userId}`);
  });

  ws.on('close', () => {
    clients.delete(userId);
  });
});

const broadcast = async (userId, message, type = 'info') => {
  const ws = clients.get(userId);
  const notification = await Notification.create({ userId, message, type });
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ id: notification.id, message, type, timestamp: notification.timestamp }));
  }
};

const getNotifications = async (userId) => {
  return await Notification.findAll({ where: { userId }, order: [['timestamp', 'DESC']] });
};

module.exports = { server, broadcast, getNotifications };