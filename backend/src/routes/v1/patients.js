const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const PatientController = require('../../controllers/PatientController');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'doctor'), asyncHandler(PatientController.list));
router.get('/:id', authenticate, asyncHandler(PatientController.getById));
router.put('/:id', authenticate, asyncHandler(PatientController.update));
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(PatientController.delete));
router.get('/:id/history', authenticate, asyncHandler(PatientController.history));

module.exports = router;
