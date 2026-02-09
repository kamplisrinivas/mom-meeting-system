import { useState } from "react";
import ActionItemForm from "../pages/ActionItemForm";

const API_URL = "http://localhost:5000";

export default function MomPointForm({ meetingId, token, refreshMeetings, momPoints }) {
  const [pointText, setPointText] = useState("");

  const addMomPoint = async () => {
    const res = await fetch(`${API_URL}/api/mom`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ meeting_id: meetingId, point: pointText })
    });
    const data = await res.json();
    if (data.success) {
      setPointText("");
      refreshMeetings();
    }
  };

  return (
    <div>
      <input placeholder="Add MOM point" value={pointText} onChange={e => setPointText(e.target.value)} />
      <button onClick={addMomPoint}>Add MOM Point</button>
      {momPoints.map(p => (
        <div key={p.id} style={{ marginTop: "10px", paddingLeft: "20px" }}>
          - {p.point}
          <ActionItemForm momPointId={p.id} token={token} refreshMeetings={refreshMeetings} actionItems={p.action_items || []} />
        </div>
      ))}
    </div>
  );
}