const nodemailer = require("nodemailer");
const db = require("../config/db");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔥 helper: extract employee id from "2098 - NAME"
function extractEmpId(text) {
  if (!text) return null;
  const match = text.match(/^(\d+)/);
  return match ? match[1] : null;
}

// 🔥 get email of superior/HOD
async function getEmployeeEmailById(empId) {
  if (!empId) return null;

  const [rows] = await db.query(
    `SELECT CompanyEmail FROM employees WHERE EmployeeID = ?`,
    [empId]
  );

  return rows.length ? rows[0].CompanyEmail : null;
}

// 🔥 main function to get recipients
async function getMeetingRecipients(department) {
  const [employees] = await db.query(
    `SELECT * FROM employees WHERE Department = ?`,
    [department]
  );

  const emailSet = new Set();

  for (const emp of employees) {
    // employee email
    if (emp.CompanyEmail) emailSet.add(emp.CompanyEmail);
    if (emp.PersonalEmail) emailSet.add(emp.PersonalEmail);

    // superior email
    const supId = extractEmpId(emp.SuperiorName);
    const supEmail = await getEmployeeEmailById(supId);
    if (supEmail) emailSet.add(supEmail);

    // HOD email
    const hodId = extractEmpId(emp.HODName);
    const hodEmail = await getEmployeeEmailById(hodId);
    if (hodEmail) emailSet.add(hodEmail);
  }

  return [...emailSet];
}

// ✅ SEND EMAIL
async function sendMail(to, subject, html) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

module.exports = {
  getMeetingRecipients,
  sendMail,
};