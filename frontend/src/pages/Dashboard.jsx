import React, { useEffect, useState } from "react";
import MomPointForm from "../components/MomPointForm"; // make sure path is correct

const API_URL = "http://localhost:5001";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meeting_date: "",
    meeting_time: "",
    department_id: "",
    meeting_type: "",
    platform: "",
    venue: "",
  });

  const token = localStorage.getItem("token");

  /* ================= FETCH MEETINGS ================= */
  const fetchMeetings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMeetings(data.data);
      else setMeetings([]);
    } catch (err) {
      console.error("Error fetching meetings:", err);
    }
  };

  /* ================= FETCH DEPARTMENTS ================= */
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setDepartments(data);
      else if (data.success) setDepartments(data.data);
      else setDepartments([]);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchDepartments();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= ADD MEETING ================= */
  const addMeeting = async () => {
    if (!formData.title || !formData.meeting_date || !formData.department_id || !formData.meeting_type) {
      alert("Please fill all required fields");
      return;
    }

    const res = await fetch(`${API_URL}/api/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Failed to create meeting");

    alert("Meeting Created Successfully");
    setShowForm(false);
    setFormData({
      title: "",
      description: "",
      meeting_date: "",
      meeting_time: "",
      department_id: "",
      meeting_type: "",
      platform: "",
      venue: "",
    });
    fetchMeetings();
  };

  return (
    <div style={container}>
      <h2>Minutes of Meeting (MoM)</h2>

      {/* Add Meeting Button */}
      <button style={button} onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Meeting"}
      </button>

      {/* ================= FORM ================= */}
      {showForm && (
        <div style={formBox}>
          <h3>Create Meeting</h3>
          <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} style={input} />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={input} />
          <input type="date" name="meeting_date" value={formData.meeting_date} onChange={handleChange} style={input} />
          <input type="time" name="meeting_time" value={formData.meeting_time} onChange={handleChange} style={input} />
          <select name="department_id" value={formData.department_id} onChange={handleChange} style={input}>
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <select name="meeting_type" value={formData.meeting_type} onChange={handleChange} style={input}>
            <option value="">Select Meeting Type</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>

          {formData.meeting_type === "Online" && (
            <input name="platform" placeholder="Platform (Zoom / Teams)" value={formData.platform} onChange={handleChange} style={input} />
          )}

          {formData.meeting_type === "Offline" && (
            <input name="venue" placeholder="Venue" value={formData.venue} onChange={handleChange} style={input} />
          )}

          <button onClick={addMeeting} style={button}>Save Meeting</button>
        </div>
      )}

      {/* ================= MEETING LIST ================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>All Meetings</h3>
        {meetings.map((m) => (
          <div key={m.id} style={meetingCard}>
            <div style={meetingHeader}>
              <strong>{m.title}</strong>
              <span>{new Date(m.meeting_date).toLocaleDateString()} {m.meeting_time}</span>
            </div>
            {m.description && <p style={description}>{m.description}</p>}
            <div style={meetingDetails}>
              <span><strong>Department:</strong> {m.department_name || "N/A"}</span>
              <span><strong>Type:</strong> {m.meeting_type || "N/A"}</span>
              {m.platform && <span><strong>Platform:</strong> {m.platform}</span>}
              {m.venue && <span><strong>Venue:</strong> {m.venue}</span>}
            </div>

            {/* ================= MOM Points ================= */}
            <div style={{ marginTop: "15px" }}>
              <MomPointForm meetingId={m.id} token={token} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const container = { padding: "30px", background: "#f4f4f4", minHeight: "100vh" };
const formBox = { background: "white", padding: "20px", marginTop: "20px", borderRadius: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "10px" };
const input = { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" };
const button = { padding: "10px", background: "#003366", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const meetingCard = { background: "#fff", padding: "20px", marginBottom: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" };
const meetingHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "18px", marginBottom: "5px" };
const description = { fontStyle: "italic", color: "#555", marginBottom: "10px" };
const meetingDetails = { display: "flex", gap: "15px", flexWrap: "wrap", color: "#333", fontSize: "14px", marginBottom: "10px" };