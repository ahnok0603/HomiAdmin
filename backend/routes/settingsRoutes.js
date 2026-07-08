const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, settingsController.getSettings);
router.put('/', requireAdmin, settingsController.updateSettings);

module.exports = router;
