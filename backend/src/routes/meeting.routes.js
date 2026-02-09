const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const meetingController = require("../controllers/meeting.controller");

/**
 * CREATE MEETING
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      meeting_date,
      meeting_time,
      department_id,
      meeting_type,
      platform,
      venue
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO meetings 
      (title, meeting_date, meeting_time, department_id, meeting_type, platform, venue, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        meeting_date,
        meeting_time,
        department_id,
        meeting_type,
        platform,
        venue,
        req.user.id
      ]
    );

    res.json({
      success: true,
      message: "Meeting created successfully",
      meeting_id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// CREATE MEETING (ADMIN)
router.post("/", authMiddleware, meetingController.createMeeting);

/**
 * LIST MEETINGS
 */

router.get("/", authMiddleware, meetingController.getAllMeetings);
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, d.name AS department_name
       FROM meetings m
       LEFT JOIN departments d ON d.id = m.department_id
       ORDER BY m.meeting_date DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;