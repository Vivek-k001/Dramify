const fs = require('fs');
const path = require('path');

// Title overrides to exact Wikipedia articles if different from title
const TITLE_WIKI_MAP = {
  'Parasite': 'Parasite (2019 film)',
  'Oldboy': 'Oldboy (2003 film)',
  'The Handmaiden': 'The Handmaiden',
  'Memories of Murder': 'Memories of Murder',
  'Train to Busan': 'Train to Busan',
  'Decision to Leave': 'Decision to Leave',
  'I Saw the Devil': 'I Saw the Devil',
  'The Chaser': 'The Chaser (2008 film)',
  'The Man from Nowhere': 'The Man from Nowhere (film)',
  'The Outlaws': 'The Outlaws (2017 film)',
  'Extreme Job': 'Extreme Job',
  'Along with the Gods: The Two Worlds': 'Along with the Gods: The Two Worlds',
  'A Taxi Driver': 'A Taxi Driver',
  'The Wailing': 'The Wailing (film)',
  'Mother': 'Mother (2009 film)',
  'Silenced': 'Silenced (film)',
  'Miracle in Cell No. 7': 'Miracle in Cell No. 7',
  'A Bittersweet Life': 'A Bittersweet Life',
  'Joint Security Area': 'Joint Security Area (film)',
  'Lady Vengeance': 'Lady Vengeance',
  'The Host': 'The Host (2006 film)',
  'The Gangster, the Cop, the Devil': 'The Gangster, the Cop, the Devil',
  'Midnight Runners': 'Midnight Runners',
  'Exhuma': 'Exhuma',
  '12.12: The Day': '12.12: The Day',
  'Space Sweepers': 'Space Sweepers',
  'The Call': 'The Call (2020 film)',
  'Believer': 'Believer (2018 South Korean film)',
  'Veteran': 'Veteran (film)',
  'The Age of Shadows': 'The Age of Shadows',
  'New World': 'New World (2013 film)',
  'The Villainess': 'The Villainess',
  'Confidential Assignment': 'Confidential Assignment',
  'Crash Landing on You': 'Crash Landing on You',
  'Squid Game': 'Squid Game',
  'The Glory': 'The Glory (TV series)',
  'Itaewon Class': 'Itaewon Class',
  'Moving': 'Moving (South Korean TV series)',
  'Descendants of the Sun': 'Descendants of the Sun',
  'Vincenzo': 'Vincenzo (TV series)',
  'Hospital Playlist': 'Hospital Playlist',
  'Reply 1988': 'Reply 1988',
  'My Mister': 'My Mister',
  'Weak Hero Class 1': 'Weak Hero',
  'Signal': 'Signal (South Korean TV series)',
  'Extraordinary Attorney Woo': 'Extraordinary Attorney Woo',
  'All of Us Are Dead': 'All of Us Are Dead',
  'Twenty Five Twenty One': 'Twenty-Five Twenty-One',
  'Weightlifting Fairy Kim Bok-joo': 'Weightlifting Fairy Kim Bok-joo',
  'Business Proposal': 'Business Proposal',
  'Alchemy of Souls': 'Alchemy of Souls',
  'Queen of Tears': 'Queen of Tears',
  'Marry My Husband': 'Marry My Husband',
  'Sweet Home': 'Sweet Home (TV series)',
  'Hotel Del Luna': 'Hotel Del Luna',
  'While You Were Sleeping': 'While You Were Sleeping (2017 TV series)',
  'Strong Girl Bong-soon': 'Strong Girl Bong-soon',
  'Hometown Cha-Cha-Cha': 'Hometown Cha-Cha-Cha',
  'Uncontrollably Fond': 'Uncontrollably Fond',
  'Moon Lovers: Scarlet Heart Ryeo': 'Moon Lovers: Scarlet Heart Ryeo',
  'Strangers from Hell': 'Hell Is Other People (TV series)',
  'Kingdom': 'Kingdom (South Korean TV series)',
  'W': 'W (TV series)',
  'Healer': 'Healer (TV series)',
  'Chicago Typewriter': 'Chicago Typewriter (TV series)',
  'It\'s Okay to Not Be Okay': 'It\'s Okay to Not Be Okay',
  'Fight for My Way': 'Fight for My Way',
  'Taxi Driver': 'Taxi Driver (South Korean TV series)',
  'Beyond Evil': 'Beyond Evil (TV series)',
  'Prison Playbook': 'Prison Playbook',
  'Flower of Evil': 'Flower of Evil (South Korean TV series)',
  'Mr. Sunshine': 'Mr. Sunshine (2018 TV series)',
  'D.P.': 'D.P. (TV series)',
  'Mouse': 'Mouse (TV series)',
  'The Penthouse: War in Life': 'The Penthouse: War in Life',
  'Tomorrow': 'Tomorrow (TV series)',
  'Little Women': 'Little Women (2022 TV series)',
  'Juvenile Justice': 'Juvenile Justice (TV series)',
  'Through the Darkness': 'Through the Darkness (TV series)',
  'Death\'s Game': 'Death\'s Game',
  'Bloodhounds': 'Bloodhounds (South Korean TV series)',
  'A Shop for Killers': 'A Shop for Killers',
  'Lovely Runner': 'Lovely Runner',
  'Love in the Moonlight': 'Love in the Moonlight',
  'Good Manager (Chief Kim)': 'Good Manager',
  'Sell Your Haunted House': 'Sell Your Haunted House',
  'Police University': 'Police University (TV series)',
  'Once Again': 'Once Again (South Korean TV series)',
  'Homemade Love Story': 'Homemade Love Story',
  'Sweet Stranger and Me': 'Sweet Stranger and Me',
  'Dali and the Cocky Prince': 'Dali & Cocky Prince',
  'Red Shoes': 'Red Shoes (TV series)',
  'Revolutionary Sisters': 'Revolutionary Sisters',
  'Love Twist': 'Love Twist',
  'Moonshine': 'Moonshine (South Korean TV series)',
  'Go Back Couple': 'Go Back (TV series)',
  'The King of Tears, Lee Bang-won': 'The King of Tears, Lee Bang-won',
  'Young Lady and Gentleman': 'Young Lady and Gentleman',
  'The Veil': 'The Veil (South Korean TV series)',
  'Ghost Doctor': 'Ghost Doctor',
  'Our Beloved Summer': 'Our Beloved Summer',
  'Snowdrop': 'Snowdrop (South Korean TV series)',
  'Bulgasal: Immortal Souls': 'Bulgasal: Immortal Souls',
  'Bad and Crazy': 'Bad and Crazy',
  'One Ordinary Day': 'One Ordinary Day',
  'Happiness': 'Happiness (South Korean TV series)',
  'The Red Sleeve': 'The Red Sleeve',
  'Now, We Are Breaking Up': 'Now, We Are Breaking Up',
  'Jirisan': 'Jirisan (TV series)',
  'My Name': 'My Name (TV series)',
  'Yumi\'s Cells': 'Yumi\'s Cells (TV series)',
  'Lovers of the Red Sky': 'Lovers of the Red Sky',
  'Police University': 'Police University (TV series)',
  'The Devil Judge': 'The Devil Judge',
  'Voice 4': 'Voice (TV series)',
  'Doom at Your Service': 'Doom at Your Service',
  'Mine': 'Mine (TV series)',
  'Youth of May': 'Youth of May',
  'Law School': 'Law School (TV series)',
  'Navillera': 'Navillera (TV series)',
  'Joseon Exorcist': 'Joseon Exorcist',
  'Sisyphus: The Myth': 'Sisyphus: The Myth',
  'Times': 'Times (TV series)',
  'L.U.C.A.: The Beginning': 'L.U.C.A.: The Beginning',
  'She Would Never Know': 'She Would Never Know',
  'Royal Secret Agent': 'Royal Secret Agent',
  'Run On': 'Run On (TV series)',
  'Mr. Queen': 'Mr. Queen',
  'True Beauty': 'True Beauty (South Korean TV series)',
  'Hush': 'Hush (South Korean TV series)',
  'The Uncanny Counter': 'The Uncanny Counter',
  'Awaken': 'Awaken (TV series)',
  'Live On': 'Live On (TV series)',
  'The Goddess of Revenge': 'The Goddess of Revenge',
  'Birthcare Center': 'Birthcare Center',
  'Kairos': 'Kairos (TV series)',
  'Search': 'Search (TV series)',
  'Start-Up': 'Start-Up (South Korean TV series)',
  'Do Do Sol Sol La La Sol': 'Do Do Sol Sol La La Sol',
  'Private Lives': 'Private Lives (TV series)',
  'Tale of the Nine Tailed': 'Tale of the Nine Tailed',
  '18 Again': '18 Again',
  'Zombie Detective': 'Zombie Detective',
  'More Than Friends': 'More Than Friends',
  'Record of Youth': 'Record of Youth',
  'Lies of Lies': 'Lies of Lies',
  'Missing: The Other Side': 'Missing: The Other Side',
  'Alice': 'Alice (South Korean TV series)',
  'Do You Like Brahms?': 'Do You Like Brahms?',
  'Secret Forest 2': 'Stranger (TV series)',
  'Lonely Enough to Love': 'Lonely Enough to Love',
  'SF8': 'SF8 (TV series)',
  'Graceful Friends': 'Graceful Friends',
  'Men Are Men': 'Men Are Men',
  'The Good Detective': 'The Good Detective',
  'Into the Ring': 'Into the Ring (TV series)',
  'Memorials': 'Into the Ring (TV series)',
  'It\'s Okay to Not Be Okay': 'It\'s Okay to Not Be Okay',
  'Backstreet Rookie': 'Backstreet Rookie',
  'My Unfamiliar Family': 'My Unfamiliar Family',
  'Sweet Munchies': 'Sweet Munchies',
  'Team Bulldog: Off-duty Investigation': 'Team Bulldog: Off-duty Investigation',
  'Kingmaker: The Change of Destiny': 'Kingmaker: The Change of Destiny',
  'Old School Intern': 'Kkondae Intern',
  'Mystic Pop-up Bar': 'Mystic Pop-up Bar',
  'Fix You': 'Soul Mechanic',
  'Good Casting': 'Good Casting',
  'When My Love Blooms': 'When My Love Blooms',
  'Born Again': 'Born Again (TV series)',
  'The King: Eternal Monarch': 'The King: Eternal Monarch',
  'Meow, the Secret Boy': 'Welcome (TV series)',
  'Find Me in Your Memory': 'Find Me in Your Memory',
  'A Piece of Your Mind': 'A Piece of Your Mind',
  '365: Repeat the Year': '365: Repeat the Year',
  'Nobody Knows': 'Nobody Knows (TV series)',
  'Memorist': 'Memorist',
  'Hospital Playlist': 'Hospital Playlist',
  'Kingdom 2': 'Kingdom (South Korean TV series)',
  'Hyena': 'Hyena (South Korean TV series)',
  'Tell Me What You Saw': 'Tell Me What You Saw',
  'The Cursed': 'The Cursed (TV series)',
  'My Holo Love': 'My Holo Love',
  'The Game: Towards Zero': 'The Game: Towards Zero',
  'Money Game': 'Money Game (TV series)',
  'Touch': 'Touch (South Korean TV series)',
  'Dr. Romantic 2': 'Dr. Romantic',
};

async function fetchWikiPosters(wikiTitles) {
  const map = {};
  const chunks = [];
  for (let i = 0; i < wikiTitles.length; i += 20) {
    chunks.push(wikiTitles.slice(i, i + 20));
  }

  for (const chunk of chunks) {
    try {
      const url = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(chunk.join('|')) + '&prop=pageimages&format=json&pilicense=any&pithumbsize=600';
      const res = await fetch(url, { headers: { 'User-Agent': 'DramifyPlatform/2.0 (team@dramify.dev)' } });
      const data = await res.json();
      if (data.query?.pages) {
        for (const pid in data.query.pages) {
          const page = data.query.pages[pid];
          if (page.thumbnail?.source) {
            map[page.title.toLowerCase()] = page.thumbnail.source;
          }
        }
      }
      // Brief polite delay
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error('Batch error:', e.message);
    }
  }
  return map;
}

async function fetchStarPortraits(starNames) {
  const map = {};
  const chunks = [];
  for (let i = 0; i < starNames.length; i += 20) {
    chunks.push(starNames.slice(i, i + 20));
  }

  for (const chunk of chunks) {
    try {
      const url = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(chunk.join('|')) + '&prop=pageimages&format=json&pilicense=any&pithumbsize=400';
      const res = await fetch(url, { headers: { 'User-Agent': 'DramifyPlatform/2.0 (team@dramify.dev)' } });
      const data = await res.json();
      if (data.query?.pages) {
        for (const pid in data.query.pages) {
          const page = data.query.pages[pid];
          if (page.thumbnail?.source) {
            map[page.title.toLowerCase()] = page.thumbnail.source;
          }
        }
      }
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error('Star batch error:', e.message);
    }
  }
  return map;
}

async function run() {
  console.log('Reading userWatchedList.ts...');
  const filePath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
  let raw = fs.readFileSync(filePath, 'utf8');

  // Collect unique titles and star names
  const allWikiTitles = Object.values(TITLE_WIKI_MAP);
  console.log('Fetching verified posters for', allWikiTitles.length, 'titles...');
  const posterMap = await fetchWikiPosters(allWikiTitles);
  console.log('Got', Object.keys(posterMap).length, 'verified posters.');

  // Collect all actor names from file
  const starMatches = raw.match(/name:\s*'([^']+)'/g) || [];
  const uniqueStars = [...new Set(starMatches.map(s => s.replace(/name:\s*'/, '').replace(/'$/, '')))];
  console.log('Fetching verified portraits for', uniqueStars.length, 'stars...');
  const starMap = await fetchStarPortraits(uniqueStars);
  console.log('Got', Object.keys(starMap).length, 'verified star portraits.');

  // Now replace in file
  // 1. Replace poster_path for known mapped titles
  for (const [title, wikiName] of Object.entries(TITLE_WIKI_MAP)) {
    const verifiedUrl = posterMap[wikiName.toLowerCase()];
    if (verifiedUrl) {
      // Find block for title and update poster_path
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titlePattern = new RegExp(`(title:\\s*'${escapedTitle}',[\\s\\S]*?poster_path:\\s*)'[^']*'`, 'g');
      raw = raw.replace(titlePattern, `$1'${verifiedUrl}'`);
    }
  }

  // 2. Clear remaining hallucinated fake hashes (e.g. d9V0nE9v4kO7D5M0h0sF3b9g2c1.jpg)
  // so CinematicPoster cleanly renders the title card rather than attempting broken 404s
  raw = raw.replace(/poster_path:\s*'https:\/\/image\.tmdb\.org\/t\/p\/w780\/[a-zA-Z0-9]{20,}\.jpg'/g, "poster_path: ''");
  raw = raw.replace(/backdrop_path:\s*'https:\/\/image\.tmdb\.org\/t\/p\/w1280\/[a-zA-Z0-9]{20,}\.jpg'/g, "backdrop_path: ''");

  // 3. Populate actor profile_path
  for (const [star, imgUrl] of Object.entries(starMap)) {
    const escapedStar = star.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match { id: X, name: 'Star Name', character: 'Character' }
    const castPattern = new RegExp(`(\\{\\s*id:\\s*\\d+,\\s*name:\\s*'${escapedStar}',\\s*character:\\s*'[^']+')(\\s*\\})`, 'gi');
    raw = raw.replace(castPattern, `$1, profile_path: '${imgUrl}'$2`);
  }

  fs.writeFileSync(filePath, raw, 'utf8');
  console.log('✅ Successfully enriched userWatchedList.ts with authentic artwork!');
}

run();
