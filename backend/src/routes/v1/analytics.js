const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const AnalyticsController = require('../../controllers/AnalyticsController');

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), asyncHandler(AnalyticsController.getDashboard));

module.exports = router;
