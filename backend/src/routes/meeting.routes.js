const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ DESTRUCTURE - Perfect import
const { createMeeting, getAllMeetings } = require("../controllers/meeting.controller");

// ✅ ROUTES WORK 100%
router.post("/", authMiddleware, createMeeting);
router.get("/", authMiddleware, getAllMeetings);

module.exports = router;
