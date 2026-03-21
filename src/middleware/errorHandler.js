// Error handling middleware

const handleError = (err, req, res, next) => {
  console.error('Error:', err);

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Database errors
  if (err.code === '23505') {
    // Unique constraint violation
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({ error: 'Referenced resource not found' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = { handleError };
