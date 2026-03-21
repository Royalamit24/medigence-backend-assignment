const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Sign up endpoint
router.post('/signup', authController.signup);

// Login endpoint
router.post('/login', authController.login);

// Refresh token endpoint (optional)
router.post('/refresh', authController.refreshToken);

module.exports = router;
