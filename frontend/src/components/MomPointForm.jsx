import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
    fontFamily: "'Inter', sans-serif",
    padding: "24px",
    // CENTER LOGIC STARTS HERE
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: "600px", // Reduced max-width for a tighter centered look
    margin: "0 auto",
  },
  formContainer: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)", // Deeper shadow for centered depth
    marginBottom: "24px",
  },
  singleGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    marginLeft: "2px",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    minHeight: "100px",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
    background: "#f8fafc",
  },
  input: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    background: "#f8fafc",
    height: "45px",
    width: "100%",
    boxSizing: "border-box"
  },
  addBtn: {
    width: "100%",
    padding: "16px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: "24px",
  },
  pointCard: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    borderLeft: "4px solid #3b82f6",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  errorMsg: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    marginBottom: "15px",
    textAlign: "center"
  }
};

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "45px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    background: "#f8fafc",
  })
};

export default function MomPointForm({ meetingId, token }) {
  const [momPoints, setMomPoints] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    point: "",
    assigned_to: [],
    timeline: "",
    status: "Assigned",
  });

  const fetchData = useCallback(async () => {
    if (!meetingId || !token) return;
    setLoading(true);
    try {
      const [mRes, moRes, eRes] = await Promise.all([
        fetch(`${API_URL}/api/meetings/${meetingId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/mom/meeting/${meetingId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/employees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const mData = await mRes.json();
      const moData = await moRes.json();
      const eData = await eRes.json();
      setMeeting(mData.data || mData);
      setMomPoints(moData.data || moData || []);
      setEmployees(eData.data || eData || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [meetingId, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setError("");
    if (!formData.point.trim() || !formData.assigned_to.length) {
      setError("Discussion points and assignees are required.");
      return;
    }
    const autoTopic = formData.point.substring(0, 40);

    try {
      const url = editingId ? `${API_URL}/api/mom/${editingId}` : `${API_URL}/api/mom`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          meeting_id: parseInt(meetingId),
          topic: autoTopic, 
          point: formData.point.trim(),
          assigned_to: formData.assigned_to,
          timeline: formData.timeline || null,
          status: formData.status,
        }),
      });

      if (res.ok) {
        setFormData({ point: "", assigned_to: [], timeline: "", status: "Assigned" });
        setIsAdding(false); setEditingId(null); fetchData();
      }
    } catch (err) { setError("Error saving data"); }
  };

  const handleEdit = (p) => {
    setFormData({
      point: p.point,
      assigned_to: Array.isArray(p.assigned_to) ? p.assigned_to : [],
      timeline: p.timeline || "",
      status: p.status,
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const employeeOptions = employees.map(e => ({
    value: e.EmployeeID,
    label: `${e.EmployeeName}${e.Department ? ` (${e.Department})` : ""}`
  }));

  if (loading) return <div style={styles.app}><div style={{color:'white'}}>Loading...</div></div>;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        
        {isAdding && (
          <div style={styles.formContainer}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
              <h3 style={{margin:0, color:'#1e293b'}}>{editingId ? "Edit Item" : "New Item"}</h3>
              <div>
                <button onClick={() => {setIsAdding(false); setEditingId(null); setError("");}} style={{marginRight:'12px', border:'none', background:'none', cursor:'pointer', color:'#94a3b8', fontSize: '14px'}}>Cancel</button>
                <button onClick={handleSave} style={{background:'#10b981', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize: '14px'}}>Save</button>
              </div>
            </div>

            {error && <div style={styles.errorMsg}>{error}</div>}

            <div style={styles.singleGrid}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Discussion Points *</label>
                <textarea 
                  style={styles.textarea}
                  placeholder="What was discussed?"
                  value={formData.point}
                  onChange={e => setFormData({...formData, point: e.target.value})}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Assigned To *</label>
                <Select 
                  isMulti
                  options={employeeOptions}
                  styles={selectStyles}
                  placeholder="Select..."
                  value={employeeOptions.filter(o => formData.assigned_to.includes(o.value))}
                  onChange={s => setFormData({...formData, assigned_to: s ? s.map(x => x.value) : []})}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Status</label>
                <select style={styles.input} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Revoked</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Timeline</label>
                <input type="date" style={styles.input} value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {!isAdding && (
          <button style={styles.addBtn} onClick={() => setIsAdding(true)}>
            + Add Action Item
          </button>
        )}

        <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '5px' }}>
          {momPoints.map((item) => (
            <div key={item.id} style={styles.pointCard}>
              <div style={{flex: 1}}>
                <div style={{fontSize:'14px', color:'#1e293b', marginBottom:'6px'}}>{item.point}</div>
                <div style={{fontSize:'12px', color:'#64748b', display:'flex', gap:'12px'}}>
                  <span>📅 {item.timeline || 'No Date'}</span>
                  <span style={{fontWeight:'bold'}}>• {item.status}</span>
                </div>
              </div>
              <button 
                onClick={() => handleEdit(item)}
                style={{marginLeft: '16px', background: '#f1f5f9', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontSize: '11px', fontWeight: 'bold'}}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}