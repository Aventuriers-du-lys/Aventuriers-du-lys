function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ errorCode: 'auth_required' });
  }
  next();
}

function optionalAuth(req, _res, next) {
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ errorCode: 'auth_required' });
    }
    if (!roles.includes(req.session.role) && req.session.role !== 'admin') {
      return res.status(403).json({ errorCode: 'forbidden' });
    }
    next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
