function predictResale(productName, purchaseDate) {
  const now = new Date();
  const purchase = new Date(purchaseDate);
  const monthsOwned = (now - purchase) / (1000 * 60 * 60 * 24 * 30);

  let resaleValue = 1000;
  if (monthsOwned > 12) resaleValue *= 0.7;
  if (monthsOwned > 24) resaleValue *= 0.5;

  return {
    product: productName,
    monthsOwned,
    predictedResaleValue: resaleValue,
    recommendation: monthsOwned > 18 ? "Consider reselling soon" : "Keep for now"
  };
}

module.exports = { predictResale };
