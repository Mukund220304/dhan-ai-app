const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate response based on context
const generateChatResponse = async (userMessage, contextData, previousMessages = []) => {
  try {
    const systemPrompt = `You are Dhan AI, a helpful, context-aware financial assistant.
You must base your answers ONLY on the user's financial data provided below.
Do not hallucinate or make up data. If you don't know the answer based on the data, say so clearly.

USER'S FINANCIAL DATA:
${JSON.stringify(contextData, null, 2)}
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...previousMessages,
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'gpt-3.5-turbo' depending on the key
      messages: messages,
      temperature: 0.2, // Keep it factual
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate AI response');
  }
};

module.exports = {
  generateChatResponse,
};
