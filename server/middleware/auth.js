const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nx_salon_os_v1_jwt_secret_key_2026_super_secure');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.active) {
      return res.status(401).json({ success: false, message: 'User account is inactive or no longer exists' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized for this operation` });
    }
    next();
  };
};

const recordAudit = async ({ user, action, entity, entityId, details, salonId }) => {
  try {
    await AuditLog.create({
      userId: user ? user._id : 'System',
      userName: user ? user.name : 'System',
      userRole: user ? user.role : 'System',
      action,
      entity,
      entityId: entityId ? entityId.toString() : '',
      details: details || {},
      salonId
    });
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

module.exports = { protect, authorize, recordAudit };
