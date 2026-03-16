import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Dashboard() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
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

  // 1. Fetch Raw Meetings
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
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false);
    }
  }, [token]);

  // 2. Fetch Aggregated Stats (For User Workload)
  const fetchReportStats = useCallback(async () => {
    if (!token) return;
    try {
      const queryParams = new URLSearchParams({
        startDate: appliedFilters?.dateFrom || "",
        endDate: appliedFilters?.dateTo || "",
        department: appliedFilters?.department || ""
      }).toString();

      const res = await fetch(`${API_URL}/api/reports/stats?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success) {
        setReportStats(prev => ({
          ...prev,
          userWorkload: result.data.userWorkload || [],
        }));
      }
    } catch (err) {
      console.error("Reports API Error:", err);
    }
  }, [token, appliedFilters]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  useEffect(() => {
    fetchReportStats();
  }, [fetchReportStats, appliedFilters]);

  // --- FILTER LOGIC ---
  const filteredMeetings = useMemo(() => {
    if (!appliedFilters) return meetings; 
    return meetings.filter(m => {
      const mDate = new Date(m.meeting_date);
      const matchesDept = !appliedFilters.department || m.department === appliedFilters.department;
      const matchesFrom = !appliedFilters.dateFrom || mDate >= new Date(appliedFilters.dateFrom);
      const matchesTo = !appliedFilters.dateTo || mDate <= new Date(appliedFilters.dateTo);
      return matchesDept && matchesFrom && matchesTo;
    });
  }, [meetings, appliedFilters]);

  // --- DERIVE DEPARTMENT COUNTS LOCALLY (Fixes the 0 issue) ---
  const localDeptStats = useMemo(() => {
    const counts = {};
    filteredMeetings.forEach(m => {
      const dept = m.department || "General";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredMeetings]);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  const kpiData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    return {
      total: filteredMeetings.length,
      today: filteredMeetings.filter(m => m?.meeting_date?.split(' ')[0] === today).length,
      upcoming: filteredMeetings.filter(m => m?.meeting_date && new Date(m.meeting_date) > now).length,
      completed: filteredMeetings.filter(m => m?.meeting_date && new Date(m.meeting_date) < now).length,
      online: filteredMeetings.filter(m => m?.meeting_type === 'Online').length,
      offline: filteredMeetings.filter(m => m?.meeting_type === 'Offline').length,
    };
  }, [filteredMeetings]);

  const mainCards = [
    { title: "Total Meetings", value: kpiData.total, icon: "📊", color: "#6366f1" },
    { title: "Meetings Today", value: kpiData.today, icon: "📅", color: "#10b981" },
    { title: "Upcoming", value: kpiData.upcoming, icon: "🔄", color: "#f59e0b" },
    { title: "Completed", value: kpiData.completed, icon: "✅", color: "#ef4444" },
    { title: "Online", value: kpiData.online, icon: "💻", color: "#8b5cf6" },
    { title: "Offline", value: kpiData.offline, icon: "🏢", color: "#06b6d4" }
  ];

  if (loading) return <div style={styles.loading}>Generating Analytics...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.h1}>MOM Dashboard</h1>
            <p style={styles.headerText}>Real-time Insights • {new Date().toLocaleDateString('en-IN')}</p>
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
          {/* Department Card - NOW USING LOCAL SYNCED DATA */}
          <div style={styles.glassTableCard}>
            <div style={styles.tableHeaderArea}>
              <h3 style={styles.tableTitle}>Meetings / Department</h3>
            </div>
            <div style={styles.scrollBox}>
              <table style={styles.miniTable}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>Department</th>
                    <th style={styles.thRight}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {localDeptStats.length > 0 ? (
                    localDeptStats.map((d, i) => (
                      <tr key={i} style={styles.tableRow}>
                        <td style={styles.tdLeft}>{d.name}</td>
                        <td style={styles.tdRight}>
                          <span style={styles.countBadgeBlue}>{d.count}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2" style={styles.noDataSmall}>No departments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Task Load Card */}
          <div style={styles.glassTableCard}>
            <div style={styles.tableHeaderArea}>
              <h3 style={styles.tableTitle}>User Task Load</h3>
            </div>
            <div style={styles.scrollBox}>
              <table style={styles.miniTable}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>Person</th>
                    <th style={{ ...styles.thLeft, textAlign: 'center' }}>Workload</th>
                    <th style={styles.thRight}>Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {reportStats.userWorkload.length > 0 ? (
                    reportStats.userWorkload.map((u, i) => {
                      const count = u.task_count || u.count || 0;
                      const barWidth = maxTasks > 0 ? (count / maxTasks) * 100 : 0;
                      return (
                        <tr key={i} style={styles.tableRow}>
                          <td style={styles.tdLeft}>{u.employee || u.name}</td>
                          <td style={{ padding: '0 10px', width: '40%' }}>
                            <div style={styles.barContainer}>
                              <div style={{ ...styles.barFill, width: `${barWidth}%` }} />
                            </div>
                          </td>
                          <td style={styles.tdRight}>
                            <span style={styles.countBadgeGray}>{count}</span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="3" style={styles.noDataSmall}>No task data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FILTERS */}
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
              <button onClick={handleApplyFilters} style={styles.applyBtn}>Apply</button>
              <button onClick={clearFilters} style={styles.clearBtn}>Reset</button>
            </div>
          </div>
        </div>

        {/* RECENT RECORDS */}
        <h2 style={styles.sectionTitle}>
          Recent Meetings <span style={styles.countBadge}>{filteredMeetings.length}</span>
        </h2>
        <div style={styles.meetingGrid}>
          {filteredMeetings.length > 0 ? (
            filteredMeetings.slice(0, 9).map((m, index) => (
              <div key={m.id || index} onMouseEnter={() => setHoveredMeeting(index)} onMouseLeave={() => setHoveredMeeting(null)}
                style={{
                  ...styles.meetingCard,
                  transform: hoveredMeeting === index ? 'translateY(-5px)' : 'translateY(0)',
                  background: hoveredMeeting === index ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: hoveredMeeting === index ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.meetingId}>#{m.id}</span>
                  <span style={{...styles.tag, background: 'rgba(99, 102, 241, 0.2)', color: '#a5f3fc'}}>{m.meeting_type}</span>
                </div>
                <h3 style={styles.meetingTitle}>{m.title}</h3>
                <p style={styles.deptText}>{m.department || "General"}</p>
                <div style={styles.cardFooter}>
                  <div style={styles.footerItem}>📅 {formatDateTime(m.meeting_date)}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={styles.noDataText}>No records match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const KpiCard = ({ title, value, icon, color, isHovered, onMouseEnter, onMouseLeave }) => (
  <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
    style={{ 
      ...styles.kpiCard, borderLeftColor: color,
      transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
      background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)',
    }}
  >
    <div style={styles.kpiIcon}>{icon}</div>
    <div style={styles.kpiContent}>
      <div style={{...styles.kpiValue, color: '#fff'}}>{value}</div>
      <div style={styles.kpiLabel}>{title}</div>
    </div>
  </div>
);

const styles = {
  container: { width: '100%', boxSizing: 'border-box', color: '#fff', paddingBottom: '50px' },
  loading: { color: '#fff', textAlign: 'center', padding: '100px', fontSize: '1.2rem' },
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
  inputsWrapper: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  inputItem: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  input: { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.7rem 1rem', borderRadius: '10px', color: '#fff', outline: 'none', minWidth: '180px' },
  select: { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.7rem 1rem', borderRadius: '10px', color: '#fff', minWidth: '200px' },
  applyBtn: { background: '#6366f1', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 },
  clearBtn: { background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer' },
  countBadgeBlue: { background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, minWidth: '30px', textAlign: 'center', display: 'inline-block' },
  countBadgeGray: { background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 },
  noDataSmall: { padding: '30px', textAlign: 'center', color: '#475569', fontSize: '0.85rem' },
  sectionTitle: { color: '#fff', fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 800 },
  countBadge: { background: 'rgba(99, 102, 241, 0.2)', padding: '4px 14px', borderRadius: '20px', color: '#818cf8', fontSize: '0.9rem', marginLeft: '10px' },
  meetingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' },
  meetingCard: { padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  meetingId: { color: 'rgba(255,255,255,0.2)', fontWeight: 900, fontSize: '0.85rem' },
  meetingTitle: { color: '#fff', margin: 0, fontSize: '1.1rem', fontWeight: 700 },
  deptText: { color: '#6366f1', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' },
  tag: { padding: '4px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' },
  cardFooter: { marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' },
  footerItem: { color: '#94a3b8', fontSize: '0.8rem' },
  noDataText: { color: '#475569', gridColumn: '1/-1', textAlign: 'center', padding: '60px' }
};