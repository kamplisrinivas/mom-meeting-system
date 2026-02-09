const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get("/summary", authMiddleware, dashboardController.getSummary);
router.get("/today", authMiddleware, dashboardController.getTodayMeetings);
router.get("/actions/pending", authMiddleware, dashboardController.getPendingActions);

module.exports = router;