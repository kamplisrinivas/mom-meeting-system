const db = require("../config/db");

exports.getDepartments = async (req, res) => {
  try {
    console.log('🔄 Fetching all departments...');
    
    const [rows] = await db.execute(`
      SELECT DISTINCT Department 
      FROM employees 
      WHERE Department IS NOT NULL AND Department != ''
      ORDER BY Department ASC
    `);
    
    const departments = rows.map(row => row.Department).filter(Boolean);
    
    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('💥 Departments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch departments' });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    // Your logic here
    res.json({ success: true, data: { id, name: "Sample Dept" } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
