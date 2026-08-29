import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "VixZ(09)@$",
  database: "men_fashion_admin",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;