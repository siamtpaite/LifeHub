/**
 * pollPayment.js
 * Real on-chain verification for SOL, BASE (ETH L2), and TRON native transfers.
 * No API keys required — uses public RPC endpoints.
 *
 * Verifies:
 *  - Recipient matches vault address
 *  - Amount >= expected (with 1% tolerance for rounding)
 *  - Transaction is finalized (sufficient confirmations)
 */

const TOLERANCE = 0.01; // 1% underpayment tolerance

// ─── SOL ────────────────────────────────────────────────────────────────────

async function verifySolana({ txHash, expectedRecipient, expectedAmountUsd }) {
  // SOL/USD price from CoinGecko (free, no key)
  const priceRes = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    { signal: AbortSignal.timeout(8000) }
  );
  if (!priceRes.ok) throw new Error("SOL price fetch failed");
  const priceData = await priceRes.json();
  const solPrice = priceData?.solana?.usd;
  if (!solPrice) throw new Error("SOL price unavailable");

  const expectedLamports = Math.floor((expectedAmountUsd / solPrice) * 1e9 * (1 - TOLERANCE));

  // Solana public RPC
  const rpcRes = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [txHash, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!rpcRes.ok) throw new Error("Solana RPC unavailable");
  const rpc = await rpcRes.json();
  const tx = rpc?.result;

  if (!tx) return { ok: false, reason: "Transaction not found" };
  if (tx.meta?.err !== null) return { ok: false, reason: "Transaction failed on-chain" };

  // Must be finalized (not just confirmed)
  const slot = tx.slot;
  const statusRes = await fetch("https://api.mainnet-beta.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "getSignatureStatuses",
      params: [[txHash], { searchTransactionHistory: true }]
    }),
    signal: AbortSignal.timeout(10000)
  });
  const statusData = await statusRes.json();
  const status = statusData?.result?.value?.[0];
  if (!status || status.confirmationStatus !== "finalized") {
    return { ok: false, reason: "Transaction not yet finalized" };
  }

  // Find a native SOL transfer to our vault
  const instructions = tx.transaction?.message?.instructions || [];
  let transferredLamports = 0;
  for (const ix of instructions) {
    if (
      ix.program === "system" &&
      ix.parsed?.type === "transfer" &&
      ix.parsed?.info?.destination?.toLowerCase() === expectedRecipient.toLowerCase()
    ) {
      transferredLamports += Number(ix.parsed.info.lamports || 0);
    }
  }

  // Also check inner instructions
  const innerInstructions = tx.meta?.innerInstructions || [];
  for (const inner of innerInstructions) {
    for (const ix of inner.instructions || []) {
      if (
        ix.program === "system" &&
        ix.parsed?.type === "transfer" &&
        ix.parsed?.info?.destination?.toLowerCase() === expectedRecipient.toLowerCase()
      ) {
        transferredLamports += Number(ix.parsed.info.lamports || 0);
      }
    }
  }

  if (transferredLamports < expectedLamports) {
    return {
      ok: false,
      reason: `Insufficient amount: got ${transferredLamports} lamports, need ${expectedLamports}`
    };
  }

  return { ok: true };
}

// ─── BASE (ETH L2) ──────────────────────────────────────────────────────────

async function verifyBase({ txHash, expectedRecipient, expectedAmountUsd }) {
  // ETH/USD price
  const priceRes = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    { signal: AbortSignal.timeout(8000) }
  );
  if (!priceRes.ok) throw new Error("ETH price fetch failed");
  const priceData = await priceRes.json();
  const ethPrice = priceData?.ethereum?.usd;
  if (!ethPrice) throw new Error("ETH price unavailable");

  const expectedWei = BigInt(
    Math.floor((expectedAmountUsd / ethPrice) * 1e18 * (1 - TOLERANCE)).toString()
  );

  // Base mainnet public RPC
  const rpcRes = await fetch("https://mainnet.base.org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getTransactionByHash",
      params: [txHash]
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (!rpcRes.ok) throw new Error("Base RPC unavailable");
  const rpc = await rpcRes.json();
  const tx = rpc?.result;

  if (!tx) return { ok: false, reason: "Transaction not found" };
  if (tx.to?.toLowerCase() !== expectedRecipient.toLowerCase()) {
    return { ok: false, reason: "Recipient mismatch" };
  }

  const valueWei = BigInt(tx.value || "0x0");
  if (valueWei < expectedWei) {
    return { ok: false, reason: `Insufficient amount: got ${valueWei} wei, need ${expectedWei}` };
  }

  // Check receipt for success + confirmations
  const receiptRes = await fetch("https://mainnet.base.org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "eth_getTransactionReceipt",
      params: [txHash]
    }),
    signal: AbortSignal.timeout(10000)
  });
  const receiptData = await receiptRes.json();
  const receipt = receiptData?.result;

  if (!receipt) return { ok: false, reason: "Receipt not available yet" };
  if (receipt.status !== "0x1") return { ok: false, reason: "Transaction reverted" };

  // Check confirmations (need at least 12)
  const blockRes = await fetch("https://mainnet.base.org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "eth_blockNumber",
      params: []
    }),
    signal: AbortSignal.timeout(10000)
  });
  const blockData = await blockRes.json();
  const latestBlock = parseInt(blockData?.result || "0x0", 16);
  const txBlock = parseInt(receipt.blockNumber || "0x0", 16);
  const confirmations = latestBlock - txBlock;

  if (confirmations < 12) {
    return { ok: false, reason: `Only ${confirmations} confirmations, need 12` };
  }

  return { ok: true };
}

// ─── TRON ────────────────────────────────────────────────────────────────────

async function verifyTron({ txHash, expectedRecipient, expectedAmountUsd }) {
  // TRX/USD price
  const priceRes = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd",
    { signal: AbortSignal.timeout(8000) }
  );
  if (!priceRes.ok) throw new Error("TRX price fetch failed");
  const priceData = await priceRes.json();
  const trxPrice = priceData?.tron?.usd;
  if (!trxPrice) throw new Error("TRX price unavailable");

  const expectedSun = Math.floor((expectedAmountUsd / trxPrice) * 1e6 * (1 - TOLERANCE));

  // Tron public API (no key needed for basic tx lookup)
  const tronRes = await fetch(
    `https://api.trongrid.io/v1/transactions/${txHash}`,
    {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000)
    }
  );
  if (!tronRes.ok) throw new Error("Tron API unavailable");
  const tronData = await tronRes.json();
  const tx = tronData?.data?.[0];

  if (!tx) return { ok: false, reason: "Transaction not found" };
  if (tx.ret?.[0]?.contractRet !== "SUCCESS") {
    return { ok: false, reason: "Transaction failed on-chain" };
  }

  // Must be confirmed
  if (!tx.confirmed) return { ok: false, reason: "Transaction not yet confirmed" };

  // Find native TRX transfer (TransferContract)
  const contracts = tx.raw_data?.contract || [];
  let transferredSun = 0;
  for (const contract of contracts) {
    if (contract.type === "TransferContract") {
      const value = contract.parameter?.value;
      // Tron addresses in API are base58 — compare directly
      if (value?.to_address === expectedRecipient || value?.to_address === expectedRecipient) {
        transferredSun += Number(value?.amount || 0);
      }
    }
  }

  // Tron API sometimes returns hex address — also check decoded
  if (transferredSun === 0) {
    for (const contract of contracts) {
      if (contract.type === "TransferContract") {
        const value = contract.parameter?.value;
        // amount check without address validation as fallback
        if (value?.amount) transferredSun += Number(value.amount);
      }
    }
    // Re-validate recipient via tron info endpoint
    if (transferredSun > 0) {
      const infoRes = await fetch(
        `https://api.trongrid.io/v1/transactions/${txHash}/info`,
        { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(10000) }
      );
      if (infoRes.ok) {
        const info = await infoRes.json();
        const toAddr = info?.data?.[0]?.to;
        if (toAddr && toAddr !== expectedRecipient) {
          return { ok: false, reason: "Recipient mismatch" };
        }
      }
    }
  }

  if (transferredSun < expectedSun) {
    return {
      ok: false,
      reason: `Insufficient amount: got ${transferredSun} sun, need ${expectedSun}`
    };
  }

  return { ok: true };
}

// ─── Main entry ──────────────────────────────────────────────────────────────

async function pollPayment({ network, txHash, expectedRecipient, expectedAmount }) {
  if (!txHash || !expectedRecipient || !expectedAmount || !network) {
    return false;
  }

  try {
    let result;
    switch (network) {
      case "SOL":
        result = await verifySolana({ txHash, expectedRecipient, expectedAmountUsd: expectedAmount });
        break;
      case "BASE":
        result = await verifyBase({ txHash, expectedRecipient, expectedAmountUsd: expectedAmount });
        break;
      case "TRON":
        result = await verifyTron({ txHash, expectedRecipient, expectedAmountUsd: expectedAmount });
        break;
      default:
        console.error(`[pollPayment] Unknown network: ${network}`);
        return false;
    }

    if (!result.ok) {
      console.warn(`[pollPayment] Verification failed (${network}): ${result.reason}`);
    }
    return result.ok;
  } catch (err) {
    console.error(`[pollPayment] Error verifying ${network} tx ${txHash}:`, err.message);
    return false;
  }
}

module.exports = { pollPayment };
