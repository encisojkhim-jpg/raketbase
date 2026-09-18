const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const proposalsController = require('../controllers/proposalsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', jobsController.getAllJobs);
router.get('/categories', jobsController.getCategories);
router.get('/mine', requireAuth, jobsController.getMyJobs);
router.get('/:id/proposals', requireAuth, proposalsController.getProposalsForJob);
router.get('/:id', jobsController.getJobById);
router.post('/', requireAuth, jobsController.createJob);

module.exports = router;