import { useState } from "react";

const API_URL = "http://localhost:5001";

export default function MeetingForm({ token, refreshMeetings }) {
  const [meeting, setMeeting] = useState({
    title: "",
    description: "",
    meeting_date: "",
    meeting_time: "",
    department_id: 1,
    meeting_type: "Offline",
    platform: "",
    venue: ""
  });

  // ================= CREATE MEETING =================
  const createMeeting = async () => {
    // ✅ Client-side validation
    if (!meeting.title?.trim()) {
      alert("Title is required");
      return;
    }
    if (!meeting.meeting_date || !meeting.meeting_time) {
      alert("Date and time are required");
      return;
    }
    if (!meeting.meeting_type) {
      alert("Meeting type is required");
      return;
    }
    if (meeting.meeting_type === "Online" && !meeting.platform?.trim()) {
      alert("Platform required for Online meeting");
      return;
    }
    if (meeting.meeting_type === "Offline" && !meeting.venue?.trim()) {
      alert("Venue required for Offline meeting");
      return;
    }

    try {
      console.log("Sending meeting data:", meeting); // Debug

      const res = await fetch(`${API_URL}/api/meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(meeting)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create meeting");
        return;
      }

      // ✅ Reset form completely
      setMeeting({
        title: "",
        description: "",
        meeting_date: "",
        meeting_time: "",
        department_id: 1,
        meeting_type: "Offline",
        platform: "",
        venue: ""
      });

      refreshMeetings();
      alert("Meeting created successfully ✅");
    } catch (err) {
      console.error("Create meeting error:", err);
      alert("Server error");
    }
  };

  // ================= UI =================
  return (
    <div style={container}>
      <h3>Create Meeting</h3>

      <input
        style={input}
        placeholder="Title *"
        value={meeting.title}
        onChange={(e) => setMeeting({ ...meeting, title: e.target.value })}
      />

      <textarea
        style={textarea}
        placeholder="Description (optional)"
        value={meeting.description}
        onChange={(e) => setMeeting({ ...meeting, description: e.target.value })}
      />

      <input
        style={input}
        type="date"
        value={meeting.meeting_date}
        onChange={(e) => setMeeting({ ...meeting, meeting_date: e.target.value })}
      />

      <input
        style={input}
        type="time"
        value={meeting.meeting_time}
        onChange={(e) => setMeeting({ ...meeting, meeting_time: e.target.value })}
      />

      <select
        style={input}
        value={meeting.department_id}
        onChange={(e) => setMeeting({ ...meeting, department_id: parseInt(e.target.value) })}
      >
        <option value={1}>HR Department</option>
        <option value={2}>Engineering</option>
        <option value={3}>Sales</option>
        <option value={4}>Marketing</option>
      </select>

      <select
        style={input}
        value={meeting.meeting_type}
        onChange={(e) => setMeeting({ ...meeting, meeting_type: e.target.value })}
      >
        <option value="Offline">Offline</option>
        <option value="Online">Online</option>
      </select>

      {meeting.meeting_type === "Online" && (
        <input
          style={input}
          placeholder="Platform (Zoom/Teams/Google Meet) *"
          value={meeting.platform}
          onChange={(e) => setMeeting({ ...meeting, platform: e.target.value })}
        />
      )}

      {meeting.meeting_type === "Offline" && (
        <input
          style={input}
          placeholder="Venue/Room *"
          value={meeting.venue}
          onChange={(e) => setMeeting({ ...meeting, venue: e.target.value })}
        />
      )}

      <button style={button} onClick={createMeeting}>
        Create Meeting
      </button>
    </div>
  );
}

// ================= STYLES =================
const container = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  maxWidth: "400px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};

const input = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  fontSize: "14px",
  transition: "border-color 0.2s"
};

const textarea = {
  ...input,
  height: "80px",
  resize: "vertical"
};

const button = {
  padding: "12px",
  background: "#003366",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "background 0.2s"
};

button:hover = {
  background: "#002244"
};
