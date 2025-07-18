const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Rute yang sudah ada
router.post('/reviews', apiController.createReview);


// --- Rute BARU ---
// GET /api/reviews/public -> Menyediakan data ulasan untuk publik
router.get('/reviews/public', apiController.getPublicReviews);


module.exports = router;