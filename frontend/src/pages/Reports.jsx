import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FaFileExport, FaPrint, FaFilter, FaCalendarAlt, 
  FaCheckCircle, FaClock, FaUsers, FaChartLine 
} from 'react-icons/fa';
import '../styles/Report.css';

const API = "http://localhost:5001/api";

export default function Reports() {
  const [stats, setStats] = useState({
    totalMeetings: 0, totalTasks: 0, completedTasks: 0, pendingActions: 0, completionRate: 0,
    departmentStats: [], userWorkload: []
  });
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [statsRes, meetingRes] = await Promise.all([
        fetch(`${API}/reports/stats?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/reports/meeting-details?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const statsData = await statsRes.json();
      const meetingData = await meetingRes.json();
      if (statsData.success) setStats(statsData.data || {});
      if (meetingData.success) setMeetings(meetingData.data || []);
    } catch (err) {
      console.error("Report Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const filteredMeetings = meetings.filter(m => 
    (!departmentFilter || m.department === departmentFilter) &&
    (!titleFilter || m.title.toLowerCase().includes(titleFilter.toLowerCase()))
  );

  if (loading) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Generating Analytics...</p>
    </div>
  );

  return (
    <div className="reports-page">
      {/* HEADER SECTION */}
      <header className="reports-header">
        <div className="header-info">
          <h1>Meeting Insights</h1>
          <p>Performance analytics and MOM details</p>
        </div>
        <button className="btn-print" onClick={() => window.print()}><FaPrint /> Print View</button>
      </header>

      {/* SINGLE ROW FILTER & EXPORT BAR */}
      <div className="control-panel">
        <div className="filter-side">
          <div className="input-box">
            <label><FaCalendarAlt /> Start</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="input-box">
            <label><FaCalendarAlt /> End</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="input-box">
            <label><FaUsers /> Dept</label>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="">All</option>
              {[...new Set(meetings.map(m => m.department))].map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="input-box search">
            <label><FaFilter /> Search</label>
            <input type="text" placeholder="Meeting title..." value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} />
          </div>
          <button className="btn-apply" onClick={fetchReports}>Apply</button>
        </div>

        <div className="export-side">
          <button className="btn-excel" onClick={() => exportExcel(filteredMeetings)}><FaFileExport />Excel</button>
          <button className="btn-pdf" onClick={() => exportPDF(stats, filteredMeetings)}><FaFileExport />PDF</button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <KPICard title="Total Meetings" value={stats.totalMeetings} icon={<FaUsers />} color="#6366f1" />
        <KPICard title="Pending Tasks" value={stats.pendingActions} icon={<FaClock />} color="#f59e0b" />
        <KPICard title="Completed" value={stats.completedTasks} icon={<FaCheckCircle />} color="#10b981" />
        <KPICard title="Productivity" value={`${stats.completionRate}%`} icon={<FaChartLine />} color="#3b82f6" />
      </div>

      {/* ANALYTICS TABLES */}
      <div className="content-grid">
        <div className="card shadow">
          <h3>Meetings per Department</h3>
          <table className="mini-table">
            <thead>
              <tr><th>Department</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody>
              {stats.departmentStats.map((d, i) => (
                <tr key={i}><td>{d.department}</td><td className="text-right"><span className="tag-blue">{d.meeting_count}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card shadow">
          <h3>User Task Load</h3>
          <table className="mini-table">
            <thead>
              <tr><th>Employee</th><th className="text-right">Tasks</th></tr>
            </thead>
            <tbody>
              {stats.userWorkload.map((u, i) => (
                <tr key={i}><td>{u.employee}</td><td className="text-right"><span className="tag-gray">{u.task_count}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card full-width shadow">
          <h3>Detailed MOM Report</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Meeting</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Discussion Point</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map((m, i) => (
                  <tr key={i}>
                    <td className="font-bold">{m.title}</td>
                    <td>{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : "-"}</td>
                    <td>{m.department}</td>
                    <td className="text-muted">{m.point}</td>
                    <td>{m.assigned_to}</td>
                    <td><span className={`status-pill ${m.status?.toLowerCase().replace(/\s/g, '')}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const KPICard = ({ title, value, icon, color }) => (
  <div className="kpi-card" style={{ borderLeft: `5px solid ${color}` }}>
    <div className="kpi-icon" style={{ color: color }}>{icon}</div>
    <div className="kpi-data">
      <span className="label">{title}</span>
      <h2 className="value">{value}</h2>
    </div>
  </div>
);

/* EXPORT FUNCTIONS */
function exportExcel(meetings) {
  const ws = XLSX.utils.json_to_sheet(meetings);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Meetings");
  XLSX.writeFile(wb, "MOM_Analytics.xlsx");
}

function exportPDF(stats, meetings) {
  const doc = new jsPDF('l', 'mm', 'a4');
  doc.setFontSize(20);
  doc.text("Meeting Analytics Report", 14, 15);
  autoTable(doc, {
    startY: 25,
    head: [["Meeting", "Date", "Department", "Discussion", "Responsible", "Status"]],
    body: meetings.map(m => [m.title, m.meeting_date, m.department, m.point, m.assigned_to, m.status]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] }
  });
  doc.save("Report.pdf");
}