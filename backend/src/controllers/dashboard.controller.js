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