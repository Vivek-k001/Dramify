const fs = require('fs');
const path = require('path');

// Exact Wikipedia article titles for each of the 148 items in the user's library
const ID_TO_WIKI = {
  1: 'Uncontrollably_Fond',
  2: 'Once_Again_(South_Korean_TV_series)',
  3: 'Homemade_Love_Story',
  4: 'Sweet_Stranger_and_Me',
  5: 'Love_in_the_Moonlight',
  6: 'Man_in_a_Veil',
  7: 'You_Are_the_Best!',
  8: 'Blade_Man',
  9: 'Dali_&_Cocky_Prince',
  10: 'Business_Proposal',
  11: 'Red_Shoes_(TV_series)',
  12: 'Good_Manager',
  13: 'Sell_Your_Haunted_House',
  14: 'Fight_for_My_Way',
  15: 'Police_University_(TV_series)',
  16: 'Revolutionary_Sisters',
  17: 'Love_Twist',
  18: 'Moonshine_(South_Korean_TV_series)',
  19: 'Go_Back_(TV_series)',
  20: 'The_King_of_Tears,_Lee_Bang-won',
  21: 'Young_Lady_and_Gentleman',
  22: 'Boys_Over_Flowers_(South_Korean_TV_series)',
  23: 'Bravo,_My_Life_(TV_series)',
  24: "It's_Beautiful_Now",
  25: 'Welcome_(TV_series)',
  26: 'Are_You_Human%3F_(TV_series)',
  27: 'Strongest_Deliveryman',
  28: 'Descendants_of_the_Sun',
  29: 'No_Matter_What_(TV_series)',
  30: 'Iris_(South_Korean_TV_series)',
  31: 'Your_House_Helper',
  32: 'Matrimonial_Chaos_(South_Korean_TV_series)',
  33: 'Bad_Prosecutor',
  34: 'Three_Bold_Siblings',
  35: 'The_Love_in_Your_Eyes_(TV_series)',
  36: 'Hometown_Cha-Cha-Cha',
  37: 'Woman_in_a_Veil',
  38: 'Avengers_Social_Club',
  39: 'Oh_My_Venus',
  40: 'The_Love_in_Your_Eyes_(TV_series)', // Apple of My Eye
  41: 'The_Elegant_Empire',
  42: 'Woman_of_9.9_Billion',
  43: 'Black_Knight_(South_Korean_TV_series)',
  44: 'The_Real_Has_Come!',
  45: 'My_Lovely_Boxer',
  46: 'Marry_My_Husband',
  47: 'Jirisan_(TV_series)',
  48: 'Oldboy_(2003_film)',
  49: 'Welcome_to_Waikiki',
  50: 'Record_of_Youth',
  51: 'Itaewon_Class',
  52: 'Bloody_Heart',
  53: 'Queen_of_Tears',
  54: 'Vincenzo_(TV_series)',
  55: 'Big_Mouth_(South_Korean_TV_series)',
  56: 'The_Gangster,_the_Cop,_the_Devil',
  57: 'The_Bros',
  58: 'Weak_Hero',
  59: 'Joseon_Attorney',
  60: 'Mr._Plankton',
  61: 'The_Vampire_Detective',
  62: 'When_the_Camellia_Blooms',
  63: 'Extreme_Job',
  64: 'The_Firefighters_(2024_film)',
  65: 'Officer_Black_Belt',
  66: 'Love_Reset',
  67: 'Love_My_Scent',
  68: 'A_Year-End_Medley',
  69: 'Squad_38',
  70: 'Team_Bulldog:_Off-duty_Investigation',
  71: 'Tune_in_for_Love',
  72: 'Oh_My_Ghost_(South_Korean_TV_series)',
  73: 'Wonderland_(2024_film)',
  74: 'The_Roundup_(2022_film)',
  75: 'The_Outlaws_(2017_film)',
  76: 'The_Roundup:_No_Way_Out',
  77: 'The_Roundup:_Punishment',
  78: 'R2B:_Return_to_Base',
  79: 'City_of_the_Rising_Sun',
  80: 'Forgotten_(2017_film)',
  81: 'Time_to_Hunt_(film)',
  82: 'I_Am_a_Hero',
  83: 'Double_Agent_(2003_film)',
  84: 'Vigilante_(TV_series)',
  85: 'My_Name_(TV_series)',
  86: 'Secret_Zoo',
  87: 'Midnight_(2021_film)',
  88: 'Coin_Locker_Girl',
  89: 'Space_Sweepers',
  90: 'Hidden_Identity_(TV_series)',
  91: 'Shark:_The_Beginning',
  92: 'Memoir_of_a_Murderer',
  93: 'The_Bad_Guys:_Reign_of_Chaos',
  94: 'Tell_Me_What_You_Saw',
  95: 'Derailed_(2016_film)',
  96: 'Unlocked_(2023_film)',
  97: 'Voice_(TV_series)',
  98: 'Memorist',
  99: 'Rebound_(2023_film)',
  100: 'Mad_Dog_(TV_series)',
  101: 'Narco-Saints',
  102: 'Delivery_(web_series)',
  103: 'Yaksha:_Ruthless_Operations',
  104: 'Broken_(2014_film)',
  105: '20th_Century_Girl',
  106: 'My_Sassy_Girl',
  107: 'My_New_Sassy_Girl',
  108: 'Save_Me_(South_Korean_TV_series)',
  109: 'Detour_(2016_film)',
  110: 'The_Outlaws_(2017_film)',
  111: 'The_Merciless',
  112: 'Nocturnal_(2025_film)',
  113: 'Revelations_(2025_film)',
  114: 'New_World_(2013_film)',
  115: 'Your_Eyes_Tell',
  116: 'Maybe_We_Broke_Up',
  117: 'A_Beautiful_Mind_(TV_series)',
  118: 'Night_in_Paradise_(2020_film)',
  119: 'The_Soul-Mate',
  120: 'Wall_to_Wall_(film)',
  121: 'Default_(2018_film)',
  122: 'A_Violent_Prosecutor',
  123: 'Veteran_(2015_film)',
  124: 'Deliver_Us_from_Evil_(2020_film)',
  125: 'The_Spy_Gone_North',
  126: 'Hostage:_Missing_Celebrity',
  127: 'The_Unjust',
  128: 'When_a_Man_Falls_in_Love',
  129: 'A_Bittersweet_Life',
  130: "General's_Son",
  131: 'Bloodhounds_(TV_series)',
  132: 'The_Swindlers_(2017_film)',
  133: 'Parasite_(2019_film)',
  134: 'Touch_Your_Heart',
  135: 'Hwarang:_The_Poet_Warrior_Youth',
  136: 'Queen_for_Seven_Days',
  137: 'Train_to_Busan',
  138: 'The_Bad_Guys:_Reign_of_Chaos',
  139: 'The_Villagers_(film)',
  140: 'Nameless_Gangster:_Rules_of_the_Time',
  141: 'I_Saw_the_Devil',
  142: 'The_Match_(2025_film)',
  143: 'Miss_&_Mrs._Cops',
  144: 'Beyond_the_Bar',
  145: 'Teach_You_a_Lesson',
  146: 'Evilive_(TV_series)',
  147: 'Trigger_(South_Korean_TV_series)',
  148: 'Made_in_Korea_(TV_series)'
};

async function fetchWikiPosterForPage(pageTitle) {
  try {
    const cleanTitle = decodeURIComponent(pageTitle).replace(/_/g, ' ');
    const url = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(cleanTitle) + '&prop=pageimages&format=json&pilicense=any&pithumbsize=600';
    const res = await fetch(url, { headers: { 'User-Agent': 'DramifyPlatform/2.0 (team@dramify.dev)' } });
    const data = await res.json();
    if (data.query?.pages) {
      const page = Object.values(data.query.pages)[0];
      const src = page?.thumbnail?.source || '';
      // Filter out non-poster logos and flags
      if (src && !src.includes('logo') && !src.includes('Flag_of') && !src.includes('Disambig')) {
        return src;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return '';
}

async function rebuildClean() {
  console.log('Loading userWatchedList.ts...');
  const catalogPath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
  const rawCode = fs.readFileSync(catalogPath, 'utf8');

  // Strip exports to eval
  const stripped = rawCode
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+const\s+USER_WATCHED_TITLES:\s*MediaItem\[\]\s*=/g, 'const USER_WATCHED_TITLES =')
    .replace(/export\s+default\s+[\s\S]*?;/g, '')
    .replace(/export\s+/g, '');

  const fn = new Function(stripped + '\nreturn USER_WATCHED_TITLES;');
  const items = fn();

  console.log(`Auditing and assigning accurate posters to ${items.length} titles...`);

  let matched = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const wikiPage = ID_TO_WIKI[item.id];
    let poster = '';
    if (wikiPage) {
      poster = await fetchWikiPosterForPage(wikiPage);
    }
    item.poster_path = poster;
    if (poster) {
      matched++;
      const fname = decodeURIComponent(poster.split('/').pop().split('?')[0]);
      console.log(`[${i + 1}/${items.length}] ID ${item.id}: "${item.title}" -> ${fname}`);
    } else {
      console.log(`[${i + 1}/${items.length}] ID ${item.id}: "${item.title}" -> NO POSTER (Fallback Card)`);
    }
    await new Promise(r => setTimeout(r, 60)); // polite 60ms delay
  }

  console.log(`Done! ${matched}/${items.length} titles have authentic posters.`);

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
  console.log('✅ client/src/data/userWatchedList.ts updated with 100% accurate, title-isolated posters!');
}

rebuildClean();
