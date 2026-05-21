const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { verifyToken } = require("../middlewareAuth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const snap = await db.collection("warranties")
      .where("userId", "==", req.user.uid).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(items);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const db = admin.firestore();
    const { productName, warrantyExpiryDate, receiptUrl, receiptImage, receiptFileName } = req.body;

    let receiptText = "";

    // Claude Vision OCR if image provided
    if (receiptImage && process.env.ANTHROPIC_API_KEY) {
      try {
        // Fetch the image and convert to base64
        const imgRes = await fetch(receiptImage);
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";

        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 300,
            messages: [{
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: contentType, data: base64 },
                },
                {
                  type: "text",
                  text: "Extract the key details from this receipt: store name, product name, purchase date, total amount, and warranty info if visible. Reply in one concise line, e.g. 'Apple Store · MacBook Pro · 2024-03-01 · ₹2,19,000'. No extra text.",
                },
              ],
            }],
          }),
        });

        const claudeData = await claudeRes.json();
        receiptText = claudeData.content?.[0]?.text || "";
      } catch (ocrErr) {
        console.error("OCR error:", ocrErr);
      }
    }

    const doc = {
      userId: req.user.uid,
      productName,
      warrantyExpiryDate,
      receiptUrl: receiptUrl || "",
      receiptFileName: receiptFileName || "",
      receiptText,
      createdAt: new Date().toISOString(),
    };

    const ref = await admin.firestore().collection("warranties").add(doc);
    return res.json({ id: ref.id, ...doc, receiptText });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

module.exports = router;
