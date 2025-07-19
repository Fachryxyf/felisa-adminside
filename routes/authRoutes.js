const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.renderLoginPage);
router.post('/login', authController.handleLogin);

router.get('/logout', authController.handleLogout);

router.get('/forgot-password', authController.renderForgotPasswordPage);
router.post('/forgot-password', authController.handleForgotPassword);
router.get('/reset-password-form', authController.renderResetPasswordPage); // Menggunakan query, bukan token
router.post('/reset-password-form', authController.handleResetPassword);

module.exports = router;
