require("dotenv").config();
const nodemailer = require("nodemailer");
const db = require("../config/db");
const path = require("path");

// ================== TRANSPORTER ==================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),

  // ✅ AUTO HANDLE PORT SECURITY
  secure: Number(process.env.EMAIL_PORT) === 465,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  name: "slrm.in",

  // ✅ IMPORTANT for corporate SMTP
  tls: {
    rejectUnauthorized: false,
  },
});
// Verify SMTP connection
transporter.verify((error) => {
  if (error) console.error("❌ SMTP ERROR:", error);
  else console.log("✅ SMTP Connected successfully!");
});

// ================== HELPERS ==================
function extractEmpId(text) {
  if (!text) return null;
  const match = text.match(/^(\d+)/);
  return match ? match[1] : null;
}

async function getEmployeeEmailById(empId) {
  if (!empId) return null;

  try {
    const [rows] = await db.query(
      `SELECT CompanyEmail FROM employees WHERE EmployeeID = ?`,
      [empId]
    );
    return rows.length ? rows[0].CompanyEmail : null;
  } catch (err) {
    console.error("❌ Error fetching employee email:", err);
    return null;
  }
}

async function getMeetingRecipients(department) {
  try {
    const [employees] = await db.query(
      `SELECT * FROM employees WHERE Department = ?`,
      [department]
    );

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

// ================== SEND EMAIL ==================
async function sendMail(to, subject, html, text = null, cc = null, bcc = null) {
  try {
    // ✅ Normalize emails (array → string)
    const formatEmails = (emails) => {
      if (!emails) return undefined;
      if (Array.isArray(emails)) return emails.join(",");
      return emails;
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: formatEmails(to),
      subject,
      html,
      text: text || subject,
      attachments: [
        {
          filename: "logo.jpg",
          path: path.join(__dirname, "../image/logo.jpg"),
          cid: "slrmlogo",
        },
      ],
    };

    // ✅ Add CC only if exists
    const formattedCC = formatEmails(cc);
    if (formattedCC) {
      mailOptions.cc = formattedCC;
    }

    // ✅ Add BCC only if exists
    const formattedBCC = formatEmails(bcc);
    if (formattedBCC) {
      mailOptions.bcc = formattedBCC;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT:", info.response);
    return info;

  } catch (error) {
    console.error("❌ EMAIL FAILED:", error);
    throw error;
  }
}

// ================== EXPORTS ==================
module.exports = {
  getMeetingRecipients,
  sendMail,
};