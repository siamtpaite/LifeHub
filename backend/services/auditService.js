function logEvent(userId, action, details) {
  return {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
}

function filterLogs(logs, criteria) {
  return logs.filter(
    (log) =>
      (!criteria.userId || log.userId === criteria.userId) &&
      (!criteria.action || log.action === criteria.action) &&
      (!criteria.tenantId || log.tenantId === criteria.tenantId)
  );
}

module.exports = { logEvent, filterLogs };
