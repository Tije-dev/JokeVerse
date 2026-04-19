const express = require('express');
const { getPool } = require('../config/database');

const router = express.Router();

const ALLOWED_CATEGORIES = new Set([
  'general',
  'programming',
  'dad',
  'knock-knock',
  'science',
  'math',
  'technology',
  'school',
  'relationship',
  'food',
  'animal',
  'random',
]);

const MAX_SETUP = 500;
const MAX_PUNCHLINE = 500;

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    res.status(401).json({ success: false, message: 'You must be logged in.' });
    return;
  }
  next();
}

router.use(requireAuth);

function normalizeText(value, maxLen) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.replace(/\u0000/g, '').trim();
  if (trimmed.length > maxLen) {
    return null;
  }
  return trimmed;
}

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT save_id AS saveId, category, setup, punchline, date
       FROM saved_jokes
       WHERE user_id = ?
       ORDER BY date DESC`,
      [req.session.userId]
    );
    res.json({ success: true, jokes: rows });
  } catch (err) {
    console.error('GET /api/save-joke', err);
    res.status(500).json({ success: false, message: 'Failed to load saved jokes.' });
  }
});

router.post('/', async (req, res) => {
  const rawCategory =
    typeof req.body.category === 'string' ? req.body.category.trim().toLowerCase() : '';
  if (rawCategory && !ALLOWED_CATEGORIES.has(rawCategory)) {
    res.status(400).json({ success: false, message: 'Invalid category.' });
    return;
  }

  const setup = normalizeText(req.body.setup, MAX_SETUP);
  if (!setup) {
    res.status(400).json({ success: false, message: 'Setup is required and must be valid text.' });
    return;
  }

  const punchlineRaw = normalizeText(req.body.punchline, MAX_PUNCHLINE);
  const punchline = punchlineRaw === '' ? null : punchlineRaw;

  const category = rawCategory || null;

  try {
    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO saved_jokes (user_id, category, setup, punchline) VALUES (?, ?, ?, ?)',
      [req.session.userId, category, setup, punchline]
    );
    res.json({ success: true, saveId: result.insertId });
  } catch (err) {
    console.error('POST /api/save-joke', err);
    res.status(500).json({ success: false, message: 'Failed to save joke.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ success: false, message: 'Invalid id.' });
    return;
  }

  try {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM saved_jokes WHERE save_id = ? AND user_id = ? LIMIT 1',
      [id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Joke not found.' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/save-joke', err);
    res.status(500).json({ success: false, message: 'Failed to delete joke.' });
  }
});

module.exports = router;
