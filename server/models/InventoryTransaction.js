const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['Stock In', 'Sale', 'Service Consumption', 'Adjustment', 'Correction'],
    required: true 
  },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, default: '' },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  createdBy: { type: String, default: 'System' },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', InventoryTransactionSchema);
