const express = require('express');
const router = express.Router();
const proposalsController = require('../controllers/proposalsController');

// Note: Member 2 will pass their JWT auth middleware here once ready
router.post('/', proposalsController.createProposal);
router.get('/me', proposalsController.getMyProposals);

module.exports = router;