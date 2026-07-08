const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, notificationController.getNotifications);
router.post('/', requireAdmin, notificationController.sendNotification);

module.exports = router;
