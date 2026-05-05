function aggregateFailureTrends(warranties, recalls) {
  const productStats = {};

  warranties.forEach((warranty) => {
    const productKey = warranty.productName || warranty.product || "Unknown Product";
    if (!productStats[productKey]) {
      productStats[productKey] = { failures: 0, recalls: 0 };
    }
    if (warranty.claimed) {
      productStats[productKey].failures += 1;
    }
  });

  recalls.forEach((recall) => {
    const productKey = recall.product || recall.productName || "Unknown Product";
    if (!productStats[productKey]) {
      productStats[productKey] = { failures: 0, recalls: 0 };
    }
    productStats[productKey].recalls += 1;
  });

  return Object.keys(productStats).map((product) => ({
    product,
    failures: productStats[product].failures,
    recalls: productStats[product].recalls,
    riskScore: productStats[product].failures * 2 + productStats[product].recalls * 3
  }));
}

module.exports = { aggregateFailureTrends };
