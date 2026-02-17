import { useState, useEffect, useCallback } from "react";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const styles = {
  app: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    overflow: "hidden",
  },
  header: {
    background: "white",
    borderRadius: "0 0 20px 20px",
    padding: "24px 32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a1a2e",
    margin: "0 0 12px 0",
  },
  metaInfo: { 
    display: "flex", 
    gap: "24px", 
    color: "#64748b",
    fontSize: "14px",
  },
  mainContent: {
    flex: 1,
    overflow: "hidden",
    padding: "24px 32px",
    display: "flex",
    flexDirection: "column",
  },
  errorNotification: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #fecaca",
    flexShrink: 0,
  },
  formContainer: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    marginBottom: "24px",
    maxHeight: "40vh",
    overflowY: "auto",
  },
  scrollableList: {
    flex: 1,
    overflowY: "auto",
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
  },
  listTitle: { 
    fontSize: "22px", 
    fontWeight: "700", 
    color: "#1a1a2e", 
    margin: 0 
  },
  addBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid #f1f5f9",
  },
  formTitle: { 
    fontSize: "20px", 
    fontWeight: "700", 
    color: "#1a1a2e", 
    margin: 0 
  },
  formActions: { 
    display: "flex", 
    gap: "12px" 
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #8B0000, #A52A2A)",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#64748b",
    padding: "12px 20px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontWeight: "500",
    cursor: "pointer",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  formLabel: { 
    fontSize: "13px", 
    fontWeight: "600", 
    color: "#374151" 
  },
  input: {
    padding: "12px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    background: "#fafbfc",
  },
  textarea: {
    padding: "12px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    background: "#fafbfc",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  selectStyles: {
    control: (provided) => ({
      ...provided,
      minHeight: "48px",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      boxShadow: "none",
    }),
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 40px",
    color: "#64748b",
  },
  statusBadge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  editAction: {
    padding: "6px 12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px"
  },
  required: { color: "#ef4444" }
};

export default function MomPointForm({ meetingId, token }) {
  const [momPoints, setMomPoints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    topic: "", 
    point: "", 
    decisions: "", 
    assigned_to: [], 
    timeline: "", 
    status: "Assigned"
  });

  // ✅ PERFECTLY FIXED fetchEmployees
  const fetchEmployees = useCallback(async () => {
    console.log("🔄 Fetching employees...", !!token);
    if (!token) {
      console.log("❌ No token");
      return;
    }
    
    setEmployeeLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📡 Status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log("📋 Employees data:", data);
      
      if (data.success && Array.isArray(data.data)) {
        setEmployees(data.data);
        console.log("✅ LOADED:", data.data.length, "employees");
      } else {
        console.log("⚠️ No success/data format");
        setEmployees([]);
      }
    } catch (err) {
      console.error("💥 Fetch error:", err);
      setEmployees([]);
    } finally {
      setEmployeeLoading(false);
    }
  }, [token]);

  const fetchMomPoints = useCallback(async () => {
    if (!meetingId || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/mom/meeting/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMomPoints(data.data || []);
      }
    } catch (err) {
      setMomPoints([]);
    }
  }, [meetingId, token]);

  // ✅ PERFECTLY FIXED useEffect - NO INFINITE LOOP
  useEffect(() => {
    console.log("🚀 Component mount - token:", !!token, "meetingId:", meetingId);
    if (token) {
      fetchEmployees();
    }
    if (meetingId && token) {
      fetchMomPoints();
    }
  }, [token, meetingId]); // ✅ ONLY PROPS IN DEPENDENCIES

  const employeeOptions = employees.map(employee => ({
    value: employee.EmployeeID,
    label: `${employee.EmployeeName}${employee.Department ? ` (${employee.Department})` : ""}`
  }));

  const getEmployeeNames = (assignedIds) => {
    if (!Array.isArray(assignedIds) || !assignedIds.length) return "Unassigned";
    return assignedIds.slice(0, 2)
      .map(id => employees.find(e => e.EmployeeID == id)?.EmployeeName || `ID:${id}`)
      .join(", ") + (assignedIds.length > 2 ? ` +${assignedIds.length-2}` : "");
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

  const handleSave = async () => {
    if (!formData.topic.trim() || !formData.point.trim() || !formData.assigned_to.length) {
      return setError("Please fill all required fields");
    }
    
    setLoading(true);
    setError("");
    
    try {
      const url = editingId ? `${API_URL}/api/mom/${editingId}` : `${API_URL}/api/mom`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
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
        fetchMomPoints();
      } else {
        setError("Failed to save");
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
    if (confirm("Delete this MOM point?")) {
      try {
        await fetch(`${API_URL}/api/mom/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchMomPoints();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <div style={styles.app}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>📋 Minutes of Meeting</h1>
        <div style={styles.metaInfo}>
          <div>Meeting ID: #{meetingId?.toString().padStart(6, "0")}</div>
          <div>Total Points: {momPoints.length}</div>
          <div>Employees: {employeeLoading ? "Loading..." : employees.length}</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        {error && (
          <div style={styles.errorNotification}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} style={{ 
              background: "none", border: "none", fontSize: "18px", cursor: "pointer" 
            }}>×</button>
          </div>
        )}

        {/* ADD/EDIT FORM */}
        {isAdding && (
          <div style={styles.formContainer}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "24px" 
            }}>
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
                <label style={styles.formLabel}>
                  Topic <span style={styles.required}>*</span>
                </label>
                <input 
                  style={styles.input} 
                  value={formData.topic} 
                  onChange={e => setFormData({...formData, topic: e.target.value})} 
                  placeholder="Discussion topic"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Assignees <span style={styles.required}>*</span>
                </label>
                <Select 
                  isMulti 
                  options={employeeOptions}
                  value={employeeOptions.filter(opt => formData.assigned_to.includes(opt.value))}
                  onChange={selected => setFormData({
                    ...formData, 
                    assigned_to: selected ? selected.map(s => s.value) : []
                  })}
                  placeholder={employeeLoading ? "Loading employees..." : "Select team members"}
                  isLoading={employeeLoading}
                  styles={styles.selectStyles}
                />
                <small style={{color: "#9ca3af", fontSize: "11px"}}>
                  {employees.length} employees loaded
                </small>
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
              <label style={styles.formLabel}>
                Discussion Points <span style={styles.required}>*</span>
              </label>
              <textarea 
                style={styles.textarea} 
                value={formData.point} 
                onChange={e => setFormData({...formData, point: e.target.value})} 
                placeholder="What was discussed in detail?"
                rows={4}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Decisions</label>
              <textarea 
                style={styles.textarea} 
                value={formData.decisions} 
                onChange={e => setFormData({...formData, decisions: e.target.value})} 
                placeholder="Final decisions & resolutions"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* ACTION ITEMS LIST */}
        <div style={styles.scrollableList}>
          <div style={styles.listHeader}>
            <h2 style={styles.listTitle}>Action Items ({momPoints.length})</h2>
            {!isAdding && (
              <button style={styles.addBtn} onClick={() => setIsAdding(true)}>
                ➕ New Item
              </button>
            )}
          </div>

          {momPoints.length === 0 && !isAdding ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "48px", marginBottom: "20px", opacity: 0.5 }}>📝</div>
              <h3 style={{ fontSize: "20px", margin: "0 0 8px 0", color: "#1a1a2e" }}>
                No action items yet
              </h3>
              <p style={{ margin: "0 0 24px 0" }}>Start tracking meeting outcomes</p>
              <button style={styles.primaryBtn} onClick={() => setIsAdding(true)}>
                Create First Item
              </button>
            </div>
          ) : (
            momPoints.map(point => (
              <div key={point.id} style={styles.card}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  marginBottom: "16px" 
                }}>
                  <div>
                    <span style={{ 
                      fontSize: "12px", 
                      color: "#64748b", 
                      fontWeight: "600", 
                      display: "block", 
                      marginBottom: "4px" 
                    }}>
                      #{point.id.toString().padStart(6, "0")}
                    </span>
                    <h3 style={{ 
                      fontSize: "18px", 
                      fontWeight: "700", 
                      color: "#1a1a2e", 
                      margin: "0 0 12px 0" 
                    }}>
                      {point.topic}
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      style={styles.editAction} 
                      onClick={() => handleEdit(point)}
                    >
                      Edit
                    </button>
                    <button 
                      style={{ 
                        padding: "6px 12px", 
                        background: "#ef4444", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "6px", 
                        cursor: "pointer", 
                        fontSize: "12px" 
                      }} 
                      onClick={() => handleDelete(point.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ 
                  marginBottom: "16px", 
                  padding: "16px", 
                  background: "#f8fafc", 
                  borderRadius: "12px", 
                  borderLeft: "4px solid #8B0000" 
                }}>
                  <div style={{ 
                    display: "flex", 
                    gap: "12px", 
                    alignItems: "flex-start", 
                    marginBottom: "8px" 
                  }}>
                    <span style={{ fontSize: "18px" }}>📋</span>
                    <div>
                      <div style={{ 
                        fontSize: "13px", 
                        fontWeight: "600", 
                        color: "#64748b", 
                        marginBottom: "8px" 
                      }}>Discussion</div>
                      <p style={{ margin: 0, color: "#475569", lineHeight: "1.6" }}>
                        {point.point}
                      </p>
                    </div>
                  </div>
                </div>

                {point.decisions && (
                  <div style={{ 
                    padding: "16px", 
                    background: "#f0f9ff", 
                    borderRadius: "12px", 
                    borderLeft: "4px solid #3b82f6", 
                    marginBottom: "20px" 
                  }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "18px" }}>✅</span>
                      <div>
                        <div style={{ 
                          fontSize: "13px", 
                          fontWeight: "600", 
                          color: "#64748b", 
                          marginBottom: "8px" 
                        }}>Decision</div>
                        <p style={{ 
                          margin: 0, 
                          color: "#1a1a2e", 
                          fontWeight: "500", 
                          lineHeight: "1.6" 
                        }}>
                          {point.decisions}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  paddingTop: "16px", 
                  borderTop: "1px solid #e5e7eb" 
                }}>
                  <div>
                    <div style={{ 
                      fontSize: "11px", 
                      color: "#64748b", 
                      fontWeight: "600", 
                      marginBottom: "2px" 
                    }}>Assigned</div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>
                      {getEmployeeNames(point.assigned_to)}
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: "11px", 
                      color: "#64748b", 
                      fontWeight: "600", 
                      marginBottom: "2px" 
                    }}>Due</div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>
                      {point.timeline || "ASAP"}
                    </div>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusStyle(point.status).bg,
                    color: getStatusStyle(point.status).color
                  }}>
                    {point.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
