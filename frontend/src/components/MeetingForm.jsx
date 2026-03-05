import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function MeetingForm({ token, refreshMeetings }) {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  // 🔥 Hardcoded creators
  const fixedUsers = [
    { id: 2098, name: "BRIJESH KUMAR UPADHYAY" },
    { id: 33, name: "VINOD B S" },
    { id: 566, name: "RAVINDRA C JOSHI" },
  ];

  // 🔥 Hardcoded Venues
const venues = [
  "Ayodhya, Conference hall Second Floor Admin Building",
  "Kashi, Conference hall First Floor Admin Building",
  "Kishkinda, Conference hall Third Floor Admin Building",
];

  const [meeting, setMeeting] = useState({
  title: "",
  description: "",
  meeting_date: "",
  meeting_time: "",
  department: "",
  meeting_category: "", // NEW
  meeting_type: "Offline",
  venue: "",
  venue_custom: "",
  created_by: "",
  created_by_name: "",
  chaired_by: "", // NEW
});

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ================= FETCH DEPARTMENTS =================
  const fetchData = useCallback(async () => {
    const localToken =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    try {
      const deptRes = await fetch(`${API_URL}/api/departments`, {
        headers: {
          "Content-Type": "application/json",
          ...(localToken && { Authorization: `Bearer ${localToken}` }),
        },
      });

      const deptData = await deptRes.json();

      if (deptData.success) {
        setDepartments(deptData.data || []);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("❌ Departments fetch error:", err);
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= VALIDATION =================
  const validateForm = () => {
    const newErrors = {};

    if (!meeting.title?.trim()) newErrors.title = "Title is required";
    if (!meeting.meeting_date)
      newErrors.meeting_date = "Date is required";
    if (!meeting.department)
      newErrors.department = "Department is required";
    if (!meeting.created_by)
      newErrors.created_by = "Created By required";

    if (
      meeting.created_by === "other" &&
      !meeting.created_by_name?.trim()
    ) {
      newErrors.created_by = "Please enter creator name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= CREATE MEETING =================
  const createMeeting = async () => {
  if (!validateForm()) return;

  setLoading(true);

  try {

    // 🔥 Decide creator based on meeting category
    //let creatorId = null;

   // if (meeting.meeting_category === "technical") {
     // creatorId = 33; // VINOD B S
    //}

    //if (meeting.meeting_category === "commercial") {
      //creatorId = 2098; // BRIJESH KUMAR UPADHYAY
    //}

    //if (meeting.created_by === "566") {
      //creatorId = 566; // RAVINDRA C JOSHI
    //}

    const payload = {
  title: meeting.title,
  description: meeting.description,
  meeting_date: meeting.meeting_date,
  meeting_time: meeting.meeting_time,

  department: meeting.department,
  meeting_type: meeting.meeting_type,
  meeting_category: meeting.meeting_category,   // ✅ ADD THIS

  venue:
    meeting.venue === "other"
      ? meeting.venue_custom
      : meeting.venue,

  //created_by: creatorId,

  created_by_name:
    meeting.created_by === "other"
      ? meeting.created_by_name
      : null,

  chaired_by: meeting.chaired_by,
}; 

    const localToken =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    const res = await fetch(`${API_URL}/api/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localToken}`,
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
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setMeeting({ ...meeting, [e.target.name]: e.target.value });
  };

  // ================= UI =================
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📋 Create New Meeting</h3>

      <div style={styles.formGrid}>
        {/* Title */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Meeting Title <span style={styles.required}>*</span>
          </label>
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
          <label style={styles.label}>
            Date <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            name="meeting_date"
            style={styles.input}
            value={meeting.meeting_date}
            onChange={handleChange}
            min={today}
          />
          {errors.meeting_date && (
            <span style={styles.error}>{errors.meeting_date}</span>
          )}
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

        {/* Department */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Department <span style={styles.required}>*</span>
          </label>
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
          {errors.department && (
            <span style={styles.error}>{errors.department}</span>
          )}
        </div>

        {/* 🔥 Created By (Hardcoded + Others) */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Created By <span style={styles.required}>*</span>
          </label>

          <select
            name="created_by"
            style={styles.selectInput}
            value={meeting.created_by}
            onChange={handleChange}
          >
            <option value="">Select Creator</option>

            {fixedUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}

            <option value="other">Others (Type Name)</option>
          </select>

          {errors.created_by && (
            <span style={styles.error}>{errors.created_by}</span>
          )}

          {meeting.created_by === "other" && (
            <input
              type="text"
              name="created_by_name"
              placeholder="Enter creator name"
              style={{ ...styles.input, marginTop: "8px" }}
              value={meeting.created_by_name}
              onChange={handleChange}
            />
          )}
        </div>

        {/* Meeting Type */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Meeting Type</label>
          <select
            name="meeting_type"
            style={styles.selectInput}
            value={meeting.meeting_type}
            onChange={handleChange}
          >
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
        </div>

        {/*Meeting Category */}
        <div style={styles.fieldGroup}>
  <label style={styles.label}>
    Meeting Category <span style={styles.required}>*</span>
  </label>

  <select
    name="meeting_category"
    style={styles.selectInput}
    value={meeting.meeting_category}
    onChange={handleChange}
  >
    <option value="">Select Category</option>
    <option value="technical">Technical Meeting</option>
    <option value="commercial">Commercial Meeting</option>
  </select>
</div>

          {/*CHAIRED BY */}

          <div style={styles.fieldGroup}>
  <label style={styles.label}>Chaired By</label>

  <input
    name="chaired_by"
    style={styles.input}
    value={meeting.chaired_by}
    onChange={handleChange}
    placeholder="MD Sir / Director / HOD"
  />
</div>

        {/* Venue */}
        {/* 🔥 Venue (Hardcoded + Custom) */}
<div style={styles.fieldGroup}>
  <label style={styles.label}>Venue</label>

  <select
    name="venue"
    style={styles.selectInput}
    value={meeting.venue}
    onChange={handleChange}
  >
    <option value="">Select Venue</option>

    {venues.map((v, index) => (
      <option key={index} value={v}>
        {v}
      </option>
    ))}

    <option value="other">Other (Type Venue)</option>
  </select>

  {meeting.venue === "other" && (
    <input
      type="text"
      name="venue_custom"
      placeholder="Enter venue"
      style={{ ...styles.input, marginTop: "8px" }}
      value={meeting.venue_custom}
      onChange={handleChange}
    />
  )}
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

      <button
        style={styles.submitBtn}
        onClick={createMeeting}
        disabled={loading}
      >
        {loading ? "⏳ Creating..." : "✅ Create Meeting"}
      </button>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "2rem",
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  label: { fontWeight: "600", color: "#374151", fontSize: "14px" },
  selectInput: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "16px",
    background: "#fafbfc",
    minHeight: "44px",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "16px",
    background: "#fafbfc",
    minHeight: "44px",
    width: "100%",
    boxSizing: "border-box",
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
    boxSizing: "border-box",
  },
  required: { color: "#ef4444" },
  error: { color: "#ef4444", fontSize: "12px" },
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
  },
};