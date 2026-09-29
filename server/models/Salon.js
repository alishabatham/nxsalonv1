const mongoose = require('mongoose');

const WorkingHourSchema = new mongoose.Schema({
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  isOpen: { type: Boolean, default: true },
  openTime: { type: String, default: '10:00' }, // "10:00" 24hr format
  closeTime: { type: String, default: '20:00' } // "20:00" 24hr format
});

const SalonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  gstNumber: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  workingHours: [WorkingHourSchema],
  isSetupCompleted: { type: Boolean, default: false },
  invoicePrefix: { type: String, default: 'INV-2026-' },
  taxEnabled: { type: Boolean, default: false },
  taxPercent: { type: Number, default: 18 },
  reminderTimingHours: { type: Number, default: 24 },
  defaultRebookingDays: { type: Number, default: 30 }
}, { timestamps: true });

module.exports = mongoose.model('Salon', SalonSchema);
