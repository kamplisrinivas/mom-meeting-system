import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    api.get("/meetings")
      .then(res => {
        setMeetings(res.data.data);
      })
      .catch(err => {
        console.error("Error fetching meetings:", err);
      });
  }, []);

  return (
    <div>
      <h2>Meetings</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Title</th>
            <th>Department</th> {/* ✅ Added */}
            <th>Date</th>
            <th>MOM</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map(m => (
            <tr key={m.id}>
              <td>{m.title}</td>
              <td>{m.department}</td> {/* ✅ Display Department */}
              <td>{m.meeting_date}</td>
              <td>
                <Link to={`/mom/${m.id}`}>View MOM</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}