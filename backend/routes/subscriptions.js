const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { requireProOrLimit } = require("../services/planCheck");
const fetchSubscriptions = require("../utils/subscriptionAPI");

const router = express.Router();

router.post("/", requireAuth, requireProOrLimit("subscriptions", 5), async (req, res) => {
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

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("subscriptions").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    if (docSnap.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await docRef.delete();
    return res.json({ message: "Subscription deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cost, renewalDate } = req.body;

    const docRef = db.collection("subscriptions").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Subscription not found." });
    }

    if (docSnap.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (cost !== undefined) updates.cost = Number(cost);
    if (renewalDate !== undefined) updates.renewalDate = renewalDate;

    await docRef.update(updates);
    const updated = await docRef.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
