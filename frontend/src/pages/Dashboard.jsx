import React, { useEffect, useState, useCallback, useMemo } from "react";
import MomPointForm from "../components/MomPointForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState({
    searchText: '', dateFrom: '', dateTo: '', meetingId: '', createdBy: '', department: ''
  });
  const token = localStorage.getItem("token");

  // ✅ KPI CALCULATIONS
  const kpiData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    return {
      total: meetings.filter(m => m?.id).length,
      today: meetings.filter(m => m?.meeting_date?.split(' ')[0] === today).length,
      upcoming: meetings.filter(m => m?.meeting_date && new Date(m.meeting_date) > now).length,
      completed: meetings.filter(m => m?.meeting_date && new Date(m.meeting_date) < now).length,
      online: meetings.filter(m => m?.meeting_type === 'Online').length,
      offline: meetings.filter(m => m?.meeting_type === 'Offline').length,
      byDepartment: departments.map(dept => ({
        name: dept.name,
        count: meetings.filter(m => m.department_id == dept.id).length
      })).slice(0, 5)
    };
  }, [meetings, departments]);

  // ✅ ADVANCED FILTERING
  const filteredMeetings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    return meetings.filter((m) => {
      if (!m?.id) return false;
      const safeDate = m.meeting_date || '';
      const datePart = safeDate.split(' ')[0];
      
      let passesKpi = true;
      switch (activeFilter) {
        case 'today': passesKpi = datePart === today; break;
        case 'upcoming': passesKpi = safeDate && new Date(safeDate) > now; break;
        case 'completed': passesKpi = safeDate && new Date(safeDate) < now; break;
        case 'online': passesKpi = m.meeting_type === 'Online'; break;
        case 'offline': passesKpi = m.meeting_type === 'Offline'; break;
      }

      const searchText = searchFilters.searchText.toLowerCase();
      const passesSearch = !searchText || 
        m.title?.toLowerCase().includes(searchText) ||
        m.description?.toLowerCase().includes(searchText) ||
        m.department_name?.toLowerCase().includes(searchText);

      return passesKpi && passesSearch &&
        (!searchFilters.dateFrom || datePart >= searchFilters.dateFrom) &&
        (!searchFilters.dateTo || datePart <= searchFilters.dateTo) &&
        (!searchFilters.meetingId || m.id.toString().includes(searchFilters.meetingId)) &&
        (!searchFilters.createdBy || m.created_by?.toString().includes(searchFilters.createdBy)) &&
        (!searchFilters.department || m.department_name?.toLowerCase().includes(searchFilters.department.toLowerCase()));
    });
  }, [meetings, activeFilter, searchFilters]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [meetingsRes, deptsRes] = await Promise.all([
        fetch(`${API_URL}/api/meetings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/departments`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const meetingsData = await meetingsRes.json();
      const deptsData = await deptsRes.json();
      
      setMeetings(meetingsData.success ? meetingsData.data.filter(Boolean) : []);
      setDepartments(deptsData.success ? deptsData.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchChange = (e) => {
    setSearchFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setSearchFilters({ searchText: '', dateFrom: '', dateTo: '', meetingId: '', createdBy: '', department: '' });
    setActiveFilter('all');
  };

  const openMomForm = (meeting) => setSelectedMeeting(meeting);
  const closeMomForm = () => setSelectedMeeting(null);

  return (
    <div style={styles.container}>
      {/* PAGE HEADER */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.h1}>Minutes of Meeting Dashboard</h1>
          <p style={styles.headerText}>
            Showing {filteredMeetings.length} of {meetings.length} meetings • {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* ✅ KPI CARDS */}
      <div style={styles.kpiGrid}>
        <KpiCard 
          title="Total" 
          value={kpiData.total} 
          icon="📊" 
          active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')} 
          color="#6366f1" 
        />
        <KpiCard 
          title="Today" 
          value={kpiData.today} 
          icon="📅" 
          active={activeFilter === 'today'} 
          onClick={() => setActiveFilter('today')} 
          color="#10b981" 
        />
        <KpiCard 
          title="Upcoming" 
          value={kpiData.upcoming} 
          icon="🔄" 
          active={activeFilter === 'upcoming'} 
          onClick={() => setActiveFilter('upcoming')} 
          color="#f59e0b" 
        />
        <KpiCard 
          title="Completed" 
          value={kpiData.completed} 
          icon="✅" 
          active={activeFilter === 'completed'} 
          onClick={() => setActiveFilter('completed')} 
          color="#ef4444" 
        />
        <KpiCard 
          title="Online" 
          value={kpiData.online} 
          icon="💻" 
          active={activeFilter === 'online'} 
          onClick={() => setActiveFilter('online')} 
          color="#8b5cf6" 
        />
        <KpiCard 
          title="Offline" 
          value={kpiData.offline} 
          icon="🏢" 
          active={activeFilter === 'offline'} 
          onClick={() => setActiveFilter('offline')} 
          color="#06b6d4" 
        />
      </div>

      {/* ✅ SEARCH PANEL */}
      <div style={styles.searchPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.h2}>Advanced Search</h2>
          <button style={styles.clearBtn} onClick={clearFilters}>Clear All Filters</button>
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

      {/* ✅ MEETINGS GRID */}
      <div style={styles.meetingsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>
            {activeFilter !== 'all' ? activeFilter.toUpperCase() : 'ALL'} MEETINGS ({filteredMeetings.length})
          </h2>
          {loading && <div style={styles.spinner} />}
        </div>

        {filteredMeetings.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={styles.meetingsGrid}>
            {filteredMeetings.slice(0, 12).map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} onClick={() => openMomForm(meeting)} token={token} />
            ))}
          </div>
        )}
      </div>

      {/* ✅ MOM POINTS - REDIRECT TO ALL MEETINGS */}
{selectedMeeting && (
  <div style={styles.momRedirect}>
    <div style={styles.momIcon}>📝</div>
    <h3 style={styles.momTitle}>Meeting #{selectedMeeting.id}</h3>
    <p style={styles.momText}>
      Click <strong>"All Meetings"</strong> in the sidebar → Click any meeting card 
      to add MOM points (full page experience)
    </p>
    <div style={styles.momActions}>
      <button 
        style={styles.momPrimaryBtn}
        onClick={() => window.open('/meetings', '_self')}
      >
        → Go to All Meetings
      </button>
      <button 
        style={styles.momSecondaryBtn}
        onClick={closeMomForm}
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
};

// ==================== ALL COMPONENTS ====================

const KpiCard = ({ title, value, icon, active, onClick, color }) => (
  <div 
    style={{ 
      ...styles.kpiCard, 
      ...(active && styles.kpiActive), 
      borderLeftColor: color,
      background: active ? `linear-gradient(135deg, ${color}20, ${color}10)` : 'white'
    }} 
    onClick={onClick}
  >
    <div style={styles.kpiIcon}>{icon}</div>
    <div style={styles.kpiContent}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{title}</div>
    </div>
  </div>
);

const SearchInput = ({ name, type = 'text', placeholder, value, onChange }) => (
  <div style={styles.searchField}>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={styles.searchInput}
    />
  </div>
);

const MeetingCard = ({ meeting, onClick, token }) => (
  <div style={styles.meetingCard} onClick={onClick}>
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
    
    {meeting.description && (
      <p style={styles.meetingDesc}>{meeting.description}</p>
    )}
    
    <div style={styles.meetingFooter}>
      <span style={styles.department}>{meeting.department_name}</span>
      <div style={styles.actionHint}>👆 Click to add MOM Points</div>
    </div>
  </div>
);

const EmptyState = () => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>📋</div>
    <h3>No meetings found</h3>
    <p>Try adjusting your filters or <a href="/meetings/create" style={styles.createLink}>create a new meeting</a></p>
  </div>
);

// ==================== COMPLETE STYLES ====================

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  pageHeader: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '24px',
    marginBottom: '2rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  h1: { 
    fontSize: '2.8rem', 
    fontWeight: 800, 
    color: '#1a1a1a', 
    margin: '0 0 0.5rem 0' 
  },
  headerText: { 
    color: '#64748b', 
    fontSize: '1.2rem', 
    margin: 0 
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  kpiCard: {
    padding: '2rem',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    borderLeft: '5px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  kpiActive: {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  },
  kpiIcon: { 
    fontSize: '2.5rem', 
    width: '60px', 
    height: '60px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.8)'
  },
  kpiContent: { flex: 1 },
  kpiValue: { fontSize: '2.8rem', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 },
  kpiLabel: { color: '#64748b', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  searchPanel: {
    background: 'white',
    borderRadius: '24px',
    padding: '2.5rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  h2: { fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a', margin: 0 },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  searchField: { flex: 1 },
  searchInput: {
    width: '100%',
    padding: '1.2rem 1.5rem',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: '#fafbfc',
  },
  clearBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
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
  meetingsGrid: {
    padding: '2.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: '2rem',
  },
  meetingCard: {
    background: 'linear-gradient(145deg, #ffffff, #f0f2f5)',
    borderRadius: '20px',
    padding: '2.5rem',
    border: '1px solid #e8ecf4',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  meetingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  meetingTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.5rem 0', lineHeight: 1.3 },
  meetingDate: { color: '#64748b', fontSize: '1rem', fontWeight: 500 },
  meetingType: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    padding: '0.5rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  meetingDesc: {
    color: '#475569',
    lineHeight: '1.7',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '12px',
    borderLeft: '4px solid #667eea',
  },
  meetingFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  department: {
    background: '#f1f5f9',
    color: '#475569',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  actionHint: {
    color: '#667eea',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '6rem 2rem',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '2rem',
    opacity: 0.5,
  },
  createLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 600,
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

// Add spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-dashboard]')) {
  styleSheet.setAttribute('data-dashboard', 'true');
  document.head.appendChild(styleSheet);
}


