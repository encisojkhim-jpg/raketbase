const express = require('express');
const router = express.Router();
const proposalsController = require('../controllers/proposalsController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, proposalsController.createProposal);
router.get('/me', requireAuth, proposalsController.getMyProposals);

module.exports = router;