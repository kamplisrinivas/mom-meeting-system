import { useState } from "react";

const API_URL = "http://localhost:5000";

export default function ActionItemForm({ momPointId, token, refreshMeetings, actionItems }) {
  const [text, setText] = useState("");
  const [responsibleUserId, setResponsibleUserId] = useState(2);
  const [targetDate, setTargetDate] = useState("");

  const addAction = async () => {
    const res = await fetch(`${API_URL}/api/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mom_point_id: momPointId, action_item: text, responsible_user_id: responsibleUserId, target_date: targetDate })
    });
    const data = await res.json();
    if (data.success) {
      setText("");
      refreshMeetings();
    }
  };

  return (
    <div style={{ marginTop: "5px" }}>
      <input placeholder="Action item" value={text} onChange={e => setText(e.target.value)} />
      <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
      <button onClick={addAction}>Add Action</button>
      {actionItems.map(a => (
        <div key={a.id}>
          * {a.action_item} - Responsible: {a.responsible_user_id} - Target: {new Date(a.target_date).toLocaleDateString()} - Status: {a.status}
        </div>
      ))}
    </div>
  );
}