const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  appointmentNumber: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: String, required: true }, // Format "YYYY-MM-DD"
  startTime: { type: String, required: true }, // Format "10:30"
  endTime: { type: String, required: true }, // Format "11:00"
  duration: { type: Number, required: true }, // Minutes
  status: { 
    type: String, 
    enum: ['Booked', 'Confirmed', 'Checked-in', 'In Service', 'Completed', 'Cancelled', 'No-show'],
    default: 'Booked'
  },
  notes: { type: String, default: '' },
  bookingSource: { 
    type: String, 
    enum: ['Reception', 'Phone', 'WhatsApp', 'Website', 'Walk-in'],
    default: 'Reception'
  },
  checkInTime: { type: Date },
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },
  cancellationReason: { type: String, default: '' },
  cancelledBy: { type: String, default: '' },
  noShowMarkedBy: { type: String, default: '' },
  rescheduleToken: { type: String, default: '' },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

// Prevent double booking at DB index level if necessary, or check via query
AppointmentSchema.index({ staffId: 1, date: 1, startTime: 1, status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
