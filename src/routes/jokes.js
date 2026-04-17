const express = require('express');

const router = express.Router();

const BASE = 'https://official-joke-api.appspot.com';

/**
 * GET /api/jokes/random
 * Query: topic (optional). If omitted, defaults to programming.
 * Frontend "random" category sends no topic.
 */
router.get('/random', async (req, res) => {
  let topic = typeof req.query.topic === 'string' ? req.query.topic.trim() : '';
  if (!topic) {
    topic = 'programming';
  }

  try {
    let data;
    if (topic === 'random') {
      const r = await fetch(`${BASE}/random_joke`);
      if (!r.ok) {
        res.status(r.status).json({ error: 'Joke API error' });
        return;
      }
      const joke = await r.json();
      data = [joke];
    } else {
      const r = await fetch(`${BASE}/jokes/${encodeURIComponent(topic)}/random`);
      if (!r.ok) {
        res.status(r.status).json({ error: 'Joke API error' });
        return;
      }
      data = await r.json();
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch joke' });
  }
});

module.exports = router;
