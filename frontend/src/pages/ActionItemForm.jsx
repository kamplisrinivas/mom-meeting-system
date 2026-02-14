import { useState, useEffect } from "react";
import ActionItemForm from "../pages/ActionItemForm";

const API_URL = "http://localhost:5001";

export default function MomPointForm({ meetingId, token }) {
  const [pointText, setPointText] = useState("");
  const [momPoints, setMomPoints] = useState([]);

  // Fetch MOM points + their action items
  const fetchMomPoints = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mom/meeting/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const momPointsWithActions = await Promise.all(
          data.data.map(async (mp) => {
            const resActions = await fetch(`${API_URL}/api/actions/meeting/${mp.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const actionsData = await resActions.json();
            return { ...mp, action_items: actionsData.success ? actionsData.data : [] };
          })
        );
        setMomPoints(momPointsWithActions);
      }
    } catch (err) {
      console.error("Error fetching MOM points:", err);
    }
  };

  useEffect(() => {
    fetchMomPoints();
  }, [meetingId]);

  // Add new MOM point
  const addMomPoint = async () => {
    if (!pointText.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/mom`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ meeting_id: meetingId, point: pointText }),
      });
      const data = await res.json();
      if (data.success) {
        setPointText("");
        fetchMomPoints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Add MOM Point */}
      <div style={addMomBox}>
        <input
          placeholder="Add MOM point"
          value={pointText}
          onChange={(e) => setPointText(e.target.value)}
          style={input}
        />
        <button onClick={addMomPoint} style={button}>
          Add MOM Point
        </button>
      </div>

      {/* MOM Points List */}
      <div style={{ marginTop: "20px" }}>
        {momPoints.map((p) => (
          <div key={p.id} style={momCard}>
            <div style={momText}>
              <strong>- {p.point}</strong>
            </div>

            {/* Toggleable Action Form */}
            <ToggleActionForm
              momPointId={p.id}
              token={token}
              refreshMeetings={fetchMomPoints}
              actionItems={p.action_items || []}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Toggleable Action Form per MOM point
function ToggleActionForm({ momPointId, token, refreshMeetings, actionItems }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ marginLeft: "20px" }}>
      <button style={toggleButton} onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide Actions" : "Add Action"}
      </button>

      {showForm && (
        <div style={{ marginTop: "10px" }}>
          <ActionItemForm
            meetingId={momPointId}
            token={token}
            refreshMeetings={() => {
              refreshMeetings();
              setShowForm(false); // ✅ collapse after add
            }}
            actionItems={actionItems}
          />
        </div>
      )}

      {/* Existing action items */}
      <div style={{ marginTop: "10px" }}>
        {actionItems.map((a) => (
          <div key={a.id} style={actionItemCard}>
            <strong>{a.description}</strong>
            <div style={actionDetails}>
              Responsible: {a.assigned_to || "N/A"} | Target:{" "}
              {a.due_date ? new Date(a.due_date).toLocaleDateString() : "N/A"} | Status:{" "}
              {a.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const addMomBox = { display: "flex", gap: "10px", marginBottom: "15px" };
const input = { flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" };
const button = {
  padding: "8px 15px",
  background: "#003366",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const toggleButton = {
  padding: "5px 10px",
  background: "#0066cc",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
};
const momCard = {
  background: "#f9f9f9",
  padding: "15px",
  borderRadius: "6px",
  marginBottom: "12px",
  borderLeft: "4px solid #003366",
};
const momText = { fontSize: "15px", marginBottom: "10px" };
const actionItemCard = {
  background: "#fff",
  padding: "8px",
  borderRadius: "4px",
  marginBottom: "6px",
  border: "1px solid #ddd",
};
const actionDetails = { fontSize: "13px", color: "#555" };