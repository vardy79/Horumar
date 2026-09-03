const mongoose = require('mongoose');

const wholesalerProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  minOrderQuantity: { type: Number, required: true, default: 1 },
  wholesalePrice: { type: Number, required: true },
  retailPrice: { type: Number },
  bulkDiscounts: [{
    quantity: Number,
    discount: Number // percentage
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WholesalerProduct', wholesalerProductSchema);
