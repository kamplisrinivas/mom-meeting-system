const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const momController = require("../controllers/mom.controller");

router.post("/", authMiddleware, momController.createMomPoint);
router.get("/meeting/:meetingId", authMiddleware, momController.getMomByMeeting);

module.exports = router;