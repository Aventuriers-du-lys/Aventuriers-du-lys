const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { mapListing, sanitizeText, parseJsonField } = require('../middleware/helpers');

const router = express.Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM listings ORDER BY created_at DESC').all();
  res.json({ listings: rows.map(mapListing) });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ errorCode: 'listing_not_found' });
  res.json({ listing: mapListing(row) });
});

router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  const title = sanitizeText(b.title || b.Titre, 160);
  if (!title) return res.status(400).json({ errorCode: 'title_required' });

  const user = db.prepare('SELECT display_name, email FROM users WHERE id = ?').get(req.session.userId);
  const id = uuid();
  const maxPlayers = Number(b.max_players || 5);
  const booked = Number(b.booked || 0);

  db.prepare(`
    INSERT INTO listings (
      id, owner_id, title, gm, system, type, lang, tz, start_date, time, frequency,
      price, currency, seats, min_players, max_players, booked, platform, vibe, desc, contact_email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.session.userId,
    title,
    sanitizeText(b.gm || b.PseudoMJ || user.display_name, 80),
    sanitizeText(b.system || b.Système || 'D&D', 40),
    sanitizeText(b.type || (b.Fréquence === 'one-shot' ? 'one-shot' : 'campagne'), 40),
    sanitizeText(b.lang || b.Langue || 'FR', 8),
    sanitizeText(b.tz || b.Timezone || 'America/Montreal', 60),
    sanitizeText(b.start_date || b.DateDébut || '', 20),
    sanitizeText(b.time || b.Heure || '', 20),
    sanitizeText(b.frequency || b.Fréquence || 'one-shot', 40),
    Number(b.price || b.Montant || 20),
    sanitizeText(b.currency || b.Devise || 'CAD', 8),
    sanitizeText(b.seats || `${booked}/${maxPlayers}`, 20),
    Number(b.min_players || 3),
    maxPlayers,
    booked,
    sanitizeText(b.platform || b.Plateformes || 'Discord', 120),
    JSON.stringify(Array.isArray(b.vibe) ? b.vibe : parseJsonField(b.vibe, [])),
    sanitizeText(b.desc || b.Description || '', 4000),
    sanitizeText(b.contact_email || user.email, 120)
  );

  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
  res.status(201).json({ listing: mapListing(row) });
});

module.exports = router;
