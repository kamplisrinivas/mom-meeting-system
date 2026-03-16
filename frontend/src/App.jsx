import React, { useState, useEffect } from "react";
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useParams 
} from "react-router-dom";
import MomPointForm from "./components/MomPointForm";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MeetingForm from "./components/MeetingForm";
import Reports from "./pages/Reports";

const pageStyles = {
  backBtn: {
    background: 'linear-gradient(135deg, #64748b, #475569)',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  // Added a base transparent page wrapper style
  transparentPage: {
    padding: '2rem 0', 
    maxWidth: '1400px', 
    margin: '0 auto',
    background: 'transparent'
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      const savedRole = localStorage.getItem("userRole");
      if (savedRole) {
        setUser({ role: savedRole });
      }
    }
  }, []);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("userRole", newUser?.role);
    
    if (newUser?.role === "Admin") {
        window.location.href = "/dashboard";
    } else {
        window.location.href = "/employee-tasks";
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" replace />;
    return children;
  };

  const MomPointFormPage = () => {
    const { meetingId } = useParams();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    if (!token || !meetingId) {
      navigate("/meetings");
      return null;
    }

    return (
      <div style={pageStyles.transparentPage}>
        <div style={{ marginBottom: '2rem', padding: '0 2.5rem' }}>
          <button onClick={() => navigate("/meetings")} style={pageStyles.backBtn}>
            ← Back to Meetings
          </button>
        </div>
        <MomPointForm meetingId={meetingId} token={token} />
      </div>
    );
  };

  const MeetingFormPage = () => {
    const navigate = useNavigate();
    const handleSubmit = () => {
      alert("Meeting created successfully! 🎉");
      navigate("/dashboard");
    };
    const handleCancel = () => navigate("/dashboard");

    return (
      <div style={{ ...pageStyles.transparentPage, maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem', padding: '0 2.5rem' }}>
          <button onClick={handleCancel} style={pageStyles.backBtn}>
            ← Back to Dashboard
          </button>
        </div>
        <MeetingForm title="➕ Create New Meeting" onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    );
  };

  const AllMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
      searchText: "", dateFrom: "", dateTo: "", meetingId: "", createdBy: "", department: ""
    });

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const styles = {
      pageWrapper: {
        width: "100%",
        minHeight: "100vh", 
        // REMOVED: background image and linear gradient
        background: "transparent", 
        padding: "40px 20px",
        boxSizing: "border-box",
        margin: 0,
        position: "relative"
      },
      container: { maxWidth: "1250px", margin: "0 auto" },
      header: {
        background: "rgba(255, 255, 255, 0.15)", // Frosted glass
        backdropFilter: "blur(12px)",
        padding: "25px",
        borderRadius: "20px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "white"
      },
      newBtn: {
        background: "linear-gradient(135deg,#6366f1,#a855f7)",
        color: "white",
        padding: "12px 24px",
        borderRadius: "12px",
        textDecoration: "none",
        fontWeight: "600",
        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
      },
      filterBox: {
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(10px)",
        padding: "20px",
        borderRadius: "20px",
        marginBottom: "25px",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "white"
      },
      filterGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        gap: "12px"
      },
      input: {
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.1)",
        color: "white",
        outline: "none",
      },
      clearBtn: {
        background: "rgba(239, 68, 68, 0.2)",
        color: "#f87171",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "10px",
        padding: "10px",
        cursor: "pointer",
        fontWeight: "600"
      },
      grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
        gap: "25px"
      },
      card: {
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(16px)",
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        color: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      },
      cardTitle: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "10px", color: "#fff" },
      badge: {
        display: "inline-block",
        background: "rgba(255, 255, 255, 0.2)",
        color: "white",
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "0.85rem",
        marginTop: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }
    };

    useEffect(() => {
      if (!token) return;
      const fetchMeetings = async () => {
        try {
          setLoading(true);
          const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
          const res = await fetch(`${API_URL}/api/meetings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          const meetingsData = data.success ? data.data.filter(Boolean) : [];
          setMeetings(meetingsData);
          setFilteredMeetings(meetingsData);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
      };
      fetchMeetings();
    }, [token]);

    useEffect(() => {
      const filtered = meetings.filter((m) => {
        const search = filters.searchText.toLowerCase();
        const datePart = m.meeting_date?.split(" ")[0] || "";
        return (
          (!search || m.title?.toLowerCase().includes(search) || m.department?.toLowerCase().includes(search)) &&
          (!filters.dateFrom || datePart >= filters.dateFrom) &&
          (!filters.dateTo || datePart <= filters.dateTo) &&
          (!filters.department || m.department?.toLowerCase().includes(filters.department.toLowerCase()))
        );
      });
      setFilteredMeetings(filtered);
    }, [filters, meetings]);

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const clearFilters = () => setFilters({ searchText: "", dateFrom: "", dateTo: "", meetingId: "", createdBy: "", department: "" });

    return (
      <div style={styles.pageWrapper}>
        <style>{`
          input::placeholder { color: rgba(255,255,255,0.6) !important; }
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
        `}</style>
        <div style={styles.container}>
          <div style={styles.header}>
            <div>
              <h1 style={{margin: 0}}>📋 All Meetings</h1>
              <p style={{margin: "5px 0 0", opacity: 0.8}}>{filteredMeetings.length} meetings archived</p>
            </div>
            <a href="/meetings/create" style={styles.newBtn}>➕ Create Meeting</a>
          </div>

          <div style={styles.filterBox}>
            <div style={styles.filterGrid}>
              <input style={styles.input} name="searchText" placeholder="Search title..." value={filters.searchText} onChange={handleChange} />
              <input style={styles.input} type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} />
              <input style={styles.input} type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} />
              <input style={styles.input} name="department" placeholder="Department" value={filters.department} onChange={handleChange} />
              <button onClick={clearFilters} style={styles.clearBtn}>Clear</button>
            </div>
          </div>

          {loading ? <p style={{color: 'white', textAlign: 'center'}}>Loading meetings...</p> : (
            <div style={styles.grid}>
              {filteredMeetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  style={styles.card} 
                  onClick={() => navigate(`/mom/${meeting.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={styles.cardTitle}>{meeting.title}</div>
                  <div style={{opacity: 0.7, fontSize: '0.9rem'}}>📅 {new Date(meeting.meeting_date).toLocaleDateString("en-IN")}</div>
                  <div style={styles.badge}>🏢 {meeting.department || "General"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="meetings/create" element={<MeetingFormPage />} />
          <Route path="meetings" element={<AllMeetings />} />
          <Route path="mom/:meetingId" element={<MomPointFormPage />} />
          <Route path="employee-tasks" element={<EmployeeDashboard />} />
          <Route path="reports" element={<Reports />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;