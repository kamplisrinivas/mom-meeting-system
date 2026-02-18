const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const momController = require("../controllers/mom.controller");

// ✅ Create a new MOM point
router.post("/", authMiddleware, momController.createMomPoint);

// ✅ Get all MOM points for a specific meeting
router.get("/meeting/:meetingId", authMiddleware, momController.getMomByMeeting);

// ✅ Update a MOM point by ID
router.put("/:id", authMiddleware, momController.updateMomPoint);

// ✅ Delete a MOM point by ID
router.delete("/:id", authMiddleware, momController.deleteMomPoint);

// ✅ NEW: Get MY assigned tasks (Employee Dashboard)
router.get("/my-tasks", authMiddleware, momController.getMyTasks);

// ✅ NEW: Update task status only (Employee status buttons)
router.put("/:id/status", authMiddleware, momController.updateStatus);

module.exports = router;
