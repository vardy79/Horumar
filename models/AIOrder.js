const mongoose = require('mongoose');

const aiOrderSchema = new mongoose.Schema({
  aiAssistant: { type: mongoose.Schema.Types.ObjectId, ref: 'AIAssistant', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, unique: true, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  totalAmount: { type: Number, required: true },
  suggestedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'processing'], default: 'pending' },
  confidence: { type: Number, min: 0, max: 100 }, // AI confidence score
  reason: String, // Why AI created this order
  ownerAction: {
    action: { type: String, enum: ['confirmed', 'rejected', 'modified'] },
    timestamp: Date,
    notes: String
  },
  designedAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIOrder', aiOrderSchema);
