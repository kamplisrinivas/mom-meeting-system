const db = require("../config/db");

// CREATE ACTION ITEM
exports.createActionItem = async (req, res) => {
  try {
    const {
      mom_point_id,
      action_item,
      responsible_user_id,
      target_date
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO action_items 
       (mom_point_id, action_item, responsible_user_id, target_date)
       VALUES (?, ?, ?, ?)`,
      [mom_point_id, action_item, responsible_user_id, target_date]
    );

    res.json({
      success: true,
      message: "Action item added",
      action_item_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE ACTION STATUS
exports.updateActionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await db.query(
      `UPDATE action_items SET status = ? WHERE id = ?`,
      [status, id]
    );

    res.json({
      success: true,
      message: "Action status updated"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};