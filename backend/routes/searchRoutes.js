const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, searchController.getSearchHistory);
router.delete('/:id', requireAdmin, searchController.deleteSearchHistory);

module.exports = router;
