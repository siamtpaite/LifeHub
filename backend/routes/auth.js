const express = require("express");
const requireAuth = require("../middlewareAuth");

const router = express.Router();

// Returns current authenticated user info from Firebase token
router.get("/me", requireAuth, (req, res) => {
  return res.json({
    uid: req.user.uid,
    email: req.user.email || null,
    name: req.user.name || null,
  });
});

module.exports = router;
