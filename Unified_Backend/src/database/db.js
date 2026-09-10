require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER || "LILBawal",
  password: process.env.DB_PASSWORD || "LILBawal@2025",
  server: process.env.DB_SERVER || "192.168.12.6",
  database: process.env.DB_NAME || "PPMS_LILBawal",
  connectionTimeout: 3000,
  requestTimeout: 4000,
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;
let connectingPromise = null;
let lastFailureTime = 0;
const RECONNECT_COOLDOWN_MS = 10000; // 10s cooldown between failed connection attempts

const poolPromise = sql
  .connect(config)
  .then((p) => {
    pool = p;
    console.log(`[DB] Successfully connected to SQL Server at ${config.server}/${config.database}`);
    return pool;
  })
  .catch((err) => {
    lastFailureTime = Date.now();
    console.error("[DB] Initial Connection Failed:", err.message);
    // Don't crash; allow app to serve fallback caches
    return null;
  });

async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  // If a connection attempt failed recently, fail fast to allow cached fallback without delay
  if (Date.now() - lastFailureTime < RECONNECT_COOLDOWN_MS) {
    throw new Error(`Database at ${config.server} is unreachable (reconnect cooldown active)`);
  }

  // Deduplicate concurrent connection attempts
  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = sql
    .connect(config)
    .then((p) => {
      pool = p;
      connectingPromise = null;
      console.log(`[DB] Successfully connected to SQL Server at ${config.server}/${config.database}`);
      return pool;
    })
    .catch((err) => {
      connectingPromise = null;
      lastFailureTime = Date.now();
      console.error("[DB] Reconnection error:", err.message);
      throw err;
    });

  return connectingPromise;
}

module.exports = { sql, poolPromise, getPool };
