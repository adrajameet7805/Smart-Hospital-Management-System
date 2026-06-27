const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const AmbulanceController = require('../../controllers/AmbulanceController');

const router = express.Router();

router.get('/', authenticate, asyncHandler(AmbulanceController.list));
router.get('/:id', authenticate, asyncHandler(AmbulanceController.getById));
router.post('/', authenticate, authorize('admin'), [
  body('vehicle_number').notEmpty(),
  body('type').notEmpty(),
], asyncHandler(AmbulanceController.create));
router.put('/:id/location', authenticate, authorize('admin'), asyncHandler(AmbulanceController.updateLocation));
router.patch('/:id/status', authenticate, authorize('admin'), asyncHandler(AmbulanceController.updateStatus));

module.exports = router;
