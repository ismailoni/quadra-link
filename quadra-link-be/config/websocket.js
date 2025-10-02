const WebSocket = require('ws');
const Notification = require('../models/Notification');

let clients = new Map();
let wss; // will hold WebSocket.Server

function initWebsocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const userId = req.url.split('/')[1]; // Expect /:userId
    clients.set(userId, ws);

    ws.on('message', (message) => {
      console.log(`Received: ${message} from ${userId}`);
    });

    ws.on('close', () => {
      clients.delete(userId);
    });
  });

  console.log('✅ WebSocket server initialized');
}

const broadcast = async (userId, message, type = 'info') => {
  const ws = clients.get(userId);
  const notification = await Notification.create({ userId, message, type });
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        id: notification.id,
        message,
        type,
        timestamp: notification.timestamp,
      })
    );
  }
};

const getNotifications = async (userId) => {
  return await Notification.findAll({
    where: { userId },
    order: [['timestamp', 'DESC']],
  });
};

module.exports = { initWebsocket, broadcast, getNotifications };
