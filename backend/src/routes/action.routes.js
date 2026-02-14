const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const actionController = require("../controllers/action.controller");

// Create action item
router.post("/", authMiddleware, actionController.createActionItem);

// Get all action items for a meeting
router.get("/meeting/:meetingId", authMiddleware, actionController.getActionItemsByMeeting);

// Update action item by ID
router.put("/:id", authMiddleware, actionController.updateActionItem);

// Delete action item by ID
router.delete("/:id", authMiddleware, actionController.deleteActionItem);

module.exports = router;