const express = require("express");
const requireAuth = require("../middlewareAuth");
const { encryptData, decryptData } = require("../services/encryptionService");

const router = express.Router();

const SECRET_KEY = process.env.ENCRYPTION_KEY;

router.post("/encrypt", requireAuth, (req, res) => {
  try {
    const { data } = req.body;
    const encrypted = encryptData(data, SECRET_KEY);
    return res.json(encrypted);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/decrypt", requireAuth, (req, res) => {
  try {
    const { encryptedData, iv } = req.body;
    const decrypted = decryptData(encryptedData, iv, SECRET_KEY);
    return res.json(decrypted);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
