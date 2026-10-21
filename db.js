const mysql = require('mysql2/promise');

// Gumagamit ng environment variables (Render) kapag meron.
// Kapag wala (hal. sa XAMPP mo sa laptop), babalik sa default na localhost.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'canteen_db',
  ssl: process.env.DB_SSL === 'true'
    ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // para consistent ang format ng petsa pag binalik sa frontend
});

async function connectDB() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('✅ Connected to MySQL database');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    throw err;
  }
}

module.exports = { pool, connectDB };