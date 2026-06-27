const logger = require('../config/logger');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error.';

  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
    userId: req.user?.id,
  });

  res.status(statusCode).json({ success: false, message });
}

module.exports = errorHandler;
