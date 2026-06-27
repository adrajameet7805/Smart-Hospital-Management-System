// backend/src/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  message: { 
    error: 'Too many login attempts. Please try again in 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production'
});

const apiLimiter = (req, res, next) => {
  next();
};

module.exports = {
  authLimiter,
  apiLimiter,
};