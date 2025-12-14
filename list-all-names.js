const fs = require('fs');

const text = fs.readFileSync('ocr_debug_page2.txt', 'utf-8');

// Enhanced pattern to handle "त च नाव" suffix
const namePattern = /मतदाराचे\s+पूर्ण\s*[:\s]+([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)*?)(?=\s+(?:मतदाराचे|नांव|त\s+च|वडि|पती|\n|$))/g;

const matches = [];
let match;
while ((match = namePattern.exec(text)) !== null) {
  matches.push({ name: match[1].trim().replace(/\s+/g, ' '), index: match.index });
}

console.log(`Total names found: ${matches.length}\n`);

// Show all names
matches.forEach((m, i) => {
  console.log(`${i + 1}. ${m.name}`);
});
