const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
const raw = fs.readFileSync(filePath, 'utf8');

// Strip all exports and imports and type annotations
const stripped = raw
  .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
  .replace(/export\s+const\s+USER_WATCHED_TITLES:\s*MediaItem\[\]\s*=/g, 'const USER_WATCHED_TITLES =')
  .replace(/export\s+default\s+[\s\S]*?;/g, '')
  .replace(/export\s+/g, '');

const fn = new Function(stripped + '\nreturn USER_WATCHED_TITLES;');
const list = fn();

console.log('Total items in userWatchedList:', list.length);

const missing = list.filter(item => !item.poster_path || item.poster_path.trim() === '');
console.log('Total missing poster_path:', missing.length);

console.log('\n=== DETAILED BREAKDOWN OF MISSING TITLES ===');
missing.forEach((item, idx) => {
  const displayTitle = item.title || item.name;
  const orig = item.original_title || item.original_name || '';
  const date = item.release_date || item.first_air_date || 'N/A';
  console.log(`${idx + 1}. [${item.media_type.toUpperCase()}] "${displayTitle}" (${orig}) - Year: ${date.slice(0, 4)} (ID: ${item.id})`);
});
