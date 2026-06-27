const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { requireProOrLimit } = require("../services/planCheck");

const router = express.Router();

router.post("/", requireAuth, requireProOrLimit("skills", 5), async (req, res) => {
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

router.post("/offer", requireAuth, requireProOrLimit("skills", 5), async (req, res) => {
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

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("skills").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Skill not found." });
    }

    if (docSnap.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await docRef.delete();
    return res.json({ message: "Skill deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { skillName, description } = req.body;

    const docRef = db.collection("skills").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: "Skill not found." });
    }

    if (docSnap.data().userId !== req.user.uid) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (skillName !== undefined) updates.skillName = skillName;
    if (description !== undefined) updates.description = description;

    await docRef.update(updates);
    const updated = await docRef.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
