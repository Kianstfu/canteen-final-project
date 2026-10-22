const mysql = require('mysql2/promise');

// Env vars ang gamit (para sa Render + TiDB Cloud).
// Kapag walang env vars, babalik sa default ng XAMPP para gumana pa rin locally.
const useSSL = process.env.DB_SSL === 'true';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'canteen_db',
  // Kailangan ng TLS ng TiDB Cloud Serverless
  ssl: useSSL ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // para consistent ang format ng petsa pag binalik sa frontend
});

async function connectDB() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log(`✅ Connected to MySQL (${process.env.DB_HOST || 'localhost'})`);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    throw err;
  }
}

module.exports = { pool, connectDB };