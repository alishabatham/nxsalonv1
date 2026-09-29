const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ['service', 'product'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true }
});

const BillSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [BillItemSchema],
  subtotal: { type: Number, required: true },
  discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxEnabled: { type: Boolean, default: false },
  taxPercent: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Partially Paid', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  isCancelled: { type: Boolean, default: false },
  cancelledReason: { type: String, default: '' },
  cancelledBy: { type: String, default: '' },
  cancelledAt: { type: Date },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);
