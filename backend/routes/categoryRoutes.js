const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, categoryController.getCategories);
router.get('/:id', requireAdmin, categoryController.getCategoryById);
router.post('/', requireAdmin, categoryController.createCategory);
router.put('/:id', requireAdmin, categoryController.updateCategory);
router.delete('/:id', requireAdmin, categoryController.deleteCategory);

module.exports = router;
