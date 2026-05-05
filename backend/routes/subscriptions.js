const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const fetchSubscriptions = require("../utils/subscriptionAPI");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, cost, renewalDate } = req.body;

    if (!name || !cost || !renewalDate) {
      return res.status(400).json({ message: "name, cost, and renewalDate are required." });
    }

    const docRef = await db.collection("subscriptions").add({
      userId: req.user.uid,
      name,
      cost: Number(cost),
      renewalDate,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("subscriptions").where("userId", "==", req.user.uid).get();
    const subs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(subs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/auto", requireAuth, async (req, res) => {
  try {
    const autoSubscriptions = await fetchSubscriptions(req.user.uid);
    return res.json(autoSubscriptions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
