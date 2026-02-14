const db = require("../config/db");

exports.getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM departments ORDER BY name ASC");

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Department Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};