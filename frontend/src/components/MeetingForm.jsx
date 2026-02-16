import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function MeetingForm({ token, refreshMeetings }) {
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState({
    title: "",
    description: "",
    meeting_date: "",
    meeting_time: "",
    department_id: "",
    meeting_type: "Offline",
    platform: "",
    venue: "",
    created_by: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showManualId, setShowManualId] = useState(false);

  const currentUserId = localStorage.getItem("userId") || "1";

  useEffect(() => {
    if (!token) return;
    
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data || []);
          const currentUser = data.data.find(user => user.id == currentUserId);
          if (currentUser) {
            setMeeting(prev => ({ ...prev, created_by: currentUser.id.toString() }));
          }
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    
    fetchUsers();
  }, [token, currentUserId]);

  const toggleManualId = () => {
    setShowManualId(!showManualId);
    if (!showManualId) {
      setMeeting(prev => ({ ...prev, created_by: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!meeting.title?.trim()) newErrors.title = "Title is required";
    if (!meeting.meeting_date) newErrors.meeting_date = "Date is required";
    if (!meeting.department_id) newErrors.department_id = "Department is required";
    if (!meeting.meeting_type) newErrors.meeting_type = "Meeting type is required";
    if (!meeting.created_by) newErrors.created_by = "Please select or enter Assigned By";
    
    if (meeting.meeting_type === "Online" && !meeting.platform?.trim()) {
      newErrors.platform = "Platform is required";
    }
    if (meeting.meeting_type === "Offline" && !meeting.venue?.trim()) {
      newErrors.venue = "Venue is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ NEW: Send beautiful email notification
  const sendMeetingNotificationEmail = async (meetingData, meetingId) => {
    try {
      const currentUser = users.find(u => u.id == meetingData.created_by) || 
                         { name: localStorage.getItem("username") || "Admin", email: "admin@company.com" };

      const emailData = {
        scheduledBy: currentUser.name || "SLRM ADMIN",
        meeting_datetime: new Date(`${meetingData.meeting_date} ${meetingData.meeting_time || '00:00'}`).toLocaleString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        venue: meetingData.meeting_type === 'Online' ? `${meetingData.platform || 'Online Platform'}` : `${meetingData.venue || 'TBA'}`,
        meetingCustomId: meetingId || `M${Date.now().toString().slice(-6)}`,
        subject: meetingData.title,
        agenda: meetingData.description || "No agenda provided.",
        recipientEmail: currentUser.email || "team@company.com", // Send to creator or team
      };

      console.log("📧 Sending email notification:", emailData);

      // ✅ Call your existing email endpoint
      const emailRes = await fetch(`${API_URL}/api/send-meeting-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      const emailResult = await emailRes.json();
      console.log("📧 Email sent:", emailResult);
      
      return emailResult;
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr);
      // Don't block UI if email fails
      return { success: false, message: "Email notification failed (non-critical)" };
    }
  };

  // In your MeetingForm createMeeting function - SIMPLIFIED:
const createMeeting = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    const dateTime = meeting.meeting_date && meeting.meeting_time 
      ? `${meeting.meeting_date} ${meeting.meeting_time}:00`
      : meeting.meeting_date;

    const payload = {
      title: meeting.title.trim(),
      description: meeting.description || "",
      meeting_date: dateTime,
      meeting_time: meeting.meeting_time || null,
      department_id: parseInt(meeting.department_id),
      meeting_type: meeting.meeting_type,
      platform: meeting.platform?.trim() || null,
      venue: meeting.venue?.trim() || null,
      created_by: parseInt(meeting.created_by),
    };

    const res = await fetch(`${API_URL}/api/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ SUCCESS - Your backend already sent emails!
      setMeeting({
        title: "", description: "", meeting_date: "", meeting_time: "",
        department_id: "", meeting_type: "Offline", platform: "", venue: "", created_by: currentUserId
      });
      
      if (refreshMeetings) refreshMeetings();
      
      alert(`✅ Meeting created successfully! 📧 ${data.emails_sent_to || 0} emails sent to department`);
      navigate(-1); // Go back to dashboard
    } else {
      alert(data.error || "Failed to create meeting");
    }
  } catch (err) {
    alert("Network error");
  } finally {
    setLoading(false);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeeting({ ...meeting, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const getUserDisplayName = (userId) => {
    const user = users.find(u => u.id == userId);
    return user ? `${user.name || user.username} (${user.email})` : `User ID: ${userId}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📋 Create New Meeting</h3>
        <button style={styles.closeBtn} onClick={() => navigate(-1)}>×</button>
      </div>

      <div style={styles.formGrid}>
        {/* Title */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Meeting Title <span style={styles.required}>*</span></label>
          <input
            name="title"
            style={{ ...styles.input, ...(errors.title && styles.inputError) }}
            placeholder="Enter meeting title"
            value={meeting.title}
            onChange={handleChange}
          />
          {errors.title && <span style={styles.error}>{errors.title}</span>}
        </div>

        {/* Date & Time */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Date <span style={styles.required}>*</span></label>
          <input
            name="meeting_date"
            type="date"
            style={{ ...styles.input, ...(errors.meeting_date && styles.inputError) }}
            value={meeting.meeting_date}
            onChange={handleChange}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Time</label>
          <input
            name="meeting_time"
            type="time"
            style={styles.input}
            value={meeting.meeting_time}
            onChange={handleChange}
          />
        </div>

        {/* Department */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Department <span style={styles.required}>*</span></label>
          <select name="department_id" style={{ ...styles.input, ...(errors.department_id && styles.inputError) }} value={meeting.department_id} onChange={handleChange}>
            <option value="">Select Department</option>
            <option value={1}>HR Department</option>
            <option value={2}>Engineering</option>
            <option value={3}>Sales</option>
            <option value={4}>Marketing</option>
          </select>
        </div>

        {/* Assigned By */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Assigned By <span style={styles.required}>*</span></label>
          {!showManualId ? (
            <div style={styles.assignedByContainer}>
              <select name="created_by" style={{ ...styles.input, flex: 1, ...(errors.created_by && styles.inputError) }} value={meeting.created_by} onChange={handleChange}>
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username} ({user.email})
                  </option>
                ))}
                <option value={currentUserId}>💼 Me (ID: {currentUserId})</option>
                <option value="manual">➕ Enter Custom ID</option>
              </select>
              <button type="button" style={styles.manualIdToggle} onClick={toggleManualId}>ID#</button>
            </div>
          ) : (
            <>
              <input
                name="created_by"
                type="number"
                style={{ ...styles.input, ...(errors.created_by && styles.inputError) }}
                placeholder="Enter User ID"
                value={meeting.created_by}
                onChange={handleChange}
              />
              <span style={styles.manualIdPreview}>Preview: {getUserDisplayName(meeting.created_by)}</span>
              <button type="button" style={styles.backToDropdown} onClick={toggleManualId}>← Back</button>
            </>
          )}
          {errors.created_by && <span style={styles.error}>{errors.created_by}</span>}
        </div>

        {/* Meeting Type */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Meeting Type <span style={styles.required}>*</span></label>
          <select name="meeting_type" style={{ ...styles.input, ...(errors.meeting_type && styles.inputError) }} value={meeting.meeting_type} onChange={handleChange}>
            <option value="">Select Type</option>
            <option value="Offline">🏢 Offline</option>
            <option value="Online">💻 Online</option>
          </select>
        </div>

        {/* Platform/Venue */}
        {meeting.meeting_type === "Online" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Platform <span style={styles.required}>*</span></label>
            <input name="platform" style={{ ...styles.input, ...(errors.platform && styles.inputError) }} placeholder="Zoom, Teams" value={meeting.platform} onChange={handleChange} />
          </div>
        )}
        {meeting.meeting_type === "Offline" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Venue <span style={styles.required}>*</span></label>
            <input name="venue" style={{ ...styles.input, ...(errors.venue && styles.inputError) }} placeholder="Room A" value={meeting.venue} onChange={handleChange} />
          </div>
        )}

        {/* Description */}
        <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            style={styles.textarea}
            placeholder="Type your meeting description here... (optional)"
            value={meeting.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.cancelBtn} onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
        <button style={{ ...styles.submitBtn, ...(loading && styles.disabledBtn) }} onClick={createMeeting} disabled={loading}>
          {loading ? "⏳ Creating & Sending Email..." : "✅ Create Meeting & Send Email"}
        </button>
      </div>
    </div>
  );
}



// ✅ FIXED STYLES - Description textarea works perfectly
const styles = {
  container: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    padding: "2rem",
    borderRadius: "24px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    maxWidth: "700px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #f0f0f0",
  },
  title: { margin: 0, fontSize: "1.8rem", fontWeight: "700", color: "#1a1a1a" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "2rem",
    cursor: "pointer",
    color: "#666",
    padding: "0.5rem",
    borderRadius: "8px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginBottom: "0.5rem",
    fontSize: "0.95rem",
  },
  required: { color: "#e74c3c", fontSize: "0.9rem" },
  input: {
    padding: "14px 16px",
    border: "2px solid #e1e5e9",
    borderRadius: "12px",
    fontSize: "1rem",
    background: "#fafbfc",
    transition: "all 0.3s ease",
  },
  inputError: {
    borderColor: "#e74c3c",
    boxShadow: "0 0 0 3px rgba(231, 76, 60, 0.1)",
  },
  // ✅ FIXED TEXTAREA STYLE - Works perfectly now
  textarea: {
    padding: "14px 16px",
    border: "2px solid #e1e5e9",
    borderRadius: "12px",
    fontSize: "1rem",
    background: "#fafbfc",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    lineHeight: "1.6",
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    color: "#e74c3c",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
  },
  assignedByContainer: {
    display: "flex",
    gap: "0.5rem",
  },
  manualIdToggle: {
    padding: "14px 16px",
    background: "#e3f2fd",
    color: "#1976d2",
    border: "2px solid #bbdefb",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  manualIdPreview: {
    fontSize: "0.85rem",
    color: "#666",
    fontStyle: "italic",
    marginTop: "0.25rem",
  },
  backToDropdown: {
    padding: "8px 16px",
    background: "#f8f9fa",
    color: "#666",
    border: "1px solid #e1e5e9",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "14px 24px",
    background: "#f8f9fa",
    color: "#666",
    border: "2px solid #e1e5e9",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
  submitBtn: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
};
