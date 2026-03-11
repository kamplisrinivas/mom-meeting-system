import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
// ✅ Correct import path for your background
import bgImage from "../assets/img/create.jpg"; 

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function MeetingForm({ token, refreshMeetings }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // 1. Initial Form State
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
    created_by: "",
    created_by_name: "",
    chaired_by: "",
  });

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 2. Constants for Dropdowns
  const fixedUsers = [
    { id: 2098, name: "BRIJESH KUMAR UPADHYAY" },
    { id: 33, name: "VINOD B S" },
    { id: 566, name: "RAVINDRA C JOSHI" },
  ];

  const venues = [
    "Ayodhya, Conference hall Second Floor Admin Building",
    "Kashi, Conference hall First Floor Admin Building",
    "Kishkinda, Conference hall Third Floor Admin Building",
  ];

  // 3. Fetch Departments
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const options = data.data.map((dept) => ({ value: dept, label: dept }));
        setDepartments(options);
      }
    } catch (err) {
      console.error("Department fetch error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // 4. Fetch Employees based on selected departments
  const fetchEmployees = async (depts) => {
    if (!depts || depts.length === 0) {
      setEmployees([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/meetings/department-employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // 5. Validation Logic
  const validateForm = () => {
    const newErrors = {};
    if (!meeting.title?.trim()) newErrors.title = "Title is required";
    if (!meeting.meeting_date) newErrors.meeting_date = "Date is required";
    if (meeting.department.length === 0) newErrors.department = "Select at least one department";
    if (!meeting.chaired_by?.trim()) newErrors.chaired_by = "Chaired By required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 6. Submit Meeting
  const createMeeting = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        ...meeting,
        department: meeting.department.join(", "),
        venue: meeting.venue === "other" ? meeting.venue_custom : meeting.venue,
        invited_employees: selectedEmployees, // Sending selected IDs
      };

      const res = await fetch(`${API_URL}/api/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Meeting Created Successfully!");
        if (refreshMeetings) refreshMeetings();
        navigate(-1);
      } else {
        const data = await res.json();
        alert(data.message || "Error creating meeting");
      }
    } catch (err) {
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
        <div style={styles.formHeader}>
          <h2 style={styles.title}>📋 Create New Meeting</h2>
          <p style={styles.subtitle}>Fill in the details to schedule a new session</p>
        </div>

        <div style={styles.formGrid}>
          {/* TITLE */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Title *</label>
            <input 
              name="title" 
              placeholder="Enter meeting title" 
              style={styles.input} 
              value={meeting.title} 
              onChange={(e) => setMeeting({...meeting, title: e.target.value})} 
            />
            {errors.title && <span style={styles.error}>{errors.title}</span>}
          </div>

          {/* DATE */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Date *</label>
            <input 
              type="date" 
              name="meeting_date" 
              style={styles.input} 
              min={today} 
              value={meeting.meeting_date} 
              onChange={(e) => setMeeting({...meeting, meeting_date: e.target.value})} 
            />
            {errors.meeting_date && <span style={styles.error}>{errors.meeting_date}</span>}
          </div>

          {/* DEPARTMENT (Multi-Select) */}
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

          {/* CHAIRED BY */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Chaired By *</label>
            <input 
              name="chaired_by" 
              style={styles.input} 
              value={meeting.chaired_by} 
              onChange={(e) => setMeeting({...meeting, chaired_by: e.target.value})} 
              placeholder="MD Sir / Director / HOD" 
            />
            {errors.chaired_by && <span style={styles.error}>{errors.chaired_by}</span>}
          </div>

          {/* VENUE */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Venue</label>
            <select 
              name="venue" 
              style={styles.input} 
              value={meeting.venue} 
              onChange={(e) => setMeeting({...meeting, venue: e.target.value})}
            >
              <option value="">Select Venue</option>
              {venues.map((v, i) => <option key={i} value={v}>{v}</option>)}
              <option value="other">Other</option>
            </select>
            {meeting.venue === "other" && (
              <input 
                placeholder="Enter custom venue" 
                style={{...styles.input, marginTop: '10px'}} 
                value={meeting.venue_custom} 
                onChange={(e) => setMeeting({...meeting, venue_custom: e.target.value})} 
              />
            )}
          </div>

          {/* MEETING TYPE */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Type</label>
            <select 
              name="meeting_type" 
              style={styles.input} 
              value={meeting.meeting_type} 
              onChange={(e) => setMeeting({...meeting, meeting_type: e.target.value})}
            >
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* EMPLOYEE SELECTION BOX */}
          <div style={{ ...styles.fieldGroup, gridColumn: "1/-1" }}>
            <label style={styles.label}>Invite Employees ({selectedEmployees.length} selected)</label>
            <div style={styles.checkboxContainer}>
              {employees.length === 0 ? (
                <p style={{ color: "#666", fontSize: "13px" }}>Select a department to view employees</p>
              ) : (
                employees.map((emp) => (
                  <label key={emp.EmployeeID} style={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={selectedEmployees.includes(emp.EmployeeID)} 
                      onChange={() => toggleEmployee(emp.EmployeeID)} 
                    />
                    {emp.EmployeeName} — <small>{emp.Designation}</small>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={{ ...styles.fieldGroup, gridColumn: "1/-1" }}>
            <label style={styles.label}>Description</label>
            <textarea 
              name="description" 
              placeholder="Purpose of the meeting..." 
              style={styles.textarea} 
              value={meeting.description} 
              onChange={(e) => setMeeting({...meeting, description: e.target.value})} 
              rows="3" 
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

// 7. Styles - Glassmorphism Theme
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  container: {
    padding: "50px",
    maxWidth: "950px",
    width: "100%",
    background: "rgba(255, 255, 255, 0.75)", // Transparent White
    borderRadius: "24px",
    backdropFilter: "blur(15px)", // Frosted Glass Effect
    WebkitBackdropFilter: "blur(15px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  formHeader: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: "500",
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
    color: "#1e293b",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    fontSize: "15px",
    background: "rgba(255, 255, 255, 0.6)",
    outline: "none",
    color: "#000",
  },
  textarea: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    fontSize: "15px",
    background: "rgba(255, 255, 255, 0.6)",
    resize: "none",
    outline: "none",
    color: "#000",
  },
  checkboxContainer: {
    maxHeight: "150px",
    overflowY: "auto",
    background: "rgba(255, 255, 255, 0.4)",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
    fontSize: "14px",
    cursor: "pointer",
    color: "#1e293b",
  },
  submitBtn: {
    marginTop: "40px",
    width: "100%",
    padding: "18px",
    background: "#1e293b",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s ease",
  },
  error: {
    color: "#be123c",
    fontSize: "12px",
    marginTop: "4px",
    fontWeight: "600",
  }
};

const customSelectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '10px',
    padding: '3px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(4px)',
  })
};