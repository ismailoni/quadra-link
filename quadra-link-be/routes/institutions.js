// backend/routes/institutions.js
const express = require('express');
const Institution = require('../models/Institution');
const router = express.Router();

// GET /institutions - Fetch all institutions (public, no auth needed for registration form)
router.get('/', async (req, res) => {
  const institutions = await Institution.findAll({
    attributes: ['name', 'shortcode', 'placeholder', 'emailPattern'], // Only send what's needed for frontend
  });
  res.json(institutions);
});

module.exports = router;