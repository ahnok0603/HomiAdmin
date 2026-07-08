const { auth } = require('../config/firebase');

const requireAdmin = async (req, res, next) => {
  // 1. Check session auth (used for cookie-based browser login)
  if (req.session && req.session.admin) {
    req.admin = req.session.admin;
    return next();
  }

  // 2. Check Bearer token auth (used for direct token requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.admin = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email
      };
      return next();
    } catch (error) {
      console.error('Error verifying Firebase token in middleware:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token'
      });
    }
  }

  // 3. Unauthorized fallback
  return res.status(401).json({
    success: false,
    message: 'Access denied. Administrator privileges required.'
  });
};

module.exports = {
  requireAdmin
};
