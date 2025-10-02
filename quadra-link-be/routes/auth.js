// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const User = require('../models/User');
const Institution = require('../models/Institution');

const router = express.Router();

// Debug logger
const log = (...args) => {
  console.log('[AUTH DEBUG]', ...args);
};

// ======================== REGISTER ========================
router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password, institutionShortcode, role = 'student' } = req.body;

    const institution = await Institution.findOne({ where: { shortcode: institutionShortcode } });
    if (!institution) return res.status(400).json({ errorMessage: 'Invalid institution' });

    const emailRegex = new RegExp(institution.emailPattern);
    if (!emailRegex.test(email)) return res.status(400).json({ errorMessage: 'Email does not match institution format' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ errorMessage: 'Email taken' });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstname,
      lastname,
      email,
      passwordHash,
      role,
      institutionId: institution.id,
    });

    res.status(201).json({ message: 'Account created successfully', userId: user.id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
});

// ======================== LOGIN ========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    log('Login attempt:', { email, password });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ errorMessage: 'Invalid email address' });

    log('Stored hash:', user.passwordHash);

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    log('Password match result:', isMatch);
    if (!isMatch) return res.status(401).json({ errorMessage: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Set cookie instead of only returning token
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use HTTPS in production
      sameSite: "lax", // prevents CSRF but works with most clients
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ errorMessage: 'Error logging in, check oyur internet connection' });
  }
});

// ======================== FORGOT PASSWORD ========================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ errorMessage: 'Email required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ errorMessage: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetToken = resetTokenHash;
    user.resetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const host = (process.env.EMAIL_HOST || '').trim();
    const port = parseInt((process.env.EMAIL_PORT || '587').trim(), 10) || 587;
    const emailUser = (process.env.EMAIL_USER || '').trim();
    const emailPass = (process.env.EMAIL_PASS || '').trim();
    let baseUrl = (process.env.APP_BASE_URL || '').trim();
    if (baseUrl.includes(' #')) baseUrl = baseUrl.split(' #')[0].trim();

    if (!host || !emailUser || !emailPass || !baseUrl) {
      console.error('Mail config missing:', { host, emailUser, baseUrl });
      return res.status(500).json({ errorMessage: 'Email not configured' });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false },
    });

    const cleanBase = baseUrl.replace(/\/$/, '');
    const resetUrl = `${cleanBase}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: 'Password Reset',
      text: `Click to reset: ${resetUrl}\nValid for 1 hour.`,
    });

    res.json({ message: 'Reset email sent' });
  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
});

// ======================== RESET PASSWORD ========================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

	log('Password reset attempt:', { email });

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      where: {
        email,
        resetToken: resetTokenHash,
        resetExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) return res.status(400).json({ errorMessage: 'Invalid or expired token' });

    const newHash = await bcrypt.hash(newPassword, 12);

	log('New hashed password:', hashedPassword);

    user.passwordHash = newHash;
    user.resetToken = null;
    user.resetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset-password error:', err);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
});

module.exports = router;
