const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'Uncategorized',
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  merchant: {
    type: String,
  },
  sourceType: {
    type: String,
    enum: ['manual', 'csv', 'pdf', 'image', 'sms'],
    default: 'manual',
  },
  rawText: {
    type: String, // Extracted text from receipt or SMS, useful for AI RAG
  },
  // If we decide to store embeddings in MongoDB directly, we can add a vector field here
  // embedding: { type: [Number] }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
