const { pollPayment } = require("./pollPayment");

const addresses = {
  SOL: process.env.VAULT_SOL,
  BASE: process.env.VAULT_BASE,
  TRON: process.env.VAULT_TRON
};

// Validate at startup
Object.entries(addresses).forEach(([chain, addr]) => {
  if (!addr) throw new Error(`Missing env var: VAULT_${chain}`);
});

const pricing = {
  monthly: 6.99,
  yearly: 69.99
};

function normalizeNetwork(network) {
  if (!network) return "";
  const upper = String(network).toUpperCase();
  if (upper === "SOLANA") return "SOL";
  return upper;
}

async function verifyCryptoPayment(network, txHash, plan) {
  const normalizedNetwork = normalizeNetwork(network);
  if (!addresses[normalizedNetwork] || !pricing[plan]) {
    return false;
  }

  return pollPayment({
    network: normalizedNetwork,
    txHash,
    expectedRecipient: addresses[normalizedNetwork],
    expectedAmount: pricing[plan]
  });
}

module.exports = { addresses, pricing, verifyCryptoPayment };
