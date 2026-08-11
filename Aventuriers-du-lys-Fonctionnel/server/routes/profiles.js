const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText } = require('../middleware/helpers');

const router = express.Router();

function mapProfile(row, user) {
  if (!row || !user) return null;
  return {
    user_id: user.id,
    displayName: user.display_name,
    email: undefined,
    lang: row.lang,
    tz: row.tz,
    bio: row.bio,
    publicLink: row.public_link,
    currentGames: row.current_games,
    mode: row.profile_mode,
    pSystems: row.p_systems,
    pStyle: row.p_style,
    pLevel: row.p_level,
    pAvailability: row.p_availability,
    specialties: row.specialties,
    systems: row.systems,
    corporateOpen: row.corporate_open,
    corporateRegions: row.corporate_regions,
    gmCurrentGames: row.gm_current_games,
    gmExp: row.gm_exp,
    gmCurrency: row.gm_currency,
    gmRate: row.gm_rate,
    gmPlatforms: row.gm_platforms,
    gmSafety: row.gm_safety,
    isPublic: !!row.is_public
  };
}

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, display_name, email, role FROM users WHERE id = ?').get(req.session.userId);
  let profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.session.userId);
  if (!profile) {
    db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(req.session.userId);
    profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.session.userId);
  }
  res.json({ profile: mapProfile(profile, user) });
});

router.put('/me', requireAuth, (req, res) => {
  const b = req.body || {};
  const displayName = sanitizeText(b.displayName || b.display_name, 80);

  if (displayName) {
    db.prepare('UPDATE users SET display_name = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(displayName, req.session.userId);
    req.session.displayName = displayName;
  }

  db.prepare(`
    INSERT INTO profiles (
      user_id, lang, tz, bio, public_link, current_games, profile_mode,
      p_systems, p_style, p_level, p_availability,
      specialties, systems, corporate_open, corporate_regions,
      gm_current_games, gm_exp, gm_currency, gm_rate, gm_platforms, gm_safety,
      is_public, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, datetime('now')
    )
    ON CONFLICT(user_id) DO UPDATE SET
      lang = excluded.lang,
      tz = excluded.tz,
      bio = excluded.bio,
      public_link = excluded.public_link,
      current_games = excluded.current_games,
      profile_mode = excluded.profile_mode,
      p_systems = excluded.p_systems,
      p_style = excluded.p_style,
      p_level = excluded.p_level,
      p_availability = excluded.p_availability,
      specialties = excluded.specialties,
      systems = excluded.systems,
      corporate_open = excluded.corporate_open,
      corporate_regions = excluded.corporate_regions,
      gm_current_games = excluded.gm_current_games,
      gm_exp = excluded.gm_exp,
      gm_currency = excluded.gm_currency,
      gm_rate = excluded.gm_rate,
      gm_platforms = excluded.gm_platforms,
      gm_safety = excluded.gm_safety,
      is_public = excluded.is_public,
      updated_at = datetime('now')
  `).run(
    req.session.userId,
    sanitizeText(b.lang || 'FR', 8),
    sanitizeText(b.tz || 'America/Montreal', 60),
    sanitizeText(b.bio || '', 4000),
    sanitizeText(b.publicLink || b.public_link || '', 300),
    sanitizeText(b.currentGames || b.current_games || '', 2000),
    sanitizeText(b.mode || b.profile_mode || 'player', 20),
    sanitizeText(b.pSystems || '', 300),
    sanitizeText(b.pStyle || 'Équilibré', 80),
    sanitizeText(b.pLevel || 'Débutant', 80),
    sanitizeText(b.pAvailability || '', 2000),
    sanitizeText(b.specialties || '', 300),
    sanitizeText(b.systems || '', 300),
    sanitizeText(b.corporateOpen || 'Non', 10),
    sanitizeText(b.corporateRegions || '', 300),
    sanitizeText(b.gmCurrentGames || '', 2000),
    sanitizeText(b.gmExp || '', 300),
    sanitizeText(b.gmCurrency || 'CAD', 8),
    sanitizeText(b.gmRate || '', 40),
    sanitizeText(b.gmPlatforms || '', 300),
    sanitizeText(b.gmSafety || '', 2000),
    b.isPublic === false || b.is_public === 0 ? 0 : 1
  );

  const user = db.prepare('SELECT id, display_name, email, role FROM users WHERE id = ?').get(req.session.userId);
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.session.userId);
  res.json({ profile: mapProfile(profile, user) });
});

router.get('/:userId', (req, res) => {
  const user = db.prepare('SELECT id, display_name, role FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ errorCode: 'profile_not_found' });

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
  if (!profile || !profile.is_public) {
    return res.status(404).json({ errorCode: 'profile_private' });
  }

  res.json({ profile: mapProfile(profile, user) });
});

module.exports = router;
