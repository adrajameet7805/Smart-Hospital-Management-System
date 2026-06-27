const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const BillingController = require('../../controllers/BillingController');

const router = express.Router();

router.get('/', authenticate, asyncHandler(BillingController.list));
router.get('/:id', authenticate, asyncHandler(BillingController.getById));
router.post('/', authenticate, authorize('admin', 'doctor'), asyncHandler(BillingController.create));
router.put('/:id/pay', authenticate, asyncHandler(BillingController.pay));

module.exports = router;
