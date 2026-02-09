const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const actionController = require("../controllers/action.controller");

// CREATE ACTION ITEM
router.post("/", authMiddleware, actionController.createActionItem);

// UPDATE ACTION STATUS
router.put("/:id/status", authMiddleware, actionController.updateActionStatus);

module.exports = router;