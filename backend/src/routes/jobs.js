const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', jobsController.getAllJobs);
router.get('/categories', jobsController.getCategories);
router.get('/:id', jobsController.getJobById);
router.post('/', requireAuth, jobsController.createJob);

module.exports = router;