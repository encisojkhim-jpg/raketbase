const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const contractsController = require('../controllers/contractsController');

// All contract endpoints require an authenticated session
router.use(requireAuth);

// GET /api/v1/contracts - List contracts for the authenticated user (client or freelancer)
router.get('/', contractsController.getContracts);

// GET /api/v1/contracts/:id - Get contract details by ID
router.get('/:id', contractsController.getContractById);

// PATCH /api/v1/contracts/:id/submit - Freelancer marks work as submitted for review
router.patch('/:id/submit', contractsController.submitWork);

// PATCH /api/v1/contracts/:id/complete - Client approves work and releases escrow funds
router.patch('/:id/complete', contractsController.completeContract);

module.exports = router;
