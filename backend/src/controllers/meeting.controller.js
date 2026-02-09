const db = require("../config/db");

// CREATE MEETING
exports.createMeeting = async (req, res) => {
  try {
    const {
      title,
      meeting_date,
      meeting_time,
      department_id,
      meeting_type,
      platform,
      venue
    } = req.body;

    if (!title || !meeting_date || !meeting_time || !meeting_type || !platform) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    const [result] = await db.query(
      `INSERT INTO meetings 
       (title, meeting_date, meeting_time, department_id, meeting_type, platform, venue, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        meeting_date,
        meeting_time,
        department_id || null,
        meeting_type,
        platform,
        venue || null,
        req.user.id
      ]
    );

    res.json({
      success: true,
      message: "Meeting created successfully",
      meeting_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// LIST MEETINGS
exports.getAllMeetings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, d.name AS department_name
       FROM meetings m
       LEFT JOIN departments d ON d.id = m.department_id
       ORDER BY m.meeting_date DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};