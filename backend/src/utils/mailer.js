require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.rediffmailpro.com",
  port: Number(process.env.EMAIL_PORT) || 587, // 465 for secure true
  secure: false, // MUST be true for 465
  name: "slrm.in",
  helo: "slrm.in",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection on server start
transporter.verify(function (error) {
  if (error) {
    console.error("❌ SMTP connection error:", error.message);
  } else {
    console.log("✅ SMTP server is ready");
  }
});

// Clean reusable sendEmail function
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"SLRM MIS ERP" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;