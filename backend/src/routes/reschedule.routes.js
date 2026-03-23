const express = require("express");
const router = express.Router();
const rescheduleController = require("../controllers/reschedule.controller");

// --- ADD THIS LINE ---
// Adjust the path to where your auth middleware actually lives
const authMiddleware = require("../middlewares/authMiddleware"); 

// Now these will work
router.get("/list", authMiddleware, rescheduleController.getRescheduleList);
router.get("/:id", authMiddleware, rescheduleController.getMeetingById);
router.put("/:id", authMiddleware, rescheduleController.updateMeetingSchedule);

module.exports = router;