const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const multerUpload = require('../middleware/multer'); // Pastikan multer di-import

// GET /profile -> Menampilkan halaman profil
router.get('/profile', protect, profileController.renderProfilePage);

// POST /profile -> Memproses pembaruan data profil, dengan middleware multer
router.post('/profile', protect, multerUpload.single('avatar'), profileController.updateProfile);

// GET /change-password -> Menampilkan form ubah password
router.get('/change-password', protect, profileController.renderChangePasswordPage);

// POST /change-password -> Memproses form ubah password
router.post('/change-password', protect, profileController.handleChangePassword);

module.exports = router;