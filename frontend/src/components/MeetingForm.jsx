import { useState } from "react";

const API_URL = "http://localhost:5000";

export default function MeetingForm({ token, refreshMeetings }) {
  const [meeting, setMeeting] = useState({
    title: "",
    meeting_date: "",
    meeting_time: "",
    department_id: 1,
    meeting_type: "IN_PERSON",
    platform: "IN_PERSON",
    venue: ""
  });

  const createMeeting = async () => {
    const res = await fetch(`${API_URL}/api/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(meeting)
    });
    const data = await res.json();
    if (data.success) {
      setMeeting({ title: "", meeting_date: "", meeting_time: "", department_id: 1, meeting_type: "IN_PERSON", platform: "IN_PERSON", venue: "" });
      refreshMeetings();
    }
  };

  return (
    <div>
      <h3>Create Meeting</h3>
      <input placeholder="Title" value={meeting.title} onChange={e => setMeeting({ ...meeting, title: e.target.value })} />
      <input type="date" value={meeting.meeting_date} onChange={e => setMeeting({ ...meeting, meeting_date: e.target.value })} />
      <input type="time" value={meeting.meeting_time} onChange={e => setMeeting({ ...meeting, meeting_time: e.target.value })} />
      <input placeholder="Venue" value={meeting.venue} onChange={e => setMeeting({ ...meeting, venue: e.target.value })} />
      <button onClick={createMeeting}>Create Meeting</button>
    </div>
  );
}