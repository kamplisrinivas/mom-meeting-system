import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function MeetingForm({ token, refreshMeetings }) {
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState({
    title: "",
    description: "",
    meeting_date: "",
    meeting_time: "",
    department: "",
    meeting_type: "Offline",
    platform: "",
    venue: "",
    created_by: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const currentUserId = localStorage.getItem("userId") || "1";

  // 🔍 DEBUG useEffect
  useEffect(() => {
    console.log("🔍 Departments state:", departments);
    console.log("🔍 Departments length:", departments.length);
  }, [departments]);

  // ✅ FIXED fetchData with full logging
  const fetchData = useCallback(async () => {
  // 🔥 AUTO-GET TOKEN FROM LOCALSTORAGE
  const localToken = localStorage.getItem('token') || localStorage.getItem('authToken');
  console.log("🔍 LOCAL TOKEN FOUND:", !!localToken);
  
  if (!localToken) {
    console.log("⚠️ No token - fetching without auth");
    // TRY WITHOUT TOKEN ANYWAY
  }

  try {
    console.log("🔄 Fetching departments...");
    const deptRes = await fetch(`${API_URL}/api/departments`, {
      headers: { 
        'Content-Type': 'application/json',
        // ONLY ADD TOKEN IF EXISTS
        ...(localToken && { Authorization: `Bearer ${localToken}` })
      },
    });
    
    console.log("📡 Response status:", deptRes.status);
    const deptData = await deptRes.json();
    console.log("📄 Full response:", deptData);
    
    if (deptData.success) {
      setDepartments(deptData.data || []);
      console.log("✅ Departments loaded:", deptData.data);
    } else {
      console.error("❌ API failed:", deptData);
      setDepartments([]);
    }
  } catch (err) {
    console.error("❌ Departments error:", err);
    setDepartments([]);
  }
}, []);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const validateForm = () => {
    const newErrors = {};
    if (!meeting.title?.trim()) newErrors.title = "Title is required";
    if (!meeting.meeting_date) newErrors.meeting_date = "Date is required";
    if (!meeting.department) newErrors.department = "Department is required";
    if (!meeting.created_by) newErrors.created_by = "Created By required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMeeting = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        title: meeting.title,
        description: meeting.description,
        meeting_date: meeting.meeting_date,
        meeting_time: meeting.meeting_time,
        department: meeting.department,
        meeting_type: meeting.meeting_type,
        platform: meeting.platform,
        venue: meeting.venue,
        created_by: parseInt(meeting.created_by),
      };

      const res = await fetch(`${API_URL}/api/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Meeting created! ID: ${data.meetingId}`);
        if (refreshMeetings) refreshMeetings();
        navigate(-1);
      } else {
        alert(data.message || "Failed to create meeting");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setMeeting({ ...meeting, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      {/* 🔍 DEBUG DISPLAY - Remove after testing */}
     
      
      <h3 style={styles.title}>📋 Create New Meeting</h3>
      
      <div style={styles.formGrid}>
        {/* Title */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Meeting Title <span style={styles.required}> *</span></label>
          <input
            name="title"
            style={styles.input}
            value={meeting.title}
            onChange={handleChange}
            placeholder="Weekly Sprint Review"
          />
          {errors.title && <span style={styles.error}>{errors.title}</span>}
        </div>

        {/* Date */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Date <span style={styles.required}> *</span></label>
          <input
            type="date"
            name="meeting_date"
            style={styles.input}
            value={meeting.meeting_date}
            onChange={handleChange}
          />
          {errors.meeting_date && <span style={styles.error}>{errors.meeting_date}</span>}
        </div>

        {/* Time */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Time</label>
          <input
            type="time"
            name="meeting_time"
            style={styles.input}
            value={meeting.meeting_time}
            onChange={handleChange}
          />
        </div>

        {/* ✅ FIXED Department Dropdown */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Department <span style={styles.required}> *</span></label>
          <select
            name="department"
            style={styles.selectInput}  
            value={meeting.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            {departments.length > 0 ? (
              departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))
            ) : (
              <option disabled>No departments available</option>
            )}
          </select>
          {errors.department && <span style={styles.error}>{errors.department}</span>}
        </div>

        {/* Created By */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Created By <span style={styles.required}> *</span></label>
          <select
            name="created_by"
            style={styles.selectInput}
            value={meeting.created_by}
            onChange={handleChange}
          >
            <option value="">Select Creator</option>
            <option value={currentUserId}>Current User (ID: {currentUserId})</option>
          </select>
          {errors.created_by && <span style={styles.error}>{errors.created_by}</span>}
        </div>

        {/* Meeting Type */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Meeting Type</label>
          <select name="meeting_type" style={styles.selectInput} value={meeting.meeting_type} onChange={handleChange}>
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
        </div>

        {/* Venue/Platform */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Venue/Platform</label>
          <input
            name="venue"
            style={styles.input}
            value={meeting.venue}
            onChange={handleChange}
            placeholder="Conference Room A1 / Zoom Link"
          />
        </div>

        {/* Description */}
        <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            style={styles.textarea}
            value={meeting.description}
            onChange={handleChange}
            placeholder="Meeting agenda, discussion points..."
            rows={4}
          />
        </div>
      </div>

      <button style={styles.submitBtn} onClick={createMeeting} disabled={loading}>
        {loading ? "⏳ Creating..." : "✅ Create Meeting"}
      </button>
    </div>
  );
}

// ✅ FIXED STYLES - Departments will show!
const styles = {
  container: { 
    padding: "2rem", 
    maxWidth: "900px", 
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
  },
  debugBox: {
    padding: "10px",
    background: "#e7f3ff",
    border: "1px solid #b3d9ff",
    borderRadius: "8px",
    marginBottom: "20px",
    fontFamily: "monospace",
    fontSize: "14px",
    color: "#1e40af"
  },
  title: { 
    marginBottom: "2rem", 
    fontSize: "28px", 
    fontWeight: "700", 
    color: "#1a1a2e",
    textAlign: "center"
  },
  formGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem", 
    marginBottom: "2rem" 
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { fontWeight: "600", color: "#374151", fontSize: "14px" },
  
  // ✅ FIXED SELECT INPUT
  selectInput: { 
    padding: "12px 16px", 
    border: "2px solid #e2e8f0", 
    borderRadius: "10px", 
    fontSize: "16px",
    background: "#fafbfc",
    minHeight: "44px",
    width: "100%",
    boxSizing: "border-box",
    appearance: "menulist",
    WebkitAppearance: "menulist",
    cursor: "pointer"
  },
  
  // Regular inputs
  input: { 
    padding: "12px 16px", 
    border: "2px solid #e2e8f0", 
    borderRadius: "10px", 
    fontSize: "16px",
    background: "#fafbfc",
    minHeight: "44px",
    width: "100%",
    boxSizing: "border-box"
  },
  textarea: {
    padding: "12px 16px", 
    border: "2px solid #e2e8f0", 
    borderRadius: "10px", 
    fontSize: "16px",
    background: "#fafbfc",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box"
  },
  required: { color: "#ef4444" },
  error: { color: "#ef4444", fontSize: "12px", marginTop: "0.25rem" },
  submitBtn: {
    width: "100%",
    padding: "16px 32px",
    background: "linear-gradient(135deg, #8B0000, #A52A2A)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
};
