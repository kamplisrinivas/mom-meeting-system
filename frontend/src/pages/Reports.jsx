import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx-js-style"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilter, FaCalendarAlt, FaUsers, FaTag, FaFileExcel, FaFilePdf, FaUndo } from 'react-icons/fa';

const API = "http://192.168.1.25:5001/api";

export default function Reports() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [allDepartments, setAllDepartments] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); 
  const [titleFilter, setTitleFilter] = useState("");
  
  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: startDate || "",
        endDate: endDate || "",
        department: departmentFilter || "",
        category: categoryFilter || "",
        title: titleFilter || ""
      }).toString();

      const res = await fetch(`${API}/reports/meetings?${params}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();

      if (data.success) {
        const fetchedData = data.data || [];
        setMeetings(fetchedData);

        if (allDepartments.length === 0 && fetchedData.length > 0) {
          const depts = [...new Set(fetchedData.map(m => m.department))].filter(Boolean).sort();
          setAllDepartments(depts);
        }
        if (allCategories.length === 0 && fetchedData.length > 0) {
          const cats = [...new Set(fetchedData.map(m => m.meeting_category))].filter(Boolean).sort();
          setAllCategories(cats);
        }
      }
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
    setTimeout(fetchReports, 10);
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading && meetings.length === 0) return (
    <div style={loaderStyle}>
      <div className="spinner"></div>
      <p>Loading Analytics...</p>
    </div>
  );

  return (
    <div style={pageWrapperStyle}>
      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
          .data-table { width: 100%; border-collapse: collapse; table-layout: fixed; min-width: 1400px; }
          .data-table th { text-align: left; padding: 12px 15px; background: #1e293b; color: #94a3b8; font-size: 11px; text-transform: uppercase; position: sticky; top: 0; z-index: 10; border-bottom: 2px solid #334155; }
          .data-table td { padding: 12px 15px; border-bottom: 1px solid #334155; color: #e2e8f0; font-size: 13px; vertical-align: top; }
          .wrap-cell { white-space: normal !important; line-height: 1.5; color: #cbd5e1; word-wrap: break-word; text-align: left !important; }
          .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; display: inline-block; margin-top: 2px; }
          .status-pill.completed { background: rgba(16, 185, 129, 0.2); color: #10b981; }
          .status-pill.pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
          .status-pill.scheduled { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
          input, select { background: #0f172a !important; color: white !important; border: 1px solid #334155 !important; border-radius: 6px; padding: 8px; outline: none; width: 100%; }
        `}
      </style>

      <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto' }}>
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Meeting Insights</h1>
            <p style={{ margin: 0, opacity: 0.5, fontSize: '13px' }}>Standardized MOM Reporting</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ ...btnBase, background: '#10b981' }} onClick={() => exportExcel(meetings)}><FaFileExcel /> Excel</button>
            <button style={{ ...btnBase, background: '#ef4444' }} onClick={() => exportPDF(meetings)}><FaFilePdf /> PDF</button>
            <button style={{ ...btnBase, background: '#334155' }} onClick={resetFilters}><FaUndo /> Reset</button>
          </div>
        </header>

        <div style={filterContainerStyle}>
          <div style={gridStyle}>
            <div style={inputGroup}><label style={labelStyle}>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div style={inputGroup}><label style={labelStyle}>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            <div style={inputGroup}>
                <label style={labelStyle}>Department</label>
                <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {allDepartments.map((d, i) => <option key={i} value={d}>{d}</option>)}
                </select>
            </div>
            <div style={inputGroup}>
                <label style={labelStyle}>Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {allCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
            </div>
            <div style={{ ...inputGroup, flex: 2 }}><label style={labelStyle}>Keyword Search</label><input type="text" placeholder="Search titles..." value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} /></div>
            <button style={btnApply} onClick={fetchReports}>Apply Filters</button>
          </div>
        </div>

        <div style={tableWrapperStyle} className="scroll-container">
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '100px', textAlign: 'center' }}>Meeting ID</th>
                  <th style={{ width: '200px' }}>Meeting Title</th>
                  <th style={{ width: '120px' }}>Date</th>
                  <th style={{ width: '160px' }}>Department</th>
                  <th style={{ width: '140px' }}>Category</th>
                  <th style={{ width: '400px' }}>Discussion Point</th>
                  <th style={{ width: '350px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {meetings.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px' }}>No records found</td></tr>
                ) : (
                  meetings.map((m, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', color: '#6366f1', fontWeight: 'bold' }}>{m.id}</td>
                      <td style={{ fontWeight: '600' }}>{m.title}</td>
                      <td>{m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-GB') : "-"}</td>
                      <td>{m.department}</td>
                      <td>{m.meeting_category}</td>
                      <td className="wrap-cell">{m.point || "—"}</td>
                      <td className="wrap-cell">
                        <span className={`status-pill ${m.status?.toLowerCase().replace(/\s/g, '')}`}>
                          {m.status}
                        </span>
                      </td>
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

// --- Styles & Helpers ---
const pageWrapperStyle = { background: '#020617', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#1e293b', padding: '20px', borderRadius: '12px' };
const filterContainerStyle = { background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '20px' };
const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' };
const inputGroup = { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '150px' };
const labelStyle = { fontSize: '11px', fontWeight: 'bold', marginBottom: '5px', color: '#94a3b8' };
const btnBase = { padding: '10px 18px', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const btnApply = { ...btnBase, background: '#6366f1', height: '40px' };
const tableWrapperStyle = { background: '#1e293b', borderRadius: '12px', height: '650px', overflowY: 'auto', position: 'relative', border: '1px solid #334155' };
const loaderStyle = { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#020617', color: 'white' };

function exportExcel(data) {
  const headers = ["Meeting ID", "Meeting Title", "Date", "Department", "Category", "Discussion Point", "Status"];
  const rows = data.map(m => [
    m.id, m.title, 
    m.meeting_date ? new Date(m.meeting_date).toLocaleDateString('en-GB') : "-", 
    m.department, m.meeting_category, m.point, m.status
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const range = XLSX.utils.decode_range(ws['!ref']);
  
  for (let r = 0; r <= range.e.r; ++r) {
    for (let c = 0; c <= range.e.c; ++c) {
      const address = XLSX.utils.encode_cell({ r, c });
      if (!ws[address]) continue;
      
      if (r === 0) {
        ws[address].s = {
          fill: { fgColor: { rgb: "6366F1" } },
          font: { color: { rgb: "FFFFFF" }, bold: true },
          alignment: { horizontal: "center", vertical: "center" }
        };
      } else {
        ws[address].s = {
          alignment: { vertical: "top", horizontal: (c === 0) ? "center" : "left", wrapText: true }
        };
      }
    }
  }

  // Width for Meeting ID set to 12 to fit the full title
  ws['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 50 }, { wch: 40 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Meetings");
  XLSX.writeFile(wb, "Meeting_Report.xlsx");
}

function exportPDF(data) {
  const doc = new jsPDF('l', 'mm', 'a4');
  autoTable(doc, {
    head: [["Meeting ID", "Meeting Title", "Date", "Dept", "Category", "Discussion Point", "Status"]],
    body: data.map(m => [m.id, m.title, m.meeting_date, m.department, m.meeting_category, m.point, m.status]),
    theme: 'grid',
    styles: { fontSize: 8, valign: 'top', halign: 'left' },
    columnStyles: { 
      0: { halign: 'center', cellWidth: 25 }, // Adjusted width for "Meeting ID"
      5: { cellWidth: 70 }, 
      6: { cellWidth: 70 } 
    },
    headStyles: { fillColor: [99, 102, 241] }
  });
  doc.save("Meeting_Report.pdf");
}