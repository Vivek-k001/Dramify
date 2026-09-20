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
const items = fn();

console.log(`Loaded ${items.length} items.`);

// 1. Update Are You Human Too? (ID 26)
const item26 = items.find(i => i.id === 26);
if (item26) {
  item26.title = 'Are You Human Too?';
  item26.poster_path = 'https://upload.wikimedia.org/wikipedia/en/9/9b/Are_You_Human%3F.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled';
  console.log('Updated ID 26 (Are You Human Too?)');
}

// 2. Update Matrimonial Chaos (ID 32)
const item32 = items.find(i => i.id === 32);
if (item32) {
  item32.title = 'Matrimonial Chaos';
  item32.poster_path = 'https://upload.wikimedia.org/wikipedia/en/1/1c/Matrimonial_Chaos.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled';
  console.log('Updated ID 32 (Matrimonial Chaos)');
}

// 3. Update Team Bulldog: Off-Duty Investigation (ID 70)
const item70 = items.find(i => i.id === 70);
if (item70) {
  item70.title = 'Team Bulldog: Off-Duty Investigation';
  item70.poster_path = 'https://upload.wikimedia.org/wikipedia/en/7/79/Team_Bulldog.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled';
  console.log('Updated ID 70 (Team Bulldog)');
}

// 4. Update Shark: The Beginning (ID 91)
const item91 = items.find(i => i.id === 91);
if (item91) {
  item91.title = 'Shark: The Beginning';
  item91.poster_path = 'https://upload.wikimedia.org/wikipedia/en/b/ba/Shark-_The_Storm_poster.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled';
  console.log('Updated ID 91 (Shark: The Beginning)');
}

// 5. Update Iris to Iris II: New Generation (ID 30)
const item30 = items.find(i => i.id === 30);
if (item30) {
  item30.title = 'Iris 2 (Iris II: New Generation)';
  item30.original_title = '아이리스 2';
  item30.korean_title = '아이리스 2';
  item30.release_year = 2013;
  item30.release_date = '2013-02-13';
  item30.overview = 'Three years after the death of Kim Hyun-joon, NSS agents led by Jung Yoo-gun and Ji Soo-yeon investigate the shadowy terrorist organization IRIS.';
  item30.poster_path = 'https://upload.wikimedia.org/wikipedia/en/e/ef/IRIS_II_%28promotional_poster%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled';
  item30.cast = [
    { id: 147, name: 'Jang Hyuk', character: 'Jung Yoo-gun', profile_path: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/K_Drama_IRIS2_Press_24_%28Jang_Hyuk%29_%28cropped%29.jpg/500px-K_Drama_IRIS2_Press_24_%28Jang_Hyuk%29_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail' },
    { id: 148, name: 'Lee Da-hae', character: 'Ji Soo-yeon', profile_path: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Lee_Da-hae_in_2014.jpg/500px-Lee_Da-hae_in_2014.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail' }
  ];
  console.log('Updated ID 30 (Iris 2)');
}

// 6. Update Welcome to Waikiki to Welcome to Waikiki 2 (ID 49)
const item49 = items.find(i => i.id === 49);
if (item49) {
  item49.title = 'Welcome to Waikiki 2';
  item49.original_title = '으라차차 와이키키 2';
  item49.korean_title = '으라차차 와이키키 2';
  item49.release_year = 2019;
  item49.release_date = '2019-03-25';
  item49.overview = 'Lee Joon-ki tries to revive the bankrupt Waikiki guesthouse by pulling his high school classmates Cha Woo-sik and Kook Ki-bong into chaotic cohabitation.';
  item49.poster_path = 'https://upload.wikimedia.org/wikipedia/en/c/c1/Welcome_to_Waikiki_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled';
  item49.cast = [
    { id: 201, name: 'Lee Yi-kyung', character: 'Lee Joon-ki', profile_path: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Lee_Yi-kyung_in_January_2024.jpg/500px-Lee_Yi-kyung_in_January_2024.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail' },
    { id: 202, name: 'Kim Seon-ho', character: 'Cha Woo-sik', profile_path: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Kim_Seon-ho_in_2021.jpg/500px-Kim_Seon-ho_in_2021.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail' }
  ];
  console.log('Updated ID 49 (Welcome to Waikiki 2)');
}

// 7. Update Bloodhounds to Bloodhounds S1 & S2 (ID 131)
const item131 = items.find(i => i.id === 131);
if (item131) {
  item131.title = 'Bloodhounds (Season 1 & 2)';
  item131.poster_path = 'https://upload.wikimedia.org/wikipedia/en/0/02/Bloodhounds_%28South_Korean_TV_series%29_logo.png?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=original';
  item131.overview = 'Two young boxing prodigies risk life and limb alongside an honorable moneylender to demolish a vicious criminal empire of predatory loan sharks across Seasons 1 and 2.';
  console.log('Updated ID 131 (Bloodhounds S1 & S2)');
}

// 8. Replace duplicate #75 with Unstoppable (2018) starring Ma Dong-seok!
const item75 = items.find(i => i.id === 75);
if (item75) {
  item75.tmdb_id = 538362;
  item75.title = 'Unstoppable';
  item75.original_title = '성난황소';
  item75.korean_title = '성난황소';
  item75.overview = 'A reformed legendary gangster living as a quiet fish distributor must unleash his monstrous brute strength after a ruthless human trafficking syndicate kidnaps his wife.';
  item75.poster_path = 'https://upload.wikimedia.org/wikipedia/en/1/1c/Unstoppable_%282018_film%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled';
  item75.media_type = 'movie';
  item75.release_date = '2018-11-22';
  item75.release_year = 2018;
  item75.vote_average = 7.7;
  item75.vote_count = 580;
  item75.dramify_community_rating = 9.3;
  item75.dramify_ratings_count = 1850;
  item75.genres = ['Action', 'Crime', 'Thriller'];
  item75.status = 'Released';
  item75.runtime = 115;
  item75.director = 'Kim Min-ho';
  item75.cast = [
    { id: 250, name: 'Ma Dong-seok', character: 'Kang Dong-chul', profile_path: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Don_Lee_by_Gage_Skidmore.jpg/500px-Don_Lee_by_Gage_Skidmore.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail' },
    { id: 251, name: 'Song Ji-hyo', character: 'Ji-soo', profile_path: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Song_Ji-hyo_in_November_2019.jpg/500px-Song_Ji-hyo_in_November_2019.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail' }
  ];
  console.log('Replaced ID 75 duplicate with Unstoppable (성난황소, 2018)');
}

// Serialize back cleanly
const header = `import { MediaItem } from '../types/media';\n\nexport const USER_WATCHED_TITLES: MediaItem[] = [\n`;
const footer = `\n];\n`;

const itemStrings = items.map(item => {
  return '  ' + JSON.stringify(item, null, 2)
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : '  ' + line))
    .join('\n')
    .replace(/"([^"]+)":/g, '$1:');
});

fs.writeFileSync(catalogPath, header + itemStrings.join(',\n') + footer, 'utf8');
console.log('Successfully updated userWatchedList.ts with all user specifications!');
