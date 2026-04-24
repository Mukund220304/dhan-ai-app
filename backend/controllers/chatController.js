const Expense = require('../models/Expense');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');

// Helper function to call OpenAI-compatible APIs (like Groq and OpenRouter)
const callOpenAICompatibleAPI = async (endpoint, apiKey, model, messages) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// POST /api/chat
const processChat = async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id;

  if (!message) return res.status(400).json({ message: 'Message is required' });

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ message: 'Groq API Key is missing. Please add it to the .env file.' });
  }

  try {
    // 1. Fetch real user context
    const user = await User.findById(userId);
    const currency = user?.preferences?.currencySymbol || '₹';
    
    // Get all expenses to feed into the AI
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    
    // Aggregate category totals
    const categoryTotals = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Build the RAG Data Context string
    const contextData = `
    --- USER FINANCIAL DATA CONTEXT ---
    Currency Symbol: ${currency}
    Total Spend All Time: ${currency}${totalSpent.toFixed(2)}
    
    Top Spending Categories (Top 10):
    ${categoryTotals.slice(0, 10).map(c => `- ${c._id}: ${currency}${c.total.toFixed(2)} (${c.count} transactions)`).join('\n')}

    Recent Transactions (Latest 20):
    ${expenses.slice(0, 20).map(e => `- Date: ${new Date(e.date).toISOString().split('T')[0]}, Merchant: ${e.merchant || 'Unknown'}, Category: ${e.category}, Amount: ${currency}${e.amount.toFixed(2)}`).join('\n')}
    -----------------------------------
    `;

    // 2. Setup strict System Instruction
    const systemInstruction = `
    You are the 'Dhan AI Financial Advisor', a highly intelligent, professional, and strict AI built specifically for managing personal finances.
    
    RULES YOU MUST NEVER BREAK:
    1. You are ONLY allowed to answer questions related to finance, budgeting, expenses, investing, or the user's specific data provided in the context.
    2. If the user asks a non-financial question (e.g., coding, general knowledge, writing a poem, jokes, history), you MUST explicitly refuse by saying: "I am a dedicated financial advisor. I can only assist you with questions regarding your finances, budgeting, and the expense data you have logged in Dhan AI."
    3. You must use the USER FINANCIAL DATA CONTEXT provided to give hyper-personalized answers. Do not give generic advice if specific data is available.
    4. Base your answers strictly on the provided transaction data. Do not hallucinate transactions that do not exist.
    5. Always format numbers nicely using the user's preferred currency symbol.
    6. Keep your answers concise, structured, and easy to read. Use bullet points when listing data. Do not write massive walls of text.
    7. Be encouraging but objective about their spending habits. Point out anomalies or areas where they spend too much based on the data.
    `;

    // 3. Get/create chat history
    let chatRecord = await ChatHistory.findOne({ userId });
    if (!chatRecord) chatRecord = await ChatHistory.create({ userId, messages: [] });

    // Format history for standard OpenAI format
    const formattedHistory = chatRecord.messages.slice(-12).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    // Construct the full message array
    const messages = [
      { role: 'system', content: systemInstruction + '\n\n' + contextData },
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    let aiResponse = '';
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        aiResponse = await callOpenAICompatibleAPI(
          'https://api.groq.com/openai/v1/chat/completions',
          process.env.GROQ_API_KEY,
          'llama-3.1-8b-instant',
          messages
        );
        break; // Success!
      } catch (groqError) {
        attempts++;
        const isRateLimit = groqError.message.includes('429') || groqError.message.includes('Rate limit');
        
        if (attempts < maxAttempts && isRateLimit) {
          console.warn(`Groq Rate Limit hit. Retrying in 1s... (Attempt ${attempts}/${maxAttempts})`);
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        console.warn('Groq API failed, attempting OpenRouter fallback...', groqError.message);
        
        // 5. Fallback to OpenRouter API
        if (!process.env.OPENROUTER_API_KEY) {
          throw new Error('Groq failed and OPENROUTER_API_KEY is not configured for fallback.');
        }
        
        try {
          aiResponse = await callOpenAICompatibleAPI(
            'https://openrouter.ai/api/v1/chat/completions',
            process.env.OPENROUTER_API_KEY,
            'meta-llama/llama-3-8b-instruct:free',
            messages
          );
          break; // Success!
        } catch (openRouterError) {
          console.error('OpenRouter Fallback also failed:', openRouterError.message);
          throw new Error('Both AI providers failed.');
        }
      }
    }

    // 6. Persist chat to DB (Save the clean message, not the injected context)
    chatRecord.messages.push({ role: 'user', content: message });
    chatRecord.messages.push({ role: 'assistant', content: aiResponse });
    await chatRecord.save();

    res.json({ response: aiResponse });
  } catch (err) {
    console.error('Chat error:', err.message);
    // Graceful error handling for the frontend
    res.status(500).json({ message: 'Server busy, try again' });
  }
};

// GET /api/chat/history
const getChatHistory = async (req, res) => {
  try {
    const chatRecord = await ChatHistory.findOne({ userId: req.user._id });
    res.json(chatRecord ? chatRecord.messages : []);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

// DELETE /api/chat/history
const clearChatHistory = async (req, res) => {
  try {
    await ChatHistory.findOneAndUpdate({ userId: req.user._id }, { messages: [] });
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing history' });
  }
};

module.exports = { processChat, getChatHistory, clearChatHistory };
