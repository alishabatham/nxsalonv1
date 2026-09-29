const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole: { type: String, enum: ['owner', 'receptionist', 'staff', 'customer', 'all'] },
  type: { 
    type: String, 
    enum: ['Booking Confirmation', 'Appointment Reminder', 'Cancellation', 'Reschedule', 'Payment Confirmation', 'Low Stock', 'Rebooking Reminder'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ['In-app', 'SMS', 'WhatsApp'], default: 'In-app' },
  deliveryStatus: { type: String, enum: ['Sent', 'Pending', 'Not Configured'], default: 'Sent' },
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
