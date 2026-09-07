require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER || "LILBawal",
  password: process.env.DB_PASSWORD || "LILBawal@2025",
  server: process.env.DB_SERVER || "192.168.12.6",
  database: process.env.DB_NAME || "PPMS_LILBawal",
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

const poolPromise = sql
  .connect(config)
  .then((p) => {
    pool = p;
    console.log(`[DB] Successfully connected to SQL Server at ${config.server}/${config.database}`);
    return pool;
  })
  .catch((err) => {
    console.error("[DB] Initial Connection Failed:", err.message);
    // Don't crash immediately; allow app to start and retry on query
    return null;
  });

async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }
  try {
    pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error("[DB] Reconnection error:", err.message);
    throw err;
  }
}

module.exports = { sql, poolPromise, getPool };
