const User = require('../models/User');
const Expense = require('../models/Expense');
const bcrypt = require('bcryptjs');

const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
};

// GET /api/settings
const getSettings = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -otp -otpExpiry');
  res.json(user);
};

// PATCH /api/settings/profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    const user = await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { new: true }).select('-password -otp');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// PATCH /api/settings/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password' });
  }
};

// PATCH /api/settings/currency
const updateCurrency = async (req, res) => {
  try {
    const { currency } = req.body;
    if (!CURRENCIES[currency]) return res.status(400).json({ message: 'Unsupported currency' });

    const user = await User.findByIdAndUpdate(req.user._id, {
      'preferences.currency': currency,
      'preferences.currencySymbol': CURRENCIES[currency].symbol,
    }, { new: true }).select('-password -otp');
    res.json({ currency, currencySymbol: CURRENCIES[currency].symbol, preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ message: 'Error updating currency' });
  }
};

// PATCH /api/settings/notifications
const updateNotifications = async (req, res) => {
  try {
    const { emailEnabled, weeklySummary, spendingAlerts, spendingThreshold } = req.body;
    const update = {};
    if (emailEnabled !== undefined) update['notifications.emailEnabled'] = emailEnabled;
    if (weeklySummary !== undefined) update['notifications.weeklySummary'] = weeklySummary;
    if (spendingAlerts !== undefined) update['notifications.spendingAlerts'] = spendingAlerts;
    if (spendingThreshold !== undefined) update['notifications.spendingThreshold'] = Number(spendingThreshold);

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password -otp');
    res.json(user.notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

// GET /api/settings/export-csv
const exportCSV = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    const sym = req.user.preferences?.currencySymbol || '₹';

    const header = 'Date,Merchant,Category,Amount,Source';
    const rows = expenses.map(e =>
      `${new Date(e.date).toISOString().split('T')[0]},${(e.merchant || '').replace(/,/g, ' ')},${e.category},${e.amount},${e.sourceType}`
    );
    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="dhanai_expenses.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Error exporting data' });
  }
};

module.exports = { getSettings, updateProfile, changePassword, updateCurrency, updateNotifications, exportCSV, CURRENCIES };
