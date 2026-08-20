const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['mpesa', 'bank_transfer', 'buy_goods', 'paybill'], required: true },
  status: { type: String, enum: ['initiated', 'processing', 'completed', 'failed'], default: 'initiated' },
  mpesaResponse: {
    checkoutRequestId: String,
    responseCode: String,
    responseDescription: String,
    merchantRequestId: String
  },
  bankDetails: {
    accountNumber: String,
    bankName: String
  },
  buyGoodsDetails: {
    businessShortCode: String,
    reference: String
  },
  paybillDetails: {
    businessShortCode: String,
    accountNumber: String
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Payment', paymentSchema);
