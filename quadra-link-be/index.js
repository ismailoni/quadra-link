// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const institutionRoutes = require('./routes/institutions');
const userRoutes = require('./routes/users');
const moodCheckInRoutes = require('./routes/moodCheckIn');
const notificationsRoutes = require('./routes/notifications');
const communitiesRoutes = require('./routes/communities');
const messagesRoutes = require('./routes/messages');
const normalizePort = require('./utils/normalizePort');
const {initWebsocket} = require('./config/websocket'); // <-- import initializer, not server

dotenv.config();

const app = express();
const DEFAULT_PORT = 3000;
const PORT = normalizePort(process.env.PORT, DEFAULT_PORT);

// Middleware
app.use(cors());
app.use(express.json());

// Sync DB
sequelize.sync({ alter: true })
  .then(() => console.log('PostgreSQL connected and synced'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/institutions', institutionRoutes);
app.use('/mood-check-ins', moodCheckInRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/communities', communitiesRoutes);
app.use('/messages', messagesRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Start Express HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});

// Attach WebSocket to the same HTTP server
initWebsocket(server);
