const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { protect } = require('../middleware/authMiddleware');

// Rute yang sudah ada
// GET /reviews -> Menampilkan halaman data penilaian
router.get('/reviews', protect, reviewsController.renderReviewsPage);


// --- Rute BARU ---
// DELETE /reviews/:id -> Menghapus sebuah ulasan berdasarkan ID
router.delete('/reviews/:id', protect, reviewsController.deleteReview);


module.exports = router;