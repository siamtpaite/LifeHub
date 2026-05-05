const { pollPayment } = require("./pollPayment");

const addresses = {
  SOL: "A8qcrU1VYQy398C7ESotbQsLgwyeaPXt8K3eYqk6C7D3",
  BASE: "0x410bd58086F75f61AEe0546A74B7c3D9Ef461bD8",
  TRON: "TXE8UZejabi93ks73VzsgeBqXM4C3fEydX"
};

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
