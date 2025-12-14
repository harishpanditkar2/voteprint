const fs = require('fs');

const text = fs.readFileSync('ocr_debug_page2.txt', 'utf-8');
const pattern = /([XC][UR][AMU]\d{7,10})\s+(\d{3}\/\d{3}\/\d{3})/g;

const matches = [];
let match;
while ((match = pattern.exec(text)) !== null) {
  matches.push({ voterId: match[1], partNumber: match[2] });
}

console.log(`Total matches: ${matches.length}`);
console.log('\nFirst 5:');
matches.slice(0, 5).forEach((m, i) => {
  console.log(`  ${i+1}. ${m.voterId} ${m.partNumber}`);
});
console.log('\nLast 5:');
matches.slice(-5).forEach((m, i) => {
  console.log(`  ${matches.length - 4 + i}. ${m.voterId} ${m.partNumber}`);
});
