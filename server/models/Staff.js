const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  profilePhoto: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['Manager', 'Receptionist', 'Stylist', 'Other'],
    default: 'Stylist'
  },
  assignedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  joiningDate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  workingDays: [{ 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  workingHours: {
    openTime: { type: String, default: '10:00' },
    closeTime: { type: String, default: '19:00' }
  },
  offDays: [{ type: String }], // Array of 'YYYY-MM-DD' or day names
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
