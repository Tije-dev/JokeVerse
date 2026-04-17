const express = require('express');
const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');

const router = express.Router();

router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    res.json({ success: false, message: 'Email and password are required.' });
    return;
  }

  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, username, password FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      res.json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const row = rows[0];
    const isValidPassword = await bcrypt.compare(password, row.password);
    if (!isValidPassword) {
      res.json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const user = {
      id: row.id,
      username: row.username,
      email,
    };

    req.session.regenerate((err) => {
      if (err) {
        res.json({ success: false, message: 'Login failed. Try again later.' });
        return;
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.email = user.email;
      res.json({
        success: true,
        message: 'Login successful.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    });
  } catch (err) {
    res.json({ success: false, message: 'Login failed. Try again later.' });
  }
});

router.post('/register', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk || !username || !password) {
    res.json({ success: false, message: 'All fields are required and must be valid.' });
    return;
  }
  if (password.length < 8) {
    res.json({ success: false, message: 'Password must be at least 8 characters.' });
    return;
  }

  try {
    const pool = getPool();
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if (existing.length > 0) {
      res.json({ success: false, message: 'Email or username already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, passwordHash]
    );

    const userId = result.insertId;
    const user = { id: userId, username, email };

    req.session.regenerate((err) => {
      if (err) {
        res.json({ success: true, message: 'Registration successful. Please log in.' });
        return;
      }
      req.session.userId = userId;
      req.session.username = username;
      req.session.email = email;
      res.json({
        success: true,
        message: 'Registration successful.',
        user,
      });
    });
  } catch (err) {
    res.json({ success: false, message: 'Registration failed. Try again later.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.json({ success: false, message: 'Logout failed.' });
      return;
    }
    res.clearCookie('jokeverse.sid', { path: '/' });
    res.json({ success: true, message: 'Logged out.' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    res.json({ success: true, authenticated: false });
    return;
  }
  res.json({
    success: true,
    authenticated: true,
    user: {
      id: req.session.userId,
      username: req.session.username,
      email: req.session.email,
    },
  });
});

module.exports = router;
