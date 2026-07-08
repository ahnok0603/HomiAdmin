const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, orderController.getOrders);
router.get('/:id', requireAdmin, orderController.getOrderById);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);
router.get('/:id/invoice', orderController.getInvoice); // Accessible without middleware for quick print layout loading

module.exports = router;
