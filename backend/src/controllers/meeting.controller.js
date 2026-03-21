const db = require("../config/db");
const { sendMail } = require("../services/emailService");

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
      chaired_by,
      selectedEmployeeIds
    } = req.body;

    console.log("--------------------------------------------------");
    console.log("📥 IDs Received:", selectedEmployeeIds);
    console.log("--------------------------------------------------");

    // Validation
    if (!title || !meeting_date || !meeting_type || !department || !meeting_category) {
      return res.status(400).json({
        success: false,
        message: "Title, date, type, department and category are required",
      });
    }

    const creatorId = 566;
    const creatorName = "RAVINDRA C JOSHI";

    let conductedBy =
      meeting_category === "technical"
        ? 33
        : meeting_category === "commercial"
        ? 2098
        : null;

    // ===============================
    // INSERT MEETING
    // ===============================
    const [meetingResult] = await db.execute(
      `INSERT INTO meetings 
      (title, meeting_category, description, meeting_date, meeting_time, meeting_type, platform, venue, chaired_by, created_by, conducted_by, created_by_name, department, status, created_at)
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
    console.log(`✅ Meeting created ID: ${meetingId}`);

    // ===============================
    // EMAIL LOGIC (NO BCC)
    // ===============================
    if (
      selectedEmployeeIds &&
      Array.isArray(selectedEmployeeIds) &&
      selectedEmployeeIds.length > 0
    ) {
      const placeholders = selectedEmployeeIds.map(() => "?").join(",");

      const [employees] = await db.execute(
        `SELECT EmployeeName, CompanyEmail 
         FROM employees 
         WHERE EmployeeID IN (${placeholders})`,
        selectedEmployeeIds
      );

      const validEmployees = employees.filter(
        (emp) => emp.CompanyEmail && emp.CompanyEmail.includes("@")
      );

      console.log(`📧 Valid emails: ${validEmployees.length}`);

      if (validEmployees.length > 0) {
        const employeeEmails = validEmployees
  .map((e) => e.CompanyEmail)
  .filter((email) => typeof email === "string");

        const htmlContent = `
        <div style="background:#f2f2f2;padding:30px;font-family:Arial,sans-serif;">
          <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:10px;border:2px solid #a30000;">
            
            <div style="background:#a30000;color:white;padding:15px;">
              <h2>📌 Meeting Invitation</h2>
              <p>Scheduled by: ${creatorName}</p>
            </div>

            <div style="padding:20px;">
              <p><strong>Title:</strong> ${title}</p>
              <p><strong>Date:</strong> ${meeting_date}</p>
              <p><strong>Time:</strong> ${meeting_time || "Not specified"}</p>
              <p><strong>Type:</strong> ${meeting_type}</p>
              <p><strong>Venue:</strong> ${venue || "-"}</p>
              <p><strong>Department:</strong> ${department}</p>

              <br/>
              <p><strong>Description:</strong></p>
              <div style="background:#f4f4f4;padding:10px;">
                ${description || "No description provided."}
              </div>
            </div>

            <div style="text-align:center;font-size:12px;color:#777;padding:10px;">
              Automated invitation from <strong>SLR Metaliks MOM System</strong>
            </div>

          </div>
        </div>
        `;

        // ✅ SEND EMAIL (TO + CC)
        await sendMail(
  employeeEmails.join(","), // ✅ string ONLY
  `Meeting Notification: ${title}`,
  htmlContent,              // must be string
  null,
  ["ravi.joshi@slrm.in", "mdoffice@slrm.in"],
  null
);

        console.log("🚀 Email sent (TO + CC)");

        return res.status(201).json({
          success: true,
          message: "Meeting created and emails sent",
          meetingId,
          mailSummary: {
            total: employeeEmails.length,
            sent: employeeEmails.length
          }
        });
      }
    } else {
      console.log("🚫 No employees selected. Email skipped.");
    }

    return res.status(201).json({
      success: true,
      message: "Meeting created (No emails sent)",
      meetingId,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ===============================
// GET DEPARTMENT EMPLOYEES
// ===============================
// ===============================
// GET DEPARTMENT EMPLOYEES
// Only return employees with certain designations
// ===============================
exports.getDepartmentEmployees = async (req, res) => {
  try {
    const { departments } = req.body;

    // Targeted designations
    const targetedDesignations = [
      'ASSISTANT GENERAL MANAGER',
      'ASSISTANT VICE PRESIDENT',
      'CHIEF FINANCE OFFICER',
      'CHIEF OPERATING OFFICER',
      'DEPUTY GENERAL MANAGER',
      'DEPUTY MANAGER',
      'SENIOR MANAGER',
      'MANAGING DIRECTOR',
      'VICE PRESIDENT',
      'GENERAL MANAGER',
      'MANAGER',
      'DEPUTY MANAGER',
      'CONSULTANT - SENIOR GENERAL MANAGER',
      'CONSULTANT - VICE PRESIDENT',
      'DEPUTY CHIEF FINANCE OFFICE',
      'SENIOR GENERAL MANAGER',
      'SENIOR DEPUTY GENERAL MANAGER',
      'SENIOR ASSISTANT GENERAL MANAGER'
    ];

    const desPlaceholders = targetedDesignations.map(() => "?").join(",");

    let query = `SELECT EmployeeID, EmployeeName, CompanyEmail, Designation, Department
                 FROM employees
                 WHERE UPPER(Designation) IN (${desPlaceholders})`;

    let params = targetedDesignations.map(d => d.toUpperCase());

    if (departments && departments.length > 0) {
      const deptPlaceholders = departments.map(() => "?").join(",");
      query += ` AND Department IN (${deptPlaceholders})`;
      params.push(...departments);
    }

    query += ` ORDER BY Designation, EmployeeName`;

    const [employees] = await db.execute(query, params);

    res.json({ success: true, employees });
  } catch (error) {
    console.error("❌ [BACKEND] Get department employees error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ===============================
// GET ALL MEETINGS
// ===============================
exports.getMeetings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM meetings ORDER BY meeting_date DESC LIMIT 50`
    );
    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ===============================
// GET SINGLE MEETING
// ===============================
exports.getMeetingById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM meetings WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ===============================
// UPDATE MEETING
// ===============================
exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, final_decision } = req.body;

    await db.execute(
      `UPDATE meetings 
       SET title=?, description=?, status=?, final_decision=? 
       WHERE id=?`,
      [title, description || null, status || "Scheduled", final_decision || null, id]
    );

    res.json({ success: true, message: "Updated" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ===============================
// DELETE MEETING
// ===============================
exports.deleteMeeting = async (req, res) => {
  try {
    await db.execute(`DELETE FROM meetings WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};