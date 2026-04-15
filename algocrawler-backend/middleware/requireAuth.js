// middleware/requireAuth.js
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // Extract token from the "Authorization: Bearer <token>" header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Missing or invalid token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user payload to the request
    next(); // Pass control to the next route handler
  } catch (err) {
    res.status(401).json({ error: 'Access denied. Token expired or corrupted.' });
  }
};

module.exports = requireAuth;