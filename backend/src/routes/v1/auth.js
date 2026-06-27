const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const AuthController = require('../../controllers/AuthController');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role'),
], asyncHandler(AuthController.register));

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], asyncHandler(AuthController.login));

router.get('/me', authenticate, asyncHandler(AuthController.getMe));
router.post('/logout', AuthController.logout);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], AuthController.forgotPassword);

module.exports = router;
