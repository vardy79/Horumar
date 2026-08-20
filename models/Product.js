const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  wholesalePrice: { type: Number },
  quantity: { type: Number, default: 0 },
  unit: { type: String, enum: ['kg', 'litre', 'bag', 'crate', 'bunch', 'piece'], required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String },
  county: { type: String },
  images: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
