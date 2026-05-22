const express = require("express");
const requireAuth = require("../middlewareAuth");
const { encryptData } = require("../services/encryptionService");

const router = express.Router();

const SECRET_KEY = process.env.ENCRYPTION_KEY;

// Encrypt only — decrypt is server-side only, never exposed as API
router.post("/encrypt", requireAuth, (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ message: "data is required" });
    const encrypted = encryptData(data, SECRET_KEY);
    return res.json(encrypted);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
