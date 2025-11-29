// src/controllers/superAdminController.js
import Organization from "../models/master/Organization.js";
import User from "../models/master/User.js";
import { getTenantConnection } from "../services/dbManager.js";
import { createTenantModels } from "../models/tenantFactory/tenantFactory.js";
import { hashPassword } from "../services/cryptoService.js";

export async function approveOrg(req, res) {
  try {
    const { orgCode } = req.body;

    if (!orgCode) {
      return res.status(400).json({ error: "orgCode required" });
    }

    const org = await Organization.findOne({ orgCode });
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (org.status === "approved") {
      return res.json({ message: "Organization already approved" });
    }

    const tenantConn = await getTenantConnection(orgCode);
    createTenantModels(tenantConn);

    const tempPassword = "Admin@123";

    const adminUser = await User.create({
      name: org.adminName || `${orgCode} Admin`,
      email: org.adminEmail.toLowerCase(),
      password: await hashPassword(tempPassword),
      role: "ORG_ADMIN",
      orgCode: orgCode.toUpperCase(),
    });

    org.status = "approved";
    org.tenantDbName =
      (process.env.TENANT_DB_PREFIX || "votex_org_") + orgCode.toLowerCase();
    org.approvedAt = new Date();
    await org.save();

    return res.status(200).json({
      message: "Organization approved & tenant DB ready",
      orgCode,
      tenantDb: org.tenantDbName,
      tempAdminCredentials: {
        email: adminUser.email,
        password: tempPassword,
      },
    });
  } catch (err) {
    console.error("approveOrg:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
