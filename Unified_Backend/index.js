require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { poolPromise, sql } = require("./src/database/db");
const middlewares = require("./src/middlewares/middlewares");

const authRoutes = require("./src/routes/auth");
const plantRoutes = require("./src/routes/plant");
const performanceRoutes = require("./src/routes/performance");
const mouldRoutes = require("./src/routes/mould");

const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cache-Control", "Pragma", "Expires", "*"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// -- 1. Clean Modern Namespaces ----------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/plant", plantRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/mould", mouldRoutes);

// -- 2. Legacy Universal Compatibility Layer ---------------------------------
// Auth
app.use("/api/login", authRoutes);

// Performance / Lumax legacy prefixes
app.use("/api/PerfMachine", performanceRoutes);
app.use("/api/DowntimeHome", performanceRoutes);
app.use("/api/DowntimeMachine", performanceRoutes);
app.use("/api/MachineParameter", performanceRoutes);
app.use("/api/MachineAlarm", performanceRoutes);

// Mould Maintenance legacy prefixes
app.use("/api/PMStatus", mouldRoutes);
app.use("/api/HCStatus", mouldRoutes);
app.use("/api/MouldMaintenanceHistoryPM", mouldRoutes);
app.use("/api/MouldMaintenanceHistoryhc", mouldRoutes);
app.use("/api/MouldMaintenanceHistoryHC", mouldRoutes);
app.use("/api/MouldMaintenanceHistoryBreakdownCalDetails", mouldRoutes);
app.use("/api/MouldMaintenanceHistorySparePart", mouldRoutes);
app.use("/api/MouldMaintenanceHistoryPM/PMCheckpointDetails", mouldRoutes);
app.use("/api/MouldMaintenanceHistoryHC/HCCheckpointDetails", mouldRoutes);
app.use("/api/MouldMaintenanceHistoryhc/HCCheckpointDetails", mouldRoutes);

// Shared / Colliding Prefixes resolved transparently:
// /api/PerformanceHome (used by both Lumax and PlantHead)
app.use("/api/PerformanceHome", plantRoutes);
app.use("/api/PerformanceHome", performanceRoutes);

// /api/MouldSummary (used by both Mould Maintenance and PlantHead)
app.use("/api/MouldSummary", plantRoutes);
app.use("/api/MouldSummary", mouldRoutes);

// /api/Home (used by both Mould Maintenance and Lumax)
app.use("/api/Home", mouldRoutes);
app.use("/api/Home", performanceRoutes);

// -- Health Check & System Info ----------------------------------------------
app.get("/api/status", async (req, res) => {
  let dbStatus = "Disconnected";
  try {
    const pool = await poolPromise;
    if (pool && pool.connected) {
      dbStatus = "Connected";
    }
  } catch (e) {
    dbStatus = "Error: " + e.message;
  }

  res.json({
    status: 200,
    app: "Unified Manufacturing Intelligence Backend (Mould 3.0)",
    version: "1.0.0",
    serverTime: new Date().toISOString(),
    database: {
      server: process.env.DB_SERVER || "192.168.12.6",
      name: process.env.DB_NAME || "PPMS_LILBawal",
      status: dbStatus,
    },
    modules: ["Plant Head Executive", "Machine Performance & Telemetry", "Mould Maintenance & Health"],
  });
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`🚀 Unified Manufacturing Backend running on PORT: ${PORT}`);
  console.log(`   - Health Check: http://localhost:${PORT}/api/status`);
  console.log(`   - Plant APIs:   http://localhost:${PORT}/api/plant`);
  console.log(`   - Perf APIs:    http://localhost:${PORT}/api/performance`);
  console.log(`   - Mould APIs:   http://localhost:${PORT}/api/mould`);
  console.log(`=======================================================`);
});
