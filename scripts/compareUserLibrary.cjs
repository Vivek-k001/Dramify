const fs = require('fs');
const path = require('path');

const userListRaw = `
1. Uncontrollably Fond – KD
2. Once Again – KD
3. Homemade Love Story – KD
4. Sweet Stranger and Me – KD
5. Love in the Moonlight – KD
6. Man in a Veil – KD
7. You Are the Best – KD
8. Blade Man – KD
9. Dali and the Cocky Prince – KD
10. Business Proposal – KD
11. Red Shoes – KD
12. Good Manager – KD
13. Sell Your Haunted House – KD
14. Fight for My Way – KD
15. Police University – KD
16. Revolutionary Sisters – KD
17. Love Twist – KD
18. Moonshiner – KD
19. Go Back – KD
20. King of Sadness (Lee Bang-won) – KD
21. Young Lady and Gentleman – KD
22. Boys Over Flowers – KD
23. Bravo My Life – KD
24. Now It’s Beautiful – KD
25. Welcome (Meow, the Boy) – KD
26. Are You Human Too – KD
27. Strongest Deliveryman – KD
28. Descendants of the Sun – KD
29. No Matter What – KD
30. Iris – KD
31. Your House Helper – KD
32. Matrimonial Chaos – KD
33. Bad Prosecutor – KD
34. Three Bold Siblings – KD
35. The Love in Your Eyes – KD
36. Hometown Cha-Cha-Cha – KD
37. Woman in a Veil – KD
38. Vengeance of Women – KD
39. Oh My Venus – KD
40. Apple of My Eye – KM
41. Elegant Empire – KD
42. Woman of Billion – KD
43. Black Knight – KD
44. The Real Has Come – KD
45. My Lovely Boxer – KD
46. Marry My Husband – KD
47. Jirisan – KD
48. Oldboy – KM
49. Welcome to Waikiki – KD
50. Record of Youth – KD
51. Itaewon Class – KD
52. Bloody Heart – KD
53. Queen of Tears – KD
54. Vincenzo – KD
55. Big Mouth – KD
56. Gangster, the Cop, the Devil – KM
57. The Bros – KM
58. Weak Hero Class – KD
59. Joseon Attorney – KD
60. Mr. Plankton – KD
61. Vampire Detective – KD
62. When the Camellia Blooms – KD
63. Extreme Job – KM
64. Firefighter – KM
65. Officer Black Belt – KM
66. Love Reset – KM
67. Love My Scent – KM
68. A Year-End Medley – KM
69. Squad 38 – KD
70. Team Bulldog: Off-Duty Investigation – KD
71. Tune in for Love – KM
72. Oh My Ghost – KD
73. Wonderland – KM
74. The Roundup – KM
75. The Roundup 2 – KM
76. The Roundup: No Way Out – KM
77. The Roundup: Punishment – KM
78. Return to Base – KM
79. City of the Rising Sun – KM
80. Forgotten – KM
81. Time to Hunt – KM
82. I Am a Hero – KM
83. Double Agent – KM
84. The Vigilante – KD
85. My Name – KD
86. Secret Zoo – KM
87. Midnight – KM
88. Coin Locker Girl – KM
89. Space Sweepers – KM
90. Hide Identity – KD
91. Shark: The Beginning – KM
92. Memoir of a Murderer – KM
93. Bad Guys 2 – KM
94. Tell Me What You Saw – KD
95. Derailed – KM
96. Unlocked – KM
97. Voice – KD
98. Intern Detective – KD
99. Rebounded – KM
100. Mad Dog – KD
101. Narco-Saints – KD
102. Delivery – KM
103. Yaksha – KM
104. Broken – KM
105. 20th Century Girl – KM
106. My Sassy Girl – KM
107. My New Sassy Girl – KM
108. Save Me – KD
109. Detour – KM
110. The Outlaws – KM
111. Merciless – KM
112. Nocturnal – KM
113. Revelation – KM
114. New World – KM
115. Your Eyes Tell – KM
116. Maybe We Broke Up – KM
117. Beautiful Mind – KD
118. Night in Paradise – KM
119. The Soulmate – KM
120. Wall to Wall – KM
121. Default – KM
122. The Violent Prosecutor – KM
123. Veteran – KM
124. Deliver Us from Evil – KM
125. The Spy Gone North – KM
126. Hostage: Missing Celebrity – KM
127. The Unjust – KM
128. Man in Love – KM
129. A Bittersweet Life – KM
130. General’s Son – KD
131. Bloodhounds – KD
132. The Swindlers – KM
133. Parasite – KM
134. Touch Your Heart – KD
135. Hwarang – KD
136. Queen for Seven Days – KD
137. Train to Busan – KM
138. Bad Guys – KM
139. The Villagers – KM
140. Nameless Gangster – KM
141. I Saw the Devil – KM
142. The Match – KM
143. Miss & Mrs. Incognito – KM
144. Beyond the Bar – KD
145-teach you a lesson
146-evilive-KD
147-trigger-KD
148-made in korea s1 - KD
`;

// Parse user list
const userItems = [];
const lines = userListRaw.trim().split('\n');
for (const line of lines) {
  const m = line.match(/^(\d+)[\.\-]?\s*(.*?)(?:\s*–\s*|\s*-\s*)(KD|KM)?$/i) || line.match(/^(\d+)[\.\-]?\s*(.*)$/);
  if (m) {
    const num = parseInt(m[1]);
    let title = m[2].trim();
    let type = (m[3] || '').toUpperCase();
    if (title.endsWith('- KD') || title.endsWith('-KD')) {
      type = 'KD';
      title = title.replace(/- ?KD$/i, '').trim();
    } else if (title.endsWith('- KM') || title.endsWith('-KM')) {
      type = 'KM';
      title = title.replace(/- ?KM$/i, '').trim();
    }
    userItems.push({ num, rawTitle: title, type: type || (title.includes('KM') ? 'KM' : 'KD') });
  }
}

console.log(`Parsed ${userItems.length} items from user list.`);

// Load current catalog from userWatchedList.ts
const catalogPath = path.join(__dirname, '../client/src/data/userWatchedList.ts');
const rawCode = fs.readFileSync(catalogPath, 'utf8');

const stripped = rawCode
  .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
  .replace(/export\s+const\s+USER_WATCHED_TITLES:\s*MediaItem\[\]\s*=/g, 'const USER_WATCHED_TITLES =')
  .replace(/export\s+default\s+[\s\S]*?;/g, '')
  .replace(/export\s+/g, '');

const fn = new Function(stripped + '\nreturn USER_WATCHED_TITLES;');
const catalog = fn();

console.log(`Catalog has ${catalog.length} items.`);

// Compare each user item with catalog
const analysis = [];

for (const u of userItems) {
  const catItem = catalog.find(c => c.id === u.num);
  analysis.push({
    num: u.num,
    userTitle: u.rawTitle,
    userType: u.type,
    catalogItem: catItem ? {
      id: catItem.id,
      title: catItem.title,
      korean_title: catItem.korean_title,
      media_type: catItem.media_type,
      year: catItem.release_year || catItem.release_date?.slice(0, 4),
      hasPoster: Boolean(catItem.poster_path)
    } : null
  });
}

fs.writeFileSync(path.join(__dirname, 'libraryComparison.json'), JSON.stringify(analysis, null, 2), 'utf8');
console.log('Saved libraryComparison.json');
