const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const requireAuth = require("../middlewareAuth");
const { requireProOrLimit } = require("../services/planCheck");

router.get("/", requireAuth, async (req, res) => {
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

router.post("/", requireAuth, requireProOrLimit("warranties", 3), async (req, res) => {
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

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const db = admin.firestore();
    const { id } = req.params;
    const docRef = db.collection("warranties").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Warranty not found." });
    }

    if (docSnap.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await docRef.delete();
    return res.json({ message: "Warranty deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const db = admin.firestore();
    const { id } = req.params;
    const { productName, warrantyExpiryDate } = req.body;

    const docRef = db.collection("warranties").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Warranty not found." });
    }

    if (docSnap.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (productName !== undefined) updates.productName = productName;
    if (warrantyExpiryDate !== undefined) updates.warrantyExpiryDate = warrantyExpiryDate;

    await docRef.update(updates);
    const updated = await docRef.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
