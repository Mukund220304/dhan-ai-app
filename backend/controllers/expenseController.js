const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

// POST /api/expenses/add
const addExpense = async (req, res) => {
  try {
    const { amount, category, date, merchant, rawText } = req.body;
    if (!amount || !category)
      return res.status(400).json({ message: 'Amount and category are required' });

    const expense = await Expense.create({
      userId: req.user._id,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      merchant: merchant || '',
      sourceType: 'manual',
      rawText: rawText || '',
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding expense' });
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating expense' });
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await expense.deleteOne();
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
};

// POST /api/expenses/upload (AI Powered CSV/Image Parsing)
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const cleanAIJSON = (text) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const uploadExpense = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const { path, mimetype, originalname } = req.file;
  
  try {
    const isImage = mimetype.startsWith('image/');
    const isCsv = mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel' || originalname.endsWith('.csv');

    if (!isImage && !isCsv) {
      fs.unlinkSync(path);
      return res.status(400).json({ message: 'Only CSV and Images (PNG/JPG) are supported' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      }
    });

    const prompt = `
      You are a precise financial data extraction AI.
      I will provide you with a financial document (either raw text of a CSV file, or an image of a receipt/payment screenshot).
      Your task is to parse the data and return a clean JSON array of transaction objects.
      
      For each transaction found, determine:
      1. "date": The transaction date (YYYY-MM-DD format).
      2. "merchant": The description or name of the merchant (e.g., "Trader Joe's", "Comcast"). Clean up weird prefixes if necessary.
      3. "amount": The transaction amount (number, positive float).
      4. "type": Strictly either "income" or "expense". (If it's a salary or positive cashflow, mark "income". If it's a purchase, mark "expense").
      5. "category": Choose the MOST appropriate single word/short phrase category. Use standard categories like: Salary, Housing, Groceries, Utilities, Transport, Dining, Shopping, Health, Entertainment, Travel, Other.

      Return ONLY a JSON array of these objects. Do not wrap it in markdown block quotes.
    `;

    let aiResponseText;
    if (isImage) {
      const imageBytes = fs.readFileSync(path);
      const base64Image = Buffer.from(imageBytes).toString("base64");
      
      try {
        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: mimetype
          }
        };
        result = await model.generateContent([prompt, imagePart]);
        aiResponseText = result.response.text();
      } catch (geminiErr) {
        console.warn('Gemini Vision failed, attempting OpenRouter Vision fallback...', geminiErr.message);
        
        if (!process.env.OPENROUTER_API_KEY) throw geminiErr;

        // Call OpenRouter Vision API (using Llama 3.2 Vision or Gemini Flash Free)
        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: `data:${mimetype};base64,${base64Image}` } }
                ]
              }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (!openRouterRes.ok) throw new Error(`OpenRouter Vision Error: ${openRouterRes.status}`);
        
        const openRouterData = await openRouterRes.json();
        aiResponseText = cleanAIJSON(openRouterData.choices[0].message.content);
      }
    } else {
      const csvText = fs.readFileSync(path, 'utf8');
      // Use Groq for CSV parsing to save Gemini vision quota
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt + `\n\nRAW CSV DATA:\n${csvText}` }],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!groqRes.ok) {
        throw new Error(`Groq API Error: ${groqRes.status}`);
      }

      const groqData = await groqRes.json();
      aiResponseText = cleanAIJSON(groqData.choices[0].message.content);
    }

    fs.unlinkSync(path); // Cleanup immediately
    const parsedTransactions = JSON.parse(aiResponseText);
    
    // Support both direct array or wrapped object from different AI models
    const transactionsArray = Array.isArray(parsedTransactions) ? parsedTransactions : (parsedTransactions.transactions || []);

    const created = [];
    for (const row of transactionsArray) {
      if (!row.amount) continue;
      
      const exp = await Expense.create({
        userId: req.user._id,
        amount: parseFloat(row.amount),
        type: row.type || 'expense',
        category: row.category || 'Uncategorized',
        merchant: row.merchant || '',
        date: row.date ? new Date(row.date) : new Date(),
        sourceType: 'csv',
        rawText: JSON.stringify(row), // store the AI parsed row as raw context
      });
      created.push(exp);
    }

    res.status(201).json(created);
  } catch (err) {
    console.error('AI Processing Error:', err);
    if (fs.existsSync(path)) fs.unlinkSync(path);
    
    if (err.message) {
      if (err.message.includes('API key not valid')) {
        return res.status(400).json({ message: 'Invalid Gemini API Key in .env file.' });
      }
      if (err.message.includes('429 Too Many Requests') || err.message.includes('quota')) {
        return res.status(429).json({ message: 'AI Rate limit exceeded. Please wait a minute and try again.' });
      }
    }
    
    res.status(500).json({ message: 'Error processing document with AI.' });
  }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense, uploadExpense };
