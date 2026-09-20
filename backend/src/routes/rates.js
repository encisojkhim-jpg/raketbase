const express = require('express');
const router = express.Router();
const ratesController = require('../controllers/ratesController');

router.get('/', ratesController.getRates);

module.exports = router;
