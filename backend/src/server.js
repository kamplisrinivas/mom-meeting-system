require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
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

// Health check
app.get("/", (req, res) => {
  res.send("MOM Backend API is running 🚀");
});

// DB test
app.get("/db-test", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ success: true, message: "MySQL connected" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Protected test
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 🚨 THIS IS CRITICAL
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});