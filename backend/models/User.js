const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  googleId: { type: String },

  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },

  // User preferences
  preferences: {
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    theme: { type: String, default: 'dark' },
  },

  // Notification settings
  notifications: {
    emailEnabled: { type: Boolean, default: false },
    weeklySummary: { type: Boolean, default: false },
    spendingAlerts: { type: Boolean, default: false },
    spendingThreshold: { type: Number, default: 10000 },
    lastWeeklySentAt: { type: Date },
  },

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
