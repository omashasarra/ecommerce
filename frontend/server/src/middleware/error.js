export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
}
