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
const { server } = require('./config/websocket');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Sync DB (for dev; use migrations in prod)
sequelize.sync({ alter: true }) // alter: true updates schema without dropping
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
app.get('/', (req, res) => res.send('Campus Mental Health API is running!'));

// Start Express HTTP server
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));

// If you need to start websocket server as well, do it after Express:
server.listen(PORT + 1, () => console.log(`WebSocket server running on port ${PORT + 1}`));