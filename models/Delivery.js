const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  area: { type: String, enum: ['nairobi', 'outside_nairobi'], required: true },
  deliveryFee: { type: Number, required: true },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  status: { type: String, enum: ['pending', 'in_transit', 'delivered', 'failed'], default: 'pending' },
  deliveryNotes: { type: String },
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: String,
    notes: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', deliverySchema);
