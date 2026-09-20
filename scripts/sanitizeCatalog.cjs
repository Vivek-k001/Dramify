const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
let raw = fs.readFileSync(catalogPath, 'utf8');

// Title cleanups: remove unnecessary awkward parentheses while keeping clean official names
const TITLE_CLEANUPS = [
  { from: "title: 'Good Manager (Chief Kim)'", to: "title: 'Good Manager'" },
  { from: "title: 'Welcome (Meow, the Secret Boy)'", to: "title: 'Welcome (Meow, the Secret Boy)'" },
  { from: "title: 'Avengers Social Club (Vengeance of Women)'", to: "title: 'Avengers Social Club'" },
  { from: "title: 'Love Reset (30 Days)'", to: "title: 'Love Reset'" },
  { from: "title: 'Derailed (No Way Out)'", to: "title: 'Derailed'" },
  { from: "title: 'Memorist (Intern Detective)'", to: "title: 'Memorist'" },
  { from: "title: 'Detour (Olleh)'", to: "title: 'Detour'" },
  { from: "title: 'Miss & Mrs. Cops (Incognito)'", to: "title: 'Miss & Mrs. Cops'" },
  { from: "title: 'Teach You a Lesson (Get Schooled)'", to: "title: 'Teach You a Lesson'" },
  { from: "title: 'Bad Guys: The Movie'", to: "title: 'The Bad Guys: Reign of Chaos'" }
];

for (const { from, to } of TITLE_CLEANUPS) {
  if (raw.includes(from)) {
    raw = raw.replace(from, to);
    console.log(`Cleaned: ${from} -> ${to}`);
  }
}

// Remove the trail logo for Detour so it cleanly renders the authentic card
raw = raw.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/en\/f\/f6\/Jejuolletraillogo\.png\?[^']*/, '');

fs.writeFileSync(catalogPath, raw, 'utf8');
console.log('Sanitization complete!');
