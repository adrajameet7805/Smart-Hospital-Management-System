const { validationResult } = require('express-validator');
const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { user, token } = await AuthService.register(req.body);
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000, path: '/' });
      res.status(201).json({ success: true, message: 'Registration successful.', data: { user } });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { user, profile, token } = await AuthService.login(req.body.email, req.body.password);
      
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000, path: '/' });
      
      res.json({ success: true, message: 'Login successful.', data: { user, profile } });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async getMe(req, res) {
    try {
      const data = await AuthService.getMe(req.user.id);
      res.json({ success: true, data });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  logout(req, res) {
    res.clearCookie('token');
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    res.json({ success: true, message: 'Logged out.' });
  }

  forgotPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  }
}

module.exports = new AuthController();
