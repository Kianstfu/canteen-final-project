const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// ─────────────────────────────────────────
// POST — register a new customer (for customer-register.html)
// ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, password, full_name, contact_number } = req.body;

  if (!username || !password || !full_name) {
    return res.status(400).json({ success: false, message: 'Username, password, and full name are required.' });
  }

  try {
    const [existing] = await pool.execute('SELECT * FROM customers WHERE username = ?', [username]);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'This username is already taken.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO customers (username, password, full_name, contact_number)
       VALUES (?, ?, ?, ?)`,
      [username, password, full_name, contact_number || null]
    );

    res.json({ success: true, customer_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// POST — verify customer login (for customer-login.html)
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }

    const customer = rows[0];
    if (customer.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }

    res.json({ success: true, customer_id: customer.customer_id, full_name: customer.full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// POST — Google sign-in (for the "Continue with Google" button)
// Kung existing na ang email sa customers table, gagamitin na lang natin
// yung account na iyon. Kung wala pa, gagawa tayo ng bagong customer row
// gamit ang email bilang username, walang password (Google na ang bahala
// sa pag-verify ng pagkatao).
// ─────────────────────────────────────────
router.post('/google-login', async (req, res) => {
  const { email, full_name } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE email = ? OR username = ?',
      [email, email]
    );
    let customer;

    if (rows.length > 0) {
      customer = rows[0];
      // Legacy row bago pa idinagdag ang email column (username = email pero
      // walang laman ang email field) — i-backfill na lang.
      if (!customer.email) {
        await pool.execute('UPDATE customers SET email = ? WHERE customer_id = ?', [email, customer.customer_id]);
      }
    } else {
      const [result] = await pool.execute(
        `INSERT INTO customers (username, email, password, full_name, contact_number)
         VALUES (?, ?, NULL, ?, NULL)`,
        [email, email, full_name || email.split('@')[0]]
      );
      customer = { customer_id: result.insertId, full_name: full_name || email.split('@')[0] };
    }

    res.json({ success: true, customer_id: customer.customer_id, full_name: customer.full_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET all orders for a specific customer (for my-orders.html)
// ─────────────────────────────────────────
router.get('/:id/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT o.order_id, o.building, o.room_number, o.total_amount, o.status, o.date_placed, o.followed_up, o.rating,
              m.item_name, oi.quantity
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN menu_items m ON oi.item_id = m.item_id
       WHERE o.customer_id = ?
       ORDER BY o.date_placed DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;