/**
 * Wraps an async route handler to catch rejected promises
 * and forward them to the centralized error handler.
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
