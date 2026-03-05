import React, { useState, useEffect } from "react";

const API = "http://localhost:5001/api";

export default function Reports() {

  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingActions: 0,
    overdueItems: 0,
    completionRate: 0,
    departmentStats: [],
    userWorkload: []
  });

  const [meetings,setMeetings] = useState([]);
  const [loading,setLoading] = useState(true);

  const [startDate,setStartDate] = useState("");
  const [endDate,setEndDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchReports = async () => {

    try{

      setLoading(true);

      const statsRes = await fetch(
        `${API}/reports/stats?startDate=${startDate}&endDate=${endDate}`,
        { headers:{ Authorization:`Bearer ${token}` } }
      );

      const statsData = await statsRes.json();

      const meetingRes = await fetch(
        `${API}/reports/meeting-details?startDate=${startDate}&endDate=${endDate}`,
        { headers:{ Authorization:`Bearer ${token}` } }
      );

      const meetingData = await meetingRes.json();

      if(statsData.success) setStats(statsData.data || {});
      if(meetingData.success) setMeetings(meetingData.data || []);

    }catch(err){
      console.error("Report Fetch Error:",err);
    }

    setLoading(false);
  };

  useEffect(()=>{
    fetchReports();
  },[]);


  if(loading) return <h2>Loading reports...</h2>;

  return(

  <div style={{padding:"30px"}}>

  <h1>📊 Meeting Analytics & Reports</h1>

  {/* FILTER */}

  <div style={{marginBottom:"20px",display:"flex",gap:"10px"}}>

  <input
  type="date"
  value={startDate}
  onChange={(e)=>setStartDate(e.target.value)}
  />

  <input
  type="date"
  value={endDate}
  onChange={(e)=>setEndDate(e.target.value)}
  />

  <button onClick={fetchReports}>
  Apply Filters
  </button>

  </div>

  {/* KPI */}

  <div style={{display:"flex",gap:"20px",marginBottom:"30px"}}>

  <Card title="Total Meetings" value={stats?.totalMeetings || 0}/>
  <Card title="Pending Actions" value={stats?.pendingActions || 0}/>
  <Card title="Completed Actions" value={stats?.completedTasks || 0}/>
  <Card title="Productivity Score" value={`${stats?.completionRate || 0}%`}/>

  </div>


  {/* DEPARTMENT REPORT */}

  <h2>Department Wise Meetings</h2>

  <table border="1" cellPadding="10" width="100%">

  <thead>
  <tr>
  <th>Department</th>
  <th>Meetings</th>
  </tr>
  </thead>

  <tbody>

  {(stats.departmentStats || []).map((d,i)=>(
  <tr key={i}>
  <td>{d.department}</td>
  <td>{d.meeting_count}</td>
  </tr>
  ))}

  </tbody>

  </table>


  {/* EMPLOYEE WORKLOAD */}

  <h2 style={{marginTop:"40px"}}>Employee Workload</h2>

  <table border="1" cellPadding="10" width="100%">

  <thead>
  <tr>
  <th>Employee</th>
  <th>Tasks</th>
  </tr>
  </thead>

  <tbody>

  {(stats.userWorkload || []).map((u,i)=>(
  <tr key={i}>
  <td>{u.user_id}</td>
  <td>{u.task_count}</td>
  </tr>
  ))}

  </tbody>

  </table>


  {/* MOM REPORT */}

  <h2 style={{marginTop:"40px"}}>Meeting MOM Report</h2>

  <table border="1" cellPadding="10" width="100%">

  <thead>

  <tr>
  <th>Meeting Title</th>
  <th>Date</th>
  <th>Department</th>
  <th>Agenda</th>
  <th>Discussion</th>
  
  <th>Responsible</th>
  <th>Deadline</th>
  <th>Status</th>
  </tr>

  </thead>

  <tbody>

  {meetings.map((m,i)=>(

  <tr key={i}>

  <td>{m.title}</td>

  <td>
  {m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : "-"}
  </td>

  <td>{m.department}</td>

  <td>{m.topic || "-"}</td>

  <td>{m.point || "-"}</td>

  

  <td>{m.assigned_to || "-"}</td>

  <td>
  {m.timeline ? new Date(m.timeline).toLocaleDateString() : "-"}
  </td>

  <td>{m.status || "-"}</td>

  </tr>

  ))}

  </tbody>

  </table>


  {/* ACTION DASHBOARD */}

  <h2 style={{marginTop:"40px"}}>Pending Action Items</h2>

  <table border="1" cellPadding="10" width="100%">

  <thead>

  <tr>
  <th>Meeting</th>
  <th>Task</th>
  <th>Responsible</th>
  <th>Deadline</th>
  <th>Status</th>
  </tr>

  </thead>

  <tbody>

  {meetings
  .filter(m=>m.status !== "Done")
  .map((m,i)=>(

  <tr key={i}>

  <td>{m.title}</td>

  <td>{m.point}</td>

  <td>{m.assigned_to}</td>

  <td>{m.timeline ? new Date(m.timeline).toLocaleDateString() : "-"}</td>

  <td>{m.status}</td>

  </tr>

  ))}

  </tbody>

  </table>


  {/* EXPORT BUTTONS */}

  <div style={{marginTop:"40px",display:"flex",gap:"20px"}}>

  <button onClick={()=>window.print()}>
  Print Report
  </button>

  <button onClick={()=>exportExcel()}>
  Export Excel
  </button>

  <button onClick={()=>exportPDF()}>
  Export PDF
  </button>

  </div>

  </div>

  );

}


const Card = ({title,value}) => (

<div style={{
padding:"20px",
background:"#f3f4f6",
borderRadius:"10px",
width:"200px"
}}>

<h3>{title}</h3>
<h2>{value}</h2>

</div>

);


function exportExcel(){
alert("Excel export feature can be added using SheetJS");
}

function exportPDF(){
alert("PDF export feature can be added using jsPDF");
}