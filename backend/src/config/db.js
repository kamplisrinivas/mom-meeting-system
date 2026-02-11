const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",   // if XAMPP default
  database: "mom_db",
});

module.exports = db;