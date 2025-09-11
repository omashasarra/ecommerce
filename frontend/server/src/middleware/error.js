// 404 Handler

export function notFound(req, res) {
  res.status(404).json({ error: 'Not Found' });
  // This runs if no route matches the incoming request.
  // Example: GET /api/does-not-exist → { "error": "Not Found" }
}

// General Error Handler

export function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  // Logs the error (stack trace, message, etc.) to the server console.
  // Useful for debugging.

  res.status(err.status || 500).json({
    error: err.message || 'Server error'
  });
  // Sends back a JSON error response to the client.
  // If err.status is provided, use it. Otherwise default to 500 (Internal Server Error).
  // If err.message is provided, show it. Otherwise use "Server error".
}
