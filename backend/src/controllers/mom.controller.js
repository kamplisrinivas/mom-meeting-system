const db = require("../config/db");
const { sendMail } = require("../services/emailService");

// ============================
// CREATE MOM POINT + EMAIL
// ============================
exports.createMomPoint = async (req, res) => {
  try {
    const {
      meeting_id,
      topic,
      point,
      decisions,
      assigned_to,
      timeline,
      status,
    } = req.body;

    if (!meeting_id || !point || !topic) {
      return res.status(400).json({
        success: false,
        message: "meeting_id, topic and point are required",
      });
    }

    // ======================================
    // ✅ BULLETPROOF ASSIGNEE HANDLING
    // ======================================
    let assignedArray = [];

    if (Array.isArray(assigned_to)) {
      assignedArray = assigned_to;
    } else if (typeof assigned_to === "string" && assigned_to.trim() !== "") {
      try {
        assignedArray = JSON.parse(assigned_to);
      } catch {
        assignedArray = [assigned_to];
      }
    } else if (assigned_to) {
      assignedArray = [assigned_to];
    }

    const assignedJson = assignedArray.length
      ? JSON.stringify(assignedArray)
      : null;

    console.log("✅ Final assignees:", assignedArray);

    // ======================================
    // ✅ INSERT MOM POINT
    // ======================================
    const [result] = await db.query(
      `INSERT INTO mom_points
       (meeting_id, topic, point, decisions, assigned_to, timeline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        meeting_id,
        topic,
        point,
        decisions || null,
        assignedJson,
        timeline || null,
        status || "Assigned",
      ]
    );

    // ======================================
    // 🚀 SEND EMAIL TO ASSIGNEES
    // ======================================
    if (assignedArray.length > 0) {
      try {
        const [emps] = await db.query(
          `SELECT EmployeeName, CompanyEmail
           FROM employees
           WHERE EmployeeID IN (?)`,
          [assignedArray]
        );

        const emails = emps
          .map((e) => e.CompanyEmail)
          .filter(Boolean);

        if (emails.length > 0) {
          const subject = `📌 New MOM Action Assigned`;

          const html = `
            <h3>New MOM Action Assigned</h3>
            <p><b>Meeting ID:</b> ${meeting_id}</p>
            <p><b>Topic:</b> ${topic}</p>
            <p><b>Discussion:</b> ${point}</p>
            <p><b>Decision:</b> ${decisions || "-"}</p>
            <p><b>Timeline:</b> ${timeline || "Not set"}</p>
            <p><b>Status:</b> ${status || "Assigned"}</p>
            <br/>
            <p>Please take necessary action.</p>
          `;

          await sendMail(
            emails.join(","),
            subject,
            html,
            `New MOM assigned: ${topic}`
          );

          console.log("📧 MOM emails sent:", emails);
        } else {
          console.log("⚠️ No employee emails found");
        }
      } catch (mailErr) {
        console.error("❌ Email sending failed:", mailErr.message);
      }
    }

    res.json({
      success: true,
      message: "MOM point created successfully",
      mom_point_id: result.insertId,
    });
  } catch (err) {
    console.error("Create MOM Error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ======================================
// ✅ GET MOM BY MEETING
// ======================================
exports.getMomByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        mp.*,
        m.title AS meeting_title,
        GROUP_CONCAT(
          DISTINCT CONCAT(e.EmployeeName, ' (', e.Department, ')')
          SEPARATOR ', '
        ) AS assignee_details
      FROM mom_points mp
      LEFT JOIN meetings m ON mp.meeting_id = m.id
      LEFT JOIN employees e 
        ON FIND_IN_SET(
             e.EmployeeID,
             REPLACE(REPLACE(mp.assigned_to, '[', ''), ']', '')
           )
      WHERE mp.meeting_id = ?
      GROUP BY mp.id
      ORDER BY mp.created_at ASC
      `,
      [meetingId]
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("GET MOM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ============================
// UPDATE MOM POINT
// ============================
exports.updateMomPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, point, decisions, assigned_to, timeline, status } =
      req.body;

    if (!point || !topic) {
      return res.status(400).json({
        success: false,
        message: "topic and point are required",
      });
    }

    const assignedJson = Array.isArray(assigned_to)
      ? JSON.stringify(assigned_to)
      : "[]";

    const [result] = await db.query(
      `UPDATE mom_points 
       SET topic = ?, point = ?, decisions = ?, assigned_to = ?, timeline = ?, status = ?
       WHERE id = ?`,
      [
        topic,
        point,
        decisions || null,
        assignedJson,
        timeline || null,
        status || "Assigned",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "MOM point not found" });
    }

    res.json({ success: true, message: "MOM point updated successfully" });
  } catch (err) {
    console.error("Update MOM Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ============================
// DELETE MOM POINT
// ============================
exports.deleteMomPoint = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM mom_points WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "MOM point not found" });
    }

    res.json({ success: true, message: "MOM point deleted successfully" });
  } catch (err) {
    console.error("Delete MOM Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};