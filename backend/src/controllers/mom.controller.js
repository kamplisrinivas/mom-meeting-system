const db = require("../config/db");

// ============================
// CREATE MOM POINT
// ============================
exports.createMomPoint = async (req, res) => {
  try {
    const { meeting_id, point } = req.body;

    if (!meeting_id || !point) {
      return res.status(400).json({ success: false, message: "meeting_id and point are required" });
    }

    const [result] = await db.query(
      `INSERT INTO mom_points (meeting_id, point) VALUES (?, ?)`,
      [meeting_id, point]
    );

    res.json({
      success: true,
      message: "MOM point added successfully",
      mom_point_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================
// GET MOM BY MEETING
// ============================
exports.getMomByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM mom_points WHERE meeting_id = ? ORDER BY created_at ASC`,
      [meetingId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================
// UPDATE MOM POINT
// ============================
exports.updateMomPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { point } = req.body;

    if (!point) {
      return res.status(400).json({ success: false, message: "point is required to update" });
    }

    const [result] = await db.query(
      `UPDATE mom_points SET point = ? WHERE id = ?`,
      [point, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "MOM point not found" });
    }

    res.json({ success: true, message: "MOM point updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================
// DELETE MOM POINT
// ============================
exports.deleteMomPoint = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`DELETE FROM mom_points WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "MOM point not found" });
    }

    res.json({ success: true, message: "MOM point deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};