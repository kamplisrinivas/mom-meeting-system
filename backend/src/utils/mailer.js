require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.rediffmailpro.com",
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: true,

  // ⭐⭐⭐ THIS FIXES REDIFF
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

// verify
transporter.verify(function (error) {
  if (error) {
    console.error("❌ SMTP connection error:", error.message);
  } else {
    console.log("✅ SMTP server is ready");
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"SLRM MIS ERP" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;