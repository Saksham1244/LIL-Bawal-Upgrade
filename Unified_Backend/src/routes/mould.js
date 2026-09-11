const express = require("express");
const router = express.Router();
const { getPool, sql } = require("../database/db");

// Fallback mould list for resilience when offline
let cachedMoulds = [
  { MouldID: 1, MouldName: "YCA H/L Lens M2" },
  { MouldID: 2, MouldName: "YED NB LENS" },
  { MouldID: 3, MouldName: "YSD SIDE TURN INNER LENS-3rd" },
  { MouldID: 4, MouldName: "YCA H/L REF. RHD-3rd" },
  { MouldID: 5, MouldName: "Y0M H/L REF. RHD" },
  { MouldID: 6, MouldName: "YHB RPG EXTENSION-M2" },
  { MouldID: 7, MouldName: "YHB/YHC 25MC TL LENS" },
  { MouldID: 8, MouldName: "YED NB H/L EXTENSION" },
  { MouldID: 9, MouldName: "YHC RCL INNER LENS -2" },
  { MouldID: 10, MouldName: "YCA HL FTS REFLECTOR M2" },
  { MouldID: 11, MouldName: "YSD HMSL LENS-2nd" },
  { MouldID: 12, MouldName: "31XA HMSL HOUSING" },
  { MouldID: 13, MouldName: "YED NB H/L SUN SHADE" },
  { MouldID: 14, MouldName: "Y17 BACKUP HOUSING" },
  { MouldID: 15, MouldName: "Y17 LV REFLECTOR" },
  { MouldID: 16, MouldName: "YHB RCL EXTENSION-M3" },
  { MouldID: 17, MouldName: "Y0M H/L LENS" }
];

// -- Mould Directory & Specifications ----------------------------------------
router.get("/MouldName", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT MouldID, MouldName FROM Config_Mould ORDER BY MouldID ASC");
    if (result.recordset && result.recordset.length > 0) {
      cachedMoulds = result.recordset;
    }
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.warn("DB Notice: GET /MouldName using fallback cache:", error.message);
    res.json({ success: true, data: cachedMoulds });
  }
});

router.get("/MouldIDDesc", async (req, res) => {
  try {
    const { mouldName } = req.query;
    if (!mouldName) return res.status(400).json({ success: false, message: "mouldName required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("mouldName", sql.VarChar, mouldName)
      .query("SELECT MouldID, MouldName, MouldDesc FROM Config_Mould WHERE MouldName = @mouldName");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -- Mould 360 Dossier & Profile --------------------------------------------
router.get("/mouldPMHCOverview", async (req, res) => {
  try {
    const { mouldId } = req.query;
    if (!mouldId) return res.status(400).json({ success: false, message: "mouldId required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldID", sql.NVarChar(100), mouldId)
      .execute("Dashboard_Mould_PM_HC_Overview");

    res.json({ success: true, data: result.recordset ? result.recordset[0] : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/Dashboard_PM_OnTimeVsDelayed", async (req, res) => {
  try {
    const { mouldId } = req.query;
    if (!mouldId) return res.status(400).json({ success: false, message: "mouldId required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldID", sql.NVarChar(50), mouldId)
      .execute("Dashboard_PM_OnTimeVsDelayed");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/Dashboard_HC_OnTimeVsDelayed", async (req, res) => {
  try {
    const { mouldId } = req.query;
    if (!mouldId) return res.status(400).json({ success: false, message: "mouldId required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldID", sql.NVarChar(50), mouldId)
      .execute("Dashboard_HC_OnTimeVsDelayed");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/DashboardGetTop5BreakDownsByDuration", async (req, res) => {
  try {
    const { mouldId } = req.query;
    if (!mouldId) return res.status(400).json({ success: false, message: "mouldId required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldID", sql.NVarChar(100), mouldId)
      .execute("Dashboard_GetTop5BreakDowns_ByDuration");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/DashboardGetTop5BreakDownsByOccurrences", async (req, res) => {
  try {
    const { mouldId } = req.query;
    if (!mouldId) return res.status(400).json({ success: false, message: "mouldId required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldID", sql.NVarChar(100), mouldId)
      .execute("Dashboard_GetTop5BreakDowns_ByOccurrences");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/Dashboard_GetTop10SpareParts_ByMould", async (req, res) => {
  try {
    const { mouldId } = req.query;
    if (!mouldId) return res.status(400).json({ success: false, message: "mouldId required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldID", sql.NVarChar(100), mouldId)
      .execute("Dashboard_GetTop10SpareParts_ByMould");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/Dashboard_GET_MachineWiseShotCount_ByMould", async (req, res) => {
  try {
    const { mouldName } = req.query;
    if (!mouldName) return res.status(400).json({ success: false, message: "mouldName required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldName", sql.NVarChar(200), mouldName)
      .execute("Dashboard_GET_MachineWiseShotCount_ByMould");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/Dashboard_GET_Machines_ByMouldName", async (req, res) => {
  try {
    const { mouldName } = req.query;
    if (!mouldName) return res.status(400).json({ success: false, message: "mouldName required" });

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldName", sql.NVarChar(200), mouldName)
      .execute("Dashboard_GET_Machines_ByMouldName");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/Dashboard_GET_MachineMouldProductionDetails", async (req, res) => {
  try {
    const { mouldID, equipmentName } = req.query;
    if (!mouldID || !equipmentName) {
      return res.status(400).json({ success: false, message: "mouldID and equipmentName required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldID", sql.NVarChar(100), mouldID)
      .input("EquipmentName", sql.NVarChar(200), equipmentName)
      .execute("Dashboard_GET_MachineMouldProductionDetails_1");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -- PM Status & Planning ---------------------------------------------------
router.get(["/pm-status/overview", "/MouldPMStatus"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldPMStatus");
    const pmData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: pmData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/pm-status/weekly-plan", "/MouldPMWeekWisePlan"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_PMPlan_WeekWise");
    const pmData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: pmData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/pm-status/next-6-months", "/DashboardNext6MonthPMPlan"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_Next6MonthPMPlan");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/pm-status/due-by-date", "/MouldWiseNextPMDuedate"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldPMNextDuedate");
    const pmData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: pmData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/pm-status/due-by-shot", "/MouldWiseNextPMDueByShot"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldPMNextDueShotcount");
    const pmData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: pmData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/MouldWisePMPlan", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldPMPlans");
    const pmData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: pmData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -- HC Status & Planning ---------------------------------------------------
router.get(["/hc-status/overview", "/MouldHCStatus"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldHCStatus");
    const hcData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: hcData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/hc-status/weekly-plan", "/MouldHCWeekWisePlan"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_HCPlan_WeekWise");
    const hcData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: hcData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/hc-status/next-6-months", "/DashboardNext6MonthHCPlan"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_Next6MonthHCPlan");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/hc-status/due-by-date", "/MouldWiseNextHCDuedate"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldHCNextDuedate");
    const hcData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: hcData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/hc-status/due-by-shot", "/MouldWiseNextHCDDueByShot", "/MouldWiseNextHCDueByShot"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldHCNextDueShotcount");
    const hcData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: hcData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/MouldWiseHCPlan", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().execute("Dashboard_MouldHCPlans");
    const hcData = result.recordsets && result.recordsets.length > 1 ? result.recordsets[1] : result.recordset;
    res.json({ success: true, data: hcData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -- Mould Home KPI & Planned vs Actual --------------------------------------
router.get(["/mouldPMPlannedVsActual", "/PmPlannedVsActualCustom"], async (req, res) => {
  try {
    const { filterType, startDate, endDate } = req.query;
    const pool = await getPool();

    if (startDate || endDate || parseInt(filterType) === 5) {
      const request = pool.request();
      request.input("StartDate", sql.Date, startDate || null);
      request.input("EndDate", sql.Date, endDate || null);
      const result = await request.execute("Dashboard_MouldPM_PlannedVsActualCustomeDate");
      return res.json({ success: true, data: result.recordset });
    }

    const request = pool.request().input("FilterType", sql.Int, parseInt(filterType || 1));
    request.input("StartDate", sql.Date, null);
    request.input("EndDate", sql.Date, null);
    const result = await request.execute("Dashboard_MouldPM_PlannedVsActual");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/PmTimeDetails", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("DASHBOARD_PM_DurationStats");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/PmDelayOnTime", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("DASHBOARD_PM_OnTimeDelayedCount");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/mouldHCPlannedVsActual", "/hcPlannedVsActualCustom"], async (req, res) => {
  try {
    const { filterType, startDate, endDate } = req.query;
    const pool = await getPool();

    if (startDate || endDate || parseInt(filterType) === 5) {
      const request = pool.request();
      request.input("StartDate", sql.Date, startDate || null);
      request.input("EndDate", sql.Date, endDate || null);
      const result = await request.execute("Dashboard_MouldHC_PlannedVsActualCustomeDate");
      return res.json({ success: true, data: result.recordset });
    }

    const request = pool.request().input("FilterType", sql.Int, parseInt(filterType || 1));
    request.input("StartDate", sql.Date, null);
    request.input("EndDate", sql.Date, null);
    const result = await request.execute("Dashboard_MouldHC_PlannedVsActual");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/hcTimeDetails", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("DASHBOARD_HC_DurationStats");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/hcDelayOnTime", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("DASHBOARD_HC_OnTimeDelayedCount");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/mouldPMStatusMonitoring", async (req, res) => {
  try {
    const { caseType, startDate, endDate } = req.query;
    const pool = await getPool();
    const request = pool.request().input("CaseType", sql.Int, parseInt(caseType || 1));

    if (parseInt(caseType) === 5) {
      request.input("StartDate", sql.Date, startDate || null);
      request.input("EndDate", sql.Date, endDate || null);
    } else {
      request.input("StartDate", sql.Date, null);
      request.input("EndDate", sql.Date, null);
    }

    const result = await request.execute("DASHBOARD_MouldPMStatusMonitoring");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/mouldHCStatusMonitoring", async (req, res) => {
  try {
    const { caseType, startDate, endDate } = req.query;
    const pool = await getPool();
    const request = pool.request().input("CaseType", sql.Int, parseInt(caseType || 1));

    if (parseInt(caseType) === 5) {
      request.input("StartDate", sql.Date, startDate || null);
      request.input("EndDate", sql.Date, endDate || null);
    } else {
      request.input("StartDate", sql.Date, null);
      request.input("EndDate", sql.Date, null);
    }

    const result = await request.execute("DASHBOARD_MouldHCStatusMonitoring");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -- Work Order Checklists & Photo Inspection --------------------------------
// PM Work Orders
router.get(["/history/pm/table", "/PmHistoryDetailTable"], async (req, res) => {
  try {
    const { startDate, endDate, mouldID } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .input("MouldID", sql.NVarChar(100), mouldID || null)
      .execute("DASHBOARD_PM_CheckListHistory");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/pm/checkpoint-header", "/PmHeaderDetails"], async (req, res) => {
  try {
    const { checkListID, instance, mouldID } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("CheckListID", sql.Int, parseInt(checkListID || 1))
      .input("Instance", sql.Int, parseInt(instance || 1))
      .input("MouldID", sql.NVarChar(100), mouldID || null)
      .execute("PM_Dashboard_HeaderDetails_PMCheckpointReport");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/pm/checkpoint-details", "/PmCheckpointDetails", "/PmCheckpointDetail"], async (req, res) => {
  try {
    const { checkListID, instance } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("CheckListID", sql.Int, parseInt(checkListID || 1))
      .input("Instance", sql.Int, parseInt(instance || 1))
      .execute("Dashboard_PM_CheckPointHistoryReport");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get([
  "/history/pm/checkpoint-images",
  "/PmCheckpointImages",
  "/get-checkpoint-images",
  "/PMCheckpointDetails/get-checkpoint-images",
  "/get"
], async (req, res) => {
  try {
    const { mouldName, instance } = req.query;
    if (!mouldName || !instance) {
      return res.status(400).json({ status: 400, success: false, message: "mouldName and instance required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldName", sql.NVarChar, mouldName)
      .input("Instance", sql.Int, parseInt(instance))
      .query(`
        SELECT mci.UID, mci.Checkpoints, mci.Image, mci.MouldID, cm.MouldName, mci.Instance
        FROM Mould_Checklist_Images mci
        LEFT JOIN Config_Mould cm ON mci.MouldID = cm.MouldID
        WHERE (cm.MouldName = @MouldName OR mci.MouldID = @MouldName)
          AND mci.Instance = @Instance
          AND LOWER(mci.ImageType) = 'pm'
      `);

    const images = result.recordset.map((row) => ({
      uid: row.UID,
      checkpoint: row.Checkpoints,
      image: row.Image ? row.Image.toString("base64") : null,
      mouldID: row.MouldID,
      mouldName: row.MouldName,
      instance: row.Instance,
    }));

    res.json({ status: 200, success: true, data: images });
  } catch (error) {
    console.error("PM Checkpoint Images Error:", error.message);
    res.json({ status: 200, success: true, data: [] });
  }
});

// HC Work Orders
router.get(["/history/hc/table", "/HcHistoryDetailTable", "/hcistoryDetailTable"], async (req, res) => {
  try {
    const { startDate, endDate, mouldID } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .input("MouldID", sql.NVarChar(100), mouldID || null)
      .execute("DASHBOARD_HC_CheckListHistory");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/hc/checkpoint-header", "/HCHeaderDetails", "/HcHeaderDetails"], async (req, res) => {
  try {
    const { checkListID, instance, mouldID } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("CheckListID", sql.Int, parseInt(checkListID || 1))
      .input("Instance", sql.Int, parseInt(instance || 1))
      .input("MouldID", sql.NVarChar(100), mouldID || null)
      .execute("HC_Dashboard_HeaderDetails_HCCheckpointReport");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/hc/checkpoint-details", "/HCCheckpointDetails", "/HcCheckpointDetail"], async (req, res) => {
  try {
    const { checkListID, instance } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("CheckListID", sql.Int, parseInt(checkListID || 1))
      .input("Instance", sql.Int, parseInt(instance || 1))
      .execute("Dashboard_HC_CheckPointHistoryReport");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get([
  "/history/hc/checkpoint-images",
  "/HCCheckpointImages",
  "/get-checkpoint-images",
  "/HCCheckpointDetails/get-checkpoint-images"
], async (req, res) => {
  try {
    const { mouldName, instance } = req.query;
    if (!mouldName || !instance) {
      return res.status(400).json({ status: 400, success: false, message: "mouldName and instance required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("MouldName", sql.NVarChar, mouldName)
      .input("Instance", sql.Int, parseInt(instance))
      .query(`
        SELECT mci.UID, mci.Checkpoints, mci.Image, mci.MouldID, cm.MouldName, mci.Instance
        FROM Mould_Checklist_Images mci
        LEFT JOIN Config_Mould cm ON mci.MouldID = cm.MouldID
        WHERE (cm.MouldName = @MouldName OR mci.MouldID = @MouldName)
          AND mci.Instance = @Instance
          AND LOWER(mci.ImageType) = 'hc'
      `);

    const images = result.recordset.map((row) => ({
      uid: row.UID,
      checkpoint: row.Checkpoints,
      image: row.Image ? row.Image.toString("base64") : null,
      mouldID: row.MouldID,
      mouldName: row.MouldName,
      instance: row.Instance,
    }));

    res.json({ status: 200, success: true, data: images });
  } catch (error) {
    console.error("HC Checkpoint Images Error:", error.message);
    res.json({ status: 200, success: true, data: [] });
  }
});

// -- Breakdown Analytics (MTBF/MTTR/Pareto) ----------------------------------
router.get(["/history/breakdown/duration", "/BreakdownDuration"], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("Dashboard_BreakdownDurationCustomeDate");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/breakdown/count", "/BreakdownCount"], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("Dashboard_BreakdownCountCustomeDate");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/breakdown/stats", "/BreakdownCalculatedDetails"], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("DASHBOARD_BDDurationStats");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/breakdown/top10", "/Top10BreakdownByDuration"], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("Dashboard_Top10_BDReasons_WithDuration");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/history/breakdown/table", "/BreakdownDetailsTable"], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("DASHBOARD_BreakdownDetails");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -- Spare Parts Inventory & Tracking ----------------------------------------
router.get(["/spare-parts/categories", "/SparePartCategoryName"], async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT SparePartCategory, LastUpdatedTime, LastUpdatedBy FROM Config_SparePartCategory ORDER BY SparePartCategory ASC");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/spare-parts/inventory", "/SparePartName"], async (req, res) => {
  try {
    const pool = await getPool();
    const query = `
       SELECT DISTINCT
         SP.SparePartID,
         SP.SparePartName,
         SP.SparePartDescription,
         CAT.SparePartCategory AS SparePartCategoryID,
         M.MouldName,
         SP.SparePartSize,
         M.MouldStorageLoc AS SparePartLoc,
         SP.MinQuantity,
         SP.MaxQuantity,
         SP.ReorderLevel,
         SP.SparePartMake,
         SP.LeadTime,
         SP.ImportExport,
         SP.PackingQuantity,
         SP.PreferredSparePart,
         SP.LastUpdatedTime,
         SP.LastUpdatedBy
       FROM dbo.Config_Mould_SparePart SP
       LEFT JOIN dbo.Config_SparePartCategory CAT ON SP.SparePartID = CAT.SparePartID
       LEFT JOIN dbo.Config_Mould M ON CAT.MouldID = M.MouldID
       ORDER BY SP.SparePartName ASC;
    `;
    const result = await pool.request().query(query);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/spare-parts/consumption-category", "/DashboardSpareConsumptionByCategory"], async (req, res) => {
  try {
    const { startDate, endDate, SparePartCategory } = req.query;
    if (!startDate || !endDate || !SparePartCategory) {
      return res.status(400).json({ success: false, message: "startDate, endDate, and SparePartCategory are required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate)
      .input("EndDate", sql.Date, endDate)
      .input("SparePartCategory", sql.NVarChar(100), SparePartCategory)
      .execute("DASHBOARD_SparePartConsumptionByCategoryCustomedate");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(["/spare-parts/consumption-top50", "/DashboardTop50SpareConsumption"], async (req, res) => {
  try {
    const { startDate, endDate, SparePartCategory } = req.query;
    if (!startDate || !endDate || !SparePartCategory) {
      return res.status(400).json({ success: false, message: "startDate, endDate, and SparePartCategory are required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("StartDate", sql.Date, startDate)
      .input("EndDate", sql.Date, endDate)
      .input("SparePartCategory", sql.NVarChar(100), SparePartCategory)
      .execute("DASHBOARD_Top50SparePartConsumptionCustomDate");

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
