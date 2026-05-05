async function calculateSavings(subscriptions, warranties, skills) {
  const subscriptionSavings = subscriptions
    .filter((subscription) => Boolean(subscription.unused))
    .reduce((acc, subscription) => acc + Number(subscription.cost || 0), 0);

  const warrantySavings = warranties
    .filter((warranty) => Boolean(warranty.recallCaught) || Boolean(warranty.claimed))
    .reduce((acc, warranty) => acc + Number(warranty.estimatedValue || 0), 0);

  const skillSavings = skills
    .filter((skill) => Boolean(skill.exchanged))
    .reduce((acc, skill) => acc + Number(skill.marketValue || 0), 0);

  return {
    subscriptionSavings,
    warrantySavings,
    skillSavings,
    total: subscriptionSavings + warrantySavings + skillSavings
  };
}

module.exports = calculateSavings;
