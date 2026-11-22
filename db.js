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

// Ang TiDB Cloud ay naka-UTC by default, kaya ang CURRENT_TIMESTAMP / CURDATE() ay 8 oras
// na nauuna sa oras sa Pilipinas. Dahil dito, ang order na nilagay mo ng umaga ay napupunta
// sa "kahapon" sa sales report. Itinatakda natin ang bawat connection sa Philippine time
// (+08:00, walang DST sa PH) para pareho na ang oras ng DB at ng canteen.
pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+08:00'");
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