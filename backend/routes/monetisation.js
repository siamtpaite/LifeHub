const express = require("express");
const gumroadLinks = require("../services/gumroadPayment");
const { verifyCryptoPayment } = require("../services/cryptoPayment");

const router = express.Router();

const pricing = {
  monthly: 6.99,
  yearly: 69.99
};

router.get("/gumroad/:plan", (req, res) => {
  const { plan } = req.params;
  if (!gumroadLinks[plan]) {
    return res.status(404).send("Invalid plan");
  }
  return res.redirect(gumroadLinks[plan]);
});

router.post("/crypto/verify", async (req, res) => {
  try {
    const { network, txHash, plan } = req.body;
    if (!network || !txHash || !plan || !pricing[plan]) {
      return res.status(400).json({ success: false, message: "network, txHash, and valid plan are required." });
    }

    const valid = await verifyCryptoPayment(network, txHash, plan);
    if (valid) {
      return res.json({ success: true, plan, txHash });
    }
    return res.status(400).json({ success: false, message: "Payment not verified" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
