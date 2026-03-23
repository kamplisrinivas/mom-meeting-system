require("dotenv").config(); // MUST be first line

const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://192.168.11.175:5173",
      "http://127.0.0.1:5173"
    ];
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Crucial if you are passing Bearer tokens in headers
}));

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/departments", require("./routes/department.routes"));
app.use("/api/employees", require("./routes/employee.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/meetings", require("./routes/meeting.routes"));
app.use("/api/mom", require("./routes/mom.routes"));
app.use("/api/actions", require("./routes/action.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api", require("./routes/dashboard.routes"));

const rescheduleRoutes = require("./routes/reschedule.routes");
app.use("/api/reschedule", rescheduleRoutes);
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://192.168.11.175:${PORT}`);
});