import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.11.175:5001";

export default function MeetingForm({ refreshMeetings, onSubmit, onCancel, title: propsTitle }) {
  const { id } = useParams(); 
  const isEditMode = !!id && id !== "undefined"; 
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
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const venues = [
    "Ayodhya, Conference hall Second Floor Admin Building",
    "Kashi, Conference hall First Floor Admin Building",
    "Kishkinda, Conference hall Third Floor Admin Building"
  ];

  // --- 1. FETCH DETAILS (Endpoint aligned with Backend) ---
  const fetchMeetingDetails = useCallback(async () => {
    if (!isEditMode) return;
    try {
      setLoading(true);
      // Backend controller uses /api/reschedule/:id
      const res = await fetch(`${API_URL}/api/reschedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const m = data.data;

        // Data cleanup (Backend now sends array, but we split if it's a string)
        const rawDept = m.department || "";
        const deptArray = Array.isArray(rawDept) 
          ? rawDept 
          : rawDept.split(",").map(d => d.trim()).filter(Boolean);

        const formattedDate = m.meeting_date ? m.meeting_date.split(/T| /)[0] : "";

        setMeeting({
          title: m.title || "",
          description: m.description || "",
          meeting_date: formattedDate,
          meeting_time: m.meeting_time || "",
          department: deptArray,
          meeting_category: m.meeting_category || "",
          meeting_type: m.meeting_type || "Offline",
          chaired_by: m.chaired_by || "",
          venue: venues.includes(m.venue) ? m.venue : (m.meeting_type === "Offline" ? "other" : ""),
          venue_custom: !venues.includes(m.venue) && m.meeting_type === "Offline" ? m.venue : "",
          platform: m.meeting_type === "Online" ? m.venue : ""
        });

        if (m.attendees) {
          setSelectedEmployees(m.attendees.map(a => a.EmployeeID));
        }

        fetchEmployees(deptArray);
      }
    } catch (err) {
      console.error("Autofill fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode, token]);

  useEffect(() => {
    if (isEditMode) fetchMeetingDetails();
  }, [fetchMeetingDetails, isEditMode]);

  // --- DATA FETCHING ---
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const options = data.data.map((dept) => ({ value: dept, label: dept }));
        setDepartments(options);
      }
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const fetchEmployees = async (depts) => {
    try {
      const payload = { departments: depts || [] };
      const res = await fetch(`${API_URL}/api/meetings/department-employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) setEmployees(data.employees || []);
    } catch (error) { console.error(error); }
  };

  // --- 2. SAVE/UPDATE (Endpoint aligned with Backend) ---
  const handleSaveMeeting = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const method = isEditMode ? "PUT" : "POST";
    // Backend PUT route is /api/reschedule/:id
    const endpoint = isEditMode 
      ? `${API_URL}/api/reschedule/${id}` 
      : `${API_URL}/api/meetings`;

    try {
      const payload = {
        title: meeting.title,
        description: meeting.description,
        meeting_date: meeting.meeting_date,
        meeting_time: meeting.meeting_time,
        meeting_type: meeting.meeting_type,
        meeting_category: meeting.meeting_category,
        chaired_by: meeting.chaired_by,
        department: meeting.department.join(", "), // Join for DB storage
        venue: meeting.meeting_type === "Online" 
          ? meeting.platform 
          : (meeting.venue === "other" ? meeting.venue_custom : meeting.venue),
        selectedEmployeeIds: selectedEmployees 
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert(isEditMode ? "✅ Meeting Updated Successfully" : "✅ Meeting Created Successfully");
        if (onSubmit) onSubmit(); 
        else {
          if (refreshMeetings) refreshMeetings();
          navigate(-1);
        }
      } else {
        alert(result.message || "Error saving meeting");
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setLoading(false);
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

  const toggleEmployee = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((e) => e !== empId) : [...prev, empId]
    );
  };

  const filteredEmployees = employees.filter(emp => {
    const search = employeeSearch.toLowerCase();
    return emp.EmployeeName.toLowerCase().includes(search) || (emp.Designation && emp.Designation.toLowerCase().includes(search));
  });

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <h2 style={styles.title}>{propsTitle || (isEditMode ? "✏️ Reschedule Meeting" : "📋 Create New Meeting")}</h2>
          {!isEditMode && (
            <button style={styles.rescheduleBtn} onClick={() => navigate("/reschedule")}>🕒 Reschedule Meeting</button>
          )}
        </div>

        <div style={styles.formGrid}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Title *</label>
            <input style={styles.input} value={meeting.title} onChange={(e) => setMeeting({ ...meeting, title: e.target.value })} />
            {errors.title && <span style={styles.error}>{errors.title}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Date *</label>
            <input type="date" min={isEditMode ? "" : today} style={styles.input} value={meeting.meeting_date} onChange={(e) => setMeeting({ ...meeting, meeting_date: e.target.value })} />
            {errors.meeting_date && <span style={styles.error}>{errors.meeting_date}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Time</label>
            <input type="time" style={styles.input} value={meeting.meeting_time} onChange={(e) => setMeeting({ ...meeting, meeting_time: e.target.value })} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Type</label>
            <select style={styles.selectInput} value={meeting.meeting_type} onChange={(e) => setMeeting({ ...meeting, meeting_type: e.target.value })}>
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Meeting Category *</label>
            <select style={styles.selectInput} value={meeting.meeting_category} onChange={(e) => setMeeting({ ...meeting, meeting_category: e.target.value })}>
              <option value="">Select Category</option>
              <option value="technical">Technical</option>
              <option value="commercial">Commercial</option>
            </select>
            {errors.meeting_category && <span style={styles.error}>{errors.meeting_category}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Departments</label>
            <Select
              options={departments}
              isMulti
              styles={customSelectStyles}
              // Map directly to objects to fix UI display
              value={meeting.department.map(dept => ({ value: dept, label: dept }))}
              onChange={(sel) => {
                const vals = sel ? sel.map((s) => s.value) : [];
                setMeeting({ ...meeting, department: vals });
                fetchEmployees(vals);
              }}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Chaired By *</label>
            <input style={styles.input} placeholder="MD / Director / HOD" value={meeting.chaired_by} onChange={(e) => setMeeting({ ...meeting, chaired_by: e.target.value })} />
          </div>

          <div style={styles.fieldGroup}>
            {meeting.meeting_type === "Online" ? (
              <>
                <label style={styles.label}>Platform Name</label>
                <input style={styles.input} placeholder="Zoom / Teams" value={meeting.platform} onChange={(e) => setMeeting({ ...meeting, platform: e.target.value })} />
              </>
            ) : (
              <>
                <label style={styles.label}>Venue</label>
                <select style={styles.selectInput} value={meeting.venue} onChange={(e) => setMeeting({ ...meeting, venue: e.target.value })}>
                  <option value="">Select Venue</option>
                  {venues.map((v, i) => <option key={i} value={v}>{v}</option>)}
                  <option value="other">Other</option>
                </select>
                {meeting.venue === "other" && (
                  <input style={{ ...styles.input, marginTop: 10 }} placeholder="Custom venue" value={meeting.venue_custom} onChange={(e) => setMeeting({ ...meeting, venue_custom: e.target.value })} />
                )}
              </>
            )}
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={styles.label}>Invite Employees ({selectedEmployees.length})</label>
            <input style={styles.employeeSearchInput} placeholder="Search name..." value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} />
            <div style={styles.checkboxContainer}>
              {filteredEmployees.map((emp) => (
                <label key={emp.EmployeeID} style={styles.checkboxLabel}>
                  <input type="checkbox" checked={selectedEmployees.includes(emp.EmployeeID)} onChange={() => toggleEmployee(emp.EmployeeID)} />
                  {emp.EmployeeName} — {emp.Designation}
                </label>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: "1/-1", width: "100%" }}>
            <label style={styles.label}>Description</label>
            <textarea rows="5" style={{ ...styles.textarea, width: "100%" }} value={meeting.description} onChange={(e) => setMeeting({ ...meeting, description: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
           {onCancel && (
             <button style={{ ...styles.submitBtn, marginTop: 0, background: 'rgba(255,255,255,0.05)' }} onClick={onCancel}>Cancel</button>
           )}
           <button style={{ ...styles.submitBtn, marginTop: 0 }} onClick={handleSaveMeeting} disabled={loading}>
             {loading ? "Processing..." : isEditMode ? "💾 Update Meeting" : "🚀 Schedule Meeting"}
           </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { minHeight: "100vh", width: "100%", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  container: { padding: "50px", maxWidth: "950px", width: "100%", background: "rgba(255, 255, 255, 0.05)", borderRadius: "24px", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)" },
  headerContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#fff", margin: "0" },
  rescheduleBtn: { padding: "10px 20px", background: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.3)", borderRadius: "10px", cursor: "pointer" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" },
  fieldGroup: { display: "flex", flexDirection: "column" },
  label: { marginBottom: "8px", fontWeight: "700", color: "rgba(255, 255, 255, 0.8)", fontSize: "12px", textTransform: "uppercase" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "transparent", color: "#fff", outline: "none" },
  selectInput: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(30, 41, 59, 0.2)", color: "#fff", outline: "none" },
  textarea: { padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "transparent", color: "#fff", resize: "none" },
  employeeSearchInput: { width: "100%", padding: "10px", borderRadius: "10px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", marginBottom: 10 },
  checkboxContainer: { maxHeight: "150px", overflowY: "auto", background: "rgba(255, 255, 255, 0.05)", padding: "15px", borderRadius: "10px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", color: "#fff", fontSize: "14px", marginBottom: "8px" },
  submitBtn: { flex: 1, marginTop: "40px", padding: "18px", background: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "12px", fontWeight: "700", cursor: "pointer" },
  error: { color: "#fb7185", fontSize: "12px", marginTop: "4px" }
};

const customSelectStyles = {
  control: (base) => ({ ...base, background: "transparent", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "10px" }),
  singleValue: (base) => ({ ...base, color: "#fff" }),
  multiValue: (base) => ({ ...base, background: "rgba(255, 255, 255, 0.1)" }),
  multiValueLabel: (base) => ({ ...base, color: "#fff" }),
  placeholder: (base) => ({ ...base, color: "rgba(255, 255, 255, 0.5)" }),
  menu: (base) => ({ ...base, background: "rgba(30, 41, 59, 0.95)" }),
  option: (base, state) => ({ ...base, background: state.isFocused ? "rgba(255, 255, 255, 0.1)" : "transparent", color: "#fff" })
};