const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText, parseJsonField } = require('../middleware/helpers');

const router = express.Router();

router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT * FROM gn_events
    WHERE status = 'published'
    ORDER BY created_at DESC
  `).all();

  res.json({
    events: rows.map((r) => ({
      id: r.id,
      name: r.name,
      place: r.place,
      event_date: r.event_date,
      participants: r.participants,
      description: r.description,
      tags: parseJsonField(r.tags)
    }))
  });
});

router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  const name = sanitizeText(b.name || b.Nom, 160);
  if (!name) return res.status(400).json({ errorCode: 'event_name_required' });

  const id = uuid();
  const tags = Array.isArray(b.tags) ? b.tags : String(b.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  db.prepare(`
    INSERT INTO gn_events (id, owner_id, name, place, event_date, participants, description, tags, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `).run(
    id,
    req.session.userId,
    name,
    sanitizeText(b.place || b.Lieu || '', 120),
    sanitizeText(b.event_date || b.Date || '', 80),
    sanitizeText(b.participants || b.Participants || '', 80),
    sanitizeText(b.description || b.Description || '', 4000),
    JSON.stringify(tags)
  );

  const row = db.prepare('SELECT * FROM gn_events WHERE id = ?').get(id);
  res.status(201).json({
    event: {
      id: row.id,
      name: row.name,
      place: row.place,
      event_date: row.event_date,
      participants: row.participants,
      description: row.description,
      tags: parseJsonField(row.tags)
    }
  });
});

module.exports = router;
