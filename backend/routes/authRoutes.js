const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.checkMe);
router.post('/forgot-password', authController.forgotPassword);
router.put('/profile', authController.updateProfile);

module.exports = router;
