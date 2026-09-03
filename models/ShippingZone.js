const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, enum: ['Nairobi', 'Kenya', 'Somalia', 'International'], required: true },
  baseFee: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  estimatedDays: { type: Number, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
