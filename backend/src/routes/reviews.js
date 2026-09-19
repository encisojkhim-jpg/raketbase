const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const reviewsController = require('../controllers/reviewsController');

// GET /api/v1/reviews/users/:id?role=freelancer|customer - public profile ratings (no login required,
// same as job pages, so logged-out visitors and the job apply pages can show them).
router.get('/users/:id', reviewsController.getUserReviews);

// POST /api/v1/reviews - rate the other participant of a completed contract
router.post('/', requireAuth, reviewsController.createReview);

module.exports = router;
