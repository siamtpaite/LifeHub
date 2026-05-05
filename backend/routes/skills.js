const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { skillName, description } = req.body;

    if (!skillName) {
      return res.status(400).json({ message: "skillName is required." });
    }

    const docRef = await db.collection("skills").add({
      userId: req.user.uid,
      ownerName: req.user.name || req.user.email || "Anonymous",
      skillName,
      description: description || "",
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("skills").orderBy("createdAt", "desc").get();
    const skills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(skills);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/offer", requireAuth, async (req, res) => {
  try {
    const { skillName, description } = req.body;
    if (!skillName) {
      return res.status(400).json({ message: "skillName is required." });
    }

    const docRef = await db.collection("skills").add({
      userId: req.user.uid,
      ownerName: req.user.name || req.user.email || "Anonymous",
      skillName,
      description: description || "",
      credits: 1,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/exchange", requireAuth, async (req, res) => {
  try {
    const { skillId } = req.body;
    if (!skillId) {
      return res.status(400).json({ message: "skillId is required." });
    }

    const skillRef = db.collection("skills").doc(skillId);
    const snapshot = await skillRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ message: "Skill not found." });
    }

    const data = snapshot.data();
    const currentCredits = typeof data.credits === "number" ? data.credits : 1;
    const nextCredits = Math.max(currentCredits - 1, 0);

    await skillRef.update({ credits: nextCredits });
    return res.json({ message: "Skill exchanged successfully", credits: nextCredits });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
