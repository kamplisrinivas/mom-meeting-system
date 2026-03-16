import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaPrint, FaFilter, FaCalendarAlt, FaUsers, FaTag, FaFileExcel, FaFilePdf, FaUndo } from 'react-icons/fa';

const API = "http://localhost:5001/api";

export default function Reports() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); 
  const [titleFilter, setTitleFilter] = useState("");
  
  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Create query string including ALL filters
      const params = new URLSearchParams({
        startDate: startDate || "",
        endDate: endDate || "",
        department: departmentFilter || "",
        category: categoryFilter || "",
        title: titleFilter || ""
      }).toString();

      // Ensure endpoint matches your Backend Route (/reports/meetings)
      const res = await fetch(`${API}/reports/meetings?${params}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.success) setMeetings(data.data || []);
    } catch (err) {
      console.error("Report Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setDepartmentFilter("");
    setCategoryFilter("");
    setTitleFilter("");
    // Trigger a fresh fetch with empty filters
    setTimeout(fetchReports, 10);
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '15px' }}>Generating Report...</p>
    </div>
  );

  return (
    <div style={pageWrapperStyle}>
      <style>
        {`
          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th { text-align: left; padding: 15px; background: rgba(30, 30, 30, 0.9); font-size: 11px; color: #cbd5e1; text-transform: uppercase; position: sticky; top: 0; z-index: 10; }
          .data-table td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; font-size: 13px; }
          .status-pill { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .status-pill.completed { background: rgba(16, 185, 129, 0.2); color: #10b981; }
          .status-pill.pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
          input, select { background: rgba(0,0,0,0.3) !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px; padding: 8px; outline: none; }
          option { color: black; }
        `}
      </style>

      <div style={{ padding: '20px 0', maxWidth: '1600px', margin: '0 auto' }}>
        
        <header style={{ ...glassCardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Meeting Insights</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8 }}>Performance analytics and MOM details</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ ...btnBase, background: '#10b981' }} onClick={() => exportExcel(meetings)}><FaFileExcel /> Excel</button>
            <button style={{ ...btnBase, background: '#ef4444' }} onClick={() => exportPDF(meetings)}><FaFilePdf /> PDF</button>
            <button style={{ ...btnBase, background: 'rgba(255,255,255,0.1)' }} onClick={resetFilters}><FaUndo /> Reset</button>
          </div>
        </header>

        <div style={{ ...glassCardStyle, marginBottom: '30px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><FaCalendarAlt /> Start</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><FaCalendarAlt /> End</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><FaUsers /> Dept</label>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                <option value="">All Departments</option>
                <option value="MIS And IT">MIS And IT</option>
                <option value="HR">HR</option>
                <option value="Production">Production</option>
              </select>
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><FaTag /> Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                <option value="technical">Technical</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div style={{ ...inputGroupStyle, flex: 1 }}>
              <label style={labelStyle}><FaFilter /> Search</label>
              <input type="text" placeholder="Search title..." value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} style={{ width: '100%' }} />
            </div>
            <button style={btnApplyStyle} onClick={fetchReports}>Apply Filters</button>
          </div>
        </div>

        <div style={{ ...glassCardStyle, padding: '0', height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h3 style={{ ...stickyHeaderStyle, padding: '20px 25px' }}>Detailed MOM Report ({meetings.length} Records)</h3>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>MID</th>
                  <th>Meeting</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Discussion Point</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {meetings.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>No records found</td></tr>
                ) : (
                  meetings.map((m, i) => (
                    <tr key={i}>
                      <td style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>#{m.id}</td>
                      <td style={{ fontWeight: 'bold' }}>{m.title}</td>
                      <td>{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-GB') : "-"}</td>
                      <td>{m.department}</td>
                      <td>{m.point || "N/A"}</td>
                      <td>{m.assigned_to_names || "Unassigned"}</td>
                      <td><span className={`status-pill ${m.status?.toLowerCase().replace(/\s/g, '')}`}>{m.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLING & HELPERS ---
const pageWrapperStyle = { minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' };
const glassCardStyle = { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '25px', borderRadius: '15px' };
const stickyHeaderStyle = { margin: 0, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '18px' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#cbd5e1', marginBottom: '8px', display: 'block' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column' };
const btnBase = { padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'white' };
const btnApplyStyle = { ...btnBase, background: '#6366f1', height: '42px' };

function exportExcel(data) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, "Meeting_Report.xlsx");
}

function exportPDF(data) {
  const doc = new jsPDF('l', 'mm', 'a4');
  autoTable(doc, {
    head: [["ID", "Title", "Date", "Dept", "Point", "Assigned To", "Status"]],
    body: data.map(m => [m.id, m.title, m.meeting_date, m.department, m.point, m.assigned_to_names, m.status]),
    theme: 'striped',
  });
  doc.save("Report.pdf");
}