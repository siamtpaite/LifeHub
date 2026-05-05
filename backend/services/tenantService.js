function createTenant(name, adminUser) {
  return {
    tenantKey: `tenant_${Date.now()}`,
    name,
    adminUser,
    createdAt: new Date().toISOString(),
    roles: {
      admin: [adminUser],
      manager: [],
      viewer: []
    }
  };
}

function assignRole(tenant, userId, role) {
  if (!tenant.roles[role]) {
    tenant.roles[role] = [];
  }

  if (!tenant.roles[role].includes(userId)) {
    tenant.roles[role].push(userId);
  }
  return tenant;
}

function checkAccess(tenant, userId, role) {
  if (!tenant || !tenant.roles || !tenant.roles[role]) {
    return false;
  }
  return tenant.roles[role].includes(userId);
}

module.exports = { createTenant, assignRole, checkAccess };
