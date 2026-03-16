const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const dashboardController = require("../controllers/dashboard.controller");

// New API Route
router.get('/recent-meetings', authMiddleware, dashboardController.getRecentMeetings);
router.get("/summary", authMiddleware, dashboardController.getSummary);
router.get("/today", authMiddleware, dashboardController.getTodayMeetings);
router.get("/actions/pending", authMiddleware, dashboardController.getPendingActions);

module.exports = router;