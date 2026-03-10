const db = require("../config/db");
const sendEmail = require("../utils/mailer");


// ===============================
// CREATE MEETING
// ===============================
exports.createMeeting = async (req, res) => {
  try {

    const {
      title,
      description,
      meeting_date,
      meeting_time,
      meeting_type,
      meeting_category,
      platform,
      venue,
      department,
      chaired_by
    } = req.body;

    if (!title || !meeting_date || !meeting_type || !department || !meeting_category) {
      return res.status(400).json({
        success: false,
        message: "Title, meeting_date, meeting_type, department and meeting_category are required",
      });
    }

    // ==================================
    // 🔥 HARD CODED CREATOR
    // ==================================

    const creatorId = 566;
    const creatorName = "RAVINDRA C JOSHI";

    // ==================================
    // 🔥 SET CONDUCTED BY
    // ==================================

    let conductedBy = null;

    if (meeting_category === "technical") {
      conductedBy = 33; // VINOD B S
    }

    if (meeting_category === "commercial") {
      conductedBy = 2098; // BRIJESH KUMAR UPADHYAY
    }

    // ==================================
    // INSERT MEETING
    // ==================================

    const [meetingResult] = await db.execute(
      `INSERT INTO meetings
      (
        title,
        meeting_category,
        description,
        meeting_date,
        meeting_time,
        meeting_type,
        platform,
        venue,
        chaired_by,
        created_by,
        conducted_by,
        created_by_name,
        department,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', NOW())`,
      [
        title,
        meeting_category,
        description || null,
        meeting_date,
        meeting_time || null,
        meeting_type,
        platform || null,
        venue || null,
        chaired_by || null,
        creatorId,
        conductedBy,
        creatorName,
        department.trim()
      ]
    );

    const meetingId = meetingResult.insertId;

    // ==================================
    // GET MANAGEMENT EMPLOYEES
    // ==================================

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

    if (employees.length === 0) {
      return res.status(201).json({
        success: true,
        message: "Meeting created (No management found)",
        meetingId,
      });
    }

    // ==================================
    // FILTER VALID EMAILS
    // ==================================

    const validEmployees = employees.filter(
      (emp) =>
        emp.CompanyEmail &&
        emp.CompanyEmail.trim() !== "" &&
        emp.CompanyEmail.includes("@")
    );

    if (validEmployees.length === 0) {
      return res.status(201).json({
        success: true,
        message: "Meeting created (No valid emails)",
        meetingId,
      });
    }

    // ==================================
    // SEND EMAILS
    // ==================================

    const emailPromises = validEmployees.map((emp) =>
  sendEmail(
    emp.CompanyEmail,
    ` Meeting Notification: ${title}`,
    `
            <div style="background:#f2f2f2;padding:30px;font-family:Arial,sans-serif;">
              
              <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:10px;border:2px solid #a30000;overflow:hidden;">
                
                <!-- Header -->
                <div style="background:#a30000;color:white;padding:15px 20px;">
          <table width="100%">
            <tr>

              <td style="width:60px;">
                <img src="cid:slrmlogo" style="width:50px;height:auto;" />
              </td>

              <td style="text-align:center;">
                <h2 style="margin:0;">📌 Meeting Invitation</h2>
                <p style="margin:5px 0 0 0;font-size:14px;">
                  Scheduled by: ${creatorName || "Management"}
                </p>
              </td>

              <td style="width:60px;"></td>

            </tr>
          </table>
        </div>

        <!-- Body -->
        <div style="padding:25px;color:#333;font-size:14px;line-height:1.6;">
          
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Date:</strong> ${meeting_date}</p>
          <p><strong>Time:</strong> ${meeting_time || "Not specified"}</p>
          <p><strong>Type:</strong> ${meeting_type}</p>
          <p><strong>Platform / Venue:</strong> ${venue || "-"}</p>
          <p><strong>Department:</strong> ${department}</p>

          <br>

          <p><strong>Description:</strong></p>

          <div style="
            background:#f4f4f4;
            padding:15px;
            border-left:5px solid #a30000;
            border-radius:6px;
            margin-top:5px;
          ">
            ${description || "No description provided."}
          </div>

        </div>

        <!-- Footer -->
        <div style="text-align:center;font-size:12px;color:#777;padding:15px;background:#fafafa;">
          This is an automated invitation from 
          <strong>SLR Metaliks MOM System</strong>.
        </div>

      </div>

    </div>
    `
  )
);

    const results = await Promise.allSettled(emailPromises);

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

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
    console.error("❌ Create meeting error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getDepartmentEmployees = async (req, res) => {

  try {

    const { departments } = req.body;

    if (!departments || departments.length === 0) {
      return res.json({
        success: true,
        employees: []
      });
    }

    const placeholders = departments.map(() => "?").join(",");

    const [employees] = await db.execute(
      `SELECT EmployeeID, EmployeeName, CompanyEmail, Designation, Department
       FROM employees
       WHERE Department IN (${placeholders})`,
      departments
    );

    res.json({
      success: true,
      employees
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success:false
    });

  }

};


// ===============================
// GET ALL MEETINGS
// ===============================
exports.getMeetings = async (req, res) => {
  try {

    const [rows] = await db.execute(`
      SELECT *
      FROM meetings
      ORDER BY meeting_date DESC
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


// ===============================
// GET SINGLE MEETING
// ===============================
exports.getMeetingById = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT * FROM meetings WHERE id = ?`,
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


// ===============================
// UPDATE MEETING
// ===============================
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
      status,
      final_decision
    } = req.body;

    const [result] = await db.execute(
      `UPDATE meetings SET 
        title = ?, 
        description = ?, 
        meeting_date = ?, 
        meeting_time = ?, 
        meeting_type = ?, 
        platform = ?, 
        venue = ?, 
        department = ?,
        status = ?,
        final_decision = ?
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
        status || "Scheduled",
        final_decision || null,
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


// ===============================
// DELETE MEETING
// ===============================
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