// controllers/categoryController.js
const db = require("../config/db");

exports.getAllCategories = async (req, res) => {
  try {
    // 1. Using DISTINCT to get a unique list from the meetings table
    // 2. Using 'AS name' to provide a consistent key for the React map
    const [rows] = await db.execute(
      "SELECT DISTINCT meeting_category AS name FROM meetings WHERE meeting_category IS NOT NULL ORDER BY meeting_category ASC"
    );
    
    res.status(200).json({
      success: true,
      data: rows 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch categories"
    });
  }
};