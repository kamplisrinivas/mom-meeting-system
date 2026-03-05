const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

const reportController = require("../controllers/reportController");

/* ================= PUBLIC REPORT ROUTES (No token needed) ================= */
router.get("/department", reportController.getDepartmentReport);
router.get("/user-workload", reportController.getUserWorkload);
router.get("/overdue", reportController.getOverdueTasks);
router.get("/summary", reportController.getSummaryReport);
router.get("/meetings", reportController.getMeetingsReport);

/* ================= PROTECTED REPORT ROUTES (Token required) ================= */
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const [[totalMeetings]] = await db.query(`SELECT COUNT(*) as count FROM meetings`);
    const [[totalTasks]] = await db.query(`SELECT COUNT(*) as count FROM mom_points`);
    const [[completedTasks]] = await db.query(`
      SELECT COUNT(*) as count 
      FROM mom_points 
      WHERE status='Completed'
    `);
    const [[pendingActions]] = await db.query(`
      SELECT COUNT(*) as count 
      FROM mom_points 
      WHERE status!='Completed'
    `);
    const [[overdue]] = await db.query(`
      SELECT COUNT(*) as count 
      FROM mom_points
      WHERE timeline < CURDATE()
      AND status!='Completed'
    `);
    const [departmentStats] = await db.query(`
      SELECT department, COUNT(*) meeting_count
      FROM meetings
      GROUP BY department
    `);
    const [userWorkload] = await db.query(`
      SELECT assigned_to user_id, COUNT(*) task_count
      FROM mom_points
      GROUP BY assigned_to
    `);

    const completionRate = totalTasks.count === 0
      ? 0
      : Math.round((completedTasks.count / totalTasks.count) * 100);

    res.json({
      success: true,
      data: {
        totalMeetings: totalMeetings.count,
        totalTasks: totalTasks.count,
        completedTasks: completedTasks.count,
        pendingActions: pendingActions.count,
        overdueItems: overdue.count,
        completionRate,
        departmentStats,
        userWorkload
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Report generation failed" });
  }
});

router.get("/meeting-details", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.id,
        m.title,
        m.meeting_date,
        m.department,
        mp.topic,
        mp.point,
        mp.decisions,
        mp.timeline,
        mp.status,
        e.EmployeeName as assigned_to
      FROM meetings m
      LEFT JOIN mom_points mp ON m.id = mp.meeting_id
      LEFT JOIN employees e ON e.EmployeeID = REPLACE(REPLACE(mp.assigned_to,'[',''),']','')
      ORDER BY m.meeting_date DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Report generation failed" });
  }
});

module.exports = router;