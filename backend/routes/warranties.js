const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const extractReceiptText = require("../utils/ocr");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { productName, receiptUrl, receiptFileName, warrantyExpiryDate, receiptImage } = req.body;

    if (!productName || !warrantyExpiryDate) {
      return res.status(400).json({ message: "productName and warrantyExpiryDate are required." });
    }

    let extractedText = "";
    if (receiptImage || receiptUrl) {
      try {
        extractedText = await extractReceiptText(receiptImage || receiptUrl);
      } catch (ocrError) {
        extractedText = `OCR failed: ${ocrError.message}`;
      }
    }

    const docRef = await db.collection("warranties").add({
      userId: req.user.uid,
      productName,
      receiptUrl: receiptUrl || "",
      receiptFileName: receiptFileName || "",
      warrantyExpiryDate,
      receiptText: extractedText || "No OCR data",
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ id: docRef.id, receiptText: extractedText || "No OCR data" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("warranties").where("userId", "==", req.user.uid).get();
    const warranties = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(warranties);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
