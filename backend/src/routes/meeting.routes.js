const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const meetingController = require("../controllers/meeting.controller");

/**
 * =====================================
 * CREATE MEETING (with email notification)
 * =====================================
 */
router.post("/", authMiddleware, meetingController.createMeeting);

/**
 * =====================================
 * LIST MEETINGS
 * =====================================
 */
router.get("/", authMiddleware, meetingController.getAllMeetings);

module.exports = router;