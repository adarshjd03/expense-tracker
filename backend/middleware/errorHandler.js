/**
 * Centralized error handler middleware.
 * Always returns a consistent JSON shape: { error: "message" }
 * Must be registered LAST in Express (after all routes).
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
