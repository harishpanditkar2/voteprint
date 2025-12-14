const fs = require('fs');

const text = fs.readFileSync('ocr_debug_page2.txt', 'utf-8');

// Enhanced pattern to handle "त च नाव" suffix
const namePattern = /मतदाराचे\s+पूर्ण\s*[:\s]+([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)*?)(?=\s+(?:मतदाराचे|नांव|त\s+च|वडि|पती|\n|$))/g;

const matches = [];
let match;
while ((match = namePattern.exec(text)) !== null) {
  matches.push(match[1].trim().replace(/\s+/g, ' '));
}

console.log(`Total names found: ${matches.length}`);
console.log('\nLast 5 names:');
matches.slice(-5).forEach((name, i) => {
  console.log(`${matches.length - 4 + i}. ${name}`);
});
