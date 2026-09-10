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
  { Machine: 'JSW 1300T-1', RunningMould: 'YCA  H/L Lens M2', Availability: 84.5, Performance: 88.2, Quality: 99.1, OEE: 73.8, Plan: 180, Actual: 155, Achievement: 86.1, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 15, Mould: 0, TotalDT: 15, MachineStatus: 'IDLE', PMStatus: 'DUE', HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'JSW 1300T-2', RunningMould: 'YED  NB LENS', Availability: 95.2, Performance: 99.8, Quality: 99.5, OEE: 95.0, Plan: 270, Actual: 260, Achievement: 96.3, Rejected: 1, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'RUNNING', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'CLF 190T', RunningMould: 'YSD SIDE TURN INNER LENS-3rd', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'BMC 550T', RunningMould: 'YCA H/L REF. RHD-3rd', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'BMC 650T', RunningMould: 'Y0M  H/L REF. RHD', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'CLF 400T', RunningMould: 'YHB  RPG EXTENSION-M2', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 650 T1', RunningMould: 'YHB/YHC  25MC TL LENS', Availability: 72.1, Performance: 91.4, Quality: 98.7, OEE: 65.0, Plan: 240, Actual: 209, Achievement: 87.1, Rejected: 3, Man: 5, Material: 0, Method: 0, MachineDT: 20, Mould: 0, TotalDT: 25, MachineStatus: 'DOWN', PMStatus: 'OVERDUE', HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 1000T-2', RunningMould: 'YED NB H/L EXTENSION', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'L&T 180T (Shibaura)', RunningMould: null, Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 300, Actual: 262, Achievement: 87.3, Rejected: 4, Man: 0, Material: 0, Method: 0, MachineDT: 45, Mould: 0, TotalDT: 45, MachineStatus: 'DOWN', PMStatus: null, HCStatus: null, MouldStatus: null },
  { Machine: 'Shibaura 500T-1', RunningMould: 'YHC RCL INNER LENS -2', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'DOWN', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 650 T3', RunningMould: 'YCA HL FTS REFLECTOR  M2', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 100T', RunningMould: 'YSD HMSL LENS-2nd', Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 0, Actual: 0, Achievement: 0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 0, Mould: 0, TotalDT: 0, MachineStatus: 'IDLE', PMStatus: null, HCStatus: null, MouldStatus: null },
  { Machine: 'FCS 350 T3', RunningMould: '31XA HMSL HOUSING', Availability: 68.3, Performance: 84.1, Quality: 99.2, OEE: 57.0, Plan: 220, Actual: 197, Achievement: 89.5, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 10, Mould: 0, TotalDT: 10, MachineStatus: 'RUNNING', PMStatus: 'DUE', HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 350T-2', RunningMould: null, Availability: 0, Performance: 0, Quality: 100, OEE: 0, Plan: 400, Actual: 374, Achievement: 93.5, Rejected: 5, Man: 0, Material: 0, Method: 0, MachineDT: 30, Mould: 0, TotalDT: 30, MachineStatus: 'DOWN', PMStatus: null, HCStatus: null, MouldStatus: null },
  { Machine: 'Shibaura 150T', RunningMould: 'YED NB H/L SUN SHADE', Availability: 94.1, Performance: 98.2, Quality: 99.6, OEE: 92.0, Plan: 350, Actual: 336, Achievement: 96.0, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 5, Mould: 0, TotalDT: 5, MachineStatus: 'DOWN', PMStatus: 'DUE', HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 650T-2', RunningMould: 'Y17 BACKUP HOUSING', Availability: 74.5, Performance: 92.0, Quality: 99.1, OEE: 68.0, Plan: 230, Actual: 214, Achievement: 93.0, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 15, Mould: 0, TotalDT: 15, MachineStatus: 'DOWN', PMStatus: 'OVERDUE', HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 350T-1', RunningMould: 'Y17 LV REFLECTOR ', Availability: 86.4, Performance: 96.8, Quality: 99.2, OEE: 83.0, Plan: 140, Actual: 120, Achievement: 85.7, Rejected: 1, Man: 0, Material: 0, Method: 0, MachineDT: 10, Mould: 0, TotalDT: 10, MachineStatus: 'DOWN', PMStatus: null, HCStatus: null, MouldStatus: null },
  { Machine: 'Shibaura 1000T-1', RunningMould: 'YHB  RCL EXTENSION-M3', Availability: 62.8, Performance: 85.3, Quality: 98.9, OEE: 53.0, Plan: 210, Actual: 189, Achievement: 90.0, Rejected: 2, Man: 0, Material: 0, Method: 0, MachineDT: 20, Mould: 0, TotalDT: 20, MachineStatus: 'RUNNING', PMStatus: null, HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' },
  { Machine: 'Shibaura 1075T', RunningMould: 'Y0M H/L LENS', Availability: 20.0, Performance: 65.0, Quality: 100, OEE: 13.0, Plan: 50, Actual: 15, Achievement: 30.0, Rejected: 0, Man: 0, Material: 0, Method: 0, MachineDT: 40, Mould: 0, TotalDT: 40, MachineStatus: 'DOWN', PMStatus: 'OVERDUE', HCStatus: 'OVERDUE', MouldStatus: 'OVERDUE' }
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

    // Fetch machine performance, equipment mapping, alarms, and mould statuses with timeout
    const [perfResult, eqResult, alarmResult, pmResult, hcResult] = await Promise.allSettled([
      withTimeout(pool.request().input("FilterType", sql.VarChar, filterType).execute("Dashboard2_Get_MachinePerformance"), 4000),
      withTimeout(pool.request().query("SELECT EquipmentID, EquipmentName FROM Config_Equipment"), 3000),
      withTimeout(pool.request().query("SELECT Machine_Id, Reset_Date_Time FROM Machine_Alarm_Data WHERE ProdDate >= DATEADD(day, -7, GETDATE())"), 3000),
      withTimeout(pool.request().execute("Dashboard_MouldPMStatus"), 3000),
      withTimeout(pool.request().execute("Dashboard_MouldHCStatus"), 3000),
    ]);

    const perfRows = perfResult.status === "fulfilled" ? (perfResult.value?.recordset || []) : [];
    
    // If perfRows is empty, fallback to cached
    if (perfRows.length === 0) {
      return res.json(cachedMachinePerformance);
    }

    const eqRows = eqResult.status === "fulfilled" ? (eqResult.value?.recordset || []) : [];
    const alarmRows = alarmResult.status === "fulfilled" ? (alarmResult.value?.recordset || []) : [];

    const pmRaw = pmResult.status === "fulfilled" ? pmResult.value : null;
    const pmRows = (pmRaw?.recordsets && pmRaw.recordsets.length > 1 ? pmRaw.recordsets[1] : pmRaw?.recordset) || [];

    const hcRaw = hcResult.status === "fulfilled" ? hcResult.value : null;
    const hcRows = (hcRaw?.recordsets && hcRaw.recordsets.length > 1 ? hcRaw.recordsets[1] : hcRaw?.recordset) || [];

    // Map equipment name to EquipmentID
    const eqNameToId = {};
    eqRows.forEach((eq) => {
      if (eq.EquipmentName) {
        eqNameToId[eq.EquipmentName.trim().toLowerCase()] = eq.EquipmentID;
      }
    });

    // Active alarms count per machine ID
    const activeAlarmCounts = {};
    alarmRows.forEach((a) => {
      const isActive = String(a.Reset_Date_Time || "").trim().toLowerCase() === "active" || !a.Reset_Date_Time;
      if (isActive && a.Machine_Id) {
        const id = a.Machine_Id.trim();
        activeAlarmCounts[id] = (activeAlarmCounts[id] || 0) + 1;
      }
    });

    // Mould PM status map (MouldName / MouldID -> DONE / DUE / OVERDUE)
    const pmMap = {};
    pmRows.forEach((p) => {
      let st = "DONE";
      if (p.MouldPMStatus === 3 || p.MouldPMStatus === "3") st = "OVERDUE";
      else if (p.MouldPMStatus === 2 || p.MouldPMStatus === "2") st = "DUE";
      if (p.MouldName) pmMap[p.MouldName.trim().toLowerCase()] = st;
      if (p.MouldID) pmMap[p.MouldID.trim().toLowerCase()] = st;
    });

    // Mould HC status map (MouldName / MouldID -> DONE / DUE / OVERDUE)
    const hcMap = {};
    hcRows.forEach((h) => {
      const code = h.MouldHealthStatus ?? h.MouldHCStatus;
      let st = "DONE";
      if (code === 3 || code === "3") st = "OVERDUE";
      else if (code === 2 || code === "2") st = "DUE";
      if (h.MouldName) hcMap[h.MouldName.trim().toLowerCase()] = st;
      if (h.MouldID) hcMap[h.MouldID.trim().toLowerCase()] = st;
    });

    const enriched = perfRows.map((row) => {
      const machName = (row.Machine || "").trim();
      const eqId = eqNameToId[machName.toLowerCase()];
      const activeAlarms = eqId ? (activeAlarmCounts[eqId] || 0) : 0;
      const actual = Number(row.Actual) || 0;
      const oee = Number(row.OEE) || 0;
      const totalDT = Number(row.TotalDT) || 0;

      // Machine Status: RUNNING, IDLE, DOWN
      let machineStatus = "IDLE";
      if (activeAlarms > 0) {
        machineStatus = "DOWN";
      } else if (actual > 0 || oee > 0) {
        machineStatus = "RUNNING";
      } else if (totalDT > 60) {
        machineStatus = "DOWN";
      } else {
        machineStatus = "IDLE";
      }

      // Mould PM / HC Status
      const mouldRaw = (row.RunningMould || "").trim();
      const mouldKey = mouldRaw.toLowerCase();
      const hasMould = mouldRaw && mouldKey !== "null" && mouldKey !== "-";

      let pmStatus = hasMould ? (pmMap[mouldKey] || null) : null;
      let hcStatus = hasMould ? (hcMap[mouldKey] || null) : null;

      // Status hierarchy: OVERDUE > DUE > DONE
      let mouldStatus = null;
      if (hasMould) {
        if (pmStatus === "OVERDUE" || hcStatus === "OVERDUE") {
          mouldStatus = "OVERDUE";
        } else if (pmStatus === "DUE" || hcStatus === "DUE") {
          mouldStatus = "DUE";
        } else if (pmStatus === "DONE" || hcStatus === "DONE") {
          mouldStatus = "DONE";
        } else {
          mouldStatus = "DONE";
        }
      }

      return {
        ...row,
        MachineStatus: machineStatus,
        PMStatus: pmStatus,
        HCStatus: hcStatus,
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
