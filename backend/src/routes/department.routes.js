const express = require("express");
const router = express.Router();
const { getDepartments } = require("../controllers/department.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getDepartments);

module.exports = router;