import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function MomPointForm({ meetingId, token }) {
  const [momPoints, setMomPoints] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    topic: "",
    point: "",        // ✅ CHANGED: Backend expects "point" not "key_points"
    decisions: "",
    assigned_to: "",
    timeline: "",
    status: "Assigned" 
  });

  const fetchMomPoints = async () => {
    if (!meetingId || !token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/mom/meeting/${meetingId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = await res.json();
      console.log("Fetch mom points response:", data); // ✅ DEBUG
      
      if (data.success) {
        setMomPoints(data.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { 
    if (meetingId && token) {
      fetchMomPoints(); 
    }
  }, [meetingId, token]);

  // ✅ FIXED: Backend expects these exact field names
  const handleSave = async () => {
    if (!formData.topic?.trim()) {
      setError("Topic is required");
      return;
    }
    if (!formData.point?.trim()) {  // ✅ CHANGED: "point" not "key_points"
      setError("Discussion points are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ FIXED: Exact backend format
      const payload = {
        meeting_id: parseInt(meetingId),  // Backend expects INTEGER
        topic: formData.topic.trim(),
        point: formData.point.trim(),     // Backend field name
        decisions: formData.decisions?.trim() || null,
        assigned_to: formData.assigned_to?.trim() || null,
        timeline: formData.timeline || null,
        status: formData.status
      };

      console.log("🔥 SENDING PAYLOAD:", JSON.stringify(payload, null, 2));

      const res = await fetch(`${API_URL}/api/mom`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server error response:", errorText);
        setError(`Server Error: ${res.status} - ${errorText}`);
        return;
      }

      const result = await res.json();
      console.log("✅ Save result:", result);
      
      if (result.success || result.message === "MOM point created successfully") {
        setFormData({ 
          topic: "", point: "", decisions: "", assigned_to: "", timeline: "", status: "Assigned" 
        });
        setIsAdding(false);
        setError("");
        fetchMomPoints();
        alert("✅ MOM Point saved successfully!");
      } else {
        setError(result.message || "Failed to save");
      }
    } catch (err) {
      console.error("🌐 Network error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  return (
    <div style={container}>
      <div style={glassHeader}>
        <h2 style={title}>Minutes of Meeting</h2>
        <div style={headerGrid}>
          <div style={metaGroup}><label style={label}>MEETING ID</label><span style={val}>{meetingId}</span></div>
          <div style={metaGroup}><label style={label}>MOM POINTS</label><span style={val}>{momPoints.length}</span></div>
          <div style={metaGroup}><label style={label}>STATUS</label><span style={val}>{loading ? 'Saving...' : 'Ready'}</span></div>
        </div>
      </div>

      {error && (
        <div style={errorStyle}>
          ❌ {error}
          <button onClick={() => setError("")} style={closeBtnStyle}>×</button>
        </div>
      )}

      <div style={actionRowMain}>
        <h3 style={{ margin: 0, fontWeight: 500 }}>Discussion Flow</h3>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} style={primaryBtn} disabled={loading}>
            + New Topic
          </button>
        )}
      </div>

      {isAdding && (
        <div style={floatingForm}>
          <div style={formGrid}>
            <input 
              name="topic"           // ✅ name="topic"
              placeholder="Discussion Topic *" 
              style={modernInput} 
              value={formData.topic} 
              onChange={handleInputChange}
            />
            <input 
              name="assigned_to"     // ✅ name="assigned_to"
              placeholder="Assignee (User ID)" 
              style={modernInput} 
              value={formData.assigned_to} 
              onChange={handleInputChange}
            />
            <input 
              name="timeline"        // ✅ name="timeline"
              type="date" 
              style={modernInput} 
              value={formData.timeline} 
              onChange={handleInputChange}
            />
            <select name="status" style={modernInput} value={formData.status} onChange={handleInputChange}>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>
          
          {/* ✅ CHANGED: name="point" (backend field name) */}
          <textarea 
            name="point"
            placeholder="What was discussed? *" 
            style={modernTextarea} 
            value={formData.point} 
            onChange={handleInputChange}
          />
          
          <textarea 
            name="decisions"
            placeholder="Final Decisions" 
            style={{...modernTextarea, minHeight: '60px'}} 
            value={formData.decisions} 
            onChange={handleInputChange}
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button onClick={() => setIsAdding(false)} style={ghostBtn} disabled={loading}>Cancel</button>
            <button 
              onClick={handleSave} 
              style={{...primaryBtn, ...(loading && {opacity: 0.7, cursor: 'not-allowed'})}}
              disabled={loading}
            >
              {loading ? '⏳ Saving...' : '💾 Save MOM Point'}
            </button>
          </div>
        </div>
      )}

      <div style={cardStack}>
        {momPoints.length === 0 ? (
          <div style={emptyStateStyle}>
            📝 No MOM points yet
            <br />
            <small>Add your first discussion point above</small>
          </div>
        ) : (
          momPoints.map((p, i) => (
            <div key={p.id || i} style={modernCard} onClick={() => console.log('MOM Point:', p)}>
              <div style={cardMain}>
                <div style={topicHeader}>
                  <span style={topicText}>{p.topic}</span>
                </div>
                <div style={contentBody}>
                  <div style={contentBlock}>
                    <label style={microLabel}>KEY DISCUSSION</label>
                    <p style={pText}>{p.point || p.key_points || 'No details'}</p> {/* ✅ Handle both field names */}
                  </div>
                  {p.decisions && (
                    <div style={contentBlock}>
                      <label style={microLabel}>DECISION</label>
                      <p style={{...pText, color: '#003366', fontWeight: 500}}>{p.decisions}</p>
                    </div>
                  )}
                </div>
              </div>
              <div style={cardSidebar}>
                <label style={microLabel}>ACTION</label>
                <div style={sidebarInfo}>👤 {p.assigned_to || "Team"}</div>
                <div style={sidebarInfo}>📅 {p.timeline || "TBD"}</div>
                <div style={statusPill(p.status)}>{p.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



// ✅ ALL STYLES (your existing + new error styles)
const container = { padding: "40px 20px", maxWidth: "1100px", margin: "0 auto", backgroundColor: "#f0f2f5", minHeight: "100vh" };

const glassHeader = { background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", padding: "30px", borderRadius: "20px", boxShadow: "0 8px 32px rgba(31, 38, 135, 0.1)", border: "1px solid rgba(255, 255, 255, 0.18)", marginBottom: "40px" };
const title = { margin: "0 0 20px 0", fontSize: "28px", color: "#1a1a1a" };
const headerGrid = { display: "flex", gap: "40px" };
const metaGroup = { display: "flex", flexDirection: "column", gap: "4px" };
const label = { fontSize: "10px", fontWeight: "bold", color: "#888", letterSpacing: "1px" };
const val = { fontSize: "14px", color: "#333", fontWeight: "500" };

const actionRowMain = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "0 10px" };
const primaryBtn = { 
  background: "linear-gradient(135deg, #003366 0%, #004080 100%)", 
  color: "white", 
  padding: "12px 24px", 
  border: "none", 
  borderRadius: "12px", 
  cursor: "pointer", 
  fontWeight: "bold", 
  boxShadow: "0 4px 15px rgba(0, 51, 102, 0.3)",
  minHeight: '44px'
};
const ghostBtn = { 
  background: "transparent", 
  color: "#666", 
  padding: "12px 24px", 
  border: "1px solid #ccc", 
  borderRadius: "12px", 
  cursor: "pointer",
  minHeight: '44px'
};

const floatingForm = { background: "#fff", padding: "30px", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", marginBottom: "40px", border: "1px solid #eef" };
const formGrid = { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "15px", marginBottom: "15px" };
const modernInput = { 
  padding: "12px", 
  borderRadius: "10px", 
  border: "1px solid #e0e0e0", 
  outline: "none", 
  fontSize: "14px",
  width: '100%',
  boxSizing: 'border-box'
};
const modernTextarea = { 
  width: "100%", 
  padding: "12px", 
  borderRadius: "10px", 
  border: "1px solid #e0e0e0", 
  outline: "none", 
  minHeight: "80px", 
  marginBottom: "15px", 
  boxSizing: "border-box",
  fontFamily: 'inherit',
  fontSize: '14px',
  resize: 'vertical'
};

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
  backgroundColor: s === "Assigned" ? "#e6f6ff" : s === "Completed" ? "#f0fff4" : s === "In Progress" ? "#fef3c7" : "#fff5f5",
  color: s === "Assigned" ? "#003366" : s === "Completed" ? "#065f46" : s === "In Progress" ? "#92400e" : "#e53e3e",
  border: `1px solid ${s === "Assigned" ? "#c0e4ff" : s === "Completed" ? "#86efac" : s === "In Progress" ? "#fde68a" : "#fed7d7"}`
});

// ✅ NEW STYLES
const errorStyle = {
  background: '#fee2e2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  padding: '12px 16px',
  borderRadius: '12px',
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 500
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: 'inherit',
  padding: 0,
  marginLeft: '12px'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#94a3b8',
  fontSize: '18px',
  background: 'rgba(255,255,255,0.5)',
  borderRadius: '16px',
  border: '2px dashed #e2e8f0'
};
