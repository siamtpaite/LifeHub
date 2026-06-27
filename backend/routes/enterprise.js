const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { requirePro } = require("../services/planCheck");
const { generateEnterpriseDashboard } = require("../services/enterpriseAnalytics");

const router = express.Router();

router.get("/", requireAuth, requirePro(), async (req, res) => {
  try {
    const uid = req.user.uid;

    // Scope all queries to the logged-in user's data only
    const [subsSnap, warrantiesSnap, recallsSnap] = await Promise.all([
      db.collection("subscriptions").where("userId", "==", uid).get(),
      db.collection("warranties").where("userId", "==", uid).get(),
      db.collection("recalls").where("userId", "==", uid).get()
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
