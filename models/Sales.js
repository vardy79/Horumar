const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  type: { type: String, enum: ['regular', 'live', 'flash'], required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  description: { type: String },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  discount: { type: Number },
  quantity: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isPremium: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'ended', 'draft'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sales', salesSchema);
