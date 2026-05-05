const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { generateEnterpriseDashboard } = require("../services/enterpriseAnalytics");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [subsSnap, warrantiesSnap, recallsSnap] = await Promise.all([
      db.collection("subscriptions").get(),
      db.collection("warranties").get(),
      db.collection("recalls").get()
    ]);

    const subscriptions = subsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const warranties = warrantiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const recalls = recallsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const dashboard = generateEnterpriseDashboard(subscriptions, warranties, recalls);
    return res.json(dashboard);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
