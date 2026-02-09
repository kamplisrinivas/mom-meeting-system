const db = require("../config/db");

// CREATE MOM POINT
exports.createMomPoint = async (req, res) => {
  try {
    const { meeting_id, discussion, decision } = req.body;

    const [result] = await db.query(
      `INSERT INTO mom_points (meeting_id, discussion, decision)
       VALUES (?, ?, ?)`,
      [meeting_id, discussion, decision]
    );

    res.json({
      success: true,
      message: "MOM point added",
      mom_point_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET MOM BY MEETING
exports.getMomByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const [rows] = await db.query(
      `SELECT mp.*, ai.action_item, ai.status, ai.target_date
       FROM mom_points mp
       LEFT JOIN action_items ai ON ai.mom_point_id = mp.id
       WHERE mp.meeting_id = ?`,
      [meetingId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};