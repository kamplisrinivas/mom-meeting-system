import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.11.175:5001";

export default function ReschedulePage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Filter States
  const [searchTitle, setSearchTitle] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/meetings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMeetings(data.data);
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [token]);

  // ✅ Filtering Logic
  const filteredMeetings = meetings.filter((m) => {
    const mDate = m.meeting_date?.split("T")[0]; // Extracts YYYY-MM-DD
    const matchesTitle = m.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesFrom = fromDate ? mDate >= fromDate : true;
    const matchesTo = toDate ? mDate <= toDate : true;

    return matchesTitle && matchesFrom && matchesTo;
  });

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>📅 Reschedule Meetings</h2>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>Back</button>
        </div>

        {/* ✅ Search Filter Section */}
        <div style={styles.filterBar}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Meeting Title</label>
            <input 
              style={styles.input} 
              placeholder="Search title..." 
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>From Date</label>
            <input 
              type="date" 
              style={styles.input} 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>To Date</label>
            <input 
              type="date" 
              style={styles.input} 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          
          <button 
            style={styles.clearBtn} 
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(245, 158, 11, 0.25)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(245, 158, 11, 0.15)";
              e.target.style.transform = "translateY(0)";
            }}
            onClick={() => { setSearchTitle(""); setFromDate(""); setToDate(""); }}
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <p style={{ color: "white" }}>Loading meetings...</p>
        ) : (
          <div style={styles.scrollArea}>
            {/* ✅ Result Count for UX */}
            <p style={styles.resultCount}>
              Showing {filteredMeetings.length} result{filteredMeetings.length !== 1 ? 's' : ''}
            </p>

            <div style={styles.listGrid}>
              {filteredMeetings.map((m) => (
                <div key={m.MeetingID || m.id} style={styles.card}>
                  <div style={styles.cardContent}>
                    {/* ✅ Meeting ID beside Title */}
                    <div style={styles.titleRow}>
                      <h3 style={styles.meetingTitle}>{m.title}</h3>
                      <span style={styles.idBadge}>#{m.MeetingID || m.id}</span>
                    </div>

                    <p style={styles.meetingDetail}>🗓 {m.meeting_date?.split("T")[0]}</p>
                    <p style={styles.meetingDetail}>⏰ {m.meeting_time}</p>
                    <p style={styles.meetingDetail}>📍 {m.venue}</p>
                    <p style={styles.deptDetail}>🏢 {m.department || "General"}</p>
                  </div>
                  <button 
                    style={styles.editBtn}
                    onClick={() => navigate(`/edit-meeting/${m.MeetingID || m.id}`)}
                  >
                    Edit / Reschedule
                  </button>
                </div>
              ))}
            </div>
            
            {filteredMeetings.length === 0 && (
              <div style={styles.noResults}>
                <p>No meetings found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { height: "100vh", padding: "20px", background: "transparent", overflow: "hidden" },
  container: { maxWidth: "1100px", margin: "0 auto", height: "100%", display: "flex", flexDirection: "column" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexShrink: 0 },
  title: { color: "#fff", fontSize: "24px", fontWeight: "700" },
  backBtn: { padding: "8px 16px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", transition: "0.2s" },

  /* ✅ Filter Bar Styling */
  filterBar: {
    display: "flex",
    gap: "15px",
    background: "rgba(15, 23, 42, 0.6)", 
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
    alignItems: "flex-end",
    flexWrap: "wrap",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "150px" },
  label: { color: "#ffffff", fontSize: "12px", fontWeight: "600", opacity: 0.9 },
  
  /* ✅ Bright White Input Text */
  input: {
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "10px 14px",
    borderRadius: "8px",
    color: "#ffffff", 
    fontSize: "14px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s ease"
  },

  /* ✅ Amber Clear Button */
  clearBtn: { 
    padding: "10px 20px", 
    background: "rgba(245, 158, 11, 0.15)", 
    color: "#fbbf24", 
    border: "1px solid rgba(245, 158, 11, 0.3)", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontSize: "14px",
    fontWeight: "700",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "120px"
  },

  scrollArea: { flexGrow: 1, overflowY: "auto", paddingRight: "10px" },
  resultCount: { color: "rgba(255, 255, 255, 0.5)", fontSize: "13px", marginBottom: "15px" },
  listGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", paddingBottom: "30px" },
  
  /* ✅ Card Styles */
  card: { 
    background: "rgba(255, 255, 255, 0.07)", 
    borderRadius: "16px", 
    border: "1px solid rgba(255, 255, 255, 0.1)", 
    padding: "20px", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "space-between",
    transition: "transform 0.2s ease"
  },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "15px" },
  meetingTitle: { color: "#fff", fontSize: "17px", fontWeight: "600", margin: 0, lineHeight: "1.4" },
  idBadge: { background: "rgba(96, 165, 250, 0.2)", color: "#60a5fa", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
  
  meetingDetail: { color: "rgba(255,255,255,0.7)", fontSize: "14px", margin: "5px 0" },
  deptDetail: { color: "#a5b4fc", fontSize: "12px", margin: "10px 0 0 0", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  editBtn: { 
    marginTop: "20px", 
    padding: "12px", 
    background: "#4f46e5", 
    color: "#fff", 
    border: "none", 
    borderRadius: "12px", 
    fontWeight: "700", 
    cursor: "pointer", 
    transition: "0.3s" 
  },
  noResults: { textAlign: "center", padding: "50px", color: "rgba(255,255,255,0.4)" }
};