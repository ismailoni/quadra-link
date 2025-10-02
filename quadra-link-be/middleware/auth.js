// backend/middleware/auth.js (same as before)
const jwt = require('jsonwebtoken');

module.exports = (roles = []) => (req, res, next) => {
  // Try Authorization header first
  let token = req.header('Authorization')?.replace('Bearer ', '');

  // Fallback: parse cookie string for jwt (no cookie-parser dependency required)
  if (!token && req.headers && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|; )jwt=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};