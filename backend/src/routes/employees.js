const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ Add employee
router.post("/add", async (req, res) => {
  try {
    const {
      employee_id,
      employee_name,
      department_id,
      designation,
      personal_email,
      company_email,
      superior_name,
      hod_name
    } = req.body;

    if (!employee_id || !employee_name || !department_id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, Name and Department are required"
      });
    }

    const sql = `
      INSERT INTO employees
      (employee_id, employee_name, department_id, designation,
       personal_email, company_email, superior_name, hod_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      employee_id,
      employee_name,
      department_id,
      designation,
      personal_email,
      company_email,
      superior_name,
      hod_name
    ]);

    res.json({
      success: true,
      message: "Employee added successfully"
    });

  } catch (err) {
    console.error("Add employee error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ✅ Get all employees  ← ⭐ NEW
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.EmployeeID,
        e.EmployeeName,
        e.Designation,
        e.PersonalEmail,
        e.CompanyEmail,
        e.SuperiorName,
        e.HODName,
        e.department_id,
        d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.EmployeeID DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error("Fetch employees error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;