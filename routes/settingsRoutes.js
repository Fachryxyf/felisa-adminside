const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/settings/weights', protect, settingsController.renderWeightsPage);
router.post('/settings/weights', protect, settingsController.updateWeights);

module.exports = router;