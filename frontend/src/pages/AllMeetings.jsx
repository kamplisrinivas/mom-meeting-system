import React, { useEffect, useState, useCallback, useMemo } from "react";
// 1. Ensure this import is valid. Check your console for "Module not found"
import bgImage from "../assets/img/allmeetings.jpg"; 

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.25:5001";

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
        case "today": passesKpi = datePart === today; break;
        case "upcoming": passesKpi = safeDate && new Date(safeDate) > now; break;
        case "completed": passesKpi = safeDate && new Date(safeDate) < now; break;
        case "online": passesKpi = m.meeting_type === "Online"; break;
        case "offline": passesKpi = m.meeting_type === "Offline"; break;
        default: passesKpi = true;
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
        (!searchFilters.meetingId || m.id.toString().includes(searchFilters.meetingId)) &&
        (!searchFilters.createdBy || m.created_by?.toString().includes(searchFilters.createdBy)) &&
        (!searchFilters.department || m.department?.toLowerCase().includes(searchFilters.department.toLowerCase()))
      );
    });
  }, [meetings, activeFilter, searchFilters]);

  if (!token) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Please login to view meetings</div>;

  return (
    // 2. Applying background image with a fallback color and linear gradient
    <div style={{
      ...styles.pageWrapper,
      backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgImage})`
    }}>
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.6) !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
        
        /* Ensures the background image stays visible even if content is short */
        html, body {
            margin: 0;
            padding: 0;
            min-height: 100%;
        }
      `}</style>

      <div style={styles.container}>
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

        <div style={styles.searchPanel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.h2}>Advanced Search</h2>
            <button style={styles.clearBtn} onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
          <div style={styles.searchGrid}>
            <SearchInput name="searchText" placeholder="Search title, description..." value={searchFilters.searchText} onChange={handleSearchChange} />
            <SearchInput name="dateFrom" type="date" value={searchFilters.dateFrom} onChange={handleSearchChange} />
            <SearchInput name="dateTo" type="date" value={searchFilters.dateTo} onChange={handleSearchChange} />
            <SearchInput name="meetingId" type="number" placeholder="Meeting ID" value={searchFilters.meetingId} onChange={handleSearchChange} />
            <SearchInput name="createdBy" type="number" placeholder="Created By" value={searchFilters.createdBy} onChange={handleSearchChange} />
            <SearchInput name="department" placeholder="Department" value={searchFilters.department} onChange={handleSearchChange} />
          </div>
        </div>

        <div style={styles.meetingsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.h2}>COMPLETE MEETING LIST ({filteredMeetings.length})</h2>
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
    </div>
  );
}

// ... (Sub-components: MeetingCard, SearchInput, EmptyState remain the same)

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
      <div style={styles.meetingType}>{meeting.meeting_type}</div>
    </div>
    {meeting.description && <p style={styles.meetingDesc}>{meeting.description}</p>}
    <div style={styles.meetingFooter}>
      <span style={styles.department}>🏷️ {meeting.department}</span>
      <span style={styles.createdBy}>👤 {meeting.created_by_name}</span>
    </div>
  </div>
);

const SearchInput = ({ name, ...props }) => (
  <input name={name} {...props} style={styles.inputStyle} />
);

const EmptyState = () => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>📋</div>
    <h3 style={{color: 'white'}}>No meetings found</h3>
    <p style={{color: 'rgba(255,255,255,0.7)'}}>Try adjusting your filters or create a new one.</p>
    <a href="/meetings/create" style={styles.addBtn}>➕ Create Meeting</a>
  </div>
);

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#1a1a1a", // Fallback color
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed", // Keeps image fixed while scrolling
    backgroundRepeat: "no-repeat",
    padding: "2rem 0",
    display: "block"
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 20px"
  },
  pageHeader: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    padding: "2rem",
    borderRadius: "20px",
    marginBottom: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white"
  },
  h1: { fontSize: "2.2rem", fontWeight: 800, margin: 0, color: "#fff" },
  h2: { fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#fff" },
  headerText: { color: "rgba(255,255,255,0.8)", margin: "5px 0 0 0" },
  addBtn: {
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "white",
    textDecoration: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "10px",
    fontWeight: 600,
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
  },
  searchPanel: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    borderRadius: "20px",
    marginBottom: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  panelHeader: { display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" },
  searchGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem" },
  inputStyle: {
    padding: "0.8rem",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontSize: "0.9rem",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    outline: "none"
  },
  clearBtn: {
    background: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(239, 68, 68, 0.5)",
    color: "#f87171",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600
  },
  meetingsSection: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(15px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    minHeight: '400px'
  },
  sectionHeader: { padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", display: 'flex', justifyContent: 'space-between' },
  meetingsGrid: {
    padding: "2rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem"
  },
  meetingCard: {
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(5px)",
    borderRadius: "16px",
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    transition: "transform 0.2s ease",
    color: "white"
  },
  meetingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  meetingTitle: { fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#fff" },
  meetingDate: { color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginTop: '4px' },
  meetingType: { background: "rgba(99, 102, 241, 0.3)", color: "#c7d2fe", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, border: '1px solid rgba(99,102,241,0.4)' },
  meetingDesc: { color: "rgba(255,255,255,0.8)", fontSize: '0.9rem', lineHeight: '1.5', margin: '1rem 0' },
  meetingFooter: { marginTop: "1rem", display: "flex", justifyContent: "space-between", fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' },
  emptyState: { textAlign: 'center', padding: '5rem 0' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' }
};