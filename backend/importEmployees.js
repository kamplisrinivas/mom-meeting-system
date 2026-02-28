const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql2/promise");

// 🔧 UPDATE with your DB config
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mom_db",
  waitForConnections: true,
  connectionLimit: 10,
});

const results = [];

async function importCSV() {
  try {
    console.log("🚀 Starting import...");

    fs.createReadStream("./Hod_List.csv") // ✅ put file in backend folder
      .pipe(csv())
      .on("data", (row) => {
        // 🧹 CLEAN DATA
        results.push([
          row.EmployeeID?.replace(/'/g, "").trim() || null,
          row.EmployeeName?.trim() || null,
          row.Department?.trim() || null,
          row.Designation?.trim() || null,
          row.PersonalEmail?.trim() || null,
          row.CompanyEmail?.trim() || null,
          row.SuperiorName?.trim() || null,
          row.HODName?.trim() || null,
        ]);
      })
      .on("end", async () => {
        console.log(`📊 Rows read: ${results.length}`);

        const conn = await pool.getConnection();

        try {
          const sql = `
            INSERT INTO employees
            (EmployeeID, EmployeeName, Department, Designation,
             PersonalEmail, CompanyEmail, SuperiorName, HODName)
            VALUES ?
          `;

          await conn.query(sql, [results]);

          console.log("✅ Import completed successfully!");
        } catch (err) {
          console.error("❌ Insert error:", err.message);
        } finally {
          conn.release();
          process.exit();
        }
      });
  } catch (err) {
    console.error("❌ Import failed:", err.message);
  }
}

importCSV();