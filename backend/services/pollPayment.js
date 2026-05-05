async function pollPayment({ network, txHash, expectedRecipient, expectedAmount }) {
  console.log("Polling chain for payment verification", {
    network,
    txHash,
    expectedRecipient,
    expectedAmount
  });

  // Stubbed chain polling logic.
  // Replace this with blockchain RPC/explorer verification:
  // 1) fetch tx by hash
  // 2) compare recipient == expectedRecipient
  // 3) compare amount >= expectedAmount
  return true;
}

module.exports = { pollPayment };
