const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', requireAdmin, reportController.getReport);
router.get('/export/excel', requireAdmin, reportController.exportExcel);
router.get('/export/pdf', reportController.exportPDF); // Accessible without token for direct browser PDF generation via standard print printouts

module.exports = router;
