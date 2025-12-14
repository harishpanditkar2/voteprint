const fs = require('fs');
const path = require('path');

const ocrText = fs.readFileSync(path.join(__dirname, 'ocr_debug_page2.txt'), 'utf-8');

const voterIdPartPattern = /([XC][UR][AMU]\d{7,10})\s+(\d{3}\/\d{3}\/\d{3})/g;

let match;
const matches = [];
while ((match = voterIdPartPattern.exec(ocrText)) !== null) {
  matches.push({
    serial: matches.length + 1,
    voterId: match[1],
    partNumber: match[2]
  });
}

console.log(`Total matches found: ${matches.length}`);
console.log('\nFirst 5:');
matches.slice(0, 5).forEach(m => console.log(`${m.serial}. ${m.voterId} ${m.partNumber}`));
console.log('\nLast 5:');
matches.slice(-5).forEach(m => console.log(`${m.serial}. ${m.voterId} ${m.partNumber}`));
