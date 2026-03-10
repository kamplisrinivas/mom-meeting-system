import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";



export default function MeetingForm({ token, refreshMeetings }) {

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

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

  /* ---------------- FETCH DEPARTMENTS ---------------- */

  const fetchDepartments = useCallback(async () => {
    try {

      const res = await fetch(`${API_URL}/api/departments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const options = data.data.map((dept) => ({
          value: dept,
          label: dept,
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

  /* ---------------- FETCH EMPLOYEES ---------------- */

  const fetchEmployees = async (departments) => {

  if (!departments || departments.length === 0) {
    setEmployees([]);
    return;
  }

  try {

    const res = await fetch(`${API_URL}/api/meetings/department-employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ departments })
    });

    const data = await res.json();

    if (data.success) {
      setEmployees(data.employees);
    }

  } catch (error) {
    console.error(error);
  }
};
  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
  const newErrors = {};

  if (!meeting.title?.trim())
    newErrors.title = "Title is required";

  if (!meeting.meeting_date)
    newErrors.meeting_date = "Date is required";

  if (meeting.department.length === 0)
    newErrors.department = "Select at least one department";

  if (!meeting.created_by)
    newErrors.created_by = "Created By required";

  if (!meeting.chaired_by?.trim())
    newErrors.chaired_by = "Chaired By required";

  if (meeting.created_by === "other" && !meeting.created_by_name?.trim()) {
    newErrors.created_by = "Please enter creator name";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  /* ---------------- CREATE MEETING ---------------- */

  const createMeeting = async () => {

    if (!validateForm()) return;

    setLoading(true);

    try {

      const payload = {
  ...meeting,

  department: meeting.department.join(", "),

  venue:
    meeting.venue === "other"
      ? meeting.venue_custom
      : meeting.venue,

  created_by_name:
    meeting.created_by === "other"
      ? meeting.created_by_name
      : null,

  chaired_by: meeting.chaired_by,   // ✅ send to backend
  meeting_type: meeting.meeting_type // ✅ send to backend
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

        alert(`✅ Meeting Created! ID: ${data.meetingId}`);

        if (refreshMeetings) refreshMeetings();

        navigate(-1);

      } else {
        alert(data.message || "Error creating meeting");
      }

    } catch (err) {
      alert("Network Error");
    }

    setLoading(false);
  };

  /* ---------------- INPUT CHANGE ---------------- */

  const handleChange = (e) => {
    setMeeting({
      ...meeting,
      [e.target.name]: e.target.value,
    });
  };

  /* ---------------- DEPARTMENT CHANGE ---------------- */

  const handleDeptChange = (e) => {

    const dept = e.target.value;

    setMeeting({
      ...meeting,
      department: dept,
    });

    setSelectedEmployees([]);
    fetchEmployees(dept);
  };

  /* ---------------- EMPLOYEE SELECT ---------------- */

  const toggleEmployee = (id) => {

    setSelectedEmployees((prev) => {

      if (prev.includes(id)) {
        return prev.filter((emp) => emp !== id);
      }

      return [...prev, id];
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>📋 Create New Meeting</h2>

      <div style={styles.formGrid}>

        {/* TITLE */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Meeting Title *</label>
          <input
            name="title"
            style={styles.input}
            value={meeting.title}
            onChange={handleChange}
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
            onChange={handleChange}
          />
        </div>

        {/* TIME */}
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

        {/* DEPARTMENT */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
  Department * {meeting.department.length > 0 && `(${meeting.department.length})`}
</label>

<Select
  options={departments}
  isMulti
  closeMenuOnSelect={true}
  value={departments.filter((d) =>
    meeting.department.includes(d.value)
  )}
  onChange={(selected) => {

    const values = selected ? selected.map((s) => s.value) : [];

    setMeeting({
      ...meeting,
      department: values
    });

    fetchEmployees(values);

  }}
/>



          {errors.department && (
            <span style={styles.error}>{errors.department}</span>
          )}
        </div>

        {/* INVITE EMPLOYEES */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
  Invite Employees {selectedEmployees.length > 0 && `(${selectedEmployees.length} selected)`}
</label>

          <div style={styles.checkboxContainer}>

            {employees.length === 0 && (
              <p style={{ fontSize: "13px", color: "#888" }}>
                Select department to load employees
              </p>
            )}

            {employees.map((emp) => (
              <label key={emp.EmployeeID} style={styles.checkboxLabel}>

                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.EmployeeID)}
                  onChange={() => toggleEmployee(emp.EmployeeID)}
                />

                {" "}
                {emp.EmployeeName} — {emp.Designation}

              </label>
            ))}

          </div>
        </div>

        {/* CREATED BY */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Created By *</label>

          <select
            name="created_by"
            style={styles.input}
            value={meeting.created_by}
            onChange={handleChange}
          >

            <option value="">Select</option>

            {fixedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}

          </select>

        </div>

        {/* CATEGORY */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Meeting Category</label>

          <select
            name="meeting_category"
            style={styles.input}
            value={meeting.meeting_category}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="technical">Technical</option>
            <option value="commercial">Commercial</option>
          </select>

        </div>

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

        <div style={styles.fieldGroup}>
  <label style={styles.label}>
    Chaired By <span style={styles.required}>*</span>
  </label>

  <input
    name="chaired_by"
    style={styles.input}
    value={meeting.chaired_by}
    onChange={handleChange}
    placeholder="MD Sir / Director / HOD"
  />

  {errors.chaired_by && (
    <span style={styles.error}>{errors.chaired_by}</span>
  )}
</div>

        {/* VENUE */}
        <div style={styles.fieldGroup}>

          <label style={styles.label}>Venue</label>

          <select
            name="venue"
            style={styles.input}
            value={meeting.venue}
            onChange={handleChange}
          >

            <option value="">Select</option>

            {venues.map((v, i) => (
              <option key={i} value={v}>
                {v}
              </option>
            ))}

            <option value="other">Other</option>

          </select>

          {meeting.venue === "other" && (
            <input
              name="venue_custom"
              style={styles.input}
              placeholder="Enter venue"
              value={meeting.venue_custom}
              onChange={handleChange}
            />
          )}

        </div>

        {/* DESCRIPTION */}
        <div style={{ ...styles.fieldGroup, gridColumn: "1/-1" }}>
          <label style={styles.label}>Description</label>

          <textarea
            name="description"
            style={styles.textarea}
            value={meeting.description}
            onChange={handleChange}
          />

        </div>

      </div>

      <button
        style={styles.submitBtn}
        onClick={createMeeting}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Meeting"}
      </button>

    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {

  container: {
    padding: "30px",
    maxWidth: "900px",
    margin: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "30px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    marginBottom: "5px",
    fontWeight: "600",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  checkboxContainer: {
    maxHeight: "200px",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "6px",
  },

  checkboxLabel: {
    display: "block",
    marginBottom: "6px",
  },

  error: {
    color: "red",
    fontSize: "12px",
  },

  submitBtn: {
    marginTop: "25px",
    width: "100%",
    padding: "14px",
    background: "#8B0000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

};