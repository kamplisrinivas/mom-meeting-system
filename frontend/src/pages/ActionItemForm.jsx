import { useState, useEffect } from "react";
import ActionItemForm from "../pages/ActionItemForm";

const API_URL = "http://172.168.11.175:5001";

export default function MomPointForm({ meetingId, token }) {
  const [pointText, setPointText] = useState("");
  const [momPoints, setMomPoints] = useState([]);

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
    <div style={containerLayout}>
      {/* Add MOM Point Input Section */}
      <div style={addMomBox}>
        <input
          placeholder="Enter discussion point..."
          value={pointText}
          onChange={(e) => setPointText(e.target.value)}
          style={input}
        />
        <button onClick={addMomPoint} style={mainButton}>
          Add MOM Point
        </button>
      </div>

      {/* MOM Points List */}
      <div style={{ marginTop: "20px" }}>
        {momPoints.map((p) => (
          <div key={p.id} style={momCard}>
            <div style={momText}>
              <strong>• {p.point}</strong>
            </div>

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

function ToggleActionForm({ momPointId, token, refreshMeetings, actionItems }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ marginLeft: "15px", borderLeft: "2px solid #cbd5e1", paddingLeft: "15px" }}>
      <button 
        style={{...toggleButton, background: showForm ? "#64748b" : "#3b82f6"}} 
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "✕ Close" : "+ Add Action Item"}
      </button>

      {showForm && (
        <div style={actionFormWrapper}>
          <ActionItemForm
            meetingId={momPointId}
            token={token}
            refreshMeetings={() => {
              refreshMeetings();
              setShowForm(false);
            }}
            actionItems={actionItems}
          />
        </div>
      )}

      <div style={{ marginTop: "10px" }}>
        {actionItems.map((a) => (
          <div key={a.id} style={actionItemCard}>
            <div style={{ fontWeight: "600", color: "#1e293b" }}>{a.description}</div>
            <div style={actionDetails}>
              <span>👤 {a.assigned_to || "Unassigned"}</span>
              <span style={{ margin: "0 10px" }}>|</span>
              <span>📅 {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No Date"}</span>
              <span style={{ margin: "0 10px" }}>|</span>
              <span style={statusBadge}>{a.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= UPDATED LIGHT BLUE STYLES ================= */

const containerLayout = {
  marginTop: "20px",
  fontFamily: "sans-serif",
  color: "#334155"
};

const addMomBox = { 
  display: "flex", 
  gap: "10px", 
  marginBottom: "20px",
  padding: "15px",
  background: "#f0f7ff", // Very light blue
  borderRadius: "8px",
  border: "1px solid #dbeafe"
};

const input = { 
  flex: 1, 
  padding: "10px", 
  borderRadius: "6px", 
  border: "1px solid #bfdbfe",
  outline: "none"
};

const mainButton = {
  padding: "10px 20px",
  background: "#2563eb", // Bright blue
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600"
};

const momCard = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "15px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
};

const momText = { 
  fontSize: "16px", 
  marginBottom: "15px", 
  color: "#1e293b" 
};

const toggleButton = {
  padding: "6px 12px",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  marginBottom: "10px",
  transition: "background 0.2s"
};

const actionFormWrapper = {
  marginTop: "10px",
  padding: "15px",
  background: "#f8fafc", // Lightest gray-blue
  borderRadius: "8px",
  border: "1px dashed #3b82f6" 
};

const actionItemCard = {
  background: "#eff6ff", // Light blue background for items
  padding: "12px",
  borderRadius: "6px",
  marginBottom: "8px",
  borderLeft: "4px solid #3b82f6"
};

const actionDetails = { 
  fontSize: "13px", 
  color: "#64748b", 
  marginTop: "5px",
  display: "flex",
  alignItems: "center"
};

const statusBadge = {
  background: "#dcfce7",
  color: "#166534",
  padding: "2px 8px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase"
};