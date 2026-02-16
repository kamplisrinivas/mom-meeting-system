const db = require("../config/db");
const {
  getMeetingRecipients,
  sendMail,
} = require("../services/emailService");

/**
 * =====================================
 * CREATE MEETING + SEND EMAIL
 * =====================================
 */
exports.createMeeting = async (req, res) => {
  try {
    const {
      title,
      meeting_date,
      meeting_time,
      department_id,
      meeting_type,
      platform,
      venue,
    } = req.body;

    // ✅ insert meeting
    const [result] = await db.query(
      `INSERT INTO meetings
      (title, meeting_date, meeting_time, department_id, meeting_type, platform, venue, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        meeting_date,
        meeting_time,
        department_id,
        meeting_type,
        platform,
        venue,
        req.user.id,
      ]
    );

    // ✅ get department name
    const [deptRows] = await db.query(
      `SELECT name FROM departments WHERE id = ?`,
      [department_id]
    );

    const departmentName = deptRows[0]?.name;

    // ✅ get recipients
    const recipients = await getMeetingRecipients(departmentName);

    // ✅ send email (ONLY if emails exist)
    if (recipients.length > 0) {
      await sendMail(
        recipients.join(","),
        "📅 Meeting Scheduled",
        `
        <h3>Meeting Scheduled</h3>
        <p><b>Title:</b> ${title}</p>
        <p><b>Date:</b> ${meeting_date}</p>
        <p><b>Time:</b> ${meeting_time}</p>
        <p><b>Type:</b> ${meeting_type}</p>
        <p><b>Platform:</b> ${platform || "-"}</p>
        <p><b>Venue:</b> ${venue || "-"}</p>
        `
      );
    }

    res.json({
      success: true,
      message: "Meeting created & email sent",
      meeting_id: result.insertId,
      emails_sent_to: recipients.length,
    });
  } catch (err) {
    console.error("Create meeting error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * =====================================
 * GET ALL MEETINGS
 * =====================================
 */
exports.getAllMeetings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, d.name AS department_name
      FROM meetings m
      LEFT JOIN departments d ON d.id = m.department_id
      ORDER BY m.meeting_date DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};