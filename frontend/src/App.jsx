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
    
     // ✅ EMPLOYEE → Employee Dashboard ONLY
    window.location.href = "/employee-tasks";
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  // ✅ FIXED: Simple token check only
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };


  // ✅ Role-Based Layout Wrapper
  const RoleBasedLayout = ({ children }) => {
    const userRole = localStorage.getItem("userRole");
    
    return (
      <Layout onLogout={handleLogout}>
        {userRole === "Admin" ? (
          children  // Admin sees full dashboard
        ) : (
          <Navigate to="/employee-tasks" replace />  // Employee ONLY sees EmployeeDashboard
        )}
      </Layout>
    );
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
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const allMeetingsStyles = {
      container: { maxWidth: '1400px', margin: '0 auto' },
      pageHeader: {
        background: 'white',
        padding: '2.5rem',
        borderRadius: '24px',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      h1: { fontSize: '2.5rem', fontWeight: 800, color: '#1a1a2e', margin: '0 0 0.5rem 0' },
      headerText: { color: '#64748b', fontSize: '1.2rem', margin: 0 },
      addBtn: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textDecoration: 'none',
        padding: '1.2rem 2.5rem',
        borderRadius: '16px',
        fontSize: '1.1rem',
        fontWeight: 600,
      },
      meetingsSection: {
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      },
      sectionHeader: {
        padding: '2rem 2.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      h2: { fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e', margin: 0 },
      meetingsGrid: {
        padding: '2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '2rem',
      },
      meetingCard: {
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
      },
      meetingTitle: { 
        fontSize: '1.4rem', 
        fontWeight: 700, 
        color: '#1a1a2e', 
        margin: '0 0 12px 0',
        lineHeight: 1.3
      },
      meetingDate: { 
        color: '#64748b', 
        fontSize: '1rem', 
        fontWeight: 500,
        marginBottom: '8px'
      },
      meetingDept: { 
        background: '#e2e8f0', 
        color: '#475569', 
        padding: '6px 16px', 
        borderRadius: '20px', 
        fontSize: '0.9rem',
        fontWeight: 500,
        display: 'inline-block'
      },
      clickHint: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 600,
      },
      emptyState: {
        textAlign: 'center',
        padding: '6rem 2rem',
        color: '#94a3b8',
      },
      emptyIcon: { fontSize: '5rem', marginBottom: '2rem', opacity: 0.5 },
      createLink: {
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: 600,
        display: 'inline-block',
      },
      spinner: {
        width: '24px',
        height: '24px',
        border: '3px solid #e2e8f0',

        borderTop: '3px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      },
    };

    useEffect(() => {
      if (!token) return;
      const fetchAllMeetings = async () => {
        try {
          setLoading(true);
          const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
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
      };
      fetchAllMeetings();
    }, [token]);

    const handleMeetingClick = (meetingId) => {
      navigate(`/mom/${meetingId}`);
    };

    return (
      <div style={allMeetingsStyles.container}>
        <div style={allMeetingsStyles.pageHeader}>
          <div>
            <h1 style={allMeetingsStyles.h1}>📋 All Meetings</h1>
            <p style={allMeetingsStyles.headerText}>
              Showing {meetings.length} total meetings • Click any to add MOM points
            </p>
          </div>
          <a href="/meetings/create" style={allMeetingsStyles.addBtn}>➕ New Meeting</a>
        </div>

        <div style={allMeetingsStyles.meetingsSection}>
          <div style={allMeetingsStyles.sectionHeader}>
            <h2 style={allMeetingsStyles.h2}>COMPLETE LIST ({meetings.length})</h2>
            {loading && <div style={allMeetingsStyles.spinner} />}
          </div>

          {meetings.length === 0 ? (
            <div style={allMeetingsStyles.emptyState}>
              <div style={allMeetingsStyles.emptyIcon}>📋</div>
              <h3>No meetings</h3>
              <a href="/meetings/create" style={allMeetingsStyles.createLink}>
                ➕ Create first meeting
              </a>
            </div>
          ) : (
            <div style={allMeetingsStyles.meetingsGrid}>
              {meetings.slice(0, 20).map((meeting) => (
                <div 
                  key={meeting.id} 
                  style={allMeetingsStyles.meetingCard}
                  onClick={() => handleMeetingClick(meeting.id)}
                >
                  <div style={allMeetingsStyles.clickHint}>📝 Add MOM</div>
                  <h3 style={allMeetingsStyles.meetingTitle}>{meeting.title}</h3>
                  <p style={allMeetingsStyles.meetingDate}>
                    📅 {new Date(meeting.meeting_date).toLocaleDateString('en-IN')}
                    {meeting.meeting_time && ` | 🕒 ${meeting.meeting_time}`}
                  </p>
                  <div style={allMeetingsStyles.meetingDept}>
                    {meeting.department_name || 'No department'}
                  </div>
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
          element={
            token ? <Navigate to="/dashboard" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
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
          <Route path="employee-tasks" element={<EmployeeDashboard />} /> {/* ✅ EMPLOYEE ROUTE */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
