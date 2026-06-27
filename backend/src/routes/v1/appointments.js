const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const AppointmentController = require('../../controllers/AppointmentController');

const router = express.Router();

router.get('/', authenticate, asyncHandler(AppointmentController.list));

router.post('/', authenticate, [
  body('doctor_id').isInt(),
  body('date').notEmpty(),
  body('time_slot').notEmpty(),
], asyncHandler(AppointmentController.create));

router.put('/:id', authenticate, asyncHandler(AppointmentController.update));
router.delete('/:id', authenticate, asyncHandler(AppointmentController.cancel));
router.get('/queue/:doctorId', authenticate, asyncHandler(AppointmentController.getQueue));

module.exports = router;
