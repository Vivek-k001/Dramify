const fs = require('fs');
const comp = JSON.parse(fs.readFileSync('scripts/libraryComparison.json', 'utf8'));

const differences = [];
const missingFromCatalog = [];

for (const item of comp) {
  if (!item.catalogItem) {
    missingFromCatalog.push(item);
    continue;
  }
  const uTitle = item.userTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cTitle = item.catalogItem.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (uTitle !== cTitle) {
    differences.push({
      num: item.num,
      userTitle: item.userTitle,
      catalogTitle: item.catalogItem.title,
      koreanTitle: item.catalogItem.korean_title,
      year: item.catalogItem.year,
      type: item.userType,
      mediaType: item.catalogItem.media_type
    });
  }
}

console.log('=== 1. NEW ITEMS NOT IN PREVIOUS 147-TITLE CATALOG ===');
missingFromCatalog.forEach(m => {
  console.log(`Item #${m.num}: "${m.userTitle}" [${m.userType}]`);
});

console.log(`\n=== 2. TITLE NAME DISCREPANCIES (${differences.length} titles) ===`);
differences.forEach(d => {
  console.log(`${d.num}. User input: "${d.userTitle}"`);
  console.log(`   Official title: "${d.catalogTitle}" (Hangul: ${d.koreanTitle}, Year: ${d.year})`);
});
