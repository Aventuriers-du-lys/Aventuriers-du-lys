require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { seedIfEmpty } = require('./seed');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const listingsRoutes = require('./routes/listings');
const profilesRoutes = require('./routes/profiles');
const eventsRoutes = require('./routes/events');
const contactRoutes = require('./routes/contact');

seedIfEmpty();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
      "connect-src": ["'self'"],
      "font-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(cookieParser());

app.use(session({
  name: 'adl.sid',
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd && process.env.FORCE_SECURE_COOKIE === '1',
    maxAge: 1000 * 60 * 60 * 24 * 14
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errorCode: 'rate_limited' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errorCode: 'rate_limited' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aventuriers-du-lys' });
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/contact', contactRoutes);

const publicDir = path.join(__dirname, '..', 'public');

// Annonces was a duplicate of Accueil (same games); keep old URLs working
app.get(['/annonces', '/annonces.html'], (_req, res) => {
  res.redirect(301, '/');
});

// Redirect /page.html → /page (clean URLs)
app.get(/^(?!\/api\/).+\.html$/i, (req, res) => {
  const clean = req.path.replace(/\.html$/i, '');
  const target = clean === '/index' ? '/' : clean;
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  res.redirect(301, target + qs);
});

app.use(express.static(publicDir, {
  extensions: ['html'],
  index: ['index.html'],
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Fallback: /page → public/page.html
app.get(/^\/(?!api\/)(.+)$/, (req, res, next) => {
  if (path.extname(req.path)) return next();
  const candidate = path.join(publicDir, req.path + '.html');
  if (candidate.startsWith(publicDir) && fs.existsSync(candidate)) {
    return res.sendFile(candidate);
  }
  return next();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ errorCode: 'server' });
});

app.listen(PORT, () => {
  console.log(`Aventuriers du Lys prêt sur http://localhost:${PORT}`);
});
