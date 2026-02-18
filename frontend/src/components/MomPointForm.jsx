import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: "24px",
  },
  agendaSection: {
    maxWidth: "1200px",
    margin: "0 auto 32px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  agendaTitle: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#1e293b",
    margin: "0 0 24px 0",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  agendaItems: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  agendaItem: {
    padding: "20px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    borderRadius: "16px",
    borderLeft: "4px solid #3b82f6",
  },
  meetingHeader: {
    maxWidth: "1200px",
    margin: "0 auto 32px auto",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "32px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  },
  meetingTitle: {
    fontSize: "40px",
    fontWeight: "900",
    color: "white",
    margin: "0 0 20px 0",
    letterSpacing: "-0.02em",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.2)",
    padding: "20px 24px",
    borderRadius: "20px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  statValue: { fontSize: "28px", fontWeight: "900", color: "white", marginBottom: "4px" },
  statLabel: { fontSize: "14px", color: "rgba(255,255,255,0.9)", fontWeight: "700" },
  pointsContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  addPointBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    padding: "20px 36px",
    border: "none",
    borderRadius: "20px",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)",
    marginBottom: "32px",
    width: "100%",
  },
  pointCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(25px)",
    borderRadius: "28px",
    padding: "36px",
    marginBottom: "28px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    position: "relative",
    overflow: "hidden",
  },
  pointNumber: {
    position: "absolute",
    top: "28px",
    right: "28px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "900",
  },
  formContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    marginBottom: "32px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 24px 0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "15px",
    background: "#fafbfc",
    transition: "border-color 0.2s ease",
  },
  textarea: {
    padding: "14px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "15px",
    background: "#fafbfc",
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  formActions: {
    display: "flex",
    gap: "16px",
    justifyContent: "flex-end",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    padding: "14px 28px",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#64748b",
    padding: "14px 28px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
  loadingSpinner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
    color: "white",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "6px solid rgba(255,255,255,0.2)",
    borderTop: "6px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "24px",
  },
  errorCard: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "white",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "24px",
    borderLeft: "4px solid #ef4444",
    textAlign: "center",
  },
};

export default function MomPointForm({ meetingId, token }) {
  const [momPoints, setMomPoints] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    topic: "",
    point: "",
    decisions: "",
    assigned_to: [],
    timeline: "",
    status: "Assigned",
  });

  // ✅ COMPLETE API FUNCTIONS
  const fetchData = useCallback(async () => {
    if (!meetingId || !token) return;
    
    setLoading(true);
    setError("");
    
    try {
      console.log("🔄 Fetching data for meeting:", meetingId);
      
      // Fetch meeting details
      const meetingRes = await fetch(`${API_URL}/api/meetings/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch MOM points
      const momRes = await fetch(`${API_URL}/api/mom/meeting/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch employees
      const empRes = await fetch(`${API_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const meetingData = await meetingRes.json();
      const momData = await momRes.json();
      const empData = await empRes.json();
      
      setMeeting(meetingData.data || meetingData);
      setMomPoints(momData.data || momData || []);
      setEmployees(empData.data || empData || []);
      
      console.log("✅ Data loaded:", {
        meeting: meetingData.data?.title,
        points: momData.data?.length || 0,
        employees: empData.data?.length || 0
      });
      
    } catch (err) {
      console.error("💥 Fetch error:", err);
      setError("Failed to load meeting data");
    } finally {
      setLoading(false);
      setEmployeeLoading(false);
    }
  }, [meetingId, token]);

// ✅ ADD THIS
useEffect(() => {
  fetchData();
}, [fetchData]);

  // ✅ Form handling functions
  const handleSave = async () => {
    if (!formData.topic.trim() || !formData.point.trim() || !formData.assigned_to.length) {
      setError("Please fill all required fields");
      return;
    }
    
   // setLoading(true);
    setError("");
    
    try {
      const url = editingId ? `${API_URL}/api/mom/${editingId}` : `${API_URL}/api/mom`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          meeting_id: parseInt(meetingId),
          topic: formData.topic.trim(),
          point: formData.point.trim(),
          decisions: formData.decisions.trim() || null,
          assigned_to: formData.assigned_to,
          timeline: formData.timeline || null,
          status: formData.status,
        }),
      });
      
      if (res.ok) {
        setFormData({
          topic: "", point: "", decisions: "", assigned_to: [], timeline: "", status: "Assigned"
        });
        setIsAdding(false);
        setEditingId(null);
        fetchData();
      } else {
        setError("Failed to save action item");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (point) => {
    setFormData({
      topic: point.topic || "",
      point: point.point || "",
      decisions: point.decisions || "",
      assigned_to: Array.isArray(point.assigned_to) ? point.assigned_to : [],
      timeline: point.timeline || "",
      status: point.status || "Assigned",
    });
    setEditingId(point.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this action item?")) {
      try {
        await fetch(`${API_URL}/api/mom/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (err) {
        setError("Failed to delete");
      }
    }
  };

  const updateStatus = async (pointId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/mom/${pointId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      setError("Failed to update status");
    }
  };

  // Utility functions
  const getStatusIcon = (status) => {
    const icons = {
      "Assigned": "📋",
      "In Progress": "🔄",
      "Completed": "✅",
      "Revoked": "❌"
    };
    return icons[status] || "📋";
  };

  const getStatusStyle = (status) => {
    const colors = {
      "Assigned": { bg: "#dbeafe", color: "#1e40af" },
      "In Progress": { bg: "#fef3c7", color: "#a16207" },
      "Completed": { bg: "#dcfce7", color: "#166534" },
      "Revoked": { bg: "#fecaca", color: "#b91c1c" }
    };
    return colors[status] || colors.Assigned;
  };

  const getEmployeeNames = (assignedIds) => {
    if (!Array.isArray(assignedIds) || !assignedIds.length) return "Unassigned";
    return assignedIds.slice(0, 2)
      .map(id => employees.find(e => e.EmployeeID == id)?.EmployeeName || `ID:${id}`)
      .join(", ") + (assignedIds.length > 2 ? ` +${assignedIds.length-2}` : "");
  };

  const employeeOptions = employees.map(employee => ({
    value: employee.EmployeeID,
    label: `${employee.EmployeeName}${employee.Department ? ` (${employee.Department})` : ""}`
  }));

  // Loading state
  if (loading) {
    return (
      <div style={styles.app}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner} />
          <div style={{ fontSize: "18px", fontWeight: "600" }}>
            Loading meeting agenda & action items...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* AGENDA SECTION */}
      <div style={styles.agendaSection}>
        <h2 style={styles.agendaTitle}>📋 Meeting Agenda</h2>
        {meeting?.agenda_items ? (
          <div style={styles.agendaItems}>
            {meeting.agenda_items.map((item, index) => (
              <div key={index} style={styles.agendaItem}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
                  {index + 1}. {item}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            📄 Agenda will be available after meeting creation
          </div>
        )}
      </div>

      {/* MEETING HEADER */}
      <div style={styles.meetingHeader}>
        <h1 style={styles.meetingTitle}>
          Minutes of Meeting #{meetingId?.toString().padStart(6, "0")}
        </h1>
        {meeting && (
          <div>
            <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", marginBottom: "20px" }}>
              {meeting.title || "Untitled Meeting"}
            </div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{momPoints.length}</div>
                <div style={styles.statLabel}>Action Items</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{employees.length}</div>
                <div style={styles.statLabel}>Team Members</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{meeting.department_name || "N/A"}</div>
                <div style={styles.statLabel}>Department</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.pointsContainer}>
        {error && (
          <div style={styles.errorCard}>
            ⚠️ {error}
          </div>
        )}

        {/* ADD/EDIT FORM */}
        {isAdding && (
          <div style={styles.formContainer}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={styles.formTitle}>
                {editingId ? "✏️ Edit Action Item" : "➕ New Action Item"}
              </h2>
              <div style={styles.formActions}>
                <button 
                  style={styles.secondaryBtn} 
                  onClick={() => {setIsAdding(false); setEditingId(null);}} 
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  style={styles.primaryBtn} 
                  onClick={handleSave} 
                  disabled={loading}
                >
                  {loading ? "⏳ Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Topic *</label>
                <input 
                  style={styles.input} 
                  value={formData.topic} 
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  placeholder="Discussion topic"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Assignees *</label>
                <Select 
                  isMulti 
                  options={employeeOptions}
                  value={employeeOptions.filter(opt => formData.assigned_to.includes(opt.value))}
                  onChange={selected => setFormData({...formData, assigned_to: selected ? selected.map(s => s.value) : []})}
                  placeholder="Select team members"
                  isLoading={employeeLoading}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Due Date</label>
                <input 
                  type="date" 
                  style={styles.input} 
                  value={formData.timeline} 
                  onChange={e => setFormData({...formData, timeline: e.target.value})}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Status</label>
                <select 
                  style={styles.input} 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Revoked</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Discussion Points *</label>
              <textarea 
                style={styles.textarea} 
                value={formData.point} 
                onChange={e => setFormData({...formData, point: e.target.value})}
                placeholder="What was discussed in detail?"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Decisions</label>
              <textarea 
                style={styles.textarea} 
                value={formData.decisions} 
                onChange={e => setFormData({...formData, decisions: e.target.value})}
                placeholder="Final decisions & resolutions"
              />
            </div>
          </div>
        )}

        {/* ACTION ITEMS LIST */}
        {!isAdding && (
          <button style={styles.addPointBtn} onClick={() => setIsAdding(true)}>
            ➕ Create New Action Item
          </button>
        )}

        {momPoints.length === 0 && !isAdding && !loading ? (
          <div style={{
            textAlign: "center",
            padding: "80px 40px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "24px",
            color: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "24px", opacity: 0.7 }}>📝</div>
            <h3 style={{ fontSize: "24px", margin: "0 0 12px 0" }}>No action items yet</h3>
            <p style={{ fontSize: "16px", marginBottom: "32px" }}>
              Meeting outcomes will appear here once action items are created
            </p>
          </div>
        ) : (
          momPoints.map((point) => (
            <div key={point.id} style={styles.pointCard}>
              <div style={styles.pointNumber}>#{point.id.toString().padStart(6, "0")}</div>
              
              <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "24px" }}>
                <div style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: getStatusStyle(point.status).bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  flexShrink: 0,
                }}>
                  {getStatusIcon(point.status)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: "26px",
                    fontWeight: "900",
                    color: "#1a1a2e",
                    margin: "0 0 12px 0",
                    lineHeight: "1.3",
                  }}>
                    {point.topic}
                  </h3>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "20px",
                  }}>
                    <div style={{
                      padding: "8px 16px",
                      background: getStatusStyle(point.status).bg,
                      color: getStatusStyle(point.status).color,
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "700",
                    }}>
                      {point.status}
                    </div>
                    
                    <div style={{
                      fontSize: "15px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}>
                      👥 {getEmployeeNames(point.assigned_to)}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    style={{
                      padding: "12px 20px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                    onClick={() => handleEdit(point)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    style={{
                      padding: "12px 20px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                    onClick={() => handleDelete(point.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* DISCUSSION */}
              <div style={{
                padding: "24px",
                background: "rgba(248, 250, 252, 0.8)",
                borderRadius: "20px",
                borderLeft: "5px solid #f59e0b",
                marginBottom: "20px",
              }}>
                <div style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#92400e",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}>
                  📋 Discussion
                </div>
                <div style={{ color: "#374151", lineHeight: "1.8", fontSize: "16px" }}>
                  {point.point}
                </div>
              </div>

              {/* DECISION */}
              {point.decisions && (
                <div style={{
                  padding: "24px",
                  background: "rgba(220, 252, 231, 0.8)",
                  borderRadius: "20px",
                  borderLeft: "5px solid #10b981",
                  marginBottom: "28px",
                }}>
                  <div style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#166534",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}>
                    ✅ Decision
                  </div>
                  <div style={{ color: "#14532d", lineHeight: "1.8", fontSize: "16px", fontWeight: "500" }}>
                    {point.decisions}
                  </div>
                </div>
              )}

              {/* ACTION BAR */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "24px",
                borderTop: "2px solid #f1f5f9",
              }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", marginBottom: "4px" }}>
                    Due Date
                  </div>
                  <div style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: point.timeline && new Date(point.timeline) < new Date() ? "#ef4444" : "#10b981",
                  }}>
                    {point.timeline ? new Date(point.timeline).toLocaleDateString('en-IN') : "ASAP"}
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "12px" }}>
                  {["In Progress", "Completed", "Revoked"].map(status => (
                    <button
                      key={status}
                      style={{
                        padding: "14px 24px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "14px",
                        background: "white",
                        color: "#64748b",
                        fontWeight: "700",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        ...(point.status === status ? {
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                          borderColor: "#10b981",
                          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
                          transform: "translateY(-2px)",
                        } : {}),
                      }}
                      onClick={() => updateStatus(point.id, status)}
                    >
                      {status === "In Progress" ? "🔄 Progress" : 
                       status === "Completed" ? "✅ Done" : "❌ Revoke"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
