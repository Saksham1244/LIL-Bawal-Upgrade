const express = require("express");
const router = express.Router();
const { getPool, sql } = require("../database/db");

// 1. Get list of usernames (aliased to Username for frontend compatibility)
router.get("/username", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      "SELECT DISTINCT UserName AS Username FROM Config_User WHERE UserName IS NOT NULL AND UserName != '' ORDER BY Username ASC"
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(result.recordset);
  } catch (err) {
    console.error("Error in GET /username:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 2. User login
router.post("/Userlogin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query(
        "SELECT UserID, UserName AS Username FROM Config_User WHERE UserName = @username AND Password = @password"
      );

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Error in POST /Userlogin:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
