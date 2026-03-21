import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.25:5001";

export default function Dashboard() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]); 
  const [filteredRecent, setFilteredRecent] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [hoveredKpi, setHoveredKpi] = useState(null);
  const [hoveredMeeting, setHoveredMeeting] = useState(null);
  
  const [reportStats, setReportStats] = useState({ 
    userWorkload: [], 
    departmentStats: [] 
  });

  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", department: "" });
  const [appliedFilters, setAppliedFilters] = useState(null);

  const token = localStorage.getItem("token");

  // ✅ LOG 1: VERIFY RAW DATA
  useEffect(() => {
    if (meetings.length > 0) {
      console.log("--- RAW DATA CHECK ---");
      console.log("Sample Meeting:", meetings[0]);
    }
  }, [meetings]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/meetings`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      setMeetings(data.success ? data.data.filter(Boolean) : []);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    }
  }, [token]);

  const fetchFilteredGrid = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        startDate: appliedFilters?.dateFrom || "",
        endDate: appliedFilters?.dateTo || "",
        department: appliedFilters?.department || ""
      }).toString();

      const res = await fetch(`${API_URL}/api/recent-meetings?${queryParams}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      setFilteredRecent(data.success ? data.data.filter(Boolean) : []);
    } catch (err) { 
      console.error("Grid Fetch Error:", err); 
    } finally { 
      setLoading(false);
    }
  }, [token, appliedFilters]);

  const fetchReportStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/reports/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setReportStats(prev => ({ ...prev, userWorkload: result.data.userWorkload || [] }));
      }
    } catch (err) {
      console.error("Reports API Error:", err);
    }
  }, [token]);

  useEffect(() => { 
    fetchData(); 
    fetchReportStats();
  }, [fetchData, fetchReportStats]);

  useEffect(() => {
    fetchFilteredGrid();
  }, [fetchFilteredGrid, appliedFilters]);

  // ✅ IMPROVED FORMATTER: Fixes the 12:00 AM issue
  const formatDateTime = (m) => {
  if (!m || !m.meeting_date) return "-";
  
  // 1. Extract Date (handles both string and Date objects)
  const dateRaw = m.meeting_date;
  const datePart = typeof dateRaw === 'string' 
    ? dateRaw.split('T')[0].split(' ')[0] 
    : new Date(dateRaw).toISOString().split('T')[0];

  // 2. Identify the time field (handles potential casing issues)
  const timePart = m.meeting_time || m.Meeting_Time || null;

  // 3. If time is missing or exactly midnight, just show the date
  if (!timePart || timePart === "00:00:00") {
    return new Date(datePart).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  try {
    // 4. Force a clean ISO-like string merge: "2026-03-18T15:30:00"
    const combinedDate = new Date(`${datePart}T${timePart}`);

    return combinedDate.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).toUpperCase();
  } catch (err) {
    return datePart; // Fallback to just date if merge fails
  }
};

  const kpiData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: meetings.length,
      today: meetings.filter(m => m?.meeting_date?.includes(today)).length,
      online: meetings.filter(m => m?.meeting_type === 'Online').length,
      offline: meetings.filter(m => m?.meeting_type === 'Offline').length,
    };
  }, [meetings]);

  const localDeptStats = useMemo(() => {
    const counts = {};
    meetings.forEach(m => {
      const dept = m.department || "General";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [meetings]);

  const maxTasks = useMemo(() => {
    return reportStats.userWorkload.length > 0 
      ? Math.max(...reportStats.userWorkload.map(u => u.task_count || u.count || 0)) 
      : 0;
  }, [reportStats.userWorkload]);

  const departmentsDropdown = useMemo(() => {
    const depts = meetings.map(m => m.department).filter(Boolean);
    return [...new Set(depts)].sort();
  }, [meetings]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleApplyFilters = () => setAppliedFilters({ ...filters });
  const clearFilters = () => { setFilters({ dateFrom: "", dateTo: "", department: "" }); setAppliedFilters(null); };

  const mainCards = [
    { title: "Total Meetings", value: kpiData.total, icon: "📊", color: "#6366f1" },
    { title: "Meetings Today", value: kpiData.today, icon: "📅", color: "#10b981" },
    { title: "Online Mode", value: kpiData.online, icon: "💻", color: "#8b5cf6" },
    { title: "Offline Mode", value: kpiData.offline, icon: "🏢", color: "#06b6d4" }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.h1}>MOM Dashboard</h1>
            <p style={styles.headerText}>SLR Metaliks • Performance & Schedule Analytics</p>
          </div>
          <button style={styles.viewAllBtn} onClick={() => navigate('/meetings')}>Manage All →</button>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.statsGrid}>
          {mainCards.map((card, index) => (
            <KpiCard key={index} {...card} isHovered={hoveredKpi === index} onMouseEnter={() => setHoveredKpi(index)} onMouseLeave={() => setHoveredKpi(null)} />
          ))}
        </div>

        <div style={styles.analyticsGrid}>
          {/* Dept Table */}
          <div style={styles.glassTableCard}>
            <div style={styles.tableHeaderArea}><h3 style={styles.tableTitle}>Meetings / Department</h3></div>
            <div style={styles.scrollBox}>
              <table style={styles.miniTable}>
                <thead><tr><th style={styles.thLeft}>Department</th><th style={styles.thRight}>Total</th></tr></thead>
                <tbody>
                  {localDeptStats.map((d, i) => (
                    <tr key={i} style={styles.tableRow}>
                      <td style={styles.tdLeft}>{d.name}</td>
                      <td style={styles.tdRight}><span style={styles.countBadgeBlue}>{d.count}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Load Table */}
          <div style={styles.glassTableCard}>
            <div style={styles.tableHeaderArea}><h3 style={styles.tableTitle}>User Task Load</h3></div>
            <div style={styles.scrollBox}>
              <table style={styles.miniTable}>
                <thead><tr><th style={styles.thLeft}>Person</th><th style={{...styles.thLeft, textAlign: 'center'}}>Workload</th><th style={styles.thRight}>Tasks</th></tr></thead>
                <tbody>
                  {reportStats.userWorkload.map((u, i) => (
                    <tr key={i} style={styles.tableRow}>
                      <td style={styles.tdLeft}>{u.employee || u.name}</td>
                      <td style={{ padding: '0 10px', width: '40%' }}>
                        <div style={styles.barContainer}><div style={{ ...styles.barFill, width: `${maxTasks > 0 ? ((u.task_count || u.count || 0) / maxTasks) * 100 : 0}%` }} /></div>
                      </td>
                      <td style={styles.tdRight}><span style={styles.countBadgeGray}>{u.task_count || u.count || 0}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterSection}>
          <div style={styles.filterGroup}>
            <div style={styles.inputsWrapper}>
              <div style={styles.inputItem}>
                <label style={styles.label}>Date From</label>
                <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} style={styles.input} />
              </div>
              <div style={styles.inputItem}>
                <label style={styles.label}>Date To</label>
                <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} style={styles.input} />
              </div>
              <div style={styles.inputItem}>
                <label style={styles.label}>Department</label>
                <select name="department" value={filters.department} onChange={handleFilterChange} style={styles.select}>
                  <option value="">All Departments</option>
                  {departmentsDropdown.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            </div>
            <div style={styles.buttonWrapper}>
              <button onClick={handleApplyFilters} style={styles.applyBtn}>Filter Grid</button>
              <button onClick={clearFilters} style={styles.clearBtn}>Reset</button>
            </div>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>Recent Meetings</h2>
        
        {loading ? (
          <div style={styles.loadingSmall}>Updating grid...</div>
        ) : (
          <div style={styles.meetingGrid}>
            {(appliedFilters ? filteredRecent : meetings.slice(0, 9)).map((m, index) => (
              <div key={m.id || index} onMouseEnter={() => setHoveredMeeting(index)} onMouseLeave={() => setHoveredMeeting(null)}
                style={{
                  ...styles.meetingCard,
                  transform: hoveredMeeting === index ? 'translateY(-5px)' : 'translateY(0)',
                  background: hoveredMeeting === index ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                }}
                onClick={() => navigate(`/meeting/${m.id}`)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.meetingId}>#{m.id}</span>
                  <span style={{...styles.tag, background: 'rgba(99, 102, 241, 0.2)', color: '#a5f3fc'}}>{m.meeting_type}</span>
                </div>
                <h3 style={styles.meetingTitle}>{m.title}</h3>
                <p style={styles.deptText}>{m.department || "General"}</p>
                <div style={styles.cardFooter}>
                  <div style={styles.footerItem}>📅 {formatDateTime(m)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const KpiCard = ({ title, value, icon, color, isHovered, onMouseEnter, onMouseLeave }) => (
  <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
    style={{ ...styles.kpiCard, borderLeftColor: color, background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)' }}
  >
    <div style={styles.kpiIcon}>{icon}</div>
    <div style={styles.kpiContent}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{title}</div>
    </div>
  </div>
);

const styles = {
  container: { width: '100%', boxSizing: 'border-box', color: '#fff', paddingBottom: '50px' },
  loadingSmall: { color: '#818cf8', textAlign: 'center', padding: '40px' },
  pageHeader: { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)', padding: '1.5rem 2.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  h1: { fontSize: '1.8rem', fontWeight: 800, margin: 0 },
  headerText: { color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' },
  viewAllBtn: { background: 'rgba(99, 102, 241, 0.2)', color: '#a5f3fc', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  contentWrapper: { maxWidth: '1400px', margin: '0 auto', padding: '0 20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' },
  kpiCard: { padding: '1.5rem', borderRadius: '16px', borderLeft: '5px solid transparent', display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' },
  kpiIcon: { fontSize: '2rem' },
  kpiValue: { fontSize: '2rem', fontWeight: 800, lineHeight: 1 },
  kpiLabel: { color: '#64748b', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' },
  analyticsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' },
  glassTableCard: { background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column' },
  tableHeaderArea: { padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' },
  tableTitle: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' },
  scrollBox: { maxHeight: '280px', overflowY: 'auto', padding: '0 1.5rem 1rem' },
  miniTable: { width: '100%', borderCollapse: 'collapse' },
  thLeft: { textAlign: 'left', padding: '12px 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' },
  thRight: { textAlign: 'right', padding: '12px 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' },
  tableRow: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  tdLeft: { padding: '12px 0', fontSize: '0.9rem', color: '#cbd5e1' },
  tdRight: { padding: '12px 0', textAlign: 'right' },
  barContainer: { height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px', transition: 'width 0.8s ease-in-out' },
  filterSection: { background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2.5rem' },
  filterGroup: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' },
  inputsWrapper: { display: 'flex', gap: '1.5rem' },
  inputItem: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  input: { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.7rem 1rem', borderRadius: '10px', color: '#fff', minWidth: '180px' },
  select: { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.7rem 1rem', borderRadius: '10px', color: '#fff', minWidth: '200px' },
  applyBtn: { background: '#6366f1', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 },
  clearBtn: { background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer' },
  sectionTitle: { color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 800 },
  countBadgeBlue: { background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 },
  countBadgeGray: { background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 },
  meetingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' },
  meetingCard: { padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease', cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between' },
  meetingId: { opacity: 0.3 },
  meetingTitle: { margin: '10px 0' },
  deptText: { color: '#6366f1', fontWeight: 800, fontSize: '0.8rem' },
  tag: { padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem' },
  cardFooter: { marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' },
  footerItem: { fontSize: '0.8rem', color: '#94a3b8' }
};