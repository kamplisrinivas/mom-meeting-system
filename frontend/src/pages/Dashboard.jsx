// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";

// Format date function
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return isNaN(date) ? "-" : date.toLocaleString();
};

// Filter out placeholder meetings (optional)
const isValidMeeting = (meeting) => {
  const date = new Date(meeting.meeting_date);
  return !isNaN(date) && date.getFullYear() > 1900;
};

export default function Dashboard({ token, user }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    if (!token) return;

    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Use `data.data` if your backend returns { success: true, data: [...] }
        const meetingsList = data.data || data.meetings || [];
        setMeetings(meetingsList.filter(isValidMeeting));
      } catch (error) {
        console.error("Error fetching meetings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [token]);

  if (loading) return <p>Loading meetings...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>MOM Dashboard 🚀</h1>
      <p>Welcome, {user.role?.toUpperCase() || "-"}</p>

      <h2>Meetings</h2>
      {meetings.length === 0 && <p>No meetings found.</p>}

      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          style={{
            border: "1px solid #ccc",
            margin: "10px 0",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3>{meeting.title || "-"}</h3>
          <p>Date: {formatDate(meeting.meeting_date)}</p>
          <p>Venue: {meeting.venue || "-"}</p>

          <h4>MOM Points</h4>
          {meeting.mom_points?.length > 0 ? (
            meeting.mom_points.map((point) => (
              <div
                key={point.id}
                style={{ marginLeft: "20px", marginBottom: "10px" }}
              >
                <p><strong>Discussion:</strong> {point.discussion || "-"}</p>
                <p><strong>Decision:</strong> {point.decision || "-"}</p>
                <p><strong>Created At:</strong> {formatDate(point.created_at)}</p>
              </div>
            ))
          ) : (
            <p>No MOM points</p>
          )}
        </div>
      ))}
    </div>
  );
}