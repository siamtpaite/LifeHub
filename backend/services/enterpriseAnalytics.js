function generateEnterpriseDashboard(subscriptions, warranties, recalls) {
  const canceledCount = subscriptions.filter((subscription) => Boolean(subscription.canceled)).length;
  const subscriptionChurnRate = subscriptions.length > 0 ? canceledCount / subscriptions.length : 0;

  const claimedWarranties = warranties.filter((warranty) => Boolean(warranty.claimed));
  const claimDurations = claimedWarranties
    .map((warranty) => {
      const claimDate = new Date(warranty.claimDate || warranty.updatedAt || warranty.createdAt || Date.now());
      const purchaseDate = new Date(warranty.purchaseDate || warranty.createdAt || Date.now());
      return claimDate.getTime() - purchaseDate.getTime();
    })
    .filter((duration) => Number.isFinite(duration) && duration >= 0);

  const avgWarrantyClaimTime =
    claimDurations.length > 0 ? claimDurations.reduce((acc, duration) => acc + duration, 0) / claimDurations.length : 0;

  const topFailingProducts = claimedWarranties
    .map((warranty) => warranty.productName || warranty.product)
    .filter(Boolean)
    .slice(0, 5);

  return {
    subscriptionChurnRate,
    avgWarrantyClaimTime,
    recallImpact: recalls.length,
    topFailingProducts
  };
}

module.exports = { generateEnterpriseDashboard };
