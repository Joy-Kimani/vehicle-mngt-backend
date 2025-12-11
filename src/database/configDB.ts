import sql from "mssql";
import dotenv from "dotenv";
import assert from "assert";

dotenv.config();

// Get Environment Variables
const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_DATABASE, NODE_ENV } = process.env;

assert(DB_USER, "DB_USER is not defined in env");
assert(DB_PASSWORD, "DB_PASSWORD is not defined in env");
assert(DB_SERVER, "DB_SERVER is not defined in env");
assert(DB_PORT, "DB_PORT is not defined in env");
assert(DB_DATABASE, "DB_DATABASE is not defined in env");

// Base config for both Local & Azure
const baseConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_SERVER,
  port: parseInt(DB_PORT || "1433"),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Local Development (trust certificate)
const localConfig: sql.config = {
  ...baseConfig,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Azure SQL (requires encrypt: true)
const azureConfig: sql.config = {
  ...baseConfig,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

// Automatically choose config
export const Config = NODE_ENV === "production" ? azureConfig : localConfig;

// GLOBAL DB POOL
let globalPool: sql.ConnectionPool | null = null;

export const initDatabaseConnection = async () => {
  if (globalPool && globalPool.connected) {
    console.log("Using existing DB connection");
    return globalPool;
  }

  try {
    globalPool = await sql.connect(Config);
    console.log("✅ Connected to MSSQL Database");
    return globalPool;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }
};

export const getDbPool = () => {
  if (!globalPool || !globalPool.connected) {
    throw new Error("Database not connected. Call initDatabaseConnection() first.");
  }
  return globalPool;
};

export default initDatabaseConnection;
