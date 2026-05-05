const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { aggregateFailureTrends } = require("../services/trendAggregator");
const { predictResale } = require("../services/aiPrediction");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [warrantiesSnap, recallsSnap] = await Promise.all([
      db.collection("warranties").where("userId", "==", req.user.uid).get(),
      db.collection("recalls").get()
    ]);

    const warranties = warrantiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const recalls = recallsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const trends = aggregateFailureTrends(warranties, recalls);
    const resalePredictions = warranties.map((warranty) =>
      predictResale(warranty.productName || warranty.product || "Unknown Product", warranty.purchaseDate || warranty.createdAt || new Date().toISOString())
    );

    return res.json({ trends, resalePredictions });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
