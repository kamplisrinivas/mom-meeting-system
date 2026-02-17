const db = require("../config/db");

exports.createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      meeting_date,
      meeting_time,
      meeting_type,
      platform,
      venue,
      department,
      created_by,
    } = req.body;

    console.log("🔄 Creating meeting:", { title, department, created_by });

    const [result] = await db.execute(
      `INSERT INTO meetings 
      (title, description, meeting_date, meeting_time, meeting_type, platform, venue, department, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        description || null,
        meeting_date,
        meeting_time || null,
        meeting_type,
        platform || null,
        venue || null,
        department,
        parseInt(created_by),
      ]
    );

    console.log("✅ Meeting created:", result.insertId);

    res.json({
      success: true,
      meetingId: result.insertId,
      message: "Meeting created successfully",
    });
  } catch (error) {
    console.error("💥 Create meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create meeting",
      error: error.message,
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT m.*, 
             e.EmployeeName as created_by_name
      FROM meetings m
      LEFT JOIN employees e ON m.created_by = e.EmployeeID
      ORDER BY m.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("💥 Get meetings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch meetings",
    });
  }
};

exports.getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT m.*, e.EmployeeName as created_by_name 
       FROM meetings m
       LEFT JOIN employees e ON m.created_by = e.EmployeeID
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("💥 Get meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch meeting",
    });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      meeting_date,
      meeting_time,
      meeting_type,
      platform,
      venue,
      department,
      created_by,
    } = req.body;

    const [result] = await db.execute(
      `UPDATE meetings SET 
       title = ?, description = ?, meeting_date = ?, meeting_time = ?, 
       meeting_type = ?, platform = ?, venue = ?, department = ?, created_by = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        meeting_date,
        meeting_time || null,
        meeting_type,
        platform || null,
        venue || null,
        department,
        parseInt(created_by),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      message: "Meeting updated successfully",
    });
  } catch (error) {
    console.error("💥 Update meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update meeting",
    });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      `DELETE FROM meetings WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("💥 Delete meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete meeting",
    });
  }
};
