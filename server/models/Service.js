const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['Hair', 'Facial', 'Makeup', 'Spa', 'Nails', 'Other'],
    default: 'Hair'
  },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 1 }, // in minutes
  description: { type: String, default: '' },
  active: { type: Boolean, default: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
