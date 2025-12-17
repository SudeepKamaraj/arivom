const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);
    
    // Handle both userId and _id from different token formats
    const userId = decoded.userId || decoded._id || decoded.sub;
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      console.log('User not found or inactive:', { userId, userExists: !!user, isActive: user?.isActive });
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const logActivity = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log activity after response is sent
    if (req.user && req.activityData) {
      Activity.logActivity({
        userId: req.user._id,
        type: req.activityData.type,
        description: req.activityData.description,
        metadata: req.activityData.metadata || {},
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID,
        status: res.statusCode < 400 ? 'success' : 'failed',
        errorMessage: res.statusCode >= 400 ? data : undefined
      }).catch(err => console.error('Error logging activity:', err));
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    
    next();
  };
};

module.exports = { auth, logActivity, requireRole };
