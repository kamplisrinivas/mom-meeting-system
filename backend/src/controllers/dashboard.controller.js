const db = require("../config/db");

// SUMMARY COUNTS
exports.getSummary = async (req, res) => {
  try {
    const [[meetings]] = await db.query(
      `SELECT COUNT(*) total FROM meetings`
    );

    const [[actions]] = await db.query(
      `SELECT COUNT(*) pending 
       FROM action_items 
       WHERE status != 'COMPLETED'`
    );

    res.json({
      success: true,
      data: {
        total_meetings: meetings.total,
        pending_actions: actions.pending
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// TODAY'S MEETINGS
exports.getTodayMeetings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM meetings 
       WHERE meeting_date = CURDATE()
       ORDER BY meeting_time`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PENDING ACTION ITEMS
exports.getPendingActions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ai.*, mp.discussion, m.title AS meeting_title
       FROM action_items ai
       JOIN mom_points mp ON mp.id = ai.mom_point_id
       JOIN meetings m ON m.id = mp.meeting_id
       WHERE ai.status != 'COMPLETED'
       ORDER BY ai.target_date`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.getRecentMeetings = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    // ✅ FIXED: Added meeting_time to the SELECT list
    let query = `
      SELECT id, title, meeting_date, meeting_time, department, meeting_type 
      FROM meetings 
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      query += " AND DATE(meeting_date) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    if (department) {
      query += " AND department = ?";
      params.push(department);
    }

    // ✅ IMPROVED: Sort by date AND then by time so the newest is always on top
    query += " ORDER BY meeting_date DESC, meeting_time DESC LIMIT 10";

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};