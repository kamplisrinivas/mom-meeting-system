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

/* NEW FILTERS */

const [departmentFilter,setDepartmentFilter] = useState("");
const [meetingFilter,setMeetingFilter] = useState("");
const [titleFilter,setTitleFilter] = useState("");

const [showExport,setShowExport] = useState(false);
const [exportType,setExportType] = useState("full");

const token = localStorage.getItem("token");

/* FETCH REPORT DATA */

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


/* FILTER LOGIC */

const filteredMeetings = meetings.filter(m => {

return (

(!departmentFilter || m.department === departmentFilter) &&
(!meetingFilter || m.title === meetingFilter) &&
(!titleFilter || m.title.toLowerCase().includes(titleFilter.toLowerCase()))

);

});


if(loading) return <h2>Loading reports...</h2>;

return(

<div style={{padding:"30px"}}>

<h1>📊 Meeting Analytics & Reports</h1>

{/* FILTER SECTION */}

<div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap"}}>

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

<select
value={departmentFilter}
onChange={(e)=>setDepartmentFilter(e.target.value)}
>
<option value="">All Departments</option>
{[...new Set(meetings.map(m=>m.department))].map((d,i)=>(
<option key={i} value={d}>{d}</option>
))}
</select>

<select
value={meetingFilter}
onChange={(e)=>setMeetingFilter(e.target.value)}
>
<option value="">All Meetings</option>
{[...new Set(meetings.map(m=>m.title))].map((t,i)=>(
<option key={i} value={t}>{t}</option>
))}
</select>

<input
type="text"
placeholder="Search by title"
value={titleFilter}
onChange={(e)=>setTitleFilter(e.target.value)}
/>

<button onClick={fetchReports}>
Apply Filters
</button>

</div>


{/* KPI CARDS */}

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

{filteredMeetings.map((m,i)=>(

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


{/* PENDING ACTION ITEMS */}

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

{filteredMeetings
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

<button onClick={()=>exportPDF(stats,filteredMeetings)}>
<FaFileExport/> Export PDF
</button>

</div>

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

data=meetings.map(m=>({
Meeting:m.title,
Date:m.meeting_date,
Department:m.department,
Discussion:m.point,
Responsible:m.assigned_to,
Deadline:m.timeline,
Status:m.status
}));

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

autoTable(doc,{
startY:40,
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