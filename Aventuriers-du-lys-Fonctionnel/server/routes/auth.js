const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sanitizeText, isValidEmail } = require('../middleware/helpers');

const router = express.Router();

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    role: row.role
  };
}

router.get('/me', (req, res) => {
  if (!req.session?.userId) return res.json({ user: null });
  const user = db.prepare('SELECT id, email, display_name, role FROM users WHERE id = ?').get(req.session.userId);
  res.json({ user: publicUser(user) });
});

router.post('/register', (req, res) => {
  const email = sanitizeText(req.body.email, 120).toLowerCase();
  const password = String(req.body.password || '');
  const displayName = sanitizeText(req.body.display_name || req.body.displayName, 80);
  const role = ['player', 'gm', 'both'].includes(req.body.role) ? req.body.role : 'player';

  if (!isValidEmail(email)) return res.status(400).json({ errorCode: 'invalid_email' });
  if (password.length < 8) return res.status(400).json({ errorCode: 'password_short' });
  if (!displayName) return res.status(400).json({ errorCode: 'name_required' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ errorCode: 'email_taken' });

  const id = uuid();
  const password_hash = bcrypt.hashSync(password, 10);

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, password_hash, displayName, role);

    db.prepare(`
      INSERT INTO profiles (user_id, profile_mode)
      VALUES (?, ?)
    `).run(id, role === 'gm' ? 'gm' : 'player');
  });

  try {
    tx();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errorCode: 'register_failed' });
  }

  req.session.userId = id;
  req.session.role = role;
  req.session.displayName = displayName;

  res.status(201).json({
    user: { id, email, display_name: displayName, role }
  });
});

router.post('/login', (req, res) => {
  const email = sanitizeText(req.body.email, 120).toLowerCase();
  const password = String(req.body.password || '');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ errorCode: 'login_failed' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.displayName = user.display_name;

  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.patch('/me', requireAuth, (req, res) => {
  const displayName = sanitizeText(req.body.display_name || req.body.displayName, 80);
  const role = ['player', 'gm', 'both'].includes(req.body.role) ? req.body.role : null;

  if (!displayName) return res.status(400).json({ errorCode: 'name_required' });

  db.prepare(`
    UPDATE users SET display_name = ?, role = COALESCE(?, role), updated_at = datetime('now')
    WHERE id = ?
  `).run(displayName, role, req.session.userId);

  req.session.displayName = displayName;
  if (role) req.session.role = role;

  const user = db.prepare('SELECT id, email, display_name, role FROM users WHERE id = ?').get(req.session.userId);
  res.json({ user: publicUser(user) });
});

module.exports = router;
