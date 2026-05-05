async function fetchSubscriptions(userId) {
  return [
    { userId, name: "Netflix", cost: 9.99, renewalDate: "2026-06-01", source: "stub" },
    { userId, name: "Spotify", cost: 4.99, renewalDate: "2026-05-20", source: "stub" }
  ];
}

module.exports = fetchSubscriptions;
