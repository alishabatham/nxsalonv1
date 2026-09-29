const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  sellingPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, default: 0, min: 0 },
  currentStock: { type: Number, required: true, min: 0 },
  minStock: { type: Number, default: 5, min: 0 },
  active: { type: Boolean, default: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
