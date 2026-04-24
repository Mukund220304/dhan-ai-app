require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Forced nodemon restart
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Connect to MongoDB
connectDB();

const app = express();

// ─── CORS (must be first) ────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    // Allow any origin for production ease (Netlify dynamic URLs), or specify process.env.FRONTEND_URL
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── CRON JOBS ────────────────────────────────────────────
// Weekly summary — every Sunday at 9 AM
cron.schedule('0 9 * * 0', async () => {
  console.log('⏰ Running weekly summary cron job...');
  try {
    const User = require('./models/User');
    const Expense = require('./models/Expense');
    const { sendWeeklySummary } = require('./services/emailService');

    const users = await User.find({ 'notifications.weeklySummary': true, 'notifications.emailEnabled': true, isEmailVerified: true });
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const user of users) {
      try {
        const userId = new mongoose.Types.ObjectId(user._id);
        const [weeklyResult, categories] = await Promise.all([
          Expense.aggregate([
            { $match: { userId, date: { $gte: oneWeekAgo } } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ]),
          Expense.aggregate([
            { $match: { userId, date: { $gte: oneWeekAgo } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } },
          ]),
        ]);

        const weeklyTotal = weeklyResult[0]?.total || 0;
        const count = weeklyResult[0]?.count || 0;
        if (count > 0) {
          await sendWeeklySummary(user, { weeklyTotal, count, categories });
          console.log(`✅ Weekly summary sent to ${user.email}`);
        }
      } catch (e) {
        console.error(`Failed weekly summary for ${user.email}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Cron error:', e.message);
  }
});

// Spending threshold alert — every day at 8 PM
cron.schedule('0 20 * * *', async () => {
  console.log('⏰ Running spending alert check...');
  try {
    const User = require('./models/User');
    const Expense = require('./models/Expense');
    const { sendSpendingAlert } = require('./services/emailService');

    const users = await User.find({ 'notifications.spendingAlerts': true, 'notifications.emailEnabled': true, isEmailVerified: true });
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const user of users) {
      try {
        const userId = new mongoose.Types.ObjectId(user._id);
        const result = await Expense.aggregate([
          { $match: { userId, date: { $gte: firstOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const total = result[0]?.total || 0;
        const threshold = user.notifications.spendingThreshold;
        if (total > threshold) {
          await sendSpendingAlert(user, total, threshold);
          console.log(`🚨 Spending alert sent to ${user.email} (${total} > ${threshold})`);
        }
      } catch (e) {
        console.error(`Alert failed for ${user.email}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Cron error:', e.message);
  }
});

// ─── Error handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Dhan AI backend running on http://localhost:${PORT}`));
