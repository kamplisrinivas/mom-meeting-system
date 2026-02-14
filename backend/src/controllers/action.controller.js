const db = require("../config/db");



// ✅ Create action item
exports.createActionItem = async (req, res) => {
  try {
    const { meeting_id, description, assigned_to, due_date } = req.body;

    if (!meeting_id || !description) {
      return res
        .status(400)
        .json({ success: false, message: "meeting_id and description required" });
    }

    const [result] = await db.query(
      `INSERT INTO action_items (meeting_id, description, assigned_to, due_date, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [meeting_id, description, assigned_to || null, due_date || null]
    );

    res.json({
      success: true,
      message: "Action item created",
      action_item_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating action item:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get all action items for a meeting
exports.getActionItemsByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const [rows] = await db.query(
  `SELECT * FROM action_items WHERE meeting_id = ? ORDER BY due_date ASC`,
  [meetingId]
);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Update action item
exports.updateActionItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, assigned_to, due_date, status } = req.body;

    const [result] = await db.query(
      `UPDATE action_items SET 
         description = COALESCE(?, description),
         assigned_to = COALESCE(?, assigned_to),
         due_date = COALESCE(?, due_date),
         status = COALESCE(?, status)
       WHERE id = ?`,
      [description, assigned_to, due_date, status, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Action item not found" });

    res.json({ success: true, message: "Action item updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Delete action item
exports.deleteActionItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(`DELETE FROM action_items WHERE id = ?`, [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Action item not found" });

    res.json({ success: true, message: "Action item deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};