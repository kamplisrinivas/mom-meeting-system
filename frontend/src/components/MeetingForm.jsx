import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.25:5001";

export default function MeetingForm({ refreshMeetings }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];

  const [meeting, setMeeting] = useState({
    title: "",
    description: "",
    meeting_date: "",
    meeting_time: "", 
    department: [],
    meeting_category: "",
    meeting_type: "Offline", 
    platform: "", 
    venue: "",
    venue_custom: "",
    chaired_by: ""
  });

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState(""); // 🔹 Added search state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const venues = [
    "Ayodhya, Conference hall Second Floor Admin Building",
    "Kashi, Conference hall First Floor Admin Building",
    "Kishkinda, Conference hall Third Floor Admin Building"
  ];

  // ===============================
  // FETCH DEPARTMENTS
  // ===============================
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const options = data.data.map((dept) => ({
          value: dept,
          label: dept
        }));
        setDepartments(options);
      }
    } catch (err) {
      console.error("Department fetch error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // ===============================
  // FETCH EMPLOYEES
  // ===============================
  const fetchEmployees = async (depts) => {
    try {
      const payload = depts && depts.length > 0 ? { departments: depts } : { departments: [] };
      const res = await fetch(`${API_URL}/api/meetings/department-employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Employee fetch error:", error);
    }
  };

  // ===============================
  // FORM VALIDATION
  // ===============================
  const validateForm = () => {
    const newErrors = {};
    if (!meeting.title.trim()) newErrors.title = "Title is required";
    if (!meeting.meeting_date) newErrors.meeting_date = "Date is required";
    if (!meeting.meeting_category) newErrors.meeting_category = "Meeting category required";
    if (meeting.department.length === 0) newErrors.department = "Select department";
    if (!meeting.chaired_by.trim()) newErrors.chaired_by = "Chaired By required";
    
    if (meeting.meeting_type === "Online" && !meeting.platform.trim()) {
        newErrors.platform = "Platform is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===============================
  // CREATE MEETING
  // ===============================
  const createMeeting = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        title: meeting.title,
        description: meeting.description,
        meeting_date: meeting.meeting_date,
        meeting_time: meeting.meeting_time,
        meeting_type: meeting.meeting_type,
        meeting_category: meeting.meeting_category,
        chaired_by: meeting.chaired_by,
        department: meeting.department.join(", "),
        venue: meeting.meeting_type === "Online" 
          ? meeting.platform 
          : (meeting.venue === "other" ? meeting.venue_custom : meeting.venue),
        selectedEmployeeIds: selectedEmployees 
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
        alert("✅ Meeting Created Successfully");
        if (refreshMeetings) refreshMeetings();
        navigate(-1);
      } else {
        alert(data.message || "Error creating meeting");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TOGGLE EMPLOYEE SELECTION
  // ===============================
  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((emp) => emp !== id) : [...prev, id]
    );
  };

  // ===============================
  // FILTERED EMPLOYEES (search)
  // ===============================
  const filteredEmployees = employees.filter(emp => {
    const search = employeeSearch.toLowerCase();
    return (
      emp.EmployeeName.toLowerCase().includes(search) ||
      (emp.Designation && emp.Designation.toLowerCase().includes(search))
    );
  });

  // ===============================
  // RENDER
  // ===============================
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>📋 Create New Meeting</h2>
        <div style={styles.formGrid}>
          {/* Title */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Title *</label>
            <input
              style={styles.input}
              value={meeting.title}
              onChange={(e) => setMeeting({ ...meeting, title: e.target.value })}
            />
            {errors.title && <span style={styles.error}>{errors.title}</span>}
          </div>

          {/* Date */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Date *</label>
            <input
              type="date"
              min={today}
              style={styles.input}
              value={meeting.meeting_date}
              onChange={(e) => setMeeting({ ...meeting, meeting_date: e.target.value })}
            />
            {errors.meeting_date && <span style={styles.error}>{errors.meeting_date}</span>}
          </div>

          {/* Time */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Time</label>
            <input
              type="time"
              style={styles.input}
              value={meeting.meeting_time}
              onChange={(e) => setMeeting({ ...meeting, meeting_time: e.target.value })}
            />
          </div>

          {/* Meeting Type */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Type</label>
            <select
              style={styles.selectInput}
              value={meeting.meeting_type}
              onChange={(e) => setMeeting({ ...meeting, meeting_type: e.target.value })}
            >
              <option value="Offline" style={styles.optionStyle}>Offline</option>
              <option value="Online" style={styles.optionStyle}>Online</option>
            </select>
          </div>

          {/* Meeting Category */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Category *</label>
            <select
              style={styles.selectInput}
              value={meeting.meeting_category}
              onChange={(e) => setMeeting({ ...meeting, meeting_category: e.target.value })}
            >
              <option value="" style={styles.optionStyle}>Select Category</option>
              <option value="technical" style={styles.optionStyle}>Technical</option>
              <option value="commercial" style={styles.optionStyle}>Commercial</option>
            </select>
            {errors.meeting_category && <span style={styles.error}>{errors.meeting_category}</span>}
          </div>

          {/* Departments */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Departments </label>
            <Select
              options={departments}
              isMulti
              styles={customSelectStyles}
              value={departments.filter((d) => meeting.department.includes(d.value))}
              onChange={(selected) => {
                const values = selected ? selected.map((s) => s.value) : [];
                setMeeting({ ...meeting, department: values });
                fetchEmployees(values);
              }}
            />
            {errors.department && <span style={styles.error}>{errors.department}</span>}
          </div>

          {/* Chaired By */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Chaired By *</label>
            <input
              style={styles.input}
              placeholder="MD / Director / HOD"
              value={meeting.chaired_by}
              onChange={(e) => setMeeting({ ...meeting, chaired_by: e.target.value })}
            />
            {errors.chaired_by && <span style={styles.error}>{errors.chaired_by}</span>}
          </div>

          {/* Platform / Venue */}
          <div style={styles.fieldGroup}>
            {meeting.meeting_type === "Online" ? (
              <>
                <label style={styles.label}>Platform Name</label>
                <input
                  style={styles.input}
                  placeholder="Zoom / Teams / Meet"
                  value={meeting.platform}
                  onChange={(e) => setMeeting({ ...meeting, platform: e.target.value })}
                />
                {errors.platform && <span style={styles.error}>{errors.platform}</span>}
              </>
            ) : (
              <>
                <label style={styles.label}>Venue</label>
                <select
                  style={styles.selectInput}
                  value={meeting.venue}
                  onChange={(e) => setMeeting({ ...meeting, venue: e.target.value })}
                >
                  <option value="" style={styles.optionStyle}>Select Venue</option>
                  {venues.map((v, i) => (
                    <option key={i} value={v} style={styles.optionStyle}>{v}</option>
                  ))}
                  <option value="other" style={styles.optionStyle}>Other</option>
                </select>
                {meeting.venue === "other" && (
                  <input
                    style={{ ...styles.input, marginTop: 10 }}
                    placeholder="Enter custom venue"
                    value={meeting.venue_custom}
                    onChange={(e) => setMeeting({ ...meeting, venue_custom: e.target.value })}
                  />
                )}
              </>
            )}
          </div>

          {/* Search & Invite Employees */}
          <div style={{ gridColumn: "1/-1" }}>
            <label style={styles.label}>Invite Employees ({selectedEmployees.length})</label>
            <input
              type="text"
              placeholder="Search employees by name or designation..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent",
                color: "#fff",
                marginBottom: 10
              }}
            />
            <div style={styles.checkboxContainer}>
              {filteredEmployees.length === 0 ? (
                <p style={{color: 'rgba(255,255,255,0.6)'}}>No employees found</p>
              ) : (
                filteredEmployees.map((emp) => (
                  <label key={emp.EmployeeID} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.EmployeeID)}
                      onChange={() => toggleEmployee(emp.EmployeeID)}
                    />
                    {emp.EmployeeName} — {emp.Designation}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Description */}
          {/* Description */}
<div style={{ gridColumn: "1/-1", width: "100%" }}>  {/* spans all columns */}
  <label style={styles.label}>Description</label>
  <textarea
    rows="5"  // increased height
    style={{ ...styles.textarea, width: "100%", fontSize: "16px" }}  // full width and larger font
    value={meeting.description}
    onChange={(e) => setMeeting({ ...meeting, description: e.target.value })}
  />
</div>
        </div>

        {/* Submit Button */}
        <button
          style={styles.submitBtn}
          onClick={createMeeting}
          disabled={loading}
        >
          {loading ? "Creating..." : "🚀 Schedule Meeting"}
        </button>
      </div>
    </div>
  );
}

// ===============================
// STYLES
// ===============================
const styles = {
  pageWrapper: { minHeight: "100vh", width: "100%", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  container: { padding: "50px", maxWidth: "950px", width: "100%", background: "rgba(255, 255, 255, 0.05)", borderRadius: "24px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)" },
  title: { fontSize: "28px", fontWeight: "800", color: "#fff", margin: "0 0 30px 0", textAlign: "center" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" },
  fieldGroup: { display: "flex", flexDirection: "column" },
  label: { marginBottom: "8px", fontWeight: "700", color: "rgba(255, 255, 255, 0.8)", fontSize: "12px", textTransform: "uppercase" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.2)", fontSize: "15px", background: "transparent", outline: "none", color: "#fff" },
  selectInput: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontSize: "15px",
    background: "rgba(30, 41, 59, 0.2)",
    outline: "none",
    color: "#fff",
    cursor: "pointer",
  },
  optionStyle: { background: "rgba(30, 41, 59, 1)", color: "#fff" },
  textarea: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.2)", fontSize: "15px", background: "transparent", resize: "none", outline: "none", color: "#fff" },
  checkboxContainer: { maxHeight: "150px", overflowY: "auto", background: "rgba(255, 255, 255, 0.05)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.1)" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", fontSize: "14px", cursor: "pointer", color: "#fff" },
  submitBtn: { marginTop: "40px", width: "100%", padding: "18px", background: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: "pointer" },
  error: { color: "#fb7185", fontSize: "12px", marginTop: "4px" }
};

const customSelectStyles = {
  control: (base) => ({ ...base, background: "transparent", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "10px", color: "#fff" }),
  singleValue: (base) => ({ ...base, color: "#fff" }),
  placeholder: (base) => ({ ...base, color: "rgba(255, 255, 255, 0.5)" }),
  menu: (base) => ({ ...base, background: "rgba(30, 41, 59, 0.95)", color: "#fff" }),
  option: (base, state) => ({ ...base, background: state.isFocused ? "rgba(255, 255, 255, 0.1)" : "transparent", color: "#fff" })
};