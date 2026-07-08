const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, userController.getUsers);
router.get('/:id', requireAdmin, userController.getUserById);
router.put('/:id/status', requireAdmin, userController.toggleUserLock);
router.delete('/:id', requireAdmin, userController.deleteUser);

module.exports = router;
