const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'merchant', 'admin'], default: 'customer' },
  location: { type: String },
  county: { type: String },
  profileImage: { type: String },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String
  },
  mpesaNumber: { type: String },
  subscriptionTier: { type: String, enum: ['free', 'premium'], default: 'free' },
  subscriptionExpiry: { type: Date },
  verified: { type: Boolean, default: false },
  idNumber: { type: String },
  businessRegistration: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
