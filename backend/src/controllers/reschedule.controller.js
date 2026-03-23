const db = require("../config/db"); 
const { sendMail } = require("../services/emailService"); 

/**
 * @desc    Fetch a SINGLE meeting by ID for AUTOFILL
 */
exports.getMeetingById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM meetings WHERE id = ?`;
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    const meetingData = rows[0];

    if (meetingData.department && typeof meetingData.department === 'string') {
      meetingData.department = meetingData.department.split(",").map(d => d.trim()).filter(Boolean);
    } else if (!meetingData.department) {
      meetingData.department = [];
    }

    if (meetingData.meeting_date) {
      const d = new Date(meetingData.meeting_date);
      meetingData.meeting_date = d.toISOString().split('T')[0];
    }

    return res.status(200).json({ success: true, data: meetingData });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Update/Reschedule meeting AND Send Email
 * @route   PUT /api/reschedule/:id
 */
exports.updateMeetingSchedule = async (req, res) => {
  const { id } = req.params;
  const { 
    title, meeting_date, meeting_time, venue, platform, 
    meeting_type, description, chaired_by, department,
    selectedEmployeeIds 
  } = req.body;

  const creatorName = "RAVINDRA C JOSHI";

  try {
    const deptString = Array.isArray(department) ? department.join(", ") : (department || "");

    const updateQuery = `
      UPDATE meetings 
      SET title = ?, meeting_date = ?, meeting_time = ?, venue = ?, 
          platform = ?, meeting_type = ?, description = ?, chaired_by = ?, department = ?
      WHERE id = ?
    `;

    const [result] = await db.execute(updateQuery, [
      title || null, meeting_date || null, meeting_time || null, 
      venue || null, platform || null, meeting_type || 'Offline', 
      description || null, chaired_by || null, deptString, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }

    // ==========================================
    // 📧 EMAIL NOTIFICATION LOGIC WITH LOGGING
    // ==========================================
    if (selectedEmployeeIds && Array.isArray(selectedEmployeeIds) && selectedEmployeeIds.length > 0) {
      const placeholders = selectedEmployeeIds.map(() => "?").join(",");
      const [employees] = await db.execute(
        `SELECT EmployeeName, CompanyEmail FROM employees WHERE EmployeeID IN (${placeholders})`,
        selectedEmployeeIds
      );

      const validEmails = employees
        .filter(emp => emp.CompanyEmail && emp.CompanyEmail.includes("@"))
        .map(emp => emp.CompanyEmail);

      const fromEmail = process.env.EMAIL_FROM;
      // Added your monitoring email to CC
      const ccEmails = ["meetings@slrm.in", "ravi.joshi@slrm.in", "mdoffice@slrm.in"];

      if (validEmails.length > 0) {
        console.log("--------------------------------------------------");
        console.log("📩 SENDING RESCHEDULE EMAIL:");
        console.log(`   FROM : ${fromEmail}`);
        console.log(`   TO   : ${validEmails.join(", ")}`);
        console.log(`   CC   : ${ccEmails.join(", ")}`);
        console.log("--------------------------------------------------");

        // Using your requested Red Template
        const htmlContent = `
        <div style="background:#f2f2f2;padding:30px;font-family:Arial,sans-serif;">
          <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:10px;border:2px solid #a30000;overflow:hidden;">
            
            <div style="background:#a30000;color:white;padding:15px;text-align:center;">
              <h2 style="margin:0;">🔄 Meeting Rescheduled</h2>
              <p style="margin:5px 0 0 0;">Scheduled by: ${creatorName}</p>
            </div>

            <div style="padding:20px;color:#333;line-height:1.6;">
              <p><strong>Title:</strong> ${title}</p>
              <p><strong>Date:</strong> ${meeting_date}</p>
              <p><strong>Time:</strong> ${meeting_time || "Not specified"}</p>
              <p><strong>Type:</strong> ${meeting_type}</p>
              <p><strong>Venue:</strong> ${venue || platform || "-"}</p>
              <p><strong>Department:</strong> ${deptString}</p>

              <br/>
              <p><strong>Description/Agenda:</strong></p>
              <div style="background:#f4f4f4;padding:15px;border-left:4px solid #a30000;">
                ${description || "No description provided."}
              </div>
            </div>

            <div style="text-align:center;font-size:12px;color:#777;padding:15px;background:#eee;">
              Automated invitation from <strong>SLR Metaliks MOM System</strong><br/>
              Please update your calendar accordingly.
            </div>

          </div>
        </div>
        `;

        await sendMail(
          validEmails.join(","),
          `RESCHEDULED: ${title}`,
          htmlContent,
          null,
          ccEmails
        );

        console.log("✅ SUCCESS: Email Sent.");
      } else {
        console.log("⚠️ SKIP: No valid emails found for selected employees.");
      }
    } else {
      console.log("⚠️ SKIP: No selectedEmployeeIds provided.");
    }

    return res.status(200).json({ success: true, message: "Meeting rescheduled successfully" });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Error: " + error.message });
  }
};

/**
 * @desc    Fetch all scheduled meetings for the list view
 */
exports.getRescheduleList = async (req, res) => {
  try {
    const query = `
      SELECT id, title, meeting_date, meeting_time, venue, platform, status, department 
      FROM meetings 
      WHERE status != 'Completed' 
      ORDER BY meeting_date ASC
    `;
    const [rows] = await db.execute(query);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error in getRescheduleList:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};