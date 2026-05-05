const Tesseract = require("tesseract.js");

async function extractReceiptText(imagePath) {
  if (!imagePath) {
    return "";
  }

  const { data } = await Tesseract.recognize(imagePath, "eng");
  return data && data.text ? data.text.trim() : "";
}

module.exports = extractReceiptText;
