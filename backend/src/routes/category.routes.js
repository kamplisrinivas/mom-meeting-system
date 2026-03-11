// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/authMiddleware"); // Named here

// Change 'protect' to 'authMiddleware' to match line 4
router.get("/", authMiddleware, getAllCategories); 

module.exports = router;