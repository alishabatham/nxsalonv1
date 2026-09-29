const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// GET Audit Logs (Owner only, Spec Section 76)
router.get('/', protect, authorize('owner'), async (req, res) => {
  try {
    const { action, entity, search } = req.query;
    let filter = {};
    if (action && action !== 'All') filter.action = action;
    if (entity && entity !== 'All') filter.entity = entity;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { entity: { $regex: search, $options: 'i' } }
      ];
    }

    const auditLogs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: auditLogs.length, auditLogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
