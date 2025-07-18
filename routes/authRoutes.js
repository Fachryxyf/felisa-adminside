const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET /login -> Menampilkan halaman login
router.get('/login', authController.renderLoginPage);

// POST /login -> Memproses data login dari form
router.post('/login', authController.handleLogin);

// GET /logout -> Proses logout
router.get('/logout', authController.handleLogout);

module.exports = router;
