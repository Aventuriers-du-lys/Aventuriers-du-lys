/**
 * Seed intentionally left empty of sample content.
 * The database starts with schema only; users create all games, listings, and events.
 */
function seedIfEmpty() {
  // no demo users, games, listings, or events
}

if (require.main === module) {
  seedIfEmpty();
  console.log('Seed: aucune donnée d\'exemple (base vide).');
}

module.exports = { seedIfEmpty };
