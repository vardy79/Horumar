const mongoose = require('mongoose');

const trialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  daysRemaining: { type: Number, default: 90 },
  status: { type: String, enum: ['active', 'expired', 'converted'], default: 'active' },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

trialSchema.pre('save', function(next) {
  this.endDate = new Date(this.startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  this.daysRemaining = Math.ceil((this.endDate - Date.now()) / (1000 * 60 * 60 * 24));
  next();
});

module.exports = mongoose.model('Trial', trialSchema);
