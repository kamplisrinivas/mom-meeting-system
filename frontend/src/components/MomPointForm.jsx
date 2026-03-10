import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    fontFamily: "'Inter', sans-serif",
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: "1150px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  headerTitle: {
    color: "#ffffff",
    margin: 0,
    fontSize: "26px",
    fontWeight: "800",
  },
  actionButtonGroup: {
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },
  topAddBtn: {
    padding: "12px 24px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  exportBtn: {
   padding: "12px 20px",
  background: "#3b82f6",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(59,130,246,0.3)"
  },
  formContainer: {
    background: "#ffffff", 
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
  },
  horizontalGrid: {
    display: "grid",
    gridTemplateColumns: "80px 1.5fr 2fr 160px 100px",
    gap: "16px",
    alignItems: "end",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  formLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#475569", 
    textTransform: "uppercase",
  },
  input: {
    padding: "10px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    background: "#f8fafc",
    height: "42px",
    outline: "none",
    color: "#1e293b",
  },
  addToListBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    height: "42px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  discardBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  queueContainer: {
    background: "#ffffff", 
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "40px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
  },
  queueItem: {
    display: "grid",
    gridTemplateColumns: "50px 1fr 1.5fr 120px 80px",
    gap: "15px",
    alignItems: "center",
    background: "#f1f5f9",
    padding: "12px 15px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  historyHeader: {
    display: 'grid', 
    gridTemplateColumns: '2fr 2.5fr 140px 120px', 
    gap: '20px', 
    padding: '12px 24px',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pointCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    marginBottom: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  cardGrid: {
    display: 'grid', 
    gridTemplateColumns: '2fr 2.5fr 140px 120px', 
    gap: '20px', 
    alignItems: 'center',
    padding: '16px 24px',
  },
  pointText: { fontSize: '14px', fontWeight: '500', color: '#f8fafc' },
  assigneeWrapper: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  nameChip: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "#93c5fd",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    display: "flex",
    flexDirection: "column",
    minWidth: "120px"
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
  },
  chipName: { fontSize: "12px", fontWeight: "700" },
  chipDept: { fontSize: "10px", opacity: 0.8, color: "#60a5fa" }
};

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "13px",
  })
};

export default function MomPointForm({ meetingId, token }) {
  const [momPoints, setMomPoints] = useState([]);
  const [tempPoints, setTempPoints] = useState([]); 
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    sl_no: 1,
    point: "",
    assigned_to: [],
    timeline: "",
  });

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

      const records = moData.data || moData || [];
      const lastSl = records.length > 0 ? Math.max(...records.map(r => parseInt(r.sl_no) || 0)) : 0;
      setFormData(prev => ({ ...prev, sl_no: lastSl + 1 }));
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [meetingId, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getFullAssigneeDetails = (assignedTo) => {
    if (!assignedTo) return [];
    let ids = [];
    try {
      ids = Array.isArray(assignedTo) ? assignedTo : JSON.parse(assignedTo);
    } catch (e) {
      ids = typeof assignedTo === 'string' ? assignedTo.split(',').map(id => id.trim()) : [];
    }
    return employees.filter(e => ids.some(id => String(id) === String(e.EmployeeID)));
  };

  const handleExportExcel = () => {
    const dataToExport = momPoints.map(item => ({
      "DISCUSSION POINT": item.point,
      "ASSIGNED TO ": getFullAssigneeDetails(item.assigned_to)
        .map(e => `${e.EmployeeName} (${e.Department})`)
        .join(", "),
      "TIMELINE": item.timeline ? new Date(item.timeline).toLocaleDateString() : "N/A",
      "STATUS": getFullAssigneeDetails(item.assigned_to).length > 0 ? "Assigned" : "Not Assigned"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Meeting Points");
    XLSX.writeFile(workbook, `Meeting_${meetingId}_MOM.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`Minutes of Meeting - ID: ${meetingId}`, 14, 15);
    
    const tableData = momPoints.map(item => [
      item.point,
      getFullAssigneeDetails(item.assigned_to)
        .map(e => `${e.EmployeeName} (${e.Department})`)
        .join(", "),
      item.timeline ? new Date(item.timeline).toLocaleDateString() : "N/A",
      getFullAssigneeDetails(item.assigned_to).length > 0 ? "Assigned" : "Not Assigned"
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['POINTS', 'ASSIGNED TO', 'TIMELINE', 'STATUS']],
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold', // Header is now explicitly BOLD
        fontSize: 10 
      },
      body: tableData,
    });

    doc.save(`Meeting_${meetingId}_MOM.pdf`);
  };

  const addPointToLocalList = () => {
    if (!formData.point.trim() || formData.assigned_to.length === 0) {
      alert("Please enter a point and select at least one assignee.");
      return;
    }
    const newItem = { ...formData, id: Date.now() };
    setTempPoints([...tempPoints, newItem]);
    setFormData(prev => ({ ...prev, sl_no: prev.sl_no + 1, point: "", assigned_to: [], timeline: "" }));
  };

  const handleDiscard = () => {
    if (tempPoints.length > 0) {
      if (window.confirm("Discard all unsaved items in the queue?")) {
        setTempPoints([]);
        setIsAdding(false);
      }
    } else {
      setIsAdding(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const promises = tempPoints.map(item => 
        fetch(`${API_URL}/api/mom`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            meeting_id: parseInt(meetingId),
            sl_no: item.sl_no,
            point: item.point,
            assigned_to: item.assigned_to,
            timeline: item.timeline || null,
            status: "Assigned",
            topic: item.point.substring(0, 40)
          }),
        })
      );
      await Promise.all(promises);
      setTempPoints([]);
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = employees.map(e => ({
    value: e.EmployeeID,
    label: `[ID: ${e.EmployeeID}] ${e.EmployeeName} (${e.Department})`
  }));

  if (loading) return <div style={styles.app}><div style={{color:'white'}}>Processing...</div></div>;

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.headerTitle}>Action Items</h2>
          <div style={styles.actionButtonGroup}>
            <button style={styles.exportBtn} onClick={handleExportExcel}>Excel</button>
            <button style={styles.exportBtn} onClick={handleExportPDF}>PDF</button>
            {!isAdding && (
              <button style={styles.topAddBtn} onClick={() => setIsAdding(true)}>+ Add New Point</button>
            )}
          </div>
        </div>

        {isAdding && (
          <>
            <div style={styles.formContainer}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <button onClick={handleDiscard} style={styles.discardBtn}>Discard</button>
              </div>

              <div style={styles.horizontalGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>SL</label>
                  <input type="text" style={{...styles.input, textAlign:'center', fontWeight:'bold'}} value={formData.sl_no} readOnly />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Discussion Point *</label>
                  <input type="text" style={styles.input} value={formData.point} onChange={e => setFormData({...formData, point: e.target.value})} placeholder="What was decided?" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Assigned To *</label>
                  <Select 
                    isMulti 
                    options={employeeOptions} 
                    styles={selectStyles} 
                    value={employeeOptions.filter(o => formData.assigned_to.includes(o.value))} 
                    onChange={s => setFormData({...formData, assigned_to: s ? s.map(x => x.value) : []})} 
                    placeholder="Select by ID or Name..."
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Timeline</label>
                  <input type="date" style={styles.input} value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <button onClick={addPointToLocalList} style={styles.addToListBtn}>Add</button>
                </div>
              </div>
            </div>

            {tempPoints.length > 0 && (
              <div style={styles.queueContainer}>
                <h4 style={{color: '#1e293b', marginTop: 0, marginBottom: '15px', fontSize: '11px', textTransform:'uppercase'}}>Items in Queue ({tempPoints.length})</h4>
                {tempPoints.map((tp) => (
                  <div key={tp.id} style={styles.queueItem}>
                    <span style={{fontWeight:'800', color:'#3b82f6'}}>#{tp.sl_no}</span>
                    <span style={{fontSize:'13px', color:'#1e293b', fontWeight:'600'}}>{tp.point}</span>
                    <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                      {getFullAssigneeDetails(tp.assigned_to).map((emp, i) => (
                        <span key={i} style={{fontSize:'10px', background:'#ffffff', color:'#1e40af', padding:'3px 8px', borderRadius:'5px', border:'1px solid #dbeafe'}}>
                          ID: {emp.EmployeeID} - {emp.EmployeeName} ({emp.Department})
                        </span>
                      ))}
                    </div>
                    <span style={{fontSize:'12px', color:'#64748b'}}>{tp.timeline || 'No Date'}</span>
                    <button onClick={() => setTempPoints(tempPoints.filter(x => x.id !== tp.id))} style={{color:'#ef4444', border:'none', background:'none', cursor:'pointer', fontSize:'11px', fontWeight:'800'}}>Remove</button>
                  </div>
                ))}
                <div style={{textAlign: 'right', marginTop: '15px', borderTop: '2px solid #f1f5f9', paddingTop: '15px'}}>
                  <button onClick={handleFinalSubmit} style={{...styles.topAddBtn, background: '#f59e0b', padding: '14px 30px'}}>Save All</button>
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ opacity: isAdding ? 0.3 : 1 }}>
          <h3 style={{color: 'white', fontSize: '18px', marginBottom: '15px', fontWeight: '700'}}>Meeting History</h3>
          <div style={styles.historyHeader}>
            <span>Discussion Point</span>
            <span>Assignee Info</span>
            <span>Timeline</span>
            <span style={{textAlign: 'center'}}>Status</span>
          </div>

          {momPoints.map((item) => {
            const assignees = getFullAssigneeDetails(item.assigned_to);
            const hasAssignees = assignees.length > 0;
            return (
              <div key={item.id} style={styles.pointCard}>
                <div style={styles.cardGrid}>
                  <div style={styles.pointText}>{item.point}</div>
                  <div style={styles.assigneeWrapper}>
                    {assignees.map((emp, i) => (
                      <div key={i} style={styles.nameChip}>
                        <span style={styles.chipName}>{emp.EmployeeName}</span>
                        <span style={{ fontSize: "10px", color: "white" }}>ID: {emp.EmployeeID}</span>
                        <span style={styles.chipDept}>{emp.Department}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize: '13px', color: '#94a3b8'}}>
                    📅 {item.timeline ? new Date(item.timeline).toLocaleDateString() : 'N/A'}
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{
                      ...styles.statusBadge, 
                      background: hasAssignees ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: hasAssignees ? "#34d399" : "#f87171",
                      border: hasAssignees ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                    }}>
                      {hasAssignees ? "Assigned" : "Not Assigned"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}