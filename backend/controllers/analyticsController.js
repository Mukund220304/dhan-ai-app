const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const [incomeResult, expenseResult, categoryBreakdown, recentTransactions] =
      await Promise.all([
        Expense.aggregate([
          { $match: { userId, type: 'income' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Expense.aggregate([
          { $match: { userId, type: 'expense' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Expense.aggregate([
          { $match: { userId, type: 'expense' } },
          { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
        ]),
        Expense.find({ userId }).sort({ date: -1 }).limit(10),
      ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalSpent = expenseResult[0]?.total || 0;

    res.json({
      totalIncome,
      totalSpent,
      netRemaining: totalIncome - totalSpent,
      categoryBreakdown,
      recentExpenses: recentTransactions, // keeping the name for backward compatibility in other parts for now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching analytics summary' });
  }
};

// GET /api/analytics/trends
const getTrends = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const monthlyTrends = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ monthlyTrends });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trends' });
  }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to clean AI response text (remove markdown backticks)
const cleanAIJSON = (text) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// GET /api/analytics/forecast
const getForecast = async (req, res) => {
  try {
    const userId = req.user._id;
    // Fetch all transactions for context
    const transactions = await Expense.find({ userId }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.json({
        analysis: "You don't have any transactions yet. Add some data to get a forecast!",
        predictedSpends: 0,
        predictedSavings: 0,
        categories: []
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
    });

    // We send a stripped down version to save tokens (just date, amount, type, category)
    const contextData = transactions.map(t => ({
      d: new Date(t.date).toISOString().split('T')[0],
      a: t.amount,
      t: t.type,
      c: t.category
    }));

    const prompt = `
      You are a financial forecasting AI.
      Analyze the following transaction history of a user.
      Predict their next month's total spending (predictedSpends) and total savings (predictedSavings) based on their current income and expense trends.
      Also provide a 1-2 sentence 'analysis' explaining the forecast (e.g. "Your spending is trending up in Groceries...").
      Also provide an array 'categories' predicting the spend per category for next month { name, amount }.

      Return EXACTLY this JSON structure:
      {
        "analysis": "string",
        "predictedSpends": number,
        "predictedSavings": number,
        "categories": [{ "name": "string", "amount": number }]
      }

      TRANSACTIONS:
      ${JSON.stringify(contextData)}
    `;

    // Use Groq for forecast to avoid Gemini rate limits
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    const cleanText = cleanAIJSON(data.choices[0].message.content);
    const forecast = JSON.parse(cleanText);

    res.json(forecast);
  } catch (err) {
    console.error('Forecast Error:', err.message);
    if (err.message && (err.message.includes('429') || err.message.includes('limit'))) {
      return res.status(429).json({ message: 'AI rate limit exceeded. Please wait 60 seconds and try again.' });
    }
    res.status(500).json({ message: 'Error generating forecast' });
  }
};

// POST /api/analytics/goal-strategy
const getGoalStrategy = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { goals, essentials } = req.body;

    // Fetch user's category breakdown and income to give AI context
    const [incomeResult, categoryBreakdown] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ])
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const topCategories = categoryBreakdown.slice(0, 5).map(c => `${c._id}: ${c.total}`).join(', ');
    const userGoals = goals.map(g => `${g.name} (${g.target})`).join(', ');
    const userEssentials = essentials.map(e => `${e.desc} (${e.amount})`).join(', ');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { temperature: 0.3 } });

    const prompt = `
      You are a strict, helpful financial advisor AI. 
      The user wants to save money for these goals: ${userGoals || 'None yet'}.
      Their monthly essential bills are: ${userEssentials || 'None specified'}.
      Their total monthly income is: ${totalIncome}.
      Their top spending categories are: ${topCategories || 'No spending data'}.

      Based on this exact data, give them a highly specific, personalized 2-sentence strategy on how they can cut back on their specific top discretionary categories to achieve their goals. Be extremely concise. Do not use markdown bolding. Make it sound like a smart, direct insight.
    `;

    // Use Groq for strategy
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ strategy: data.choices[0].message.content });
  } catch (err) {
    console.error('Goal Strategy Error:', err.message);
    if (err.message && (err.message.includes('429') || err.message.includes('limit'))) {
      return res.json({ strategy: 'AI rate limit exceeded. Please wait a few seconds before generating a new strategy.' });
    }
    res.status(500).json({ message: 'Error generating goal strategy' });
  }
};

module.exports = { getSummary, getTrends, getForecast, getGoalStrategy };
