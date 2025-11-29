// src/middlewares/tenantMiddleware.js
// attach tenant models to req. Use orgCode from req.user or query param
const { getTenantConnection } = require("../config/db");
const { buildTenantModels } = require("../models/tenantFactory/tenantFactory");

module.exports = function (options = {}) {
  return async function (req, res, next) {
    try {
      const orgCode =
        req.user?.orgCode || req.headers["x-org-code"] || req.query.orgCode;
      if (!orgCode)
        return res.status(400).json({ ok: false, error: "orgCode missing" });
      const conn = getTenantConnection(orgCode);
      // cache models on conn
      if (!conn.__modelsBuilt) {
        conn.__models = buildTenantModels(conn);
        conn.__modelsBuilt = true;
      }
      req.tenant = conn.__models;
      req.tenantConnection = conn;
      return next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: "Tenant error" });
    }
  };
};
