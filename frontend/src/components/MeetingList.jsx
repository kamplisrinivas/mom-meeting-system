import React from "react";

// Format date and time
const formatDate = (dateStr, timeStr) => {
  const date = new Date(dateStr + "T" + (timeStr || "00:00:00"));
  return isNaN(date) ? "-" : date.toLocaleString();
};

export default function MeetingList({ meetings }) {
  if (!meetings || meetings.length === 0) return <p>No meetings found.</p>;

  // Filter out placeholder meetings
  const validMeetings = meetings.filter(
    (m) => new Date(m.meeting_date).getFullYear() > 1900
  );

  return (
    <div>
      {validMeetings.map((meeting) => (
        <div key={meeting.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h3>{meeting.title || "Untitled Meeting"}</h3>
          <p>Date & Time: {formatDate(meeting.meeting_date, meeting.meeting_time)}</p>
          <p>Venue: {meeting.venue || "-"}</p>
          <p>Department: {meeting.department_name || "-"}</p>
        </div>
      ))}
    </div>
  );
}