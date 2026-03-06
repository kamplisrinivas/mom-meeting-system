import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import '../styles/Report.css';
import { FaFileExport, FaPrint } from 'react-icons/fa';

const API = "http://localhost:5001/api";

export default function Reports() {

const [stats, setStats] = useState({
totalMeetings:0,
totalTasks:0,
completedTasks:0,
pendingActions:0,
completionRate:0,
departmentStats:[],
userWorkload:[]
});

const [meetings,setMeetings] = useState([]);
const [loading,setLoading] = useState(true);

const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");

const [showExport,setShowExport] = useState(false);
const [exportType,setExportType] = useState("full");

const token = localStorage.getItem("token");

const fetchReports = async ()=>{

try{

setLoading(true);

const statsRes = await fetch(
`${API}/reports/stats?startDate=${startDate}&endDate=${endDate}`,
{ headers:{ Authorization:`Bearer ${token}` }}
);

const statsData = await statsRes.json();

const meetingRes = await fetch(
`${API}/reports/meeting-details?startDate=${startDate}&endDate=${endDate}`,
{ headers:{ Authorization:`Bearer ${token}` }}
);

const meetingData = await meetingRes.json();

if(statsData.success) setStats(statsData.data || {});
if(meetingData.success) setMeetings(meetingData.data || []);

}
catch(err){
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

<Card title="Total Meetings" value={stats.totalMeetings}/>
<Card title="Pending Actions" value={stats.pendingActions}/>
<Card title="Completed Actions" value={stats.completedTasks}/>
<Card title="Productivity Score" value={`${stats.completionRate}%`}/>

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
<td>{u.employee}</td>
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


{/* PENDING ACTIONS */}

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
<FaPrint/> Print Report
</button>

<button onClick={()=>setShowExport(true)}>
<FaFileExport/> Export Excel
</button>

<button onClick={()=>exportPDF(stats,meetings)}>
<FaFileExport/> Export PDF
</button>

</div>


{/* EXPORT POPUP */}

{showExport && (

<div style={{
position:"fixed",
top:"0",
left:"0",
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.4)",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>

<div style={{
background:"white",
padding:"30px",
borderRadius:"10px",
width:"350px"
}}>

<h3>Select Report to Export</h3>

<select
value={exportType}
onChange={(e)=>setExportType(e.target.value)}
style={{width:"100%",padding:"10px",marginBottom:"20px"}}
>

<option value="full">Full Report</option>
<option value="department">Department Meetings</option>
<option value="workload">Employee Workload</option>
<option value="mom">MOM Report</option>
<option value="pending">Pending Actions</option>

</select>

<button
onClick={()=>{
exportExcel(exportType,stats,meetings);
setShowExport(false);
}}
style={{marginRight:"10px"}}
>
Export
</button>

<button onClick={()=>setShowExport(false)}>
Cancel
</button>

</div>

</div>

)}

</div>

);
}


/* KPI CARD */

const Card = ({title,value})=>(
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


/* EXCEL EXPORT */

function exportExcel(type,stats,meetings){

let data=[];

if(type==="department"){

data=(stats.departmentStats || []).map(d=>({
Department:d.department,
Meetings:d.meeting_count
}));

}

else if(type==="workload"){

data=(stats.userWorkload || []).map(u=>({
Employee:u.employee,
Tasks:u.task_count
}));

}

else if(type==="pending"){

data=meetings
.filter(m=>m.status !== "Done")
.map(m=>({
Meeting:m.title,
Task:m.point,
Responsible:m.assigned_to,
Deadline:m.timeline,
Status:m.status
}));

}

else{

data=meetings.map(m=>({
Meeting:m.title,
Date:m.meeting_date,
Department:m.department,
Discussion:m.point,
Responsible:m.assigned_to,
Deadline:m.timeline,
Status:m.status
}));

}

const worksheet=XLSX.utils.json_to_sheet(data);
const workbook=XLSX.utils.book_new();

XLSX.utils.book_append_sheet(workbook,worksheet,"Report");

XLSX.writeFile(workbook,"Meeting_Report.xlsx");

}


/* PDF EXPORT */

function exportPDF(stats,meetings){

const doc=new jsPDF();

doc.setFontSize(18);
doc.text("Meeting Analytics Report",14,20);

doc.setFontSize(12);
doc.text(`Total Meetings: ${stats.totalMeetings}`,14,35);
doc.text(`Total Tasks: ${stats.totalTasks}`,14,42);
doc.text(`Completed Tasks: ${stats.completedTasks}`,14,49);
doc.text(`Pending Actions: ${stats.pendingActions}`,14,56);
doc.text(`Productivity Score: ${stats.completionRate}%`,14,63);

autoTable(doc,{
startY:75,
head:[["Department","Meetings"]],
body:(stats.departmentStats || []).map(d=>[
d.department,
d.meeting_count
])
});

autoTable(doc,{
startY:doc.lastAutoTable.finalY+10,
head:[["Employee","Tasks"]],
body:(stats.userWorkload || []).map(u=>[
u.employee,
u.task_count
])
});

autoTable(doc,{
startY:doc.lastAutoTable.finalY+10,
head:[[
"Meeting",
"Date",
"Department",
"Discussion",
"Responsible",
"Deadline",
"Status"
]],
body:meetings.map(m=>[
m.title,
m.meeting_date ? new Date(m.meeting_date).toLocaleDateString() : "-",
m.department,
m.point || "-",
m.assigned_to || "-",
m.timeline ? new Date(m.timeline).toLocaleDateString() : "-",
m.status || "-"
])
});

doc.save("Meeting_Report.pdf");

}