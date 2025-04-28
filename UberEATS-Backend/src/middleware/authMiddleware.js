import mongoose from 'mongoose';

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Validate that the stored id is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.session.userId)) {
      // Invalid session – destroy it
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Session invalid' });
    }
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};

export const authorizeRoles = (...allowed) => {
  return (req, res, next) => {
    if (!req.session || !req.session.role) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!allowed.includes(req.session.role)) {
      return res.status(403).json({ message: 'Permission denied' });
    }
    next();
  };
}; 