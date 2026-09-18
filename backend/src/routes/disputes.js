const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const disputesController = require('../controllers/disputesController');

// Any authenticated contract participant can file or view disputes.
router.use(requireAuth);

router.post('/', disputesController.createDispute);
router.get('/', disputesController.listDisputes); // admin: all disputes, others: only their own
router.get('/:id', disputesController.getDisputeById);

// Only admins can resolve.
router.patch('/:id/resolve', requireAdmin, disputesController.resolveDispute);

module.exports = router;
