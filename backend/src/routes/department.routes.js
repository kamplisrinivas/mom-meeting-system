const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    console.log('🔄 Fetching departments from employees table...');
    
    const [rows] = await db.execute(`
      SELECT DISTINCT Department 
      FROM employees 
      WHERE Department IS NOT NULL 
      AND Department != '' 
      AND Department != 'NULL'
      ORDER BY Department ASC
    `);
    
    const departments = rows.map(row => row.Department).filter(Boolean);
    
    console.log(`✅ Found ${departments.length} departments:`, departments);
    
    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('💥 Departments error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch departments from employees table',
      data: [] 
    });
  }
});

module.exports = router;
