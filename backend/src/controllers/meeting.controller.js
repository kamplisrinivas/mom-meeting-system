const db = require("../config/db");
const sendEmail = require("../utils/mailer"); // ✅ FIXED

exports.createMeeting = async (req, res) => {
  try {
    console.log("========================================");
    console.log("📥 NEW MEETING REQUEST STARTED");

    // ✅ 1. AUTH USER
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ 2. GET BODY DATA
    const {
      title,
      description,
      meeting_date,
      meeting_time,
      meeting_type,
      platform,
      venue,
      department,
    } = req.body;

    if (!title || !meeting_date || !meeting_type || !department) {
      return res.status(400).json({
        success: false,
        message:
          "Title, meeting_date, meeting_type and department are required",
      });
    }

    console.log("👤 Created By:", userId);
    console.log("📌 Title:", title);
    console.log("🏢 Department:", department);

    // ✅ 3. INSERT MEETING
    const [meetingResult] = await db.execute(
      `INSERT INTO meetings
      (title, description, meeting_date, meeting_time, meeting_type, platform, venue, department, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title,
        description || null,
        meeting_date,
        meeting_time || null,
        meeting_type,
        platform || null,
        venue || null,
        department.trim(),
        userId,
      ]
    );

    const meetingId = meetingResult.insertId;
    console.log("✅ Meeting inserted:", meetingId);

    // ✅ 4. FETCH MANAGEMENT EMPLOYEES
    const [employees] = await db.execute(
      `SELECT EmployeeName, CompanyEmail, Designation
       FROM employees
       WHERE UPPER(Department) = UPPER(?)
       AND Designation IN (
         'MANAGING DIRECTOR',
         'VICE PRESIDENT',
         'GENERAL MANAGER',
         'SENIOR DEPUTY GENERAL MANAGER',
         'SENIOR ASSISTANT GENERAL MANAGER',
         'ASSISTANT GENERAL MANAGER',
         'SENIOR MANAGER',
         'DEPUTY MANAGER',
         'MANAGER',
         'ASSISTANT MANAGER'
       )`,
      [department.trim()]
    );

    console.log("👥 Management Found:", employees.length);

    if (employees.length === 0) {
      return res.status(201).json({
        success: true,
        message: "Meeting created (No management emails found)",
        meetingId,
      });
    }

    // ✅ 5. FILTER VALID EMAILS
    const validEmployees = employees.filter(
      (emp) =>
        emp.CompanyEmail &&
        emp.CompanyEmail.trim() !== "" &&
        emp.CompanyEmail.includes("@")
    );

    if (validEmployees.length === 0) {
      return res.status(201).json({
        success: true,
        message: "Meeting created (No valid email addresses found)",
        meetingId,
      });
    }

    // ✅ 6. SEND EMAILS (USING sendEmail FUNCTION)
    const emailPromises = validEmployees.map((emp) =>
      sendEmail(
        emp.CompanyEmail,
        `📅 Meeting Notification: ${title}`,
        `
          <div style="font-family: Arial; padding:20px;">
            <h3>Meeting Invitation</h3>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Date:</strong> ${meeting_date}</p>
            <p><strong>Time:</strong> ${meeting_time || "Not specified"}</p>
            <p><strong>Type:</strong> ${meeting_type}</p>
            <p><strong>Platform:</strong> ${platform || "-"}</p>
            <p><strong>Venue:</strong> ${venue || "-"}</p>
            <br/>
            <p>${description || ""}</p>
            <br/>
            <p>Regards,<br/><strong>Management System</strong></p>
          </div>
        `
      )
    );

    const results = await Promise.allSettled(emailPromises);

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log("📊 Mail Summary → Sent:", sent, "Failed:", failed);
    console.log("========================================");

    return res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meetingId,
      mailSummary: {
        total: validEmployees.length,
        sent,
        failed,
      },
    });
  } catch (error) {
    console.log("========================================");
    console.log("❌ SERVER ERROR:", error);
    console.log("========================================");

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT m.*, 
             e.EmployeeName as created_by_name
      FROM meetings m
      LEFT JOIN employees e ON m.created_by = e.EmployeeID
      ORDER BY m.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("💥 Get meetings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch meetings",
    });
  }
};

exports.getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT m.*, e.EmployeeName as created_by_name 
       FROM meetings m
       LEFT JOIN employees e ON m.created_by = e.EmployeeID
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("💥 Get meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch meeting",
    });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      meeting_date,
      meeting_time,
      meeting_type,
      platform,
      venue,
      department,
      created_by,
    } = req.body;

    const [result] = await db.execute(
      `UPDATE meetings SET 
       title = ?, description = ?, meeting_date = ?, meeting_time = ?, 
       meeting_type = ?, platform = ?, venue = ?, department = ?, created_by = ?
       WHERE id = ?`,
      [
        title,
        description || null,
        meeting_date,
        meeting_time || null,
        meeting_type,
        platform || null,
        venue || null,
        department,
        parseInt(created_by),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      message: "Meeting updated successfully",
    });
  } catch (error) {
    console.error("💥 Update meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update meeting",
    });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      `DELETE FROM meetings WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("💥 Delete meeting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete meeting",
    });
  }
};
