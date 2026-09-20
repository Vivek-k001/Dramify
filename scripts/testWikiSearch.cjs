const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
const raw = fs.readFileSync(filePath, 'utf8');

const stripped = raw
  .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
  .replace(/export\s+const\s+USER_WATCHED_TITLES:\s*MediaItem\[\]\s*=/g, 'const USER_WATCHED_TITLES =')
  .replace(/export\s+default\s+[\s\S]*?;/g, '')
  .replace(/export\s+/g, '');

const fn = new Function(stripped + '\nreturn USER_WATCHED_TITLES;');
const list = fn();

const missing = list.filter(item => !item.poster_path || item.poster_path.trim() === '');

console.log('Total items:', list.length);
console.log('Total missing thumbnails:', missing.length);

async function searchWikipedia(query) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=1&srlimit=3`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'DramifyPlatform/2.0 (team@dramify.dev)' } });
    const data = await res.json();
    return data.query?.search || [];
  } catch (e) {
    return [];
  }
}

async function getPageThumbnail(pageTitle) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pilicense=any&pithumbsize=600`;
    const res = await fetch(url, { headers: { 'User-Agent': 'DramifyPlatform/2.0 (team@dramify.dev)' } });
    const data = await res.json();
    if (data.query?.pages) {
      for (const pid in data.query.pages) {
        if (data.query.pages[pid]?.thumbnail?.source) {
          return data.query.pages[pid].thumbnail.source;
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function testSample() {
  console.log('\nTesting top 15 missing titles against Wikipedia search...');
  for (let i = 0; i < Math.min(15, missing.length); i++) {
    const item = missing[i];
    const displayTitle = item.title || item.name;
    // Clean title (remove parentheses)
    const cleanTitle = displayTitle.replace(/\s*\([^)]*\)/g, '').trim();
    const query = `${cleanTitle} ${item.media_type === 'tv' ? 'TV series' : 'film'}`;
    const results = await searchWikipedia(query);
    const topMatch = results[0]?.title || 'No match';
    let thumb = null;
    if (topMatch !== 'No match') {
      thumb = await getPageThumbnail(topMatch);
    }
    console.log(`[${item.media_type.toUpperCase()}] "${displayTitle}" -> Query: "${query}" -> Best Wiki: "${topMatch}" -> Has Thumb: ${!!thumb}`);
    await new Promise(r => setTimeout(r, 200));
  }
}

testSample();
