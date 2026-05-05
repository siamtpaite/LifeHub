const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { reportRecall, aggregateRecalls } = require("../services/recallService");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { productName, description, severity } = req.body;
    if (!productName || !description || !severity) {
      return res.status(400).json({ message: "productName, description, and severity are required." });
    }

    const recall = await reportRecall(productName, description, severity);
    const docRef = await db.collection("recalls").add({
      ...recall,
      userId: req.user.uid
    });

    return res.status(201).json({ id: docRef.id, ...recall });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("recalls").orderBy("reportedAt", "desc").get();
    const recalls = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const aggregated = await aggregateRecalls(recalls);
    return res.json(aggregated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
