import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function MOM() {
  const { meetingId } = useParams();
  const [mom, setMom] = useState([]);
  const [point, setPoint] = useState("");

  const loadMOM = async () => {
    const res = await api.get(`/mom/meeting/${meetingId}`);
    setMom(res.data.data);
  };

  useEffect(() => {
    loadMOM();
  }, []);

  const addPoint = async () => {
    await api.post("/mom", {
      meeting_id: meetingId,
      description: point
    });
    setPoint("");
    loadMOM();
  };

  return (
    <div>
      <h2>MOM – Meeting #{meetingId}</h2>

      {/* ADD MOM */}
      <input
        placeholder="MOM point"
        value={point}
        onChange={e => setPoint(e.target.value)}
      />
      <button onClick={addPoint}>Add</button>

      <hr />

      {/* LIST MOM */}
      {mom.map(m => (
        <div key={m.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <b>{m.description}</b>

          <ul>
            {m.actions?.map(a => (
              <li key={a.id}>
                {a.action_item} — <b>{a.status}</b>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}