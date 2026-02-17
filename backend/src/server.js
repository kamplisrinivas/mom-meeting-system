require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

/* ================= MIDDLEWARE FIRST ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */

const departmentRoutes = require("./routes/department.routes");
app.use("/api/departments", departmentRoutes);

const employeeRoutes = require("./routes/employee.routes");
app.use("/api/employees", employeeRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

const meetingRoutes = require("./routes/meeting.routes");
app.use("/api/meetings", meetingRoutes);

const momRoutes = require("./routes/mom.routes");
app.use("/api/mom", momRoutes);

const actionRoutes = require("./routes/action.routes");
app.use("/api/actions", actionRoutes);

const dashboardRoutes = require("./routes/dashboard.routes");
app.use("/api/dashboard", dashboardRoutes);


/* ================= TEST ROUTES ================= */

app.get("/", (req, res) => {
  res.send("MOM Backend API is running 🚀");
});

app.get("/db-test", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ success: true, message: "MySQL connected" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});