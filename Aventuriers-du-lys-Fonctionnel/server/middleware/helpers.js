function parseJsonField(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mapGame(row, { bookedByMe = false } = {}) {
  if (!row) return null;
  return {
    id: row.id,
    owner_id: row.owner_id,
    title_fr: row.title_fr,
    title_en: row.title_en || row.title_fr,
    system: row.system,
    format: row.format,
    lang: row.lang,
    price_per_player: row.price_per_player,
    currency: row.currency,
    when_fr: row.when_fr,
    when_en: row.when_en || row.when_fr,
    start_date: row.start_date,
    start_time: row.start_time,
    frequency: row.frequency,
    tz: row.tz,
    duration: row.duration,
    min_players: row.min_players,
    max_players: row.max_players,
    booked: row.booked,
    is_open: !!row.is_open,
    platforms: parseJsonField(row.platforms),
    tags: parseJsonField(row.tags),
    dm: row.dm_label || row.display_name || 'MJ',
    desc_fr: row.desc_fr,
    desc_en: row.desc_en || row.desc_fr,
    expect_fr: row.expect_fr,
    expect_en: row.expect_en || row.expect_fr,
    status: row.status,
    booked_by_me: bookedByMe
  };
}

function mapListing(row) {
  if (!row) return null;
  return {
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    gm: row.gm,
    system: row.system,
    type: row.type,
    lang: row.lang,
    tz: row.tz,
    startDate: row.start_date,
    time: row.time,
    frequency: row.frequency,
    price: row.price,
    currency: row.currency,
    seats: row.seats || `${row.booked || 0}/${row.max_players || 5}`,
    min_players: row.min_players,
    max_players: row.max_players,
    booked: row.booked,
    platform: row.platform,
    vibe: parseJsonField(row.vibe),
    desc: row.desc,
    is_open: !!row.is_open,
    contact_email: row.contact_email || null
  };
}

function sanitizeText(value, max = 2000) {
  if (value == null) return '';
  return String(value).trim().slice(0, max);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

module.exports = {
  parseJsonField,
  mapGame,
  mapListing,
  sanitizeText,
  isValidEmail
};
