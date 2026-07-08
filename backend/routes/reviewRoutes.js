const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, reviewController.getReviews);
router.delete('/:id', requireAdmin, reviewController.deleteReview);

module.exports = router;
