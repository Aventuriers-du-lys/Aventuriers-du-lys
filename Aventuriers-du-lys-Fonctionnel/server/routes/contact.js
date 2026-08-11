const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { sanitizeText, isValidEmail } = require('../middleware/helpers');

const router = express.Router();

router.post('/corporate', (req, res) => {
  const b = req.body || {};
  const company = sanitizeText(b.Entreprise || b.company, 160);
  const email = sanitizeText(b.Courriel || b.email, 120);

  if (!company) return res.status(400).json({ errorCode: 'company_required' });
  if (email && !isValidEmail(email)) return res.status(400).json({ errorCode: 'invalid_email' });

  const payload = {
    company,
    contact: sanitizeText(b.Responsable || b.contact, 120),
    email,
    phone: sanitizeText(b.Téléphone || b.phone, 40),
    type: sanitizeText(b.Type || b.type, 80),
    format: sanitizeText(b.Format || b.format, 80),
    participants: sanitizeText(b.Participants || b.participants, 40),
    date: sanitizeText(b.Date || b.date, 40),
    budget: sanitizeText(b.Budget || b.budget, 80),
    description: sanitizeText(b.Description || b.description, 4000)
  };

  db.prepare(`
    INSERT INTO contact_requests (id, kind, payload, user_id)
    VALUES (?, 'corporate', ?, ?)
  `).run(uuid(), JSON.stringify(payload), req.session?.userId || null);

  res.status(201).json({
    ok: true,
    messageCode: 'corporate.success'
  });
});

router.post('/publish-request', (req, res) => {
  // Fallback for unauthenticated publish (stores for admin review)
  const b = req.body || {};
  const title = sanitizeText(b.Titre || b.title, 160);
  if (!title) return res.status(400).json({ errorCode: 'title_required' });

  db.prepare(`
    INSERT INTO contact_requests (id, kind, payload, user_id)
    VALUES (?, 'publish', ?, ?)
  `).run(uuid(), JSON.stringify(b), req.session?.userId || null);

  res.status(201).json({
    ok: true,
    messageCode: 'publier.success'
  });
});

module.exports = router;
