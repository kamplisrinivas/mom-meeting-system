const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const meetingController = require("../controllers/meeting.controller");

console.log("meetingController loaded:", Object.keys(meetingController));

// ✅ ALL ROUTES - NO CONDUCTED BY
router.get("/", authMiddleware, meetingController.getMeetings);
router.post("/", authMiddleware, meetingController.createMeeting);
router.get("/:id", authMiddleware, meetingController.getMeetingById);
router.put("/:id", authMiddleware, meetingController.updateMeeting);
router.delete("/:id", authMiddleware, meetingController.deleteMeeting);

module.exports = router;
