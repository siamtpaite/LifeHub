const express = require("express");
const { generateToken, requireAuth } = require("../services/authService");

const router = express.Router();

router.post("/login", (req, res) => {
  try {
    const { userId, tenantId, role } = req.body;
    if (!userId || !tenantId || !role) {
      return res.status(400).json({ message: "userId, tenantId, and role are required." });
    }

    const token = generateToken(userId, tenantId, role);
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/verify", (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "token is required." });
    }

    const decoded = requireAuth(token);
    if (decoded) {
      return res.json({ valid: true, decoded });
    }
    return res.status(401).json({ valid: false });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
