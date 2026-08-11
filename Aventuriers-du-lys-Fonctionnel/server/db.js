const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('player','gm','both','admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      lang TEXT DEFAULT 'FR',
      tz TEXT DEFAULT 'America/Montreal',
      bio TEXT DEFAULT '',
      public_link TEXT DEFAULT '',
      current_games TEXT DEFAULT '',
      profile_mode TEXT DEFAULT 'player',
      p_systems TEXT DEFAULT '',
      p_style TEXT DEFAULT 'Équilibré',
      p_level TEXT DEFAULT 'Débutant',
      p_availability TEXT DEFAULT '',
      specialties TEXT DEFAULT '',
      systems TEXT DEFAULT '',
      corporate_open TEXT DEFAULT 'Non',
      corporate_regions TEXT DEFAULT '',
      gm_current_games TEXT DEFAULT '',
      gm_exp TEXT DEFAULT '',
      gm_currency TEXT DEFAULT 'CAD',
      gm_rate TEXT DEFAULT '',
      gm_platforms TEXT DEFAULT '',
      gm_safety TEXT DEFAULT '',
      is_public INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      title_fr TEXT NOT NULL,
      title_en TEXT NOT NULL DEFAULT '',
      system TEXT NOT NULL,
      format TEXT NOT NULL CHECK(format IN ('ONE_SHOT','CAMPAIGN')),
      lang TEXT NOT NULL DEFAULT 'FR',
      price_per_player REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'CAD',
      when_fr TEXT DEFAULT '',
      when_en TEXT DEFAULT '',
      start_date TEXT DEFAULT '',
      start_time TEXT DEFAULT '',
      frequency TEXT DEFAULT 'one-shot',
      tz TEXT DEFAULT 'America/Montreal',
      duration TEXT DEFAULT '',
      min_players INTEGER NOT NULL DEFAULT 3,
      max_players INTEGER NOT NULL DEFAULT 5,
      booked INTEGER NOT NULL DEFAULT 0,
      is_open INTEGER NOT NULL DEFAULT 1,
      platforms TEXT NOT NULL DEFAULT '[]',
      tags TEXT NOT NULL DEFAULT '[]',
      dm_label TEXT DEFAULT '',
      desc_fr TEXT DEFAULT '',
      desc_en TEXT DEFAULT '',
      expect_fr TEXT DEFAULT '',
      expect_en TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft','published','archived')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(game_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      gm TEXT NOT NULL DEFAULT '',
      system TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'one-shot',
      lang TEXT NOT NULL DEFAULT 'FR',
      tz TEXT DEFAULT 'America/Montreal',
      start_date TEXT DEFAULT '',
      time TEXT DEFAULT '',
      frequency TEXT DEFAULT 'one-shot',
      price REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'CAD',
      seats TEXT DEFAULT '',
      min_players INTEGER DEFAULT 3,
      max_players INTEGER DEFAULT 5,
      booked INTEGER DEFAULT 0,
      platform TEXT DEFAULT '',
      vibe TEXT NOT NULL DEFAULT '[]',
      desc TEXT DEFAULT '',
      contact_email TEXT DEFAULT '',
      is_open INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gn_events (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      place TEXT DEFAULT '',
      event_date TEXT DEFAULT '',
      participants TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('pending','published','archived')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      handled INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    CREATE INDEX IF NOT EXISTS idx_listings_system ON listings(system);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
  `);
}

migrate();

module.exports = db;
