import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import * as XLSX from "xlsx";
import { FaFileExcel, FaFilePdf, FaTrash, FaPlus, FaEraser } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const styles = {
  app: { 
    minHeight: "100vh", 
    background: "#f0f9ff", 
    fontFamily: "'Inter', sans-serif", 
    padding: "40px 24px", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center" 
  },
  container: { width: "100%", maxWidth: "1350px" },
  headerRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "30px",
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    border: "1px solid #e0f2fe"
  },
  headerTitle: { color: "#0369a1", margin: 0, fontSize: "24px", fontWeight: "800" },
  actionButtonGroup: { display: "flex", gap: "12px", alignItems: "center" },
  actionBtn: { padding: "10px 18px", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  excelBtn: { background: "#10b981", color: "white" },
  pdfBtn: { background: "#ef4444", color: "white" },
  addBtn: { background: "#3b82f6", color: "white" },

  formContainer: { 
    background: "#ffffff", 
    borderRadius: "16px", 
    padding: "24px", 
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", 
    marginBottom: "30px", 
    border: "1px solid #bae6fd" 
  },
  gridHeader: { 
    display: "grid", 
    gridTemplateColumns: "40px 1.2fr 1.5fr 140px 140px 80px", 
    gap: "12px", 
    marginBottom: "12px", 
    padding: "0 10px" 
  },
  staticRow: { 
    display: "grid", 
    gridTemplateColumns: "40px 1.2fr 1.5fr 140px 140px 80px", 
    gap: "12px", 
    alignItems: "center", 
    marginBottom: "10px", 
    background: "#f8fafc", 
    padding: "10px", 
    borderRadius: "10px", 
    border: "1px solid #e2e8f0" 
  },
  formLabel: { fontSize: "11px", fontWeight: "800", color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "10px 14px", border: "1px solid #bae6fd", borderRadius: "8px", fontSize: "13px", background: "#ffffff", width: "100%", outline: "none", color: "#334155" },
  
  discardBtn: { background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  addRowBtn: { background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" },
  submitBtn: { background: "#3b82f6", color: "white", border: "none", padding: "12px 40px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" },

  tableContainer: { 
    width: "100%", 
    background: "#ffffff", 
    borderRadius: "16px", 
    border: "1px solid #bae6fd", 
    overflow: "hidden", 
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" 
  },
  table: { width: "100%", borderCollapse: "collapse", color: "#334155", textAlign: "left" },
  th: { padding: "16px 20px", background: "#f0f9ff", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#0369a1", borderBottom: "1px solid #bae6fd" },
  td: { padding: "16px 20px", fontSize: "14px", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" },
  assigneeBadge: { background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", marginRight: "4px", display: "inline-block", marginBottom: "4px", fontWeight: "600" },
  deptText: { fontSize: "10px", color: "#64748b", fontWeight: "normal", marginLeft: "4px" }
};

const selectStyles = {
  control: (base) => ({ 
    ...base, 
    minHeight: "40px", 
    borderRadius: "8px", 
    border: "1px solid #bae6fd", 
    fontSize: "13px", 
    background: "white",
    boxShadow: "none",
    '&:hover': { border: '1px solid #3b82f6' }
  }),
  menu: (base) => ({ ...base, zIndex: 9999 })
};

export default function MomPointForm({ meetingId, token }) {
  const [momPoints, setMomPoints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [staticRows, setStaticRows] = useState([]);

  const fetchData = useCallback(async () => {
    if (!meetingId || !token) return;
    setLoading(true);
    try {
      const [moRes, eRes] = await Promise.all([
        fetch(`${API_URL}/api/mom/meeting/${meetingId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/employees`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const moData = await moRes.json();
      const eData = await eRes.json();
      setMomPoints(moData.data || moData || []);
      setEmployees(eData.data || eData || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [meetingId, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Helper to get formatted date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-GB'); // Formats as DD/MM/YYYY
  };

  const getFullAssigneeDetails = (assignedTo) => {
    if (!assignedTo) return [];
    let ids = [];
    try { ids = Array.isArray(assignedTo) ? assignedTo : JSON.parse(assignedTo); } 
    catch (e) { ids = typeof assignedTo === 'string' ? assignedTo.split(',').map(id => id.trim()) : []; }
    return employees.filter(e => ids.some(id => String(id) === String(e.EmployeeID)));
  };

  const handleExportExcel = () => {
    if (momPoints.length === 0) return alert("No history data to export");
    const ws = XLSX.utils.json_to_sheet(momPoints.map(i => ({
      "Discussion Point": i.point,
      "Assignees": getFullAssigneeDetails(i.assigned_to).map(e => `${e.EmployeeName} (${e.Department})`).join(", "),
      "Timeline": formatDate(i.timeline),
      "Status": i.status
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MOM");
    XLSX.writeFile(wb, `MOM_Report_${meetingId}.xlsx`);
  };

  const handleExportPDF = () => {
    if (momPoints.length === 0) return alert("No history data to export");
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Discussion Point', 'Assignees', 'Timeline', 'Status']],
      body: momPoints.map(i => [
        i.point, 
        getFullAssigneeDetails(i.assigned_to).map(e => `${e.EmployeeName} (${e.Department})`).join(", "), 
        formatDate(i.timeline), 
        i.status
      ]),
      headStyles: { fillColor: [3, 105, 161] }
    });
    doc.save(`MOM_Report_${meetingId}.pdf`);
  };

  const handleOpenForm = () => {
    const lastSl = momPoints.length > 0 ? Math.max(...momPoints.map(r => parseInt(r.sl_no) || 0)) : 0;
    setStaticRows(Array.from({ length: 6 }, (_, i) => ({
      sl_no: lastSl + i + 1, point: "", assigned_to: [], timeline: "",
    })));
    setIsAdding(true);
  };

  const handleInputChange = (index, field, value) => {
    setStaticRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
    setStaticRows(prev => {
      const nextSl = prev.length > 0 ? Math.max(...prev.map(r => r.sl_no)) + 1 : 1;
      return [...prev, { sl_no: nextSl, point: "", assigned_to: [], timeline: "", }];
    });
  };

  const handleClearRow = (index) => {
    setStaticRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], point: "", assigned_to: [], timeline: "", status: "Status" };
      return updated;
    });
  };

  const handleRemoveRow = (index) => {
    if (staticRows.length <= 1) return;
    setStaticRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    const dataToSave = staticRows.filter(row => row.point.trim() !== "" && row.assigned_to.length > 0);
    if (dataToSave.length === 0) return alert("Please fill at least one row.");
    setLoading(true);
    try {
      await Promise.all(dataToSave.map(item => 
        fetch(`${API_URL}/api/mom`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            meeting_id: parseInt(meetingId),
            sl_no: item.sl_no,
            point: item.point,
            assigned_to: item.assigned_to,
            timeline: item.timeline || null,
            status: item.status,
            topic: item.point.substring(0, 40)
          }),
        })
      ));
      setIsAdding(false);
      fetchData();
    } catch (err) { alert("Error saving data"); } finally { setLoading(false); }
  };

  const employeeOptions = employees.map(e => ({
    value: e.EmployeeID, label: `${e.EmployeeName} (${e.Department})`
  }));

  if (loading) return <div style={styles.app}><div style={{color:'#0369a1', fontWeight:'bold'}}>Loading Action Items...</div></div>;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        
        <div style={styles.headerRow}>
          <h2 style={styles.headerTitle}>📋 Action Items</h2>
          <div style={styles.actionButtonGroup}>
            <button style={{...styles.actionBtn, ...styles.excelBtn}} onClick={handleExportExcel}><FaFileExcel />Excel</button>
            <button style={{...styles.actionBtn, ...styles.pdfBtn}} onClick={handleExportPDF}><FaFilePdf />PDF</button>
            {!isAdding && <button style={{...styles.actionBtn, ...styles.addBtn}} onClick={handleOpenForm}><FaPlus />Add New Point</button>}
          </div>
        </div>

        {isAdding && (
          <div style={styles.formContainer}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', alignItems:'center'}}>
              <h4 style={{margin:0, color:'#0369a1', fontWeight:'800', fontSize:'13px', letterSpacing:'1px'}}>ENTRY WORKSPACE</h4>
              <button onClick={() => setIsAdding(false)} style={styles.discardBtn}>Discard</button>
            </div>

            <div style={styles.gridHeader}>
              <span style={styles.formLabel}>SL</span>
              <span style={styles.formLabel}>Point</span>
              <span style={styles.formLabel}>Assignees</span>
              <span style={styles.formLabel}>Timeline</span>
              <span style={styles.formLabel}>Status</span>
              <span style={{...styles.formLabel, textAlign:'center'}}>Actions</span>
            </div>

            {staticRows.map((row, idx) => (
              <div key={`row-${idx}`} style={styles.staticRow}>
                <div style={{textAlign:'center', fontWeight:'800', color:'#0369a1'}}>{row.sl_no}</div>
                <input style={styles.input} value={row.point} onChange={e => handleInputChange(idx, 'point', e.target.value)} placeholder="Action required..." />
                <Select isMulti options={employeeOptions} styles={selectStyles} 
                  value={employeeOptions.filter(o => row.assigned_to.includes(o.value))}
                  onChange={s => handleInputChange(idx, 'assigned_to', s ? s.map(v => v.value) : [])}
                />
                <input type="date" style={styles.input} value={row.timeline} onChange={e => handleInputChange(idx, 'timeline', e.target.value)} />
                <input style={styles.input} value={row.status} onChange={e => handleInputChange(idx, 'status', e.target.value)} placeholder="Status" />
                <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                  <button onClick={() => handleClearRow(idx)} style={{border:'none', background:'none', color:'#94a3b8', cursor:'pointer'}} title="Clear"><FaEraser/></button>
                  <button onClick={() => handleRemoveRow(idx)} style={{border:'none', background:'none', color:'#ef4444', cursor:'pointer'}} title="Remove"><FaTrash/></button>
                </div>
              </div>
            ))}

            <div style={{display:'flex', justifyContent:'space-between', marginTop:'20px', borderTop:'1px solid #bae6fd', paddingTop:'20px'}}>
              <button onClick={handleAddRow} style={styles.addRowBtn}><FaPlus size={12} /> Add Row</button>
              <button onClick={handleFinalSubmit} style={styles.submitBtn}>Submit</button>
            </div>
          </div>
        )}

        <div style={{ opacity: isAdding ? 0.4 : 1, transition: 'opacity 0.3s' }}>
          <h3 style={{color: '#0369a1', fontSize: '18px', marginBottom: '15px', fontWeight:'800'}}>Point History</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Discussion Point</th>
                  <th style={styles.th}>Assignees</th>
                  <th style={styles.th}>Timeline</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {momPoints.length === 0 ? (
                    <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>No points recorded yet.</td></tr>
                ) : (
                    momPoints.map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.point}</td>
                        <td style={styles.td}>
                          {getFullAssigneeDetails(item.assigned_to).map((emp, i) => (
                            <span key={i} style={styles.assigneeBadge}>
                              {emp.EmployeeName} 
                              <span style={styles.deptText}>({emp.Department})</span>
                            </span>
                          ))}
                        </td>
                        <td style={styles.td}>{formatDate(item.timeline)}</td>
                        <td style={{...styles.td, color: '#3b82f6', fontWeight: '700'}}>{item.status}</td>
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