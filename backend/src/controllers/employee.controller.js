const db = require("../config/db");

exports.getEmployees = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT EmployeeID, EmployeeName, Department 
      FROM employees 
      WHERE EmployeeName IS NOT NULL AND EmployeeName != ''
      ORDER BY EmployeeName ASC
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('💥 Employees error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    console.log('🔄 Fetching departments...');
    
    const [rows] = await db.execute(`
      SELECT DISTINCT Department 
      FROM employees 
      WHERE Department IS NOT NULL 
      AND Department != '' 
      AND Department != 'NULL'
      ORDER BY Department ASC
    `);
    
    const departments = rows.map(row => row.Department).filter(Boolean);
    
    console.log(`✅ Departments:`, departments);
    
    res.json({
      success: true,
      data: departments,  // ["IT", "General", "HR"]
      count: departments.length
    });
  } catch (error) {
    console.error('💥 Departments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch departments' });
  }
};
