const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, phone } = req.body;

    const existingUser = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = runQuery(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, phone || null]
    );

    if (role === 'patient') {
      const { blood_group, age, gender, address } = req.body;
      runQuery(
        'INSERT INTO patients (user_id, blood_group, age, gender, address) VALUES (?, ?, ?, ?, ?)',
        [result.lastInsertRowid, blood_group || null, age || null, gender || null, address || null]
      );
    }

    if (role === 'doctor') {
      const { specialization, department, experience, qualification, consultation_fee } = req.body;
      runQuery(
        'INSERT INTO doctors (user_id, specialization, department, experience, qualification, consultation_fee) VALUES (?, ?, ?, ?, ?, ?)',
        [result.lastInsertRowid, specialization || 'General', department || null, experience || 0, qualification || null, consultation_fee || 0]
      );
    }

    const user = queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [result.lastInsertRowid]);
    const token = generateToken(user);

    res.status(201).json({ success: true, message: 'Registration successful.', data: { user, token } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    runQuery('UPDATE users SET last_login = datetime("now") WHERE id = ?', [user.id]);

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    let profile = null;
    if (user.role === 'patient') {
      profile = queryOne('SELECT * FROM patients WHERE user_id = ?', [user.id]);
    } else if (user.role === 'doctor') {
      profile = queryOne('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
    }

    res.json({ success: true, message: 'Login successful.', data: { user: userWithoutPassword, profile, token } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, (req, res) => {
  try {
    const user = queryOne(
      'SELECT id, name, email, role, phone, avatar, is_active, last_login, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'patient') {
      profile = queryOne('SELECT * FROM patients WHERE user_id = ?', [user.id]);
    } else if (user.role === 'doctor') {
      profile = queryOne('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
    }

    res.json({ success: true, data: { user, profile } });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], (req, res) => {
  res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
});

module.exports = router;
