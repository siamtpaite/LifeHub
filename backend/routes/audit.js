const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { logEvent, filterLogs } = require("../services/auditService");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { action, details, tenantId } = req.body;
    if (!action) {
      return res.status(400).json({ message: "action is required." });
    }

    const event = logEvent(req.user.uid, action, details || "");
    if (tenantId) event.tenantId = tenantId;

    await db.collection("auditLogs").add(event);
    return res.status(201).json(event);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    // Scope to logged-in user only
    const snapshot = await db.collection("auditLogs")
      .where("userId", "==", req.user.uid)
      .orderBy("timestamp", "desc")
      .get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const filtered = filterLogs(logs, req.query);
    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
