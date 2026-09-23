const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// ─────────────────────────────────────────
// POST a new order (for 3-checkout.html "Place order")
// Inaasahan nitong ipasa ng frontend: customer_name, building, room_number,
// contact_number, notes, payment_method, at items: [{item_id, quantity, price}]
// ─────────────────────────────────────────
router.post('/', async (req, res) => {
  const { customer_id, customer_name, building, room_number, contact_number, notes, payment_method, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'The order has no items' });
  }

  const total_amount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Gumawa muna ng row sa orders table
    const [orderResult] = await conn.execute(
      `INSERT INTO orders (customer_id, customer_name, building, room_number, contact_number, notes, payment_method, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id || null, customer_name, building, room_number, contact_number || null, notes || null, payment_method, total_amount]
    );

    const newOrderId = orderResult.insertId;

    // 2. Idagdag ang bawat item sa order_items table
    for (const item of items) {
      await conn.execute(
        `INSERT INTO order_items (order_id, item_id, quantity, price_at_order)
         VALUES (?, ?, ?, ?)`,
        [newOrderId, item.item_id, item.quantity, item.price]
      );
    }

    await conn.commit();
    res.json({ success: true, order_id: newOrderId, total_amount });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────
// GET all orders (for 5-admin-orders.html)
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.order_id, o.customer_name, o.building, o.room_number, o.total_amount, o.status, o.date_placed, o.followed_up, o.rating, o.notes,
             m.item_name, oi.quantity
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN menu_items m ON oi.item_id = m.item_id
      ORDER BY o.followed_up DESC, o.date_placed DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT — customer flags an order for follow-up (for the "Follow up" button)
// ─────────────────────────────────────────
router.put('/:id/followup', async (req, res) => {
  try {
    await pool.execute('UPDATE orders SET followed_up = 1 WHERE order_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT — customer cancels an order (only allowed while still "pending")
// ─────────────────────────────────────────
router.put('/:id/cancel', async (req, res) => {
  try {
    const [check] = await pool.execute('SELECT status FROM orders WHERE order_id = ?', [req.params.id]);

    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (check[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This order can no longer be cancelled — the kitchen has already started preparing it.' });
    }

    await pool.execute("UPDATE orders SET status = 'cancelled' WHERE order_id = ?", [req.params.id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT — customer submits a star rating after delivery
// ─────────────────────────────────────────
router.put('/:id/rating', async (req, res) => {
  const { rating } = req.body; // 1 to 5
  try {
    await pool.execute('UPDATE orders SET rating = ? WHERE order_id = ?', [rating, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET current status of an order (for live tracking on 4-order-confirmation.html)
// ─────────────────────────────────────────
router.get('/:id/status', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT status FROM orders WHERE order_id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ status: rows[0].status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT — update order status (for "Start preparing" / "Mark as ready" buttons)
// ─────────────────────────────────────────
router.put('/:id/status', async (req, res) => {
  const { status } = req.body; // 'pending', 'preparing', 'ready', 'delivered'
  try {
    await pool.execute('UPDATE orders SET status = ?, followed_up = 0 WHERE order_id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// DELETE — customer removes a past order from their history
// (only allowed once the order is delivered or cancelled, to protect active orders)
// ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [check] = await conn.execute('SELECT status FROM orders WHERE order_id = ?', [req.params.id]);

    if (check.length === 0) {
      conn.release();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (check[0].status !== 'delivered' && check[0].status !== 'cancelled') {
      conn.release();
      return res.status(400).json({ success: false, message: 'Only delivered or cancelled orders can be removed.' });
    }

    await conn.beginTransaction();
    await conn.execute('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    await conn.execute('DELETE FROM orders WHERE order_id = ?', [req.params.id]);
    await conn.commit();

    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
