const express = require("express");
const { db } = require("../firebaseConfig");
const requireAuth = require("../middlewareAuth");
const { createTenant, assignRole, checkAccess } = require("../services/tenantService");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("tenants").get();
    const tenants = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(tenants);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, adminUser } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required." });
    }

    const adminUserId = adminUser || req.user.uid;
    const tenant = createTenant(name, adminUserId);
    const docRef = await db.collection("tenants").add(tenant);
    return res.status(201).json({ id: docRef.id, ...tenant });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/:tenantId/assign", requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required." });
    }

    const tenantRef = db.collection("tenants").doc(tenantId);
    const tenantSnap = await tenantRef.get();
    if (!tenantSnap.exists) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    const updatedTenant = assignRole(tenantSnap.data(), userId, role);
    await tenantRef.update({ roles: updatedTenant.roles });
    return res.json({ message: `Role ${role} assigned to ${userId}`, roles: updatedTenant.roles });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/:tenantId/access", requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { userId, role } = req.query;
    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role query params are required." });
    }

    const tenantSnap = await db.collection("tenants").doc(tenantId).get();
    if (!tenantSnap.exists) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    const allowed = checkAccess(tenantSnap.data(), userId, role);
    return res.json({ allowed });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
