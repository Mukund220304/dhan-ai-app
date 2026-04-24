require('dotenv').config({ path: './backend/.env' });
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    }
  });
  
  // Create a dummy 1x1 png image
  const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  
  const prompt = `Return a JSON array`;
  const imagePart = {
    inlineData: {
      data: base64Png,
      mimeType: "image/png"
    }
  };
  
  try {
    const result = await model.generateContent([prompt, imagePart]);
    console.log(result.response.text());
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
