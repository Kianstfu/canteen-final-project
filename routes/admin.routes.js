const express = require('express');
const { pool } = require('../db');
const { DEMO_ENABLED, DEMO_ADMIN } = require('./demo');

const router = express.Router();

// ─────────────────────────────────────────
// POST — admin login (for admin-login.html)
// 1) Demo admin (kung DEMO_MODE=true) — hindi kailangan ng database
// 2) Kung hindi demo, i-check sa `admins` table
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  if (DEMO_ENABLED && username === DEMO_ADMIN.username && password === DEMO_ADMIN.password) {
    return res.json({ success: true, username: DEMO_ADMIN.full_name, demo: true });
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }
    res.json({ success: true, username: rows[0].username });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database is not connected yet.', error: err.message });
  }
});

module.exports = router;