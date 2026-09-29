const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  method: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Card', 'Other'],
    default: 'Cash'
  },
  referenceNumber: { type: String, default: '' },
  paidAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  isCorrected: { type: Boolean, default: false },
  correctionNote: { type: String, default: '' },
  correctedBy: { type: String, default: '' },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
