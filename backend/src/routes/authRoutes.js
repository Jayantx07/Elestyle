const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window`
  message: { success: false, message: 'Too many requests, please try again later.' }
});

router.use(authLimiter);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', protect, authController.getMe);

module.exports = router;
