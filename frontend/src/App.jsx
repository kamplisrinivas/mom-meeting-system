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
    
    // ✅ REDIRECT LOGIC: Admin to Dashboard, Employee to Tasks
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
    if (!token) {
      return <Navigate to="/login" replace />;
    }
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
      <div style={{ padding: '2rem 0', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', padding: '0 2.5rem' }}>
          <button 
            onClick={() => navigate("/meetings")}
            style={pageStyles.backBtn}
          >
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

    const handleCancel = () => {
      navigate("/dashboard");
    };

    return (
      <div style={{ padding: '2rem 0', maxWidth: '900px', margin: '0 auto' }}>
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
    searchText: "",
    dateFrom: "",
    dateTo: "",
    meetingId: "",
    createdBy: "",
    department: ""
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const styles = {
    container: {
      maxWidth: "1400px",
      margin: "0 auto"
    },

    header: {
      background: "white",
      padding: "25px",
      borderRadius: "18px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 5px 20px rgba(0,0,0,0.08)"
    },

    newBtn: {
      background: "linear-gradient(135deg,#667eea,#764ba2)",
      color: "white",
      padding: "10px 22px",
      borderRadius: "10px",
      textDecoration: "none",
      fontWeight: "600"
    },

    filterBox: {
      background: "white",
      padding: "20px",
      borderRadius: "18px",
      marginBottom: "20px",
      boxShadow: "0 5px 20px rgba(0,0,0,0.08)"
    },

    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
      gap: "12px"
    },

    input: {
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ddd"
    },

    clearBtn: {
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "10px",
      cursor: "pointer"
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(350px,1fr))",
      gap: "20px"
    },

    card: {
      background: "white",
      padding: "22px",
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "0.25s",
      boxShadow: "0 5px 18px rgba(0,0,0,0.08)"
    },

    title: {
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "8px"
    },

    badge: {
      display: "inline-block",
      background: "#e2e8f0",
      padding: "5px 12px",
      borderRadius: "15px",
      fontSize: "13px",
      marginTop: "6px"
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchMeetings = async () => {
      try {
        setLoading(true);

        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5001";

        const res = await fetch(`${API_URL}/api/meetings`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        const meetingsData = data.success ? data.data.filter(Boolean) : [];

        setMeetings(meetingsData);
        setFilteredMeetings(meetingsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [token]);

  useEffect(() => {
    const filtered = meetings.filter((m) => {

      const search = filters.searchText.toLowerCase();
      const datePart = m.meeting_date?.split(" ")[0] || "";

      return (
        (!search ||
          m.title?.toLowerCase().includes(search) ||
          m.description?.toLowerCase().includes(search) ||
          m.department?.toLowerCase().includes(search)) &&

        (!filters.dateFrom || datePart >= filters.dateFrom) &&
        (!filters.dateTo || datePart <= filters.dateTo) &&

        (!filters.meetingId ||
          m.id.toString().includes(filters.meetingId)) &&

        (!filters.createdBy ||
          m.created_by?.toString().includes(filters.createdBy)) &&

        (!filters.department ||
          m.department?.toLowerCase().includes(filters.department.toLowerCase()))
      );
    });

    setFilteredMeetings(filtered);
  }, [filters, meetings]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      searchText: "",
      dateFrom: "",
      dateTo: "",
      meetingId: "",
      createdBy: "",
      department: ""
    });
  };

  const openMeeting = (id) => {
    navigate(`/mom/${id}`);
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1>📋 All Meetings</h1>
          <p>{filteredMeetings.length} meetings found</p>
        </div>

        <a href="/meetings/create" style={styles.newBtn}>
          ➕ Create Meeting
        </a>
      </div>

      {/* FILTER PANEL */}
      <div style={styles.filterBox}>

        <h3>🔎 Advanced Search</h3>

        <div style={styles.filterGrid}>

          <input
            style={styles.input}
            name="searchText"
            placeholder="Search title / description"
            value={filters.searchText}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            name="meetingId"
            placeholder="Meeting ID"
            value={filters.meetingId}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            name="createdBy"
            placeholder="Created By"
            value={filters.createdBy}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            name="department"
            placeholder="Department"
            value={filters.department}
            onChange={handleChange}
          />

          <button onClick={clearFilters} style={styles.clearBtn}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* MEETING CARDS */}
      {loading ? (
        <p>Loading meetings...</p>
      ) : filteredMeetings.length === 0 ? (
        <p>No meetings found</p>
      ) : (
        <div style={styles.grid}>

          {filteredMeetings.map((meeting) => (

            <div
              key={meeting.id}
              style={styles.card}
              onClick={() => openMeeting(meeting.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >

              <div style={styles.title}>
                {meeting.title}
              </div>

              <div>
                📅 {new Date(meeting.meeting_date).toLocaleDateString("en-IN")}
              </div>

              <div style={styles.badge}>
                🏢 {meeting.department || "No Department"}
              </div>

            </div>

          ))}

        </div>
      )}

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
          {/* ✅ CHILD ROUTES RENDER INSIDE THE <OUTLET /> IN LAYOUT */}
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="meetings/create" element={<MeetingFormPage />} />
          <Route path="meetings" element={<AllMeetings />} />
          <Route path="mom/:meetingId" element={<MomPointFormPage />} />
          <Route path="employee-tasks" element={<EmployeeDashboard />} />
          
          {/* ✅ MISSING ROUTE ADDED HERE */}
          <Route path="reports" element={<Reports />} /> 

          <Route path="/meetings/:id/mom" element={<MomPointForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;