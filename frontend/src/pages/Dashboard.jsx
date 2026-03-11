import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../image/slrm-front-gate.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Dashboard() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
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
    };
  }, [meetings]);

  const fetchData = useCallback(async () => {
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
    fetchData();
  }, [fetchData]);

  // KPI Card Config
  const cards = [
    { title: "Total Meetings", value: kpiData.total, icon: "📊", color: "#6366f1" },
    { title: "Meetings Today", value: kpiData.today, icon: "📅", color: "#10b981" },
    { title: "Upcoming", value: kpiData.upcoming, icon: "🔄", color: "#f59e0b" },
    { title: "Completed", value: kpiData.completed, icon: "✅", color: "#ef4444" },
    { title: "Online", value: kpiData.online, icon: "💻", color: "#8b5cf6" },
    { title: "Offline", value: kpiData.offline, icon: "🏢", color: "#06b6d4" }
  ];

  return (
    <div style={styles.container}>
      {/* PAGE HEADER */}
      <div style={styles.pageHeader}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.h1}>Minutes of Meeting Dashboard</h1>
            <p style={styles.headerText}>
              System Overview • {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button style={styles.viewAllBtn} onClick={() => navigate('/meetings')}>
              View All Meetings →
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div style={styles.kpiGrid}>
        {cards.map((card, index) => (
          <KpiCard 
            key={index}
            {...card}
            isHovered={hoveredIndex === index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </div>

      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
          <p style={{ color: 'white', fontWeight: '600' }}>Updating Metrics...</p>
        </div>
      )}
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

const KpiCard = ({ title, value, icon, color, isHovered, onMouseEnter, onMouseLeave }) => (
  <div 
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{ 
      ...styles.kpiCard, 
      borderLeftColor: color,
      // DYNAMIC HOVER EFFECTS
      transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
      boxShadow: isHovered 
        ? '0 25px 50px rgba(0,0,0,0.3)' 
        : '0 10px 25px rgba(0,0,0,0.15)',
      background: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
    }}
  >
    <div style={{
      ...styles.kpiIcon,
      transform: isHovered ? 'rotate(15deg) scale(1.1)' : 'rotate(0deg) scale(1)',
      transition: 'transform 0.3s ease'
    }}>
      {icon}
    </div>
    
    <div style={styles.kpiContent}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{title}</div>
    </div>
  </div>
);

// ==================== STYLES ====================

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2.5rem',
    backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  pageHeader: {
    background: 'white',
    padding: '2rem 3rem',
    borderRadius: '24px',
    marginBottom: '3rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  h1: { fontSize: '2.4rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 5px 0' },
  headerText: { color: '#64748b', fontSize: '1.1rem', margin: 0, fontWeight: '500' },
  viewAllBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.8rem',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '1rem',
    boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
  },
  kpiGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '2.5rem' 
  },
  kpiCard: {
    padding: '2.5rem',
    borderRadius: '24px',
    borderLeft: '8px solid transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '1.8rem',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Smooth bouncy effect
    backdropFilter: 'blur(10px)',
  },
  kpiIcon: { 
    fontSize: '3.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiContent: { flex: 1 },
  kpiValue: { 
    fontSize: '3.5rem', 
    fontWeight: 900, 
    color: '#1a1a1a', 
    lineHeight: 1,
    letterSpacing: '-1px'
  },
  kpiLabel: { 
    color: '#64748b', 
    fontSize: '1rem', 
    fontWeight: 700, 
    textTransform: 'uppercase', 
    marginTop: '8px',
    letterSpacing: '0.5px'
  },
  loadingOverlay: { 
    textAlign: 'center', 
    marginTop: '4rem' 
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '5px solid rgba(255,255,255,0.2)', 
    borderTop: '5px solid #667eea', 
    borderRadius: '50%', 
    margin: '0 auto 1.5rem',
    animation: 'spin 1s linear infinite' 
  },
};

// Injection of keyframes for the spinner
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
  document.head.appendChild(styleSheet);
}