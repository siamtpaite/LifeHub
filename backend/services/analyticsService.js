async function generateAnalytics(subscriptions, warranties, skills) {
  const totalSubscriptionCost = subscriptions.reduce(
    (acc, subscription) => acc + Number(subscription.cost || 0),
    0
  );

  const avgSubscriptionCost = subscriptions.length > 0 ? totalSubscriptionCost / subscriptions.length : 0;

  const topSkills = skills
    .map((skill) => skill.skillName || skill.skill)
    .filter(Boolean)
    .slice(0, 5);

  return {
    activeUsers: subscriptions.length + warranties.length + skills.length,
    avgSubscriptionCost,
    topSkills,
    warrantyClaims: warranties.filter((warranty) => Boolean(warranty.claimed)).length,
    recallAlerts: warranties.filter((warranty) => Boolean(warranty.recallCaught)).length
  };
}

module.exports = generateAnalytics;
