const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const PharmacyController = require('../../controllers/PharmacyController');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'doctor', 'patient'), asyncHandler(PharmacyController.list));
router.get('/low-stock', authenticate, authorize('admin'), asyncHandler(PharmacyController.getLowStock));
router.get('/:id', authenticate, authorize('admin', 'doctor'), asyncHandler(PharmacyController.getById));

router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty(),
  body('quantity').isInt({ min: 0 }),
  body('unit_price').isFloat({ min: 0 }),
], asyncHandler(PharmacyController.create));

router.put('/:id', authenticate, authorize('admin'), asyncHandler(PharmacyController.update));
router.patch('/:id/stock', authenticate, authorize('admin'), asyncHandler(PharmacyController.updateStock));
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(PharmacyController.delete));

module.exports = router;
