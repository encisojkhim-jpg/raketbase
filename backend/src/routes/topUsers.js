const express = require('express');
const router = express.Router();
const topUsersController = require('../controllers/topUsersController');

// GET /api/v1/top-users?role=freelancer|customer&min_rating=&min_price=&max_price=&limit=&offset=
// Public (no login), like the profile ratings endpoint.
router.get('/', topUsersController.getTopUsers);

module.exports = router;
