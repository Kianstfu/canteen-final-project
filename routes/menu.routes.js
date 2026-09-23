const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

const router = express.Router();

// ─────────────────────────────────────────
// Multer setup — dito i-se-save yung mga na-upload na larawan ng menu item
// (nasa public/uploads, kaya direktang naa-access sa browser via /uploads/filename.jpg)
// ─────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  }
});

// ─────────────────────────────────────────
// GET all available menu items (for 1-menu.html)
// ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM menu_items WHERE is_available = 1');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET all menu items including unavailable ones (for 7-admin-menu.html)
// ─────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM menu_items ORDER BY category, item_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// POST — add a new menu item (for 7-admin-menu.html "+ Add item")
// Tumatanggap ngayon ng multipart/form-data, kasama ang optional na "image" file field.
// ─────────────────────────────────────────
router.post('/', upload.single('image'), async (req, res) => {
  const { item_name, category, price, description } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const [result] = await pool.execute(
      `INSERT INTO menu_items (item_name, category, price, description, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [item_name, category, price, description || null, image_url]
    );
    res.json({ success: true, item_id: result.insertId, image_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT — i-edit ang existing menu item (item name, category, price, description,
// at optional na bagong larawan) — para sa "Edit" button sa 7-admin-menu.html
// ─────────────────────────────────────────
router.put('/:id', upload.single('image'), async (req, res) => {
  const { item_name, category, price, description } = req.body;
  try {
    if (req.file) {
      // may bagong na-upload na larawan — palitan ang image_url
      const image_url = `/uploads/${req.file.filename}`;
      await pool.execute(
        `UPDATE menu_items SET item_name = ?, category = ?, price = ?, description = ?, image_url = ? WHERE item_id = ?`,
        [item_name, category, price, description || null, image_url, req.params.id]
      );
    } else {
      // walang bagong larawan — ang dati na lang na image_url ang panatilihin
      await pool.execute(
        `UPDATE menu_items SET item_name = ?, category = ?, price = ?, description = ? WHERE item_id = ?`,
        [item_name, category, price, description || null, req.params.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// PUT — toggle out of stock / available (for the toggle switch)
// ─────────────────────────────────────────
router.put('/:id/availability', async (req, res) => {
  const { is_available } = req.body; // true or false
  try {
    await pool.execute('UPDATE menu_items SET is_available = ? WHERE item_id = ?', [is_available, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// DELETE — remove a menu item (for the "Delete" button)
// ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM menu_items WHERE item_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Error handler para sa multer (hal. sobrang laki ng file, o hindi image)
// ─────────────────────────────────────────
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Only image files are allowed.') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;