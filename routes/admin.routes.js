const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// ─────────────────────────────────────────
// POST — verify admin login (for admin-login.html)
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }

    const admin = rows[0];
    if (admin.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }

    res.json({ success: true, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
