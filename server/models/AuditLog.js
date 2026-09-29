const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'System' },
  userName: { type: String, default: 'System' },
  userRole: { type: String, default: 'System' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
