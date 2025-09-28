const jwt = require('jsonwebtoken');

function auth(requiredRole = null) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Unauthorized' });
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      req.user = payload; // { sub, email, role }
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

module.exports = auth;