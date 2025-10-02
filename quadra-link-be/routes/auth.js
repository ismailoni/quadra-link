// backend/routes/auth.js (updated)
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const User = require('../models/User');
const Institution = require('../models/Institution');
const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
	const { firstname, lastname, email, password, institutionShortcode, role = 'student' } = req.body;

	const institution = await Institution.findOne({ where: { shortcode: institutionShortcode } });
	if (!institution) return res.status(400).json({ errorMessage: 'Invalid institution' });

	const emailRegex = new RegExp(institution.emailPattern);
	if (!emailRegex.test(email)) return res.status(400).json({ errorMessage: 'Email does not match institution format' });

	const existingUser = await User.findOne({ where: { email } });
	if (existingUser) return res.status(400).json({ errorMessage: 'Email taken' });

	// Hash the password before creating the user
	const passwordHash = await bcrypt.hash(password, 10);

	const user = await User.create({
		firstname,
		lastname,
		email,
		passwordHash,
		// Also store the hashed password into a common `password` field if the model or legacy records expect that name.
		password: passwordHash,
		role,
		institutionId: institution.id,
	});
	res.status(201).json({ message: 'Account created successfully', userId: user.id });
});

// POST /auth/login
router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ where: { email } });
	if (!user) {
		return res.status(401).json({ errorMessage: 'Invalid credentials' });
	}

	// Support either `passwordHash` or legacy `password` attribute (both store hashed values).
	const storedHash = user.passwordHash || user.password || '';
	const isMatch = storedHash ? await bcrypt.compare(password, storedHash) : false;

	if (!isMatch) {
		return res.status(401).json({ errorMessage: 'Invalid credentials' });
	}
	const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
	res.json({ token });
});

// POST /auth/forgot-password - Initiate reset
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

		// Read and trim env vars to avoid accidental whitespace or trailing comments
		const host = (process.env.EMAIL_HOST || '').trim();
		const port = parseInt((process.env.EMAIL_PORT || '587').trim(), 10) || 587;
		const emailUser = (process.env.EMAIL_USER || '').trim();
		const emailPass = (process.env.EMAIL_PASS || '').trim();
		let baseUrl = (process.env.APP_BASE_URL || '').trim();
		// If someone left an inline comment after the URL in .env, remove it
		if (baseUrl.includes(' #')) baseUrl = baseUrl.split(' #')[0].trim();
		if (!host || !emailUser || !emailPass || !baseUrl) {
			console.error('Mail config missing:', { host, emailUser, baseUrl });
			return res.status(500).json({ errorMessage: 'Email not configured' });
		}

		const transporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465, // true for 465, false for other ports
			auth: {
				user: emailUser,
				pass: emailPass,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		const cleanBase = baseUrl.replace(/\/$/, '');
		const resetUrl = `${cleanBase}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`;
		const mailOptions = {
			from: emailUser,
			to: email,
			subject: 'Password Reset',
			text: `Click to reset: ${resetUrl}\nValid for 1 hour.`,
		};

		await transporter.sendMail(mailOptions);
		res.json({ message: 'Reset email sent' });
	} catch (err) {
		console.error('Forgot-password error:', err);
		res.status(500).json({ errorMessage: 'Internal server error' });
	}
});

// POST /auth/reset-password - Set new password
router.post('/reset-password', async (req, res) => {
	const { email, token, newPassword } = req.body;
	const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
	const user = await User.findOne({
		where: {
			email,
			resetToken: resetTokenHash,
			resetExpires: { [Op.gt]: Date.now() },
		},
	});

	if (!user) return res.status(400).json({ errorMessage: 'Invalid or expired token' });

	// Hash the new password before saving and store in both fields to be safe.
	const newHash = await bcrypt.hash(newPassword, 10);
	user.passwordHash = newHash;
	user.password = newHash; // keep legacy/alternate field synced
	user.resetToken = null;
	user.resetExpires = null;
	await user.save();

	res.json({ message: 'Password reset successful' });
});

module.exports = router;