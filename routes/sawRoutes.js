const express = require('express');
const router = express.Router();
const sawController = require('../controllers/sawController');
const { protect } = require('../middleware/authMiddleware');

router.get('/saw-details', protect, sawController.renderSawPage);

module.exports = router;