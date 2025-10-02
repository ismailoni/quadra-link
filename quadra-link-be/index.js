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
// Replace generic cors() with explicit options so credentials work with a non-wildcard origin
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser requests (e.g. server-to-server) when origin is undefined
    if (!origin || origin === FRONTEND_ORIGIN) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
};
app.use(cors(corsOptions));
// Replace the problematic app.options('*', ...) which caused path-to-regexp errors
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // run cors for preflight without registering a '*' route
    return cors(corsOptions)(req, res, next);
  }
  next();
});
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
