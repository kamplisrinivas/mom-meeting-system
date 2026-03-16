import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FaPrint, FaFilter, FaCalendarAlt, FaUsers, FaTag, FaFileExcel, FaFilePdf 
} from 'react-icons/fa';

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
      const query = new URLSearchParams({
        startDate, endDate, department: departmentFilter, category: categoryFilter
      }).toString();

      const res = await fetch(`${API}/reports/meeting-details?${query}`, { 
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

  useEffect(() => { fetchReports(); }, []);

  const filteredMeetings = meetings.filter(m => 
    (!titleFilter || m.title.toLowerCase().includes(titleFilter.toLowerCase()))
  );

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '15px' }}>Generating Report...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={pageWrapperStyle}>
      <style>
        {`
          /* Custom Global Scrollbar */
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
          ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
          
          /* Table Specific Scrollbar */
          .scroll-box::-webkit-scrollbar { width: 6px; }
          .scroll-box::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.6); border-radius: 10px; }

          .data-table { width: 100%; border-collapse: collapse; table-layout: auto; }
          .data-table th { 
            text-align: left; 
            padding: 15px; 
            background: rgba(30, 30, 30, 0.9); 
            font-size: 11px; 
            color: #cbd5e1; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            position: sticky; 
            top: 0; 
            z-index: 10; 
          }
          .data-table td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; font-size: 13px; }

          .status-pill { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
          .status-pill.completed { background: rgba(16, 185, 129, 0.2); color: #10b981; }
          .status-pill.pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
          
          input, select { background: rgba(0,0,0,0.3) !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px; padding: 8px; outline: none; }
          option { color: black; }
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
        `}
      </style>

      <div style={{ padding: '20px 0', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* HEADER SECTION */}
        <header style={{ ...glassCardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>Meeting Insights</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.8 }}>Performance analytics and MOM details</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ ...btnBase, background: '#10b981' }} onClick={() => exportExcel(filteredMeetings)}><FaFileExcel /> Excel</button>
            <button style={{ ...btnBase, background: '#ef4444' }} onClick={() => exportPDF(filteredMeetings)}><FaFilePdf /> PDF</button>
            <button style={{ ...btnBase, background: 'rgba(255,255,255,0.1)' }} onClick={() => window.print()}><FaPrint /> Print</button>
          </div>
        </header>

        {/* FILTER BAR */}
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
                <option value="">All</option>
                {[...new Set(meetings.map(m => m.department))].filter(Boolean).map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
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
              <input type="text" placeholder="Meeting title..." value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} style={{ width: '100%' }} />
            </div>
            <button style={btnApplyStyle} onClick={fetchReports}>Apply</button>
          </div>
        </div>

        {/* DETAILED MOM REPORT WITH SCROLLBAR */}
        <div style={{ 
          ...glassCardStyle, 
          padding: '0', 
          height: '650px', // Fixed height to trigger scroll
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden' 
        }}>
          <h3 style={{ ...stickyHeaderStyle, padding: '20px 25px' }}>Detailed MOM Report</h3>
          
          <div className="scroll-box" style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'auto', // Horizontal scroll if content is too wide
            padding: '0' 
          }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>MID</th>
                  <th>Meeting</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Discussion Point</th>
                  <th>Owner</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>No matching records found</td></tr>
                ) : (
                  filteredMeetings.map((m, i) => (
                    <tr key={i}>
                      <td style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>#{m.meeting_id || m.id}</td>
                      <td style={{ fontWeight: 'bold', minWidth: '180px' }}>{m.title}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-GB') : "-"}</td>
                      <td>{m.department}</td>
                      <td style={{ opacity: 0.8, minWidth: '300px' }}>{m.point}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{m.assigned_to}</td>
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

// --- STYLING OBJECTS ---

const pageWrapperStyle = {
  minHeight: '100vh',
  width: '100%',
  color: 'white',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '25px',
  borderRadius: '15px',
};

const stickyHeaderStyle = { 
  margin: 0, 
  background: 'rgba(255,255,255,0.03)', 
  borderBottom: '1px solid rgba(255,255,255,0.1)', 
  fontSize: '18px', 
  fontWeight: '700' 
};

const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', marginBottom: '8px', display: 'block' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column' };
const btnBase = { padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'white' };
const btnApplyStyle = { ...btnBase, background: '#6366f1', height: '42px' };

// --- EXPORT FUNCTIONS ---

function exportExcel(meetings) {
  const exportData = meetings.map(m => ({
    "Meeting ID": m.meeting_id || m.id,
    "Title": m.title,
    "Date": m.meeting_date,
    "Department": m.department,
    "Action Point": m.point,
    "Assigned To": m.assigned_to,
    "Status": m.status
  }));
  
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "MOM_Analytics");
  XLSX.writeFile(wb, "MOM_Analytics_Report.xlsx");
}

function exportPDF(meetings) {
  const doc = new jsPDF('l', 'mm', 'a4');
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text("Meeting Analytics Detailed Report", 14, 15);
  
  autoTable(doc, {
    startY: 25,
    head: [["ID", "Meeting", "Date", "Department", "Discussion", "Responsible", "Status"]],
    body: meetings.map(m => [
      m.meeting_id || m.id, 
      m.title, 
      m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : "-", 
      m.department, 
      m.point, 
      m.assigned_to, 
      m.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 }
  });
  doc.save("MOM_Detailed_Analytics.pdf");
}