const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  summaries: {
    type: String, // e.g., "You spent 40% of your budget on food this month."
  },
  spendingPatterns: {
    type: Map,
    of: String, // Could store AI-generated analysis of specific patterns
  },
  predictions: {
    type: String, // e.g., "You are likely to overspend on entertainment next week."
  }
}, { timestamps: true });

module.exports = mongoose.model('Insight', InsightSchema);
