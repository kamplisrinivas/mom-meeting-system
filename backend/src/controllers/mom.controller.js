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
            <p>Please take necessary action and update status in <a href="http://localhost:5173/employee-tasks">Employee Dashboard</a></p>
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
        m.meeting_date,
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
// UPDATE MOM POINT (FULL)
// ============================
exports.updateMomPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, point, decisions, assigned_to, timeline, status } = req.body;

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
// ✅ NEW: GET MY TASKS (Employee Dashboard)
// ============================
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.EmployeeID; // From JWT auth middleware

    console.log("🔍 Fetching tasks for employee:", userId);

    const query = `
      SELECT 
        mp.*,
        m.title as meeting_title,
        m.meeting_date,
        DATE_FORMAT(mp.timeline, '%Y-%m-%d') as timeline_formatted
      FROM mom_points mp
      JOIN meetings m ON mp.meeting_id = m.id
      WHERE JSON_CONTAINS(mp.assigned_to, JSON_QUOTE(?))
      ORDER BY m.meeting_date DESC, mp.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("❌ My tasks query error:", err);
        return res.status(500).json({ 
          success: false, 
          error: err.message 
        });
      }
      
      console.log("✅ Found tasks for employee", userId, ":", results.length);
      res.json({ 
        success: true, 
        data: results 
      });
    });
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================
// ✅ NEW: UPDATE STATUS ONLY (Employee updates)
// ============================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.EmployeeID;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    console.log(`🔄 Updating status for MOM ${id} to ${status} by user ${userId}`);

    // ✅ SECURITY: Check if user is assigned to this task
    const [checkResult] = await db.query(
      `SELECT assigned_to FROM mom_points WHERE id = ?`,
      [id]
    );

    if (checkResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "MOM point not found"
      });
    }

    const assignedTo = JSON.parse(checkResult[0].assigned_to || '[]');
    if (!assignedTo.includes(userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - you are not assigned to this task"
      });
    }

    // ✅ UPDATE STATUS
    const [result] = await db.query(
      `UPDATE mom_points SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "MOM point not found"
      });
    }

    console.log(`✅ Status updated: MOM ${id} → ${status}`);

    res.json({ 
      success: true, 
      message: `Status updated to ${status}`,
      data: { id, status }
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, error: error.message });
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
