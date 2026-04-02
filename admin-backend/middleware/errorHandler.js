/**
 * Centralized Error Handler Middleware
 * 
 * Catches all unhandled errors and returns safe, generic messages.
 * Internal details are logged server-side only — never exposed to clients.
 * 
 * Must be registered AFTER all routes in server.js.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message
  });
};

export default errorHandler;
