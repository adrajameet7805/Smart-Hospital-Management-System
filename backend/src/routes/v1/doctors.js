const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const DoctorController = require('../../controllers/DoctorController');

const router = express.Router();

router.get('/', authenticate, asyncHandler(DoctorController.list));
router.get('/:id', authenticate, asyncHandler(DoctorController.getById));
router.post('/', authenticate, authorize('admin'), asyncHandler(DoctorController.create));
router.put('/:id/schedule', authenticate, asyncHandler(DoctorController.updateSchedule));
router.get('/:id/appointments', authenticate, asyncHandler(DoctorController.getAppointments));
router.get('/:id/analytics', authenticate, asyncHandler(DoctorController.getAnalytics));

module.exports = router;
