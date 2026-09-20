const fs = require('fs');
const report = JSON.parse(fs.readFileSync('scripts/posterAuditReport.json', 'utf8'));

const dramas = report.filter(r => r.type === 'K-Drama');
const movies = report.filter(r => r.type === 'K-Movie');

console.log('Total catalog titles missing thumbnails:', report.length);
console.log('K-Dramas missing thumbnails:', dramas.length);
console.log('K-Movies missing thumbnails:', movies.length);

// 1. Season / Sequel / Numbered Franchise titles
const seasons = report.filter(r => 
  /(\b(season|\d+|part\s*\d+|ii|iii|iv)\b)/i.test(r.title) || /[\d]/.test(r.koreanTitle)
);

// 2. Alternate English Titles / Subtitle discrepancies
const altNames = report.filter(r => 
  !seasons.some(s => s.id === r.id) && 
  (r.title.includes('(') || r.title.includes(':') || r.title.includes('’') || r.title.includes('\'') || r.title.includes('!'))
);

// 3. Recent 2024-2025 releases
const recent = report.filter(r => 
  !seasons.some(s => s.id === r.id) && 
  !altNames.some(a => a.id === r.id) && 
  parseInt(r.year) >= 2024
);

// 4. Standard unmapped titles
const standard = report.filter(r => 
  !seasons.some(s => s.id === r.id) && 
  !altNames.some(a => a.id === r.id) && 
  !recent.some(rc => rc.id === r.id)
);

console.log(`\n========================================`);
console.log(`1. SEASON / SEQUEL / NUMBERED FRANCHISE (${seasons.length} titles)`);
console.log(`========================================`);
seasons.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.type}] "${s.title}" (Korean: ${s.koreanTitle}) [${s.year}]`);
  console.log(`   Why missing: Season/sequel number in English/Korean title (e.g. 범죄도시 2/3/4, 20세기 소녀, R2B, 38 사기동대)`);
});

console.log(`\n========================================`);
console.log(`2. ALTERNATE NAMES / SUBTITLE BRACKETS (${altNames.length} titles)`);
console.log(`========================================`);
altNames.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.type}] "${s.title}" (Korean: ${s.koreanTitle}) [${s.year}]`);
  console.log(`   Why missing: Bracketed secondary name or punctuation nuance (e.g. Meow the Secret Boy, Vengeance of Women)`);
});

console.log(`\n========================================`);
console.log(`3. RECENT 2024 - 2025 RELEASES (${recent.length} titles)`);
console.log(`========================================`);
recent.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.type}] "${s.title}" (Korean: ${s.koreanTitle}) [${s.year}]`);
  console.log(`   Why missing: New/upcoming release with late Wikipedia/archive indexing`);
});

console.log(`\n========================================`);
console.log(`4. STANDARD UNMAPPED TITLES (${standard.length} titles)`);
console.log(`========================================`);
standard.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.type}] "${s.title}" (Korean: ${s.koreanTitle}) [${s.year}]`);
});
