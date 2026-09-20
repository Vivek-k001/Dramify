const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
const rawCode = fs.readFileSync(catalogPath, 'utf8');

const stripped = rawCode
  .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
  .replace(/export\s+const\s+USER_WATCHED_TITLES:\s*MediaItem\[\]\s*=/g, 'const USER_WATCHED_TITLES =')
  .replace(/export\s+default\s+[\s\S]*?;/g, '')
  .replace(/export\s+/g, '');

const fn = new Function(stripped + '\nreturn USER_WATCHED_TITLES;');
const catalog = fn();

const targetIds = [20, 25, 38, 40, 42, 58, 74, 75, 76, 77, 78, 84, 90, 93, 98, 103, 109, 110, 111, 122, 135, 138, 143, 145, 148];

console.log('--- Current entries in userWatchedList.ts ---');
targetIds.forEach(id => {
  const item = catalog.find(c => c.id === id);
  if (item) {
    console.log(`ID ${item.id}: Title: "${item.title}" | Korean: "${item.korean_title}" | Type: ${item.media_type} | Year: ${item.release_year}`);
  } else {
    console.log(`ID ${id}: MISSING!`);
  }
});
