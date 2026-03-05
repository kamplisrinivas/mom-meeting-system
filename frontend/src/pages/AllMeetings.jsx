import React, { useEffect, useState, useCallback, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AllMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const [activeFilter, setActiveFilter] = useState("all");

  const [searchFilters, setSearchFilters] = useState({
    searchText: "",
    dateFrom: "",
    dateTo: "",
    meetingId: "",
    createdBy: "",
    department: ""
  });

  const fetchAllMeetings = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      console.log("🔥 FULL API RESPONSE:", data);

      setMeetings(data.success ? data.data.filter(Boolean) : []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  }, [token]);

  useEffect(() => {
    fetchAllMeetings();
  }, [fetchAllMeetings]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSearchFilters({
      searchText: "",
      dateFrom: "",
      dateTo: "",
      meetingId: "",
      createdBy: "",
      department: ""
    });

    setActiveFilter("all");
  };

  const filteredMeetings = useMemo(() => {

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    return meetings.filter((m) => {

      if (!m?.id) return false;

      const safeDate = m.meeting_date || "";
      const datePart = safeDate.split(" ")[0];

      let passesKpi = true;

      switch (activeFilter) {

        case "today":
          passesKpi = datePart === today;
          break;

        case "upcoming":
          passesKpi = safeDate && new Date(safeDate) > now;
          break;

        case "completed":
          passesKpi = safeDate && new Date(safeDate) < now;
          break;

        case "online":
          passesKpi = m.meeting_type === "Online";
          break;

        case "offline":
          passesKpi = m.meeting_type === "Offline";
          break;

        default:
          passesKpi = true;
      }

      const searchText = searchFilters.searchText.toLowerCase();

      const passesSearch =
        !searchText ||
        m.title?.toLowerCase().includes(searchText) ||
        m.description?.toLowerCase().includes(searchText) ||
        m.department?.toLowerCase().includes(searchText);

      return (
        passesKpi &&
        passesSearch &&
        (!searchFilters.dateFrom || datePart >= searchFilters.dateFrom) &&
        (!searchFilters.dateTo || datePart <= searchFilters.dateTo) &&
        (!searchFilters.meetingId ||
          m.id.toString().includes(searchFilters.meetingId)) &&
        (!searchFilters.createdBy ||
          m.created_by?.toString().includes(searchFilters.createdBy)) &&
        (!searchFilters.department ||
          m.department?.toLowerCase().includes(searchFilters.department.toLowerCase()))
      );

    });

  }, [meetings, activeFilter, searchFilters]);

  if (!token) return <div>Please login to view meetings</div>;

  return (

    <div style={styles.container}>

      {/* PAGE HEADER */}

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.h1}>📋 All Meetings</h1>
          <p style={styles.headerText}>
            Showing {filteredMeetings.length} meetings • Last updated {new Date().toLocaleTimeString()}
          </p>
        </div>

        <a href="/meetings/create" style={styles.addBtn}>
          ➕ New Meeting
        </a>

      </div>


      {/* SEARCH PANEL */}

      <div style={styles.searchPanel}>

        <div style={styles.panelHeader}>
          <h2 style={styles.h2}>Advanced Search</h2>

          <button style={styles.clearBtn} onClick={clearFilters}>
            Clear All Filters
          </button>

        </div>

        <div style={styles.searchGrid}>

          <SearchInput
            name="searchText"
            placeholder="Search title, description..."
            value={searchFilters.searchText}
            onChange={handleSearchChange}
          />

          <SearchInput
            name="dateFrom"
            type="date"
            value={searchFilters.dateFrom}
            onChange={handleSearchChange}
          />

          <SearchInput
            name="dateTo"
            type="date"
            value={searchFilters.dateTo}
            onChange={handleSearchChange}
          />

          <SearchInput
            name="meetingId"
            type="number"
            placeholder="Meeting ID"
            value={searchFilters.meetingId}
            onChange={handleSearchChange}
          />

          <SearchInput
            name="createdBy"
            type="number"
            placeholder="Created By"
            value={searchFilters.createdBy}
            onChange={handleSearchChange}
          />

          <SearchInput
            name="department"
            placeholder="Department"
            value={searchFilters.department}
            onChange={handleSearchChange}
          />

        </div>
      </div>


      {/* MEETINGS GRID */}

      <div style={styles.meetingsSection}>

        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>
            COMPLETE MEETING LIST ({filteredMeetings.length})
          </h2>

          {loading && <div style={styles.spinner} />}
        </div>

        {filteredMeetings.length === 0 ? (

          <EmptyState />

        ) : (

          <div style={styles.meetingsGrid}>

            {filteredMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}

          </div>

        )}

      </div>

    </div>
  );
}


const MeetingCard = ({ meeting }) => (

  <div style={styles.meetingCard}>

    <div style={styles.meetingHeader}>

      <div>
        <h3 style={styles.meetingTitle}>{meeting.title}</h3>

        <div style={styles.meetingDate}>
          📅 {new Date(meeting.meeting_date).toLocaleDateString('en-IN')}
          {meeting.meeting_time && ` | 🕒 ${meeting.meeting_time}`}
        </div>

      </div>

      <div style={styles.meetingType}>
        {meeting.meeting_type}
      </div>

    </div>

    {meeting.description && (
      <p style={styles.meetingDesc}>
        {meeting.description}
      </p>
    )}

    <div style={styles.meetingFooter}>

      <span style={styles.department}>
        {meeting.department}
      </span>

      <span style={styles.createdBy}>
        Created By: {meeting.created_by_name}
      </span>

    </div>

  </div>

);


const SearchInput = ({ name, ...props }) => (

  <input
    name={name}
    {...props}
    style={{
      padding: "0.8rem",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontSize: "0.9rem"
    }}
  />

);


const EmptyState = () => (

  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>📋</div>
    <h3>No meetings found</h3>
    <p>Create your first meeting to get started</p>

    <a href="/meetings/create" style={styles.createLink}>
      ➕ Create Meeting
    </a>

  </div>

);


const styles = {

  container: {
    maxWidth: "1400px",
    margin: "0 auto"
  },

  pageHeader: {
    background: "white",
    padding: "2.5rem",
    borderRadius: "24px",
    marginBottom: "2rem",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  h1: {
    fontSize: "2.8rem",
    fontWeight: 800,
    color: "#1a1a1a"
  },

  headerText: {
    color: "#64748b"
  },

  addBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    textDecoration: "none",
    padding: "1rem 2rem",
    borderRadius: "12px",
    fontWeight: 600
  },

  searchPanel: {
    background: "white",
    padding: "2rem",
    borderRadius: "20px",
    marginBottom: "2rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem"
  },

  searchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "1rem"
  },

  clearBtn: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer"
  },

  meetingsSection: {
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
  },

  sectionHeader: {
    padding: "2rem",
    borderBottom: "1px solid #e2e8f0"
  },

  meetingsGrid: {
    padding: "2rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px,1fr))",
    gap: "1.5rem"
  },

  meetingCard: {
    background: "#f9fafb",
    borderRadius: "16px",
    padding: "1.5rem",
    border: "1px solid #e5e7eb"
  },

  meetingTitle: {
    fontSize: "1.2rem",
    fontWeight: 700
  },

  meetingDate: {
    color: "#64748b",
    fontSize: "0.9rem"
  },

  meetingType: {
    background: "#667eea",
    color: "white",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px"
  },

  meetingFooter: {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "space-between"
  }

};