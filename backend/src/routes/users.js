// users.js — Public user profile routes
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// GET /api/v1/users/:id — Public profile (no auth required)
router.get('/:id', usersController.getPublicProfile);

module.exports = router;

