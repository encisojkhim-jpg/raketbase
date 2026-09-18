// requireAuth (middleware/auth.js) MUST run before this — it's what sets req.user.
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ status: 401, message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Admin access required' });
  }

  next();
}

module.exports = { requireAdmin };
