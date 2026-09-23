const mysql = require('mysql2/promise');

// Default na settings ng XAMPP MySQL:
//   host: localhost, port: 3306, user: root, password: '' (walang password)
// Palitan lang ang mga ito kung binago mo ang setup ng XAMPP mo (hal. naglagay ka ng password sa root).
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'canteen_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // para consistent ang format ng petsa pag binalik sa frontend
});

async function connectDB() {
  try {
    // ginagamit lang natin ito para i-test ang koneksyon pag-start ng server
    const conn = await pool.getConnection();
    conn.release();
    console.log('✅ Connected to MySQL (canteen_db) via XAMPP');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    throw err;
  }
}

module.exports = { pool, connectDB };
