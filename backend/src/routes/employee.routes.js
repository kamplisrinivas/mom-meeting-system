const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getEmployees, getDepartments } = require("../controllers/employee.controller");

// ✅ EMPLOYEES LIST
router.get("/", authMiddleware, getEmployees);

// ✅ DEPARTMENTS LIST (for dropdown)
router.get("/departments", authMiddleware, getDepartments);

module.exports = router;
