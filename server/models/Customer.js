const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true, index: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Unspecified'], default: 'Unspecified' },
  birthday: { type: String, default: '' },
  address: { type: String, default: '' },
  notes: { type: String, default: '' },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
