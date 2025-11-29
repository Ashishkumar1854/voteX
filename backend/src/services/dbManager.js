// src/services/dbManager.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

const TENANT_PREFIX = process.env.TENANT_DB_PREFIX || "votex_org_";
const MONGO_BASE = process.env.MONGO_URI;
if (!MONGO_BASE)
  throw new Error("MONGO_URI required in .env for tenant creation.");

const tenantConnections = new Map(); // orgCode => mongoose.Connection

/**
 * Build the tenant DB name from orgCode
 */
function getTenantDbName(orgCode) {
  return `${TENANT_PREFIX}${orgCode.toLowerCase()}`;
}

/**
 * Create or return an existing tenant connection.
 * Returns the mongoose.Connection instance.
 */
export async function getTenantConnection(orgCode) {
  if (!orgCode) throw new Error("orgCode required to get tenant connection.");
  const key = orgCode.toLowerCase();
  if (tenantConnections.has(key)) return tenantConnections.get(key);

  const dbName = getTenantDbName(orgCode);
  const uri = MONGO_BASE; // same connection string; dbName provided in options

  // create a new connection (separate from mongoose default)
  const conn = await mongoose.createConnection(process.env.MONGO_URI, {
    dbName: `${TENANT_PREFIX}${orgCode.toLowerCase()}`,
  });

  // Optional: create necessary indexes/collections here by requiring tenant models
  // e.g., const Candidate = conn.model("Candidate", candidateSchema);

  tenantConnections.set(key, conn);
  logger.info(`Created tenant DB connection for [${orgCode}] -> ${dbName}`);
  return conn;
}

/**
 * Close and remove tenant connection (useful for deleting orgs)
 */
export async function closeTenantConnection(orgCode) {
  const key = orgCode.toLowerCase();
  const conn = tenantConnections.get(key);
  if (!conn) return;
  await conn.close();
  tenantConnections.delete(key);
  logger.info(`Closed tenant connection for ${orgCode}`);
}
