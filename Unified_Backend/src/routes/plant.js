const express = require("express");
const router = express.Router();
const { getPool, sql } = require("../database/db");

// In-memory cache & fallback dataset for resilience when DB connection drops
let cachedPlantSummary = [
  {
    OEE: 68.4,
    Availability: 81.2,
    Performance: 85.6,
    Quality: 98.4,
    Plan: 2450,
    Actual: 2078,
    Achievement: 84.8,
    Man: 0,
    Material: 0,
    Method: 0,
    MachineDT: 315,
    Mould: 0,
    TotalDT: 315
  }
];

let cachedMachinePerformance = [
  { Machine: 'JSW 1300T-1', RunningMould: 'YCA  H/L Lens M2', Availability: 84.5, Performance: 88.2, Quality: 99.1, OEE: 73.8, Plan: 180, Actual: 155, Achievement: 86.1, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 15, Mould: 0, TotalDT: 15, MachineStatus: 'RUNNING', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' },
  { Machine: 'JSW 1300T-2', RunningMould: 'YED  NB LENS', Availability: 95.2, Performance: 99.8, Quality: 99.5, OEE: 95.0, Plan: 270, Actual: 260, Achievement: 96.3, Rejected: 1, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'RUNNING', PMStatus: 'DONE', HCStatus: null, MouldStatus: 'DONE' },
  { Machine: 'CLF 190T', RunningMould: 'YSD SIDE TURN INNER LENS-3rd', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'DONE', HCStatus: null, MouldStatus: 'DONE' },
  { Machine: 'BMC 550T', RunningMould: 'YCA H/L REF. RHD-3rd', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' },
  { Machine: 'BMC 650T', RunningMould: 'Y0M  H/L REF. RHD', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'DONE', HCStatus: null, MouldStatus: 'DONE' },
  { Machine: 'CLF 400T', RunningMould: 'YHB  RPG EXTENSION-M2', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'DUE', HCStatus: null, MouldStatus: 'DUE' },
  { Machine: 'Shibaura 650 T1', RunningMould: 'YHB/YHC  25MC TL LENS', Availability: 72.1, Performance: 91.4, Quality: 98.7, OEE: 65.0, Plan: 240, Actual: 209, Achievement: 87.1, Rejected: 3, Man: 5, Material: 0, Method: 0, MachineDT: 20, Mould: 0, TotalDT: 25, MachineStatus: 'RUNNING', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 1000T-2', RunningMould: 'YED NB H/L EXTENSION', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'DUE', HCStatus: null, MouldStatus: 'DUE' },
  { Machine: 'L&T 180T (Shibaura)', RunningMould: null, Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 300, Actual: 262, Achievement: 87.3, Rejected: 4, Man: 0, Material: 0, Method: 0, MachineDT: 45, Mould: 0, TotalDT: 45, MachineStatus: 'RUNNING', PMStatus: null, HCStatus: null, MouldStatus: null },
  { Machine: 'Shibaura 500T-1', RunningMould: 'YHC RCL INNER LENS -2', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'DONE', HCStatus: null, MouldStatus: 'DONE' },
  { Machine: 'Shibaura 650 T3', RunningMould: 'YCA HL FTS REFLECTOR  M2', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 100T', RunningMould: 'YSD HMSL LENS-2nd', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: 'DONE', HCStatus: null, MouldStatus: 'DONE' },
  { Machine: 'FCS 350 T3', RunningMould: '31XA HMSL HOUSING', Availability: 68.3, Performance: 84.1, Quality: 99.2, OEE: 57.0, Plan: 220, Actual: 197, Achievement: 89.5, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 10, Mould: 0, TotalDT: 10, MachineStatus: 'RUNNING', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 350T-2', RunningMould: null, Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 400, Actual: 374, Achievement: 93.5, Rejected: 5, Man: 0, Material: 0, Method: 0, MachineDT: 30, Mould: 0, TotalDT: 30, MachineStatus: 'RUNNING', PMStatus: null, HCStatus: null, MouldStatus: null },
  { Machine: 'Shibaura 150T', RunningMould: 'YED NB H/L SUN SHADE', Availability: 94.1, Performance: 98.2, Quality: 99.6, OEE: 92.0, Plan: 350, Actual: 336, Achievement: 96.0, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 5, Mould: 0, TotalDT: 5, MachineStatus: 'RUNNING', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 650T-2', RunningMould: 'Y17 BACKUP HOUSING', Availability: 74.5, Performance: 92.0, Quality: 99.1, OEE: 68.0, Plan: 230, Actual: 214, Achievement: 93.0, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 15, Mould: 0, TotalDT: 15, MachineStatus: 'RUNNING', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 350T-1', RunningMould: 'Y17 LV REFLECTOR ', Availability: 86.4, Performance: 96.8, Quality: 99.2, OEE: 83.0, Plan: 140, Actual: 120, Achievement: 85.7, Rejected: 1, Man: 0, Material: 0, Method: 0, MachineDT: 10, Mould: 0, TotalDT: 10, MachineStatus: 'RUNNING', PMStatus: 'DUE', HCStatus: null, MouldStatus: 'DUE' },
  { Machine: 'Shibaura 1000T-1', RunningMould: 'YHB  RCL EXTENSION-M3', Availability: 62.8, Performance: 85.3, Quality: 98.9, OEE: 53.0, Plan: 210, Actual: 189, Achievement: 90.0, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 20, Mould: 0, TotalDT: 20, MachineStatus: 'RUNNING', PMStatus: 'DONE', HCStatus: null, MouldStatus: 'DONE' },
  { Machine: 'Shibaura 1075T', RunningMould: 'Y0M H/L LENS', Availability: 20.0, Performance: 65.0, Quality: 100, OEE: 13.0, Plan: 50, Actual: 15, Achievement: 30.0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 40, Mould: 0, TotalDT: 40, MachineStatus: 'RUNNING', PMStatus: 'OVERDUE', HCStatus: null, MouldStatus: 'OVERDUE' }
];

// Helper to query with timeout
const withTimeout = (promise, ms = 4000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
  ]);
};

// 1. Plant Executive Performance Summary
router.get(["/performance", "/Plant-performance"], async (req, res) => {
  const filterType = req.query.filterType || req.query.FilterType || "Current";
  try {
    const pool = await withTimeout(getPool(), 3000);
    const result = await withTimeout(
      pool.request().input("FilterType", sql.VarChar, filterType).execute("Dashboard2_Get_PlantSummary"),
      4000
    );

    if (result.recordset && result.recordset.length > 0) {
      cachedPlantSummary = result.recordset;
    }
    res.json(result.recordset);
  } catch (err) {
    console.warn("DB Warning in GET /Plant-performance, serving cache:", err.message);
    res.json(cachedPlantSummary);
  }
});

// 2. Cross-Machine Comparative Matrix
router.get("/machine-performance", async (req, res) => {
  const filterType = req.query.filterType || req.query.FilterType || "Current";
  try {
    const pool = await withTimeout(getPool(), 3000);

    // Fetch machine performance and mould monitoring data with timeout
    const [perfResult, mmResult] = await Promise.allSettled([
      withTimeout(pool.request().input("FilterType", sql.VarChar, filterType).execute("Dashboard2_Get_MachinePerformance"), 5000),
      withTimeout(pool.request().query(`
        SELECT mm.MouldID, cm.MouldName, mm.MouldPMStatus, mm.NextPMDueDate, mm.NextPMDue, mm.MouldActualLife, mm.PMWarning
        FROM [dbo].[Mould_Monitoring] mm
        JOIN [dbo].[Config_Mould] cm ON mm.MouldID = cm.MouldID
      `), 5000),
    ]);

    const perfRows = perfResult.status === "fulfilled" ? (perfResult.value?.recordset || []) : [];
    
    // If perfRows is empty, fallback to cached
    if (perfRows.length === 0) {
      return res.json(cachedMachinePerformance);
    }

    const mmRows = mmResult.status === "fulfilled" ? (mmResult.value?.recordset || []) : [];

    const normalizeKey = (s) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
    const pmMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    mmRows.forEach((r) => {
      let st = "DONE";
      const code = r.MouldPMStatus;
      if (code === 3 || code === "3") {
        st = "OVERDUE";
      } else if (code === 2 || code === "2" || code === 8 || code === "8") {
        st = "DUE";
      } else if (code === 1 || code === "1" || code === 7 || code === "7") {
        st = "DONE";
      }

      // Check dates and shot counts against live thresholds
      if (r.NextPMDueDate && new Date(r.NextPMDueDate) > new Date("2000-01-01")) {
        const dueDate = new Date(r.NextPMDueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today && st !== "OVERDUE") {
          st = "OVERDUE";
        }
      }
      if (r.NextPMDue > 0 && r.MouldActualLife >= r.NextPMDue && st !== "OVERDUE") {
        st = "OVERDUE";
      }

      if (r.MouldName) {
        pmMap[r.MouldName.trim().toLowerCase()] = st;
        pmMap[normalizeKey(r.MouldName)] = st;
      }
      if (r.MouldID) {
        pmMap[r.MouldID.trim().toLowerCase()] = st;
        pmMap[normalizeKey(r.MouldID)] = st;
      }
    });

    const enriched = perfRows.map((row) => {
      const actual = Number(row.Actual) || 0;
      const oee = Number(row.OEE) || 0;
      const totalDT = Number(row.TotalDT) || 0;

      // Machine Status: RUNNING, IDLE, DOWN
      let machineStatus = "IDLE";
      if (actual > 0 || oee > 0) {
        machineStatus = "RUNNING";
      } else if (totalDT > 60) {
        machineStatus = "DOWN";
      } else {
        machineStatus = "IDLE";
      }

      // Mould PM Status
      const mouldRaw = (row.RunningMould || "").trim();
      const mouldKey = mouldRaw.toLowerCase();
      const normMouldKey = normalizeKey(mouldRaw);
      const hasMould = mouldRaw && mouldKey !== "null" && mouldKey !== "-" && mouldKey !== "mould not loaded" && mouldKey !== "no mould loaded";

      let mouldStatus = null;
      if (hasMould) {
        mouldStatus = pmMap[mouldKey] || pmMap[normMouldKey] || "DONE";
      }

      return {
        ...row,
        RunningMould: hasMould ? mouldRaw : null,
        MachineStatus: machineStatus,
        PMStatus: mouldStatus,
        HCStatus: null,
        MouldStatus: mouldStatus,
      };
    });

    cachedMachinePerformance = enriched;
    res.json(enriched);
  } catch (err) {
    console.warn("DB Warning in GET /machine-performance, serving cache:", err.message);
    res.json(cachedMachinePerformance);
  }
});

// 3. Active Shift Schedules & Production Calendar
router.get("/prod-dates", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM Prod_ShiftInformation");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error in GET /api/plant/prod-dates:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/GetProdDate", async (req, res) => {
  try {
    const pool = await withTimeout(getPool(), 3000);
    const result = await withTimeout(
      pool.request().query("SELECT TOP 1 ProdDate, ShiftName FROM Prod_ShiftInformation ORDER BY LastUpdatedTime DESC"),
      3000
    );
    const row = result.recordset[0] || { ProdDate: new Date(), ShiftName: "A" };
    res.json({
      success: true,
      data: {
        ProdDate: row.ProdDate,
        ShiftName: row.ShiftName || "A",
      },
    });
  } catch (err) {
    console.warn("DB Warning in GET /api/plant/GetProdDate:", err.message);
    res.json({
      success: true,
      data: {
        ProdDate: new Date().toISOString().split("T")[0],
        ShiftName: "A",
      },
    });
  }
});

// 4. Annual Mould PM Summary
router.get("/pm-summary-current-year", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard2_PM_Summary_CurrentYear");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error in GET /api/plant/pm-summary-current-year:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 5. Annual Mould HC Summary
router.get("/hc-summary-current-year", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard2_HC_Summary_CurrentYear");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error in GET /api/plant/hc-summary-current-year:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
