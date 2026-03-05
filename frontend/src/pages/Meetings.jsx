import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Meetings() {

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    dateFrom: "",
    dateTo: "",
    meetingId: "",
    createdBy: "",
    department: ""
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await api.get("/meetings");
      if (res.data.success) {
        setMeetings(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE SEARCH INPUT
  const handleSearchChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      [e.target.name]: e.target.value
    });
  };

  // ✅ CLEAR FILTERS
  const clearFilters = () => {
    setSearchFilters({
      searchText: "",
      dateFrom: "",
      dateTo: "",
      meetingId: "",
      createdBy: "",
      department: ""
    });
  };

  // ✅ FILTER LOGIC
  const filteredMeetings = useMemo(() => {

    return meetings.filter((m) => {

      const safeDate = m.meeting_date || "";
      const datePart = safeDate.split(" ")[0];

      const searchText = searchFilters.searchText.toLowerCase();

      const passesSearch =
        !searchText ||
        m.title?.toLowerCase().includes(searchText) ||
        m.description?.toLowerCase().includes(searchText) ||
        m.department?.toLowerCase().includes(searchText);

      return (
        passesSearch &&
        (!searchFilters.dateFrom || datePart >= searchFilters.dateFrom) &&
        (!searchFilters.dateTo || datePart <= searchFilters.dateTo) &&
        (!searchFilters.meetingId || m.id.toString().includes(searchFilters.meetingId)) &&
        (!searchFilters.createdBy || m.created_by?.toString().includes(searchFilters.createdBy)) &&
        (!searchFilters.department || m.department?.toLowerCase().includes(searchFilters.department.toLowerCase()))
      );

    });

  }, [meetings, searchFilters]);

  if (loading) return <p>Loading meetings...</p>;

  return (

    <div style={styles.container}>

      <h2>📋 Meetings</h2>

      {/* ✅ SEARCH PANEL */}
      <div style={styles.searchPanel}>

        <div style={styles.panelHeader}>
          <h3>Advanced Search</h3>
          <button style={styles.clearBtn} onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div style={styles.searchGrid}>

          <input
            name="searchText"
            placeholder="Search title, description..."
            value={searchFilters.searchText}
            onChange={handleSearchChange}
            style={styles.input}
          />

          <input
            type="date"
            name="dateFrom"
            value={searchFilters.dateFrom}
            onChange={handleSearchChange}
            style={styles.input}
          />

          <input
            type="date"
            name="dateTo"
            value={searchFilters.dateTo}
            onChange={handleSearchChange}
            style={styles.input}
          />

          <input
            type="number"
            name="meetingId"
            placeholder="Meeting ID"
            value={searchFilters.meetingId}
            onChange={handleSearchChange}
            style={styles.input}
          />

          <input
            type="number"
            name="createdBy"
            placeholder="Created By"
            value={searchFilters.createdBy}
            onChange={handleSearchChange}
            style={styles.input}
          />

          <input
            name="department"
            placeholder="Department"
            value={searchFilters.department}
            onChange={handleSearchChange}
            style={styles.input}
          />

        </div>

      </div>

      {/* ✅ MEETINGS TABLE */}

      <table style={styles.table}>

        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Department</th>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>MOM</th>
          </tr>
        </thead>

        <tbody>

          {filteredMeetings.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No meetings found
              </td>
            </tr>
          ) : (

            filteredMeetings.map((m) => (

              <tr key={m.id}>

                <td>{m.id}</td>

                <td>{m.title}</td>

                <td>{m.department}</td>

                <td>
                  {m.meeting_date
                    ? new Date(m.meeting_date).toLocaleDateString("en-IN")
                    : "-"}
                </td>

                <td>{m.meeting_type || "-"}</td>

                <td>{m.meeting_category || "-"}</td>

                <td>
                  <Link to={`/mom/${m.id}`} style={styles.link}>
                    View MOM
                  </Link>
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

const styles = {

  container: {
    padding: "20px"
  },

  searchPanel: {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px"
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },

  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "10px"
  },

  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  clearBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600"
  }

};