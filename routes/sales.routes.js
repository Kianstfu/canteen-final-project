const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// ─────────────────────────────────────────
// GET total sales for today (for 6-admin-sales.html)
// ─────────────────────────────────────────
router.get('/today', async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().slice(0, 10); // e.g. '2026-08-01', defaults to today's date if not provided
    const [rows] = await pool.execute(
      `SELECT SUM(total_amount) AS daily_total, COUNT(*) AS total_orders
       FROM orders
       WHERE DATE(date_placed) = ?`,
      [targetDate]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET real sales grouped by hour, for the selected date (for the "Sales by hour" chart)
// ─────────────────────────────────────────
router.get('/by-hour', async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().slice(0, 10);
    const [rows] = await pool.execute(
      `SELECT HOUR(date_placed) AS hour_of_day, SUM(total_amount) AS total
       FROM orders
       WHERE DATE(date_placed) = ?
       GROUP BY HOUR(date_placed)
       ORDER BY hour_of_day`,
      [targetDate]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET real best-selling items for the selected date (for the "Best sellers" table)
// ─────────────────────────────────────────
router.get('/best-sellers', async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().slice(0, 10);
    const [rows] = await pool.execute(
      `SELECT m.item_name, SUM(oi.quantity) AS qty_sold, SUM(oi.quantity * oi.price_at_order) AS total_sales
       FROM order_items oi
       JOIN menu_items m ON oi.item_id = m.item_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE DATE(o.date_placed) = ?
       GROUP BY m.item_name
       ORDER BY qty_sold DESC`,
      [targetDate]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET sales trend over the last N days (for the "Weekly/Monthly" trend chart)
// ─────────────────────────────────────────
router.get('/trend', async (req, res) => {
  const days = Number(req.query.days) || 7; // default sa 7 days (weekly)
  try {
    const [rows] = await pool.execute(
      `SELECT DATE(date_placed) AS sale_date, SUM(total_amount) AS total
       FROM orders
       WHERE date_placed >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(date_placed)
       ORDER BY sale_date`,
      [days - 1]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET best-selling items over a date range (for Week/Month Excel export)
// ─────────────────────────────────────────
router.get('/best-sellers-range', async (req, res) => {
  const days = Number(req.query.days) || 30;
  try {
    const [rows] = await pool.execute(
      `SELECT m.item_name, SUM(oi.quantity) AS qty_sold, SUM(oi.quantity * oi.price_at_order) AS total_sales
       FROM order_items oi
       JOIN menu_items m ON oi.item_id = m.item_id
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.date_placed >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY m.item_name
       ORDER BY qty_sold DESC`,
      [days - 1]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
