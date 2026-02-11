// frontend/src/pages/Dashboard.jsx - ✅ ZERO IMPORTS, PURE CSS
import React, { useState, useEffect } from "react";

const Dashboard = ({ token, user }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const API_URL = "http://localhost:5001";

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/meetings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(data => {
      const meetingsList = (data.data || data.meetings || data || []).filter(m => m.meeting_date);
      setMeetings(meetingsList);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [token]);

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = !searchTerm || 
      meeting.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || meeting.meeting_type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: meetings.length,
    online: meetings.filter(m => m.meeting_type === 'online').length,
    offline: meetings.length - meetings.filter(m => m.meeting_type === 'online').length
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN') + " " + date.toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'});
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={titleStyle}>📋 MOM Dashboard</h1>
        <p style={subtitleStyle}>
          Welcome, <strong>{user?.name || 'User'}</strong> 
          <span style={roleBadgeStyle}>{user?.role?.toUpperCase()}</span>
        </p>
      </header>

      {/* Stats */}
      <div style={statsContainerStyle}>
        <div style={{...statCardStyle, background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)'}}>
          <div style={statIconStyle}>📊</div>
          <div>
            <div style={statNumberStyle}>{stats.total}</div>
            <div style={statLabelStyle}>Total Meetings</div>
          </div>
        </div>
        
        <div style={{...statCardStyle, background: 'linear-gradient(135deg, #d4edda, #c3e6cb)'}}>
          <div style={statIconStyle}>💻</div>
          <div>
            <div style={statNumberStyle}>{stats.online}</div>
            <div style={statLabelStyle}>Online</div>
          </div>
        </div>
        
        <div style={{...statCardStyle, background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)'}}>
          <div style={statIconStyle}>📍</div>
          <div>
            <div style={statNumberStyle}>{stats.offline}</div>
            <div style={statLabelStyle}>Offline</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={filtersStyle}>
        <div style={searchContainerStyle}>
          <span style={searchIconStyle}>🔍</span>
          <input
            style={searchInputStyle}
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select style={filterSelectStyle} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Meetings</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
        </select>
      </div>

      {/* Meetings */}
      <div style={meetingsContainerStyle}>
        <h2 style={sectionTitleStyle}>
          📅 {filteredMeetings.length} Meeting{filteredMeetings.length !== 1 ? 's' : ''}
        </h2>
        
        {filteredMeetings.length === 0 ? (
          <div style={emptyStateStyle}>
            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📅</div>
            <h3>No meetings found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredMeetings.map((meeting, index) => (
            <div key={meeting.id || index} style={meetingCardStyle}>
              <div style={meetingHeaderStyle}>
                <span style={meetingTypeStyle}>
                  {meeting.meeting_type === 'online' ? '💻' : '📍'}
                </span>
                <div>
                  <h3 style={meetingTitleStyle}>{meeting.title}</h3>
                  <div style={meetingMetaStyle}>
                    <span>🕒 {formatDate(meeting.meeting_date)}</span>
                    {meeting.platform && <span>📱 {meeting.platform}</span>}
                    {meeting.venue && <span>📍 {meeting.venue}</span>}
                  </div>
                </div>
              </div>
              
              {meeting.description && (
                <p style={meetingDescStyle}>{meeting.description}</p>
              )}
              
              <div style={momSectionStyle}>
                <div style={momHeaderStyle}>📝 MOM Points</div>
                {meeting.mom_points?.length > 0 ? (
                  meeting.mom_points.slice(0, 3).map((point, idx) => (
                    <div key={idx} style={momItemStyle}>
                      <span style={momNumberStyle}>{idx + 1}.</span>
                      <div>
                        <div>{point.discussion || 'Discussion'}</div>
                        {point.decision && <div style={momDecisionStyle}>✓ {point.decision}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={noMomStyle}>No MOM points added yet</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 🔥 ALL INLINE STYLES - NO IMPORTS REQUIRED
const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#333',
  paddingBottom: '2rem'
};

const headerStyle = {
  background: '#ffffff',
  boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
  padding: '2rem',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: 800,
  background: 'linear-gradient(135deg, #dc3545, #007bff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  margin: '0 0 0.5rem 0'
};

const subtitleStyle = {
  fontSize: '1.2rem',
  color: '#6c757d',
  margin: 0
};

const roleBadgeStyle = {
  background: '#f8d7da',
  color: '#dc3545',
  padding: '0.25rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginLeft: '0.5rem'
};

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  maxWidth: '1400px',
  margin: '2rem auto',
  padding: '0 2rem'
};

const statCardStyle = {
  background: '#ffffff',
  padding: '2rem 1.5rem',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid #dee2e6',
  transition: 'transform 0.3s ease'
};

const statIconStyle = {
  fontSize: '2.5rem',
  marginRight: '1.5rem',
  width: '60px',
  textAlign: 'center'
};

const statNumberStyle = {
  fontSize: '2.5rem',
  fontWeight: 800,
  color: '#dc3545',
  marginBottom: '0.25rem'
};

const statLabelStyle = {
  fontSize: '1rem',
  color: '#6c757d',
  fontWeight: 500
};

const filtersStyle = {
  background: '#ffffff',
  padding: '1.5rem 2rem',
  margin: '0 2rem 2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  flexWrap: 'wrap',
  maxWidth: '1400px',
  marginLeft: 'auto',
  marginRight: 'auto'
};

const searchContainerStyle = {
  flex: 1,
  minWidth: '300px',
  position: 'relative'
};

const searchIconStyle = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6c757d',
  fontSize: '1.1rem',
  zIndex: 2
};

const searchInputStyle = {
  width: '100%',
  padding: '0.875rem 1rem 0.875rem 3rem',
  border: '2px solid #dee2e6',
  borderRadius: '10px',
  fontSize: '1rem',
  background: '#ffffff'
};

const filterSelectStyle = {
  padding: '0.875rem 1.5rem',
  border: '2px solid #dee2e6',
  borderRadius: '10px',
  background: '#ffffff',
  fontSize: '1rem',
  cursor: 'pointer'
};

const meetingsContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto 4rem',
  padding: '0 2rem'
};

const sectionTitleStyle = {
  fontSize: '1.8rem',
  fontWeight: 700,
  color: '#dc3545',
  marginBottom: '1.5rem'
};

const meetingCardStyle = {
  background: '#ffffff',
  marginBottom: '2rem',
  borderRadius: '20px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
  overflow: 'hidden'
};

const meetingHeaderStyle = {
  display: 'flex',
  padding: '2rem',
  background: 'linear-gradient(135deg, #f8d7da 0%, #ffffff 70%)',
  borderBottom: '1px solid #dee2e6'
};

const meetingTypeStyle = {
  fontSize: '2rem',
  marginRight: '1rem',
  padding: '0.5rem',
  background: '#dc3545',
  color: 'white',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const meetingTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#dc3545',
  margin: '0 0 0.5rem 0'
};

const meetingMetaStyle = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap'
};

const meetingDescStyle = {
  padding: '0 2rem 1.5rem',
  color: '#6c757d',
  lineHeight: 1.7
};

const momSectionStyle = {
  padding: '0 2rem 2rem'
};

const momHeaderStyle = {
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#dc3545',
  marginBottom: '1.5rem',
  paddingBottom: '0.75rem',
  borderBottom: '2px solid #f5c6cb'
};

const momItemStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem',
  padding: '1.25rem',
  background: '#f8f9fa',
  borderRadius: '12px',
  borderLeft: '5px solid #dc3545'
};

const momNumberStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#dc3545',
  minWidth: '30px'
};

const momDecisionStyle = {
  color: '#28a745',
  fontWeight: 500,
  marginTop: '0.25rem'
};

const noMomStyle = {
  textAlign: 'center',
  color: '#6c757d',
  fontStyle: 'italic',
  padding: '2rem',
  background: '#f8f9fa',
  borderRadius: '12px',
  border: '2px dashed #dee2e6'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '6rem 2rem',
  color: '#6c757d'
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '70vh',
  background: '#f8f9fa',
  color: '#dc3545',
  fontSize: '1.2rem'
};

export default Dashboard;
