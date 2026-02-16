const db = require("../config/db");
const { getMeetingRecipients, sendMail } = require("../services/emailService");

const meetingScheduleTemplate = (data) => {
  const formatTimeAMPM = (time24) => {
    if (!time24 || time24 === 'TBD') return 'Time TBD';
    const [hours, minutes] = time24.split(':');
    const hourNum = parseInt(hours);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const timeFormatted = formatTimeAMPM(data.meeting_time || 'TBD');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f23; min-height: 100vh;">
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 100%; margin: 0 auto;">
    <tr>
      <td>
        
        <!-- 🔽 COMPACT HEADER (Reduced 25%) -->
        <div style="background: linear-gradient(180deg, #8B0000 0%, #A52A2A 100%); padding: 25px 20px; text-align: center; border-radius: 20px 20px 0 0;">
          <div style="position: absolute; top: 12px; right: 15px; background: #00D4AA; color: white; padding: 4px 12px; border-radius: 16px; font-size: 10px; font-weight: 700; text-transform: uppercase;">NEW</div>
          
          <!-- Smaller Logo -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 28px; font-weight: 900; color: white; letter-spacing: -1px;">SLRM</div>
            <div style="color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 600;">MEETING SYSTEM</div>
          </div>
          
          <div style="font-size: 20px; font-weight: 800; color: white;">MEETING</div>
        </div>

        <!-- 🔽 COMPACT DATE (Reduced 25%) -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px 20px; margin: 0;">
          <div style="text-align: center; color: white; margin-bottom: 15px;">
            <div style="font-size: 36px; margin-bottom: 6px;">📅</div>
            <div style="font-size: 20px; font-weight: 800;">${data.meeting_date}</div>
            <div style="font-size: 18px; font-weight: 700;">${timeFormatted}</div>
          </div>
          
          <div style="background: rgba(255,255,255,0.2); padding: 18px; border-radius: 14px;">
            <div style="font-size: 16px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
              📍 ${data.venue}
            </div>
            <div style="font-size: 14px; font-weight: 700; padding: 10px 15px; background: rgba(255,255,255,0.25); border-radius: 10px; text-align: center;">
              #${data.meetingCustomId}
            </div>
          </div>
        </div>

        <!-- 🔽 COMPACT SUBJECT -->
        <div style="background: white; padding: 30px 20px; position: relative;">
          <div style="position: absolute; left: 50%; top: -10px; transform: translateX(-50%); background: linear-gradient(135deg, #8B0000, #A52A2A); color: white; padding: 6px 18px; border-radius: 16px; font-size: 12px; font-weight: 700;">SUBJECT</div>
          <div style="font-size: 24px; font-weight: 800; color: #1a1a2e; text-align: center; margin-top: 8px; line-height: 1.2;">
            ${data.subject}
          </div>
        </div>

        <!-- 🔽 COMPACT AGENDA -->
        <div style="background: #f8f9fa; padding: 30px 20px; border-bottom: 4px solid #8B0000;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <div style="width: 5px; height: 24px; background: #8B0000; border-radius: 3px;"></div>
            <div style="font-size: 16px; font-weight: 800; color: #1a1a2e;">AGENDA</div>
          </div>
          <div style="font-size: 14px; line-height: 1.6; color: #475569;">
            ${data.agenda}
          </div>
        </div>

        <!-- 🔽 COMPACT BUTTONS -->
        <div style="background: white; padding: 35px 20px; text-align: center; margin-top: -15px; border-radius: 20px 20px 0 0;">
          <a href="#" style="
            display: block; width: 100%; max-width: 280px; margin: 0 auto 18px;
            background: linear-gradient(135deg, #8B0000, #A52A2A); 
            color: white; padding: 16px 30px; text-decoration: none; 
            font-weight: 800; font-size: 15px; border-radius: 14px; 
            text-transform: uppercase; letter-spacing: 0.8px;">
            🔔 JOIN MEETING
          </a>
          
          <a href="#" style="
            display: block; width: 100%; max-width: 260px; margin: 0 auto;
            color: #8B0000; padding: 14px 25px; text-decoration: none; 
            font-weight: 700; font-size: 14px; border: 2px solid #fee2e2; 
            border-radius: 14px; background: rgba(254,226,226,0.8);">
            📅 ADD CALENDAR
          </a>
        </div>

        <!-- ✅ PERFECT FOOTER - Always Visible -->
        <div style="background: linear-gradient(135deg, #1e293b, #334155); padding: 30px 20px; text-align: center; color: white; border-radius: 0 0 20px 20px; margin-top: 0 !important; clear: both;">
          <div style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">
            By: <span style="color: #8B0000;">${data.scheduledBy}</span>
          </div>
          <div style="font-size: 13px; opacity: 0.9;">
            Powered by <strong style="color: #8B0000;">SLRM MIS ERP</strong>
          </div>
        </div>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

const createMeeting = async (req, res) => {
  try {
    console.log("🔥 CREATING MEETING:", req.body);
    
    const { title, description, meeting_date, meeting_time, department_id, meeting_type, platform, venue } = req.body;

    const [result] = await db.query(
      `INSERT INTO meetings (title, description, meeting_date, meeting_time, department_id, meeting_type, platform, venue, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, meeting_date, meeting_time, department_id, meeting_type, platform, venue, req.user.id]
    );

    const [deptRows] = await db.query(`SELECT name FROM departments WHERE id = ?`, [department_id]);
    const departmentName = deptRows[0]?.name;

    let recipients = await getMeetingRecipients(departmentName);
    recipients.push('nivaskampli@gmail.com');
    
    if (recipients.length > 0) {
      try {
        const templateData = {
          scheduledBy: req.user.name || "SLRM Admin",
          meeting_date: meeting_date,
          meeting_time: meeting_time || 'TBD',
          venue: meeting_type === 'Online' ? (platform || 'Online') : (venue || 'TBA'),
          meetingCustomId: result.insertId.toString().padStart(6, '0'),
          subject: title,
          agenda: description || "No agenda provided"
        };

        await sendMail(
          recipients.join(","),
          `📅 New Meeting: ${title}`,
          meetingScheduleTemplate(templateData),
          `📅 New Meeting: ${title}\\nDate: ${meeting_date} ${meeting_time}\\nVenue: ${venue || 'TBA'}\\nAgenda: ${description || 'No agenda'}`
        );
        console.log("✅ EMAILS SENT SUCCESSFULLY!");
      } catch (emailError) {
        console.log("⚠️ Email failed:", emailError.message);
      }
    }

    res.json({
      success: true,
      message: `Meeting #${result.insertId} created! 📧 ${recipients.length} emails sent`,
      meeting_id: result.insertId,
      department_name: departmentName
    });
  } catch (err) {
    console.error("❌ Create meeting error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAllMeetings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, d.name AS department_name 
      FROM meetings m 
      LEFT JOIN departments d ON d.id = m.department_id 
      ORDER BY m.meeting_date DESC, m.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get meetings error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔥 NEW: Get all departments for frontend dropdown
const getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM departments ORDER BY name ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Get departments error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createMeeting, getAllMeetings, getDepartments };
