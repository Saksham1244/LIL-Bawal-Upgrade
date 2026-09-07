const express = require("express");
const router = express.Router();
const { getPool, sql } = require("../database/db");

// 1. Plant Executive Performance Summary
router.get("/performance", async (req, res) => {
  const filterType = req.query.filterType || req.query.FilterType || "Current";
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("FilterType", sql.VarChar, filterType)
      .execute("Dashboard2_Get_PlantSummary");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in GET /api/plant/performance:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.get("/Plant-performance", async (req, res) => {
  const filterType = req.query.filterType || req.query.FilterType || "Current";
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("FilterType", sql.VarChar, filterType)
      .execute("Dashboard2_Get_PlantSummary");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in GET /api/plant/Plant-performance:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 2. Cross-Machine Comparative Matrix
router.get("/machine-performance", async (req, res) => {
  const filterType = req.query.filterType || req.query.FilterType || "Current";
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("FilterType", sql.VarChar, filterType)
      .execute("Dashboard2_Get_MachinePerformance");

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in GET /api/plant/machine-performance:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
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
    const pool = await getPool();
    const result = await pool.request().query("SELECT TOP 1 ProdDate, ShiftName FROM Prod_ShiftInformation ORDER BY LastUpdatedTime DESC");
    const row = result.recordset[0] || { ProdDate: new Date(), ShiftName: "A" };
    res.json({
      success: true,
      data: {
        ProdDate: row.ProdDate,
        ShiftName: row.ShiftName || "A",
      },
    });
  } catch (err) {
    console.error("Error in GET /api/plant/GetProdDate:", err.message);
    res.status(500).json({ success: false, message: error.message });
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
