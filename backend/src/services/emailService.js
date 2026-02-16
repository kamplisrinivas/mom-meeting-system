const nodemailer = require("nodemailer");
const db = require("../config/db");

// ✅ FIXED: createTransport + name: 'slrm.in' + text fallback
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || 587),
  secure: false,
  name: 'slrm.in',  // ✅ FIXES HELO [127.0.0.1] error
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true
});

// Test connection
transporter.verify((error, success) => {
  if (error) console.error("❌ SMTP ERROR:", error);
  else console.log("✅ SMTP Connected successfully!");
});

function extractEmpId(text) {
  if (!text) return null;
  const match = text.match(/^(\d+)/);
  return match ? match[1] : null;
}

async function getEmployeeEmailById(empId) {
  if (!empId) return null;
  const [rows] = await db.query(`SELECT CompanyEmail FROM employees WHERE EmployeeID = ?`, [empId]);
  return rows.length ? rows[0].CompanyEmail : null;
}

async function getMeetingRecipients(department) {
  try {
    const [employees] = await db.query(`SELECT * FROM employees WHERE Department = ?`, [department]);
    const emailSet = new Set();

    for (const emp of employees) {
      if (emp.CompanyEmail) emailSet.add(emp.CompanyEmail);
      if (emp.PersonalEmail) emailSet.add(emp.PersonalEmail);

      const supId = extractEmpId(emp.SuperiorName);
      const supEmail = await getEmployeeEmailById(supId);
      if (supEmail) emailSet.add(supEmail);

      const hodId = extractEmpId(emp.HODName);
      const hodEmail = await getEmployeeEmailById(hodId);
      if (hodEmail) emailSet.add(hodEmail);
    }

    return [...emailSet];
  } catch (err) {
    console.error("❌ Error getting recipients:", err);
    return [];
  }
}

// ✅ FIXED: Added text parameter
async function sendMail(to, subject, html, text = null) {
  try {
    console.log("📧 Sending to:", to.substring(0, 50) + "...");
    console.log("📧 HTML length:", html.length);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || `📅 New Meeting: ${subject}`
    };
    
    await transporter.sendMail(mailOptions);
    console.log("✅ EMAIL SENT SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error);
    throw error;
  }
}

module.exports = {
  getMeetingRecipients,
  sendMail
};
