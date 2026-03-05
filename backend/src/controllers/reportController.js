const db = require("../config/db");




/* ================= MEETING REPORT ================= */
exports.getMeetingsReport = async (req, res) => {
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
  GROUP_CONCAT(e.EmployeeName SEPARATOR ', ') as assigned_to_names
FROM meetings m
LEFT JOIN mom_points mp ON m.id = mp.meeting_id
LEFT JOIN employees e ON FIND_IN_SET(e.EmployeeID, REPLACE(REPLACE(mp.assigned_to,'[',''),']',''))
GROUP BY m.id, mp.id
ORDER BY m.meeting_date DESC
`);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false,message:"Report generation failed"});
  }
};

/* ================= DEPARTMENT REPORT ================= */

exports.getDepartmentReport = async (req,res)=>{
  try{

    const [rows] = await db.query(`
      SELECT 
        department,
        COUNT(*) as total_meetings
      FROM meetings
      GROUP BY department
    `);

    res.json({success:true,data:rows});

  }catch(err){
    res.status(500).json({success:false,message:"Report generation failed"});
  }
};

/* ================= USER WORKLOAD ================= */

exports.getUserWorkload = async (req,res)=>{
  try{

    const [rows] = await db.query(`
      SELECT 
        assigned_to as user_id,
        COUNT(*) as total_tasks
      FROM mom_points
      GROUP BY assigned_to
    `);

    res.json({success:true,data:rows});

  }catch(err){
    res.status(500).json({success:false,message:"Report generation failed"});
  }
};

/* ================= OVERDUE TASKS ================= */

exports.getOverdueTasks = async (req,res)=>{
  try{

    const [rows] = await db.query(`
      SELECT 
        id,
        meeting_id,
        topic,
        point,
        timeline,
        status
      FROM mom_points
      WHERE timeline < CURDATE()
      AND status != 'Completed'
    `);

    res.json({success:true,data:rows});

  }catch(err){
    res.status(500).json({success:false,message:"Report generation failed"});
  }
};

/* ================= SUMMARY REPORT ================= */

exports.getSummaryReport = async (req,res)=>{
  try{

    const [[meetings]] = await db.query(`SELECT COUNT(*) as totalMeetings FROM meetings`);
    const [[tasks]] = await db.query(`SELECT COUNT(*) as totalTasks FROM mom_points`);
    const [[completed]] = await db.query(`SELECT COUNT(*) as completedTasks FROM mom_points WHERE status='Completed'`);

    res.json({
      success:true,
      data:{
        totalMeetings:meetings.totalMeetings,
        totalTasks:tasks.totalTasks,
        completedTasks:completed.completedTasks
      }
    });

  }catch(err){
    res.status(500).json({success:false,message:"Report generation failed"});
  }
};

exports.getReports = async (req, res) => {
  try {

    const { fromDate, toDate } = req.query;

    let dateFilter = "";
    let params = [];

    if (fromDate && toDate) {
      dateFilter = "WHERE meeting_date BETWEEN ? AND ?";
      params = [fromDate, toDate];
    }

    const [[totalMeetings]] = await db.execute(
      `SELECT COUNT(*) as total FROM meetings ${dateFilter}`,
      params
    );

    const [[pendingActions]] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM mom_points 
      WHERE status!='Completed'
    `);

    const [[completedActions]] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM mom_points 
      WHERE status='Completed'
    `);

    const [deptMeetings] = await db.execute(`
      SELECT department, COUNT(*) as total
      FROM meetings
      GROUP BY department
    `);

    const [employeeTasks] = await db.execute(`
      SELECT assigned_to as employee, COUNT(*) as total
      FROM mom_points
      GROUP BY assigned_to
    `);

    const [pendingTasks] = await db.execute(`
      SELECT 
        m.title as meeting,
        p.point as task,
        p.assigned_to,
        p.timeline,
        p.status
      FROM mom_points p
      JOIN meetings m ON p.meeting_id = m.id
      WHERE p.status != 'Completed'
    `);

    const productivity =
      completedActions.total + pendingActions.total === 0
        ? 0
        : Math.round(
            (completedActions.total /
              (completedActions.total + pendingActions.total)) * 100
          );

    res.json({
      success: true,
      data: {
        totalMeetings: totalMeetings.total,
        pendingActions: pendingActions.total,
        completedActions: completedActions.total,
        productivity,
        deptMeetings,
        employeeTasks,
        pendingTasks
      }
    });

  } catch (error) {

    console.error("Report error:", error);

    res.status(500).json({
      success: false,
      message: "Report generation failed"
    });

  }
};