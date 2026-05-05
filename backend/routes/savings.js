const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const calculateSavings = require("../services/savingsCalculator");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [subscriptionsSnap, warrantiesSnap, skillsSnap] = await Promise.all([
      db.collection("subscriptions").where("userId", "==", req.user.uid).get(),
      db.collection("warranties").where("userId", "==", req.user.uid).get(),
      db.collection("skills").where("userId", "==", req.user.uid).get()
    ]);

    const subscriptions = subscriptionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const warranties = warrantiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const skills = skillsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const savings = await calculateSavings(subscriptions, warranties, skills);
    return res.json(savings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
