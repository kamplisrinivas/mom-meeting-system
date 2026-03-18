import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

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
    venue: "",
    venue_custom: "",
    chaired_by: ""
  });

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const venues = [
    "Ayodhya, Conference hall Second Floor Admin Building",
    "Kashi, Conference hall First Floor Admin Building",
    "Kishkinda, Conference hall Third Floor Admin Building"
  ];

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

  const fetchEmployees = async (depts) => {
    if (!depts || depts.length === 0) {
      setEmployees([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/meetings/department-employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ departments: depts })
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error("Employee fetch error:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!meeting.title.trim()) newErrors.title = "Title is required";
    if (!meeting.meeting_date) newErrors.meeting_date = "Date is required";
    if (!meeting.meeting_category) newErrors.meeting_category = "Meeting category required";
    if (meeting.department.length === 0) newErrors.department = "Select department";
    if (!meeting.chaired_by.trim()) newErrors.chaired_by = "Chaired By required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMeeting = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        ...meeting,
        department: meeting.department.join(", "),
        venue: meeting.venue === "other" ? meeting.venue_custom : meeting.venue,
        invited_employees: selectedEmployees
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
      console.error(err);
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((emp) => emp !== id) : [...prev, id]
    );
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>📋 Create New Meeting</h2>
        <div style={styles.formGrid}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Title *</label>
            <input
              style={styles.input}
              value={meeting.title}
              onChange={(e) => setMeeting({ ...meeting, title: e.target.value })}
            />
            {errors.title && <span style={styles.error}>{errors.title}</span>}
          </div>

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

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Category *</label>
            <select
              style={styles.input}
              value={meeting.meeting_category}
              onChange={(e) => setMeeting({ ...meeting, meeting_category: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="technical">Technical</option>
              <option value="commercial">Commercial</option>
            </select>
            {errors.meeting_category && <span style={styles.error}>{errors.meeting_category}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Departments *</label>
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

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Venue</label>
            <select
              style={styles.input}
              value={meeting.venue}
              onChange={(e) => setMeeting({ ...meeting, venue: e.target.value })}
            >
              <option value="">Select Venue</option>
              {venues.map((v, i) => (
                <option key={i} value={v}>{v}</option>
              ))}
              <option value="other">Other</option>
            </select>
            {meeting.venue === "other" && (
              <input
                style={{ ...styles.input, marginTop: 10 }}
                placeholder="Enter custom venue"
                value={meeting.venue_custom}
                onChange={(e) => setMeeting({ ...meeting, venue_custom: e.target.value })}
              />
            )}
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={styles.label}>Invite Employees ({selectedEmployees.length})</label>
            <div style={styles.checkboxContainer}>
              {employees.length === 0 ? (
                <p style={{color: 'rgba(255,255,255,0.6)'}}>Select department to view employees</p>
              ) : (
                employees.map((emp) => (
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

          <div style={{ gridColumn: "1/-1" }}>
            <label style={styles.label}>Description</label>
            <textarea
              rows="3"
              style={styles.textarea}
              value={meeting.description}
              onChange={(e) => setMeeting({ ...meeting, description: e.target.value })}
            />
          </div>
        </div>

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

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    background: "transparent", // Fully transparent
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  container: {
    padding: "50px",
    maxWidth: "950px",
    width: "100%",
    background: "rgba(255, 255, 255, 0.05)", // Minimal visibility for structure
    borderRadius: "24px",
    backdropFilter: "blur(10px)", 
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 30px 0",
    textAlign: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontSize: "15px",
    background: "transparent",
    outline: "none",
    color: "#fff",
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontSize: "15px",
    background: "transparent",
    resize: "none",
    outline: "none",
    color: "#fff",
  },
  checkboxContainer: {
    maxHeight: "150px",
    overflowY: "auto",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
    fontSize: "14px",
    cursor: "pointer",
    color: "#fff",
  },
  submitBtn: {
    marginTop: "40px",
    width: "100%",
    padding: "18px",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "#fb7185",
    fontSize: "12px",
    marginTop: "4px",
  }
};

const customSelectStyles = {
  control: (base) => ({
    ...base,
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    color: "#fff",
  }),
  singleValue: (base) => ({ ...base, color: "#fff" }),
  placeholder: (base) => ({ ...base, color: "rgba(255, 255, 255, 0.5)" }),
  menu: (base) => ({ ...base, background: "rgba(30, 41, 59, 0.95)", color: "#fff" }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "rgba(255, 255, 255, 0.1)" : "transparent",
    color: "#fff",
  })
};