import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "3rem 2.5rem",
    borderRadius: "24px",
    marginBottom: "2.5rem",
    boxShadow: "0 25px 50px rgba(102, 118, 241, 0.4)",
  },
  pageTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.025em",
  },
  headerStats: {
    display: "flex",
    gap: "2rem",
    fontSize: "1.1rem",
    opacity: 0.95,
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "2.5rem",
  },
  tasksSection: {
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  sectionHeader: {
    padding: "2.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
  },
  tasksGrid: {
    padding: "2.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
    gap: "2rem",
  },
  sidebar: {
    background: "white",
    borderRadius: "24px",
    padding: "2.5rem",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },
  statusFilter: {
    marginBottom: "2rem",
  },
  statusBtn: {
    padding: "0.75rem 1.5rem",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    background: "white",
    color: "#64748b",
    fontWeight: "600",
    cursor: "pointer",
    marginRight: "1rem",
    transition: "all 0.2s ease",
  },
  statusBtnActive: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    borderColor: "#10b981",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  taskCard: {
    padding: "2.5rem",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    background: "linear-gradient(145deg, #ffffff, #f8fafc)",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  taskNumber: {
    background: "#667eea",
    color: "white",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
  },
  taskTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 0.5rem 0",
    lineHeight: 1.3,
  },
  taskMeta: {
    color: "#64748b",
    fontSize: "0.95rem",
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statusButtons: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1.5rem",
    flexWrap: "wrap",
  },
  statusActionBtn: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    flex: "1",
    minWidth: "120px",
  },
  btnInProgress: {
    background: "#fef3c7",
    color: "#a16207",
    border: "2px solid #fcd34d",
  },
  btnCompleted: {
    background: "#dcfce7",
    color: "#166534",
    border: "2px solid #86efac",
  },
  btnCurrent: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  emptyState: {
    textAlign: "center",
    padding: "6rem 2rem",
    color: "#64748b",
  },
};

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, assigned, in-progress, completed
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  

  const fetchMyTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Get user's ID from token (decode JWT or fetch profile)
      const userRes = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setUserId(userData.EmployeeID);

      // Fetch MY assigned tasks
      const tasksRes = await fetch(`${API_URL}/api/mom/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasksData = await tasksRes.json();
      
      if (tasksData.success) {
        setTasks(tasksData.data || []);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status.toLowerCase().replace(" ", "-") === filter;
  });

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/mom/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchMyTasks(); // Refresh list
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Assigned": "📋",
      "In Progress": "🔄",
      "Completed": "✅",
      "Revoked": "❌"
    };
    return icons[status] || "📋";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>🎯 My Tasks</h1>
        <div style={styles.headerStats}>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.5rem 1rem", borderRadius: "20px", fontWeight: "600" }}>
            {filteredTasks.length} Active Tasks
          </span>
          <span>Updated {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* TASKS GRID */}
        <div style={styles.tasksSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Assigned Tasks</h2>
            <div style={styles.statusFilter}>
              {["all", "assigned", "in-progress", "completed"].map(status => (
                <button
                  key={status}
                  style={{
                    ...styles.statusBtn,
                    ...(filter === status && styles.statusBtnActive)
                  }}
                  onClick={() => setFilter(status)}
                >
                  {status.replace("-", " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.tasksGrid}>
            {loading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #e2e8f0",
                  borderTop: "4px solid #667eea",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 2rem"
                }} />
                <div>Loading tasks...</div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: "64px", marginBottom: "2rem", opacity: 0.5 }}>🎯</div>
                <h3 style={{ fontSize: "2rem", color: "#1a1a2e", margin: "0 0 1rem" }}>
                  No tasks {filter !== "all" && `in "${filter.replace("-", " ")}"`} status
                </h3>
                <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
                  Tasks will appear here when assigned to you from meetings.
                </p>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskHeader}>
                    <div style={styles.taskNumber}>{index + 1}</div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusStyle(task.status).bg,
                      color: getStatusStyle(task.status).color,
                      padding: "0.5rem 1rem",
                      fontSize: "0.85rem"
                    }}>
                      {getStatusIcon(task.status)} {task.status}
                    </div>
                  </div>

                  <h3 style={styles.taskTitle}>{task.topic}</h3>
                  
                  <div style={styles.taskMeta}>
                    <span>📅 {new Date(task.meeting_date).toLocaleDateString('en-IN')}</span>
                    <span>📋 {task.meeting_title || "Meeting #" + task.meeting_id}</span>
                    {task.timeline && <span>Due: {task.timeline}</span>}
                  </div>

                  <div style={{
                    padding: "1.5rem",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    borderLeft: "4px solid #667eea",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "0.75rem" }}>
                      💬 Discussion
                    </div>
                    <p style={{ margin: 0, lineHeight: "1.6", color: "#475569" }}>
                      {task.point}
                    </p>
                  </div>

                  {task.decisions && (
                    <div style={{
                      padding: "1.5rem",
                      background: "#f0f9ff",
                      borderRadius: "12px",
                      borderLeft: "4px solid #3b82f6",
                      marginBottom: "1.5rem"
                    }}>
                      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "0.75rem" }}>
                        ✅ Decisions
                      </div>
                      <p style={{ margin: 0, fontWeight: "500", lineHeight: "1.6" }}>
                        {task.decisions}
                      </p>
                    </div>
                  )}

                  <div style={styles.statusButtons}>
                    <button
                      style={{
                        ...styles.statusActionBtn,
                        ...styles.btnInProgress,
                        ...(task.status === "In Progress" && styles.btnCurrent)
                      }}
                      onClick={() => updateTaskStatus(task.id, "In Progress")}
                      disabled={loading}
                    >
                      🔄 Mark In Progress
                    </button>
                    <button
                      style={{
                        ...styles.statusActionBtn,
                        ...styles.btnCompleted,
                        ...(task.status === "Completed" && styles.btnCurrent)
                      }}
                      onClick={() => updateTaskStatus(task.id, "Completed")}
                      disabled={loading}
                    >
                      ✅ Mark Completed
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1.5rem" }}>
            📊 Task Summary
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <TaskStat label="Total Assigned" value={tasks.length} color="#667eea" />
            <TaskStat label="In Progress" value={tasks.filter(t => t.status === "In Progress").length} color="#f59e0b" />
            <TaskStat label="Completed" value={tasks.filter(t => t.status === "Completed").length} color="#10b981" />
            <TaskStat label="Overdue" value={tasks.filter(t => t.timeline && new Date(t.timeline) < new Date() && t.status !== "Completed").length} color="#ef4444" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility Components
const TaskStat = ({ label, value, color }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: `${color}15`,
    borderRadius: "12px",
    borderLeft: `4px solid ${color}`
  }}>
    <span style={{ color: "#64748b", fontWeight: "500" }}>{label}</span>
    <span style={{ fontSize: "1.5rem", fontWeight: "700", color }}>{value}</span>
  </div>
);

const getStatusStyle = (status) => {
  const colors = {
    "Assigned": { bg: "#dbeafe", color: "#1e40af" },
    "In Progress": { bg: "#fef3c7", color: "#a16207" },
    "Completed": { bg: "#dcfce7", color: "#166534" },
    "Revoked": { bg: "#fecaca", color: "#b91c1c" }
  };
  return colors[status] || colors.Assigned;
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-employee-dashboard]')) {
  styleSheet.setAttribute('data-employee-dashboard', 'true');
  document.head.appendChild(styleSheet);
}


