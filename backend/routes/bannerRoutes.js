const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, bannerController.getBanners);
router.post('/', requireAdmin, bannerController.createBanner);
router.put('/:id', requireAdmin, bannerController.updateBanner);
router.delete('/:id', requireAdmin, bannerController.deleteBanner);

module.exports = router;
