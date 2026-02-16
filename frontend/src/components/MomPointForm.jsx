import { useState, useEffect } from "react";

const API_URL = "http://localhost:5001";

export default function MomPointForm({ meetingId, token }) {
  const [momPoints, setMomPoints] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: "",
    key_points: "",
    decisions: "",
    assigned_to: "",
    timeline: "",
    status: "Assigned" 
  });

  const fetchMomPoints = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mom/meeting/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMomPoints(data.data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { if (meetingId && token) fetchMomPoints(); }, [meetingId, token]);

  const handleSave = async () => {
    if (!formData.topic || !formData.key_points) return alert("Topic and Key Points are required");
    try {
      const res = await fetch(`${API_URL}/api/mom`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ meeting_id: meetingId, ...formData }),
      });
      const result = await res.json();
      if (result.success) {
        setFormData({ topic: "", key_points: "", decisions: "", assigned_to: "", timeline: "", status: "Assigned" });
        setIsAdding(false);
        fetchMomPoints();
      }
    } catch (err) { console.error("Save error:", err); }
  };

  return (
    <div style={container}>
      {/* 1. GLASS-MORPHISM HEADER */}
      <div style={glassHeader}>
        <h2 style={title}>Minutes of Meeting</h2>
        <div style={headerGrid}>
          <div style={metaGroup}><label style={label}>DATE</label> <span style={val}>14 Feb 2026</span></div>
          <div style={metaGroup}><label style={label}>MEETING ID</label> <span style={val}>{meetingId}</span></div>
          <div style={metaGroup}><label style={label}>LOCATION</label> <span style={val}>Virtual / Teams</span></div>
        </div>
      </div>

      <div style={actionRowMain}>
        <h3 style={{ margin: 0, fontWeight: 500 }}>Discussion Flow</h3>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} style={primaryBtn}>+ New Topic</button>
        )}
      </div>

      {/* 2. FLOATING FORM DESIGN */}
      {isAdding && (
        <div style={floatingForm}>
          <div style={formGrid}>
            <input placeholder="Discussion Topic" style={modernInput} value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
            <input placeholder="Assignee" style={modernInput} value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} />
            <input type="date" style={modernInput} value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} />
            <select style={modernInput} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Assigned">Assigned</option>
                <option value="Revoked">Revoked</option>
            </select>
          </div>
          <textarea placeholder="What was discussed?" style={modernTextarea} value={formData.key_points} onChange={e => setFormData({...formData, key_points: e.target.value})} />
          <textarea placeholder="Final Decisions" style={{...modernTextarea, minHeight: '50px'}} value={formData.decisions} onChange={e => setFormData({...formData, decisions: e.target.value})} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setIsAdding(false)} style={ghostBtn}>Cancel</button>
            <button onClick={handleSave} style={primaryBtn}>Add to Minutes</button>
          </div>
        </div>
      )}

      {/* 3. NEUMORPHIC CARDS LIST */}
      <div style={cardStack}>
        {momPoints.map((p, i) => (
          <div key={i} style={modernCard}>
            <div style={cardMain}>
              <div style={topicHeader}>
                <span style={topicText}>{p.topic}</span>
              </div>
              <div style={contentBody}>
                 <div style={contentBlock}>
                    <label style={microLabel}>KEY DISCUSSION</label>
                    <p style={pText}>{p.point}</p>
                 </div>
                 <div style={contentBlock}>
                    <label style={microLabel}>DECISION</label>
                    <p style={{...pText, color: '#003366', fontWeight: 500}}>{p.decisions || "No specific decision made."}</p>
                 </div>
              </div>
            </div>

            <div style={cardSidebar}>
               <label style={microLabel}>ACTION ITEM</label>
               <div style={sidebarInfo}>👤 {p.assigned_to || "Unassigned"}</div>
               <div style={sidebarInfo}>📅 {p.timeline || "TBD"}</div>
               <div style={statusPill(p.status)}>{p.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= LATEST 2026 UI STYLES ================= */
const container = { padding: "40px 20px", maxWidth: "1100px", margin: "0 auto", backgroundColor: "#f0f2f5", minHeight: "100vh" };

const glassHeader = { background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", padding: "30px", borderRadius: "20px", boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)", border: "1px solid rgba(255, 255, 255, 0.18)", marginBottom: "40px" };
const title = { margin: "0 0 20px 0", fontSize: "28px", color: "#1a1a1a" };
const headerGrid = { display: "flex", gap: "40px" };
const metaGroup = { display: "flex", flexDirection: "column", gap: "4px" };
const label = { fontSize: "10px", fontWeight: "bold", color: "#888", letterSpacing: "1px" };
const val = { fontSize: "14px", color: "#333", fontWeight: "500" };

const actionRowMain = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "0 10px" };
const primaryBtn = { background: "linear-gradient(135deg, #003366 0%, #004080 100%)", color: "white", padding: "12px 24px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 15px rgba(0, 51, 102, 0.3)" };
const ghostBtn = { background: "transparent", color: "#666", padding: "12px 24px", border: "1px solid #ccc", borderRadius: "12px", cursor: "pointer" };

const floatingForm = { background: "#fff", padding: "30px", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", marginBottom: "40px", border: "1px solid #eef" };
const formGrid = { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "15px", marginBottom: "15px" };
const modernInput = { padding: "12px", borderRadius: "10px", border: "1px solid #e0e0e0", outline: "none", fontSize: "14px" };
const modernTextarea = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e0e0e0", outline: "none", minHeight: "80px", marginBottom: "15px", boxSizing: "border-box" };

const cardStack = { display: "flex", flexDirection: "column", gap: "25px" };
const modernCard = { display: "flex", background: "#fff", borderRadius: "24px", boxShadow: "0 10px 20px rgba(0,0,0,0.03)", transition: "transform 0.2s", overflow: "hidden" };

const cardMain = { flex: 3, padding: "25px" };
const cardSidebar = { flex: 1, backgroundColor: "#f8fafd", padding: "25px", borderLeft: "1px solid #edf2f7", display: "flex", flexDirection: "column", gap: "12px" };

const topicHeader = { marginBottom: "15px" };
const topicText = { fontSize: "18px", fontWeight: "bold", color: "#1a1a1a" };
const contentBody = { display: "flex", flexDirection: "column", gap: "15px" };
const contentBlock = {};
const microLabel = { fontSize: "9px", fontWeight: "bold", color: "#a0aec0", letterSpacing: "1.2px", display: "block", marginBottom: "6px" };
const pText = { margin: 0, fontSize: "14px", color: "#4a5568", lineHeight: "1.6" };

const sidebarInfo = { fontSize: "13px", color: "#4a5568" };
const statusPill = (s) => ({
    marginTop: "auto",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: s === "Assigned" ? "#e6f6ff" : "#fff5f5",
    color: s === "Assigned" ? "#003366" : "#e53e3e",
    border: `1px solid ${s === "Assigned" ? "#c0e4ff" : "#fed7d7"}`
});