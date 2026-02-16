const db = require("../config/db");

const getAttendeeEmails = async (meetingId) => {
  const [rows] = await db.query(`
    SELECT 
      COALESCE(e.CompanyEmail, e.PersonalEmail) AS email
    FROM meeting_attendees ma
    JOIN employees e ON e.EmployeeID = ma.employee_id
    WHERE ma.meeting_id = ?
  `, [meetingId]);

  return rows.map(r => r.email).filter(Boolean);
};

module.exports = getAttendeeEmails;