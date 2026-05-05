const express = require("express");

const router = express.Router();

const supportedCurrencies = ["INR", "USD", "EUR", "GBP"];

router.get("/currencies", (req, res) => {
  return res.json(supportedCurrencies);
});

module.exports = router;
