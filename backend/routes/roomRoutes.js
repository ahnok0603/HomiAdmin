const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, roomController.getRooms);
router.post('/', requireAdmin, roomController.createRoom);
router.put('/:id', requireAdmin, roomController.updateRoom);
router.delete('/:id', requireAdmin, roomController.deleteRoom);

module.exports = router;
