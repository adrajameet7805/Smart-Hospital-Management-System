const jwt = require('jsonwebtoken');
const { queryOne } = require('../config/db');
const redis = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'smart-hospital-jwt-secret-key-2026';

/**
 * Verify JWT from HTTP-Only cookie and validate user is still active.
 * Uses Redis cache to avoid DB hit on every request (60s TTL).
 */
async function authenticate(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Not authenticated.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check Redis cache first
    const cacheKey = `user:active:${decoded.id}`;
    let isActive = await redis.get(cacheKey);

    if (isActive === null) {
      // Cache miss — query database
      const user = await queryOne(
        'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (!user || !user.is_active) {
        res.clearCookie('token');
        return res.status(403).json({ success: false, message: 'Account deactivated.' });
      }

      // Cache the active status for 60 seconds
      await redis.setex(cacheKey, 60, '1');
      req.user = user;
    } else {
      // Cache hit — use decoded token data
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };
    }

    next();
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

module.exports = { authenticate, authorize, generateToken };
