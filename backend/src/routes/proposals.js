const express = require('express');
const router = express.Router();
const proposalsController = require('../controllers/proposalsController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, proposalsController.createProposal);
router.get('/me', requireAuth, proposalsController.getMyProposals);
router.patch('/:id/accept', requireAuth, proposalsController.acceptProposal);
router.patch('/:id/reject', requireAuth, proposalsController.rejectProposal);

module.exports = router;