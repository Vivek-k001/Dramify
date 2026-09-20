const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '../client/src/data/userWatchedList.ts'), 'utf8');

const stripped = raw
  .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
  .replace(/export\s+const\s+USER_WATCHED_TITLES:\s*MediaItem\[\]\s*=/g, 'const USER_WATCHED_TITLES =')
  .replace(/export\s+default\s+[\s\S]*?;/g, '')
  .replace(/export\s+/g, '');

const fn = new Function(stripped + '\nreturn USER_WATCHED_TITLES;');
const list = fn();

console.log('Total items in list:', list.length);
const dramas = list.filter(i => i.media_type === 'tv');
const movies = list.filter(i => i.media_type === 'movie');
console.log('K-Dramas count:', dramas.length);
console.log('K-Movies count:', movies.length);

console.log('--- Checking titles 6 to 25 ---');
for (let id = 6; id <= 25; id++) {
  const item = list.find(i => i.id === id);
  if (item) {
    const poster = item.poster_path ? decodeURIComponent(item.poster_path.split('/').pop().split('?')[0]) : 'EMPTY (FALLBACK CARD)';
    console.log(`ID ${item.id}: "${item.title}" (${item.korean_title}) -> Poster: ${poster}`);
  }
}

console.log('\n--- Checking titles 100 to 140 ---');
for (let id = 100; id <= 125; id++) {
  const item = list.find(i => i.id === id);
  if (item) {
    const poster = item.poster_path ? decodeURIComponent(item.poster_path.split('/').pop().split('?')[0]) : 'EMPTY (FALLBACK CARD)';
    console.log(`ID ${item.id}: "${item.title}" (${item.korean_title}) -> Poster: ${poster}`);
  }
}
