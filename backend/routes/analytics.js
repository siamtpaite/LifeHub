const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const generateAnalytics = require("../services/analyticsService");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [subsSnap, warrantiesSnap, skillsSnap] = await Promise.all([
      db.collection("subscriptions").where("userId", "==", req.user.uid).get(),
      db.collection("warranties").where("userId", "==", req.user.uid).get(),
      db.collection("skills").where("userId", "==", req.user.uid).get()
    ]);

    const subscriptions = subsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const warranties = warrantiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const skills = skillsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const analytics = await generateAnalytics(subscriptions, warranties, skills);
    return res.json(analytics);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
