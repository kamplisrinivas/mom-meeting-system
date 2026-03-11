import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FaPrint, FaCalendarAlt, FaCheckCircle, 
  FaClock, FaUsers, FaChartLine, FaTag, FaFileExcel, FaFilePdf, FaSearch, FaUserTie 
} from 'react-icons/fa';
import '../styles/Report.css';

const API = "http://localhost:5001/api";

export default function Reports() {
  const [stats, setStats] = useState({
    totalMeetings: 0, totalTasks: 0, completedTasks: 0, pendingActions: 0, completionRate: 0,
    departmentStats: [], userWorkload: []
  });
  const [meetings, setMeetings] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate, endDate, 
        department: departmentFilter,
        category: categoryFilter, 
        title: titleFilter
      }).toString();

      const [statsRes, meetingRes, catRes] = await Promise.all([
        fetch(`${API}/reports/stats?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/reports/meeting-details?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/categories`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const statsData = await statsRes.json();
      const meetingData = await meetingRes.json();
      const catData = await catRes.json();
      
      if (statsData.success) setStats(statsData.data || {});
      if (meetingData.success) setMeetings(meetingData.data || []);
      if (catData.success) setCategories(catData.data || []);
      
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Generating SLR Metaliks Analytics...</p>
    </div>
  );

  return (
    <div className="reports-wrapper" style={scrollWrapperStyle}>
      <div className="reports-page" style={{ padding: '24px' }}>
        
        {/* HEADER */}
        <header className="reports-header" style={headerStyle}>
          <div className="header-info">
            <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>SLR Metaliks Insights</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>Management Information System (MIS) Report</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => exportExcel(meetings)} style={{ ...actionBtnBase, background: '#10b981', color: 'white' }}>
              <FaFileExcel /> Excel
            </button>
            <button onClick={() => exportPDF(stats, meetings)} style={{ ...actionBtnBase, background: '#ef4444', color: 'white' }}>
              <FaFilePdf /> PDF
            </button>
            <button onClick={() => window.print()} style={{ ...actionBtnBase, background: '#64748b', color: 'white' }}>
              <FaPrint /> Print View
            </button>
          </div>
        </header>

        {/* FILTERS */}
        <div className="control-panel" style={filterBarStyle}>
          <div className="filter-side" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div className="input-box">
              <label style={labelStyle}><FaCalendarAlt /> Start</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div className="input-box">
              <label style={labelStyle}><FaCalendarAlt /> End</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
            <div className="input-box">
              <label style={labelStyle}><FaUsers /> Dept</label>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} style={inputStyle}>
                <option value="">All Departments</option>
                {[...new Set(meetings.map(m => m.department))].filter(Boolean).map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="input-box">
              <label style={labelStyle}><FaTag /> Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={inputStyle}>
                <option value="">All Categories</option>
                <option value="technical">Technical</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <button className="btn-apply" onClick={fetchReports} style={applyBtnStyle}>Generate Report</button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <KPICard title="Total Meetings" value={stats.totalMeetings} icon={<FaUsers />} color="#6366f1" />
          <KPICard title="Pending Tasks" value={stats.pendingActions} icon={<FaClock />} color="#f59e0b" />
          <KPICard title="Completed" value={stats.completedTasks} icon={<FaCheckCircle />} color="#10b981" />
          <KPICard title="Productivity" value={`${stats.completionRate}%`} icon={<FaChartLine />} color="#3b82f6" />
        </div>

        {/* DATA TABLE */}
        <div className="card full-width shadow" style={cardStyle}>
          <h3 style={cardTitleStyle}>Detailed MOM Report</h3>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Meeting Title</th>
                  <th>Details</th>
                  <th>Dept / Category</th>
                  <th>Conducted By</th>
                  <th>Discussion Point</th>
                  <th>Responsible</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {meetings.length > 0 ? meetings.map((m, i) => (
                  <tr key={i}>
                    <td className="font-bold">{m.title}</td>
                    <td style={{ fontSize: '12px' }}>
                      <div>{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-GB') : "-"}</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{m.meeting_type}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{m.department}</div>
                      <span style={catTagStyle}>{m.meeting_category}</span>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      <FaUserTie style={{ marginRight: '4px', color: '#64748b' }} />
                      {m.conducted_by_name || "N/A"}
                    </td>
                    <td className="text-muted" style={{ maxWidth: '250px' }}>{m.point}</td>
                    
                    {/* CRITICAL FIX: Responsible Mapping */}
                    <td style={{ fontWeight: '500', color: '#334155' }}>
                      {m.assigned_to_names || m.assigned_to || "Unassigned"}
                    </td>

                    <td>
                      <span className={`status-pill ${m.status?.toLowerCase().replace(/\s/g, '')}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{textAlign:'center', padding:'40px', color: '#94a3b8'}}>No meeting data matches the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- KPI Card Component ---
const KPICard = ({ title, value, icon, color }) => (
  <div style={{ ...cardStyle, borderLeft: `6px solid ${color}`, display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
    <div style={{ color: color, fontSize: '28px' }}>{icon}</div>
    <div>
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{title}</span>
      <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>{value}</h2>
    </div>
  </div>
);

// --- STYLES ---
const scrollWrapperStyle = { height: '100vh', overflowY: 'auto', background: '#f1f5f9', width: '100%' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const actionBtnBase = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700' };
const filterBarStyle = { background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', minWidth: '160px', outline: 'none', background: '#fff' };
const applyBtnStyle = { background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', height: '40px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' };
const cardStyle = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' };
const cardTitleStyle = { margin: '0 0 16px', fontSize: '16px', color: '#1e293b', fontWeight: '700' };
const catTagStyle = { background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' };

// --- EXPORT FUNCTIONS ---
function exportExcel(meetings) {
  const ws = XLSX.utils.json_to_sheet(meetings.map(m => ({
    "Meeting Title": m.title,
    "Date": m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-GB') : "",
    "Type": m.meeting_type || "",
    "Category": m.meeting_category || "General",
    "Department": m.department,
    "Conductor": m.conducted_by_name || "N/A",
    "Point": m.point,
    "Responsible": m.assigned_to_names || m.assigned_to || "Unassigned",
    "Status": m.status
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SLR_MOM_Report");
  XLSX.writeFile(wb, "SLR_Metaliks_Detailed_Report.xlsx");
}

function exportPDF(stats, meetings) {
  const doc = new jsPDF('l', 'mm', 'a4');
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text("SLR Metaliks - Meeting Insights Detailed Report", 14, 15);
  
  autoTable(doc, {
    startY: 22,
    head: [["Meeting", "Date", "Category", "Dept", "Conductor", "Discussion", "Responsible", "Status"]],
    body: meetings.map(m => [
      m.title, 
      m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-GB') : "", 
      m.meeting_category || "General", 
      m.department,
      m.conducted_by_name || "N/A",
      m.point, 
      m.assigned_to_names || m.assigned_to || "Unassigned", 
      m.status
    ]),
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      5: { cellWidth: 50 }, // Wrap Discussion Point
      6: { cellWidth: 35 }  // Wrap Responsible names
    }
  });
  doc.save("SLR_Metaliks_MOM_Report.pdf");
}