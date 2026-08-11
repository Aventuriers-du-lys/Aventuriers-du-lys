const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { mapGame, sanitizeText, parseJsonField } = require('../middleware/helpers');

const router = express.Router();

function userBookingSet(userId) {
  if (!userId) return new Set();
  const rows = db.prepare('SELECT game_id FROM bookings WHERE user_id = ?').all(userId);
  return new Set(rows.map((r) => r.game_id));
}

router.get('/', (req, res) => {
  const mine = userBookingSet(req.session?.userId);
  const rows = db.prepare(`
    SELECT g.*, u.display_name
    FROM games g
    LEFT JOIN users u ON u.id = g.owner_id
    WHERE g.status = 'published'
    ORDER BY g.created_at DESC
  `).all();

  res.json({
    games: rows.map((r) => mapGame(r, { bookedByMe: mine.has(r.id) }))
  });
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT g.*, u.display_name
    FROM games g
    LEFT JOIN users u ON u.id = g.owner_id
    WHERE g.id = ?
  `).get(req.params.id);

  if (!row || row.status === 'archived') {
    return res.status(404).json({ errorCode: 'game_not_found' });
  }

  const bookedByMe = !!(req.session?.userId && db.prepare(
    'SELECT 1 FROM bookings WHERE game_id = ? AND user_id = ?'
  ).get(req.params.id, req.session.userId));

  res.json({ game: mapGame(row, { bookedByMe }) });
});

router.post('/', requireAuth, (req, res) => {
  const b = req.body || {};
  const title_fr = sanitizeText(b.title_fr || b.title || b.Titre, 160);
  if (!title_fr) return res.status(400).json({ errorCode: 'title_required' });

  const systemMap = {
    'D&D': 'DND', DND: 'DND', Pathfinder: 'PF', PF: 'PF', VtM: 'VTM', VTM: 'VTM',
    Cthulhu: 'COC', COC: 'COC', 'Marvel/DC': 'HERO', HERO: 'HERO',
    Cyberpunk: 'OTHER', Shadowrun: 'SR', SR: 'SR', Autre: 'OTHER', OTHER: 'OTHER'
  };

  const system = systemMap[b.system || b.Système] || sanitizeText(b.system || 'OTHER', 20);
  const format = (b.format === 'CAMPAIGN' || b.Fréquence === 'hebdomadaire' || b.type === 'campagne')
    ? 'CAMPAIGN'
    : 'ONE_SHOT';

  const id = uuid();
  const platforms = Array.isArray(b.platforms)
    ? b.platforms
    : String(b.platforms || b.Plateformes || 'Discord')
      .split(/[,+]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const tags = Array.isArray(b.tags) ? b.tags : parseJsonField(b.tags, []);

  const user = db.prepare('SELECT display_name FROM users WHERE id = ?').get(req.session.userId);

  db.prepare(`
    INSERT INTO games (
      id, owner_id, title_fr, title_en, system, format, lang, price_per_player, currency,
      when_fr, when_en, start_date, start_time, frequency, tz, duration,
      min_players, max_players, booked, is_open, platforms, tags, dm_label,
      desc_fr, desc_en, expect_fr, expect_en, status
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, 0, 1, ?, ?, ?,
      ?, ?, ?, ?, 'published'
    )
  `).run(
    id,
    req.session.userId,
    title_fr,
    sanitizeText(b.title_en || title_fr, 160),
    system,
    format,
    sanitizeText(b.lang || b.Langue || 'FR', 8),
    Number(b.price_per_player || b.Montant || 20),
    sanitizeText(b.currency || b.Devise || 'CAD', 8),
    sanitizeText(b.when_fr || `${b.DateDébut || ''} ${b.Heure || ''}`.trim() || 'À confirmer', 80),
    sanitizeText(b.when_en || b.when_fr || 'TBD', 80),
    sanitizeText(b.start_date || b.DateDébut || '', 20),
    sanitizeText(b.start_time || b.Heure || '', 20),
    sanitizeText(b.frequency || b.Fréquence || 'one-shot', 40),
    sanitizeText(b.tz || b.Timezone || 'America/Montreal', 60),
    sanitizeText(b.duration || '', 40),
    Number(b.min_players || 3),
    Number(b.max_players || 5),
    JSON.stringify(platforms),
    JSON.stringify(tags),
    sanitizeText(b.dm || b.PseudoMJ || user.display_name, 80),
    sanitizeText(b.desc_fr || b.Description || b.desc || '', 4000),
    sanitizeText(b.desc_en || b.desc_fr || b.Description || '', 4000),
    sanitizeText(b.expect_fr || '', 2000),
    sanitizeText(b.expect_en || '', 2000)
  );

  const row = db.prepare('SELECT g.*, u.display_name FROM games g LEFT JOIN users u ON u.id = g.owner_id WHERE g.id = ?').get(id);
  res.status(201).json({ game: mapGame(row) });
});

router.post('/:id/book', requireAuth, (req, res) => {
  const gameId = req.params.id;
  const userId = req.session.userId;

  try {
    const result = db.transaction(() => {
      const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
      if (!game || game.status !== 'published') {
        return { status: 404, errorCode: 'game_not_found' };
      }
      if (!game.is_open) return { status: 400, errorCode: 'game_closed' };
      if (game.booked >= game.max_players) return { status: 400, errorCode: 'game_full' };

      const existing = db.prepare('SELECT id FROM bookings WHERE game_id = ? AND user_id = ?').get(gameId, userId);
      if (existing) return { status: 409, errorCode: 'already_booked' };

      db.prepare('INSERT INTO bookings (id, game_id, user_id) VALUES (?, ?, ?)').run(uuid(), gameId, userId);
      db.prepare('UPDATE games SET booked = booked + 1, updated_at = datetime(\'now\') WHERE id = ?').run(gameId);

      const updated = db.prepare('SELECT g.*, u.display_name FROM games g LEFT JOIN users u ON u.id = g.owner_id WHERE g.id = ?').get(gameId);
      return { status: 200, game: mapGame(updated, { bookedByMe: true }) };
    })();

    if (result.errorCode) return res.status(result.status).json({ errorCode: result.errorCode });
    res.json({ game: result.game });
  } catch (e) {
    console.error(e);
    res.status(500).json({ errorCode: 'book_failed' });
  }
});

router.post('/:id/cancel', requireAuth, (req, res) => {
  const gameId = req.params.id;
  const userId = req.session.userId;

  try {
    const result = db.transaction(() => {
      const booking = db.prepare('SELECT id FROM bookings WHERE game_id = ? AND user_id = ?').get(gameId, userId);
      if (!booking) return { status: 404, errorCode: 'no_booking' };

      db.prepare('DELETE FROM bookings WHERE id = ?').run(booking.id);
      db.prepare('UPDATE games SET booked = MAX(booked - 1, 0), updated_at = datetime(\'now\') WHERE id = ?').run(gameId);

      const updated = db.prepare('SELECT g.*, u.display_name FROM games g LEFT JOIN users u ON u.id = g.owner_id WHERE g.id = ?').get(gameId);
      return { status: 200, game: mapGame(updated, { bookedByMe: false }) };
    })();

    if (result.errorCode) return res.status(result.status).json({ errorCode: result.errorCode });
    res.json({ game: result.game });
  } catch (e) {
    console.error(e);
    res.status(500).json({ errorCode: 'cancel_failed' });
  }
});

router.post('/:id/toggle', requireAuth, (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!game) return res.status(404).json({ errorCode: 'game_not_found' });

  const isOwner = game.owner_id === req.session.userId;
  const isAdmin = req.session.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ errorCode: 'owner_only' });

  db.prepare('UPDATE games SET is_open = CASE WHEN is_open = 1 THEN 0 ELSE 1 END, updated_at = datetime(\'now\') WHERE id = ?')
    .run(game.id);

  const updated = db.prepare('SELECT g.*, u.display_name FROM games g LEFT JOIN users u ON u.id = g.owner_id WHERE g.id = ?').get(game.id);
  const bookedByMe = !!(db.prepare('SELECT 1 FROM bookings WHERE game_id = ? AND user_id = ?').get(game.id, req.session.userId));
  res.json({ game: mapGame(updated, { bookedByMe }) });
});

module.exports = router;
