import React, { useEffect, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AllMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

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

  if (!token) return <div>Please login to view meetings</div>;

  return (
    <div style={styles.container}>
      {/* PAGE HEADER */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.h1}>📋 All Meetings</h1>
          <p style={styles.headerText}>
            Showing {meetings.length} total meetings • Last updated {new Date().toLocaleTimeString()}
          </p>
        </div>
        <a href="/meetings/create" style={styles.addBtn}>➕ New Meeting</a>
      </div>

      {/* MEETINGS GRID */}
      <div style={styles.meetingsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>COMPLETE MEETING LIST ({meetings.length})</h2>
          {loading && <div style={styles.spinner} />}
        </div>

        {meetings.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={styles.meetingsGrid}>
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Same components as Dashboard but simplified
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
    
    {meeting.description && (
      <p style={styles.meetingDesc}>{meeting.description}</p>
    )}
    
    <div style={styles.meetingFooter}>
      <span style={styles.department}>{meeting.department_name}</span>
      <span style={styles.createdBy}>By ID: {meeting.created_by}</span>
    </div>
  </div>
);

const EmptyState = () => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>📋</div>
    <h3>No meetings yet</h3>
    <p>Create your first meeting to get started</p>
    <a href="/meetings/create" style={styles.createLink}>➕ Create Meeting</a>
  </div>
);

// Same styles as Dashboard
const styles = {
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
  h1: { fontSize: '2.8rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 0.5rem 0' },
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
  h2: { fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a', margin: 0 },
  meetingsGrid: {
    padding: '2.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: '2rem',
  },
  // ... rest of meeting card styles (copy from Dashboard.jsx)
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
  createdBy: {
    color: '#64748b',
    fontSize: '0.9rem',
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
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    padding: '1rem 2rem',
    borderRadius: '12px',
    display: 'inline-block',
    marginTop: '1rem',
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
