const mongoose = require('mongoose');

const marketSectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Eastleigh CBD', 'Westlands', 'Nakumatt', 'Sarit Center', 'Other'], required: true },
  image: String,
  merchants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  productCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketSection', marketSectionSchema);
