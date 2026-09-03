const mongoose = require('mongoose');

const aiAssistantSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'paused', 'inactive'], default: 'active' },
  autoOrderGeneration: { type: Boolean, default: true },
  businessHours: {
    enabled: { type: Boolean, default: false },
    start: String,
    end: String
  },
  preferences: {
    maxOrdersPerDay: { type: Number, default: 20 },
    minOrderValue: { type: Number, default: 1000 },
    autoConfirmUnder: { type: Number, default: 5000 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIAssistant', aiAssistantSchema);
