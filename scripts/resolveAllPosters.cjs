const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
const raw = fs.readFileSync(filePath, 'utf8');

// Parse USER_WATCHED_TITLES
const stripped = raw
  .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
  .replace(/export\s+const\s+USER_WATCHED_TITLES:\s*MediaItem\[\]\s*=/g, 'const USER_WATCHED_TITLES =')
  .replace(/export\s+default\s+[\s\S]*?;/g, '')
  .replace(/export\s+/g, '');

const fn = new Function(stripped + '\nreturn USER_WATCHED_TITLES;');
const allMedia = fn();

console.log(`Total media items: ${allMedia.length}`);

const hasThumbnail = allMedia.filter(m => m.poster_path && m.poster_path.trim() !== '');
const missingThumbnail = allMedia.filter(m => !m.poster_path || m.poster_path.trim() === '');

console.log(`Already have thumbnails: ${hasThumbnail.length}`);
console.log(`Missing thumbnails: ${missingThumbnail.length}`);

// Query Wikipedia API with polite User-Agent
async function searchWikiByTitle(query) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=1&srlimit=5`;
    const res = await fetch(url, { headers: { 'User-Agent': 'DramifyPlatform/2.0 (team@dramify.dev)' } });
    const data = await res.json();
    return data.query?.search || [];
  } catch (e) {
    return [];
  }
}

async function getPageImage(title) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pilicense=any&pithumbsize=600`;
    const res = await fetch(url, { headers: { 'User-Agent': 'DramifyPlatform/2.0 (team@dramify.dev)' } });
    const data = await res.json();
    if (data.query?.pages) {
      for (const pid in data.query.pages) {
        if (data.query.pages[pid]?.thumbnail?.source) {
          return {
            pageTitle: data.query.pages[pid].title,
            imageUrl: data.query.pages[pid].thumbnail.source
          };
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function auditAndResolve() {
  const auditReport = [];
  const resolvedMap = {};

  for (let i = 0; i < missingThumbnail.length; i++) {
    const item = missingThumbnail[i];
    const displayTitle = item.title || item.name;
    const koreanTitle = item.korean_title || item.original_title || '';
    const cleanTitle = displayTitle.replace(/\s*\([^)]*\)/g, '').trim();
    const mediaTypeLabel = item.media_type === 'tv' ? 'K-Drama' : 'K-Movie';

    let match = null;
    let strategy = '';

    // 1. Try search with Korean title
    if (koreanTitle) {
      const searchResults = await searchWikiByTitle(koreanTitle);
      for (const res of searchResults) {
        const img = await getPageImage(res.title);
        if (img) {
          match = img;
          strategy = `Korean title match: "${koreanTitle}" -> "${res.title}"`;
          break;
        }
        await new Promise(r => setTimeout(r, 100));
      }
    }

    // 2. Try search with English Title + Year / TV series / film
    if (!match) {
      const queries = [
        `${cleanTitle} (${item.media_type === 'tv' ? 'TV series' : 'film'})`,
        `${cleanTitle} (${item.release_year || ''} ${item.media_type === 'tv' ? 'TV series' : 'film'})`,
        `${cleanTitle} (South Korean ${item.media_type === 'tv' ? 'TV series' : 'film'})`,
        cleanTitle
      ];

      for (const q of queries) {
        const searchResults = await searchWikiByTitle(q);
        for (const res of searchResults) {
          // Check title relevance to avoid wrong non-Korean shows
          const tLower = res.title.toLowerCase();
          const cleanLower = cleanTitle.toLowerCase();
          if (tLower.includes(cleanLower) || cleanLower.includes(tLower.split(' (')[0])) {
            const img = await getPageImage(res.title);
            if (img) {
              match = img;
              strategy = `English title query: "${q}" -> "${res.title}"`;
              break;
            }
          }
          await new Promise(r => setTimeout(r, 100));
        }
        if (match) break;
      }
    }

    // Categorize reasons
    let category = 'Unmapped Title';
    const isSeason = /\b(season|\d+|part\s*\d+|ii|iii|iv)\b/i.test(displayTitle) || /[\d]/.test(koreanTitle);
    const hasAltName = displayTitle.includes('(') || (match && match.pageTitle.toLowerCase() !== displayTitle.toLowerCase());

    if (isSeason) {
      category = 'Season / Sequel / Numbered Franchise';
    } else if (hasAltName) {
      category = 'Alternate Title / Subtitle Difference';
    } else if (item.release_year >= 2024) {
      category = 'Recent 2024-2025 Release';
    }

    if (match) {
      resolvedMap[item.id] = {
        id: item.id,
        title: displayTitle,
        imageUrl: match.imageUrl,
        wikiPage: match.pageTitle
      };
    }

    auditReport.push({
      id: item.id,
      title: displayTitle,
      koreanTitle,
      type: mediaTypeLabel,
      year: item.release_year || (item.release_date || '').slice(0, 4),
      category,
      strategy: match ? strategy : 'No Wikipedia page found with poster',
      foundPoster: !!match,
      posterUrl: match?.imageUrl || null,
      matchedWikiPage: match?.pageTitle || null
    });

    console.log(`[${i + 1}/${missingThumbnail.length}] [${mediaTypeLabel}] "${displayTitle}" (${koreanTitle}) -> Found: ${!!match} (${match?.pageTitle || 'None'})`);
    await new Promise(r => setTimeout(r, 150));
  }

  // Save audit report to JSON
  fs.writeFileSync(
    path.join(__dirname, 'posterAuditReport.json'),
    JSON.stringify(auditReport, null, 2),
    'utf8'
  );

  console.log(`\nAudit finished! Found artwork for ${Object.keys(resolvedMap).length} out of ${missingThumbnail.length} missing items.`);
}

auditAndResolve();
