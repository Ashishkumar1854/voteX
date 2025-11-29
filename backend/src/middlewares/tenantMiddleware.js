// src/middlewares/tenantMiddleware.js
import { getTenantConnection } from "../services/dbManager.js";
import { createTenantModels } from "../models/tenantFactory/tenantFactory.js";

export async function tenantMiddleware(req, res, next) {
  try {
    const orgCode = req.user?.orgCode;
    if (!orgCode) {
      return res.status(400).json({ error: "Organization context required" });
    }

    const conn = await getTenantConnection(orgCode);
    req.tenantModels = createTenantModels(conn);

    next();
  } catch (err) {
    console.error("tenantMiddleware:", err);
    return res.status(500).json({ error: "Tenant DB Error" });
  }
}
