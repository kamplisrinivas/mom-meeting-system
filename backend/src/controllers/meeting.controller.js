const db = require("../config/db");

// ================= CREATE MEETING =================
exports.createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      meeting_date,
      meeting_time,
      department_id,
      meeting_type,
      platform,
      venue
    } = req.body;

    // 🔹 Debug logging
    console.log("REQ.BODY:", req.body);

    // 🔹 Basic required fields
    if (!title?.trim() || !meeting_date || !meeting_time || !meeting_type) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields"
      });
    }

    // 🔹 Combine DATE + TIME into DATETIME
    const meeting_datetime = `${meeting_date} ${meeting_time}:00`;
    console.log("meeting_datetime:", meeting_datetime);

    // 🔹 Online meeting validation
    if (meeting_type === "Online" && !platform?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Platform is required for Online meeting"
      });
    }

    // 🔹 Offline meeting validation
    if (meeting_type === "Offline" && !venue?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Venue is required for Offline meeting"
      });
    }

    // ✅ FIXED: Match ALL schema columns exactly (9 columns)
    const [result] = await db.query(
      `INSERT INTO meetings 
       (title, description, meeting_date, meeting_time, department_id, meeting_type, platform, venue, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description || null,           // ✅ DESCRIPTION SAVES NOW
        meeting_datetime,              // ✅ DATETIME format
        meeting_time || null,          // ✅ Schema column included
        department_id || null,
        meeting_type,
        meeting_type === "Online" ? platform.trim() : null,
        meeting_type === "Offline" ? venue.trim() : null,
        req.user.id
      ]
    );

    console.log("Meeting created with ID:", result.insertId);

    res.json({
      success: true,
      message: "Meeting created successfully",
      meeting_id: result.insertId
    });

  } catch (err) {
    console.error("CREATE MEETING ERROR:", err.code, err.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating meeting",
      error: err.message
    });
  }
};

// ================= LIST MEETINGS =================
exports.getAllMeetings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, d.name AS department_name
       FROM meetings m
       LEFT JOIN departments d ON d.id = m.department_id
       ORDER BY m.meeting_date DESC`
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error("GET MEETINGS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching meetings",
      error: err.message
    });
  }
};
