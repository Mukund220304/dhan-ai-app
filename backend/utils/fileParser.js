const fs = require('fs');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const csv = require('csv-parser');

// Parse PDF to extract text
const parsePDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};

// Parse Image using OCR
const parseImage = async (filePath) => {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text;
};

// Parse CSV
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

module.exports = {
  parsePDF,
  parseImage,
  parseCSV,
};
